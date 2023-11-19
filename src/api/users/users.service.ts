import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DefaultService } from 'src/defaults/defatul.service';
import { ArrayGuidDTO, ResposeResultsPaginationDTO } from 'src/dto/api.dto';
import { UserCreateDTO, UserSearchDTO, UserSearchPaginationDTO, UserUpdateDTO } from 'src/dto/user.dto';
import { RoleEntity, RoleEnum } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { UserAlreadyExistsException, UserNoExistsException } from 'src/exceptions/user.exception';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class UsersService extends DefaultService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(RoleEntity)
  private readonly userRoleRepository: Repository<RoleEntity>;
  @Inject()
  private readonly configService: ConfigService;

  constructor() {
    super(UsersService);
  }

  private async _hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(8);
    return await bcrypt.hash(password, salt);
  }

  async getBy(params: { query: UserSearchDTO; withPassword?: boolean }): Promise<UserEntity> {
    try {
      const query = await this.userRepository
        .createQueryBuilder('user')
        .select(UserEntity.getColumnsArrayToShow({ alias: 'user', withPassword: params.withPassword }))
        .addSelect(RoleEntity.getColumnsArrayToShow({ alias: 'role' }))
        .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'createdBy' }))
        .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'updatedBy' }))
        .innerJoin('user.role', 'role')
        .innerJoin('user.createdBy', 'createdBy')
        .leftJoin('user.updatedBy', 'updatedBy')
        .where('user.deletedAt IS NULL');

      if (params.query.guid && params.query.guid !== '') {
        query.andWhere('user.guid = :guid', { guid: params.query.guid });
      }
      if (params.query.username && params.query.username !== '') {
        query.andWhere('user.username = :username', { username: params.query.username });
      }

      const user = await query.getOne();
      if (!user) {
        throw new UserNoExistsException();
      }

      return user;
    } catch (error) {
      if (error.status) {
        error.message = `${UsersService.name}[getBy]:${error.message}`;
        throw error;
      }
      throw new Error(`${UsersService.name}[getBy]:${error.message}`);
    }
  }

  async all(params: { query: UserSearchPaginationDTO }): Promise<ResposeResultsPaginationDTO> {
    try {
      const forPage: number = parseInt(params.query.pageSize);
      const skip: number = parseInt(params.query.offset); // from where entities should be taken.

      const query = await this.userRepository
        .createQueryBuilder('user')
        .select(UserEntity.getColumnsArrayToShow({ alias: 'user' }))
        .addSelect(RoleEntity.getColumnsArrayToShow({ alias: 'role' }))
        .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'createdBy' }))
        .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'updatedBy' }))
        .innerJoin('user.role', 'role')
        .innerJoin('user.createdBy', 'createdBy')
        .leftJoin('user.updatedBy', 'updatedBy')
        .where('user.deletedAt IS NULL');

      if (this.configService.get('NODE_ENV') === 'development') {
        query.andWhere("user.search NOT LIKE '%aguilasdevs%'");
      }

      if (params.query.guid && params.query.guid !== '') {
        query.andWhere('user.guid = :guid', { guid: params.query.guid });
      }
      if (params.query.name && params.query.name !== '') {
        query.andWhere('user.name = :name', { name: params.query.name });
      }
      if (params.query.lastname && params.query.lastname !== '') {
        query.andWhere('user.lastname = :lastname', { lastname: params.query.lastname });
      }
      if (params.query.email && params.query.email !== '') {
        query.andWhere('user.email = :email', { email: params.query.email });
      }
      if (params.query.telephone && params.query.telephone !== '') {
        query.andWhere('user.telephone = :telephone', { telephone: params.query.telephone });
      }
      if (params.query.search && params.query.search !== '') {
        query.andWhere('user.search LIKE :search', { search: `%${params.query.search}%` });
      }
      if (params.query.username && params.query.username !== '') {
        query.andWhere('user.username = :username', { username: params.query.username });
      }
      if (params.query.isActive !== undefined) {
        query.andWhere('user.isActive = :isActive', { isActive: params.query.isActive });
      }
      if (params.query.roleGuid && params.query.roleGuid !== '') {
        query.andWhere('role.guid = :roleGuid', { roleGuid: params.query.roleGuid });
      }
      if (params.query.roleGuids && params.query.roleGuids.length) {
        query.andWhere('role.guid IN (:roleGuids)', { roleGuids: params.query.roleGuids });
      }

      const [results, total] = await query
        .orderBy(`user.${params.query.orderBy}`, params.query.orderType === 'ASC' ? 'ASC' : 'DESC')
        .skip(skip)
        .take(forPage)
        .getManyAndCount();

      return { total: total, pageSize: forPage, offset: parseInt(params.query.offset), results: results };
    } catch (error) {
      throw new Error(`${UsersService.name}[all]:${error.message}`);
    }
  }

  async create(params: { body: UserCreateDTO; createdByGUID?: string }): Promise<UserEntity> {
    try {
      let user = await this.userRepository.findOneBy({ username: params.body.username });
      if (user) {
        throw new UserAlreadyExistsException();
      }

      const password = await this._hashPassword(params.body.password);
      const role = await this.userRoleRepository.findOneBy({ guid: params.body.roleGuid });
      const isActive = params.body.isActive === undefined || params.body.isActive === null ? true : params.body.isActive;
      user = await this.userRepository.save({
        name: params.body.name,
        lastname: params.body.lastname || null,
        email: params.body.email || null,
        password: password,
        username: params.body.username,
        role: role,
        isActive: isActive
      });
      if (params.createdByGUID) {
        user.createdBy = await this.userRepository.findOneBy({ guid: params.createdByGUID });
      } else {
        user.createdBy = user;
      }
      user = await this.userRepository.save(user);

      user = await this.getBy({ query: { guid: user.guid }, withPassword: false });

      return user;
    } catch (error) {
      if (error.status) {
        error.message = `${UsersService.name}[create]:${error.message}`;
        throw error;
      }
      throw new Error(`${UsersService.name}[create]:${error.message}`);
    }
  }

  async update(params: { guid: string; body: UserUpdateDTO; updatedByGUID: string }): Promise<UserEntity> {
    try {
      let user = await this.userRepository.findOne({ relations: ['role'], where: { guid: params.guid, deletedAt: IsNull() } });
      if (!user) {
        throw new UserNoExistsException();
      }

      const updatedBy = await this.userRepository.findOne({ relations: ['role'], where: { guid: params.updatedByGUID, deletedAt: IsNull() } });
      if (updatedBy.role.guid === RoleEnum.Player && user.guid !== params.updatedByGUID) {
        throw new UnauthorizedException();
      }

      let role = user.role;
      if (params.body.roleGuid && params.body.roleGuid !== user.role.guid) {
        if (params.body.roleGuid !== RoleEnum.Admin) {
          throw new UnauthorizedException();
        }
        role = await this.userRoleRepository.findOneBy({ guid: params.body.roleGuid });
      }

      if (params.body.username) {
        const userOld = await this.userRepository.findOneBy({ username: params.body.username, deletedAt: IsNull() });
        if (user && userOld && user.guid !== userOld.guid) {
          throw new UserAlreadyExistsException('username');
        }
      }

      user.username = params.body.username || user.username;
      user.name = params.body.name || user.name;
      user.lastname = params.body.lastname || user.lastname;
      user.password = params.body.password ? await this._hashPassword(params.body.password) : user.password;
      user.isActive = params.body.isActive || user.isActive;
      user.role = role;
      user.updatedBy = updatedBy;
      await this.userRepository.save(user);
      user = await this.getBy({ query: { guid: user.guid }, withPassword: false });

      return user;
    } catch (error) {
      if (error.status) {
        error.message = `${UsersService.name}[update]:${error.message}`;
        throw error;
      }
      throw new Error(`${UsersService.name}[update]:${error.message}`);
    }
  }

  async $delete(params: { body: ArrayGuidDTO; deletedByGUID: string }): Promise<void> {
    try {
      const deletedBy = await this.userRepository.findOne({ relations: ['role'], where: { guid: params.deletedByGUID, deletedAt: IsNull() } });
      if (!deletedBy) {
        throw new UserNoExistsException();
      }

      for (const guid of params.body.guids) {
        let user = await this.userRepository.findOne({ relations: ['role'], where: { guid: guid, deletedAt: IsNull() } });
        if (!user) {
          continue;
        }
        if (deletedBy.role.guid !== RoleEnum.Admin) {
          throw new UnauthorizedException();
        }

        await this.userRepository.update({ guid: guid, deletedAt: IsNull() }, { username: user.guid, deletedAt: new Date() });
        user = await this.userRepository.findOneBy({ guid: guid });
        user.deletedBy = deletedBy;
        await this.userRepository.save(user);
      }
    } catch (error) {
      if (error.status) {
        error.message = `${UsersService.name}[$delete]:${error.message}`;
        throw error;
      }
      throw new Error(`${UsersService.name}[$delete]:${error.message}`);
    }
  }
}
