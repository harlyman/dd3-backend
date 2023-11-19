import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultService } from 'src/defaults/defatul.service';
import { ResponseDataDTO } from 'src/dto/api.dto';
import { ChallengeUserEntity } from 'src/entities/challengeUser.entity';
import { RoleEntity } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService extends DefaultService {
  @InjectRepository(ChallengeUserEntity)
  private readonly challengeUserRepository: Repository<ChallengeUserEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(WordEntity)
  private readonly wordRepository: Repository<WordEntity>;

  constructor() {
    super(ReportsService);
  }

  async users(params: { playerGUID: string }): Promise<ResponseDataDTO> {
    const challenges = await this.challengeUserRepository.findBy({ user: { guid: params.playerGUID } });
    return { status: 'success', data: { challenges: challenges.length, victories: challenges.filter((challenge) => challenge.victory).length } };
  }

  async ranking(): Promise<ResponseDataDTO> {
    const subqueryA = this.challengeUserRepository
      .createQueryBuilder('cu')
      .select('u.guid', 'guid')
      .addSelect('CASE WHEN cu.victory THEN 1 ELSE 0 END', 'victories')
      .leftJoin('cu.user', 'u')
      .getQuery();

    const subqueryB = this.userRepository
      .createQueryBuilder('u')
      .select('a.guid', 'guid')
      .addSelect('SUM(A.victories)', 'amount')
      .innerJoin(`(${subqueryA})`, 'a', 'u.guid = a.guid')
      .groupBy('a.guid')
      .getQuery();

    const rows = await this.userRepository
      .createQueryBuilder('user')
      .select(UserEntity.getColumnsArrayToShow({ alias: 'user' }))
      .addSelect('b.amount', 'amount')
      .addSelect(RoleEntity.getColumnsArrayToShow({ alias: 'role' }))
      .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'createdBy' }))
      .addSelect(UserEntity.getColumnsArrayToShow({ alias: 'updatedBy' }))
      .innerJoin('user.role', 'role')
      .innerJoin('user.createdBy', 'createdBy')
      .leftJoin('user.updatedBy', 'updatedBy')
      .innerJoin(`(${subqueryB})`, 'b', 'user.guid = b.guid')
      .orderBy('b.amount', 'DESC')
      .limit(10)
      .getRawMany();

    const result = [];
    rows.forEach((row) => {
      let updatedBy = null;
      if (row.updatedBy_guid) {
        updatedBy = {
          guid: row.updatedBy_guid,
          name: row.updatedBy_name,
          lastname: row.updatedBy_lastname,
          email: row.updatedBy_email,
          username: row.updatedBy_username,
          createdAt: row.updatedBy_createdAt,
          updatedAt: row.updatedBy_updatedAt
        };
      }
      result.push({
        guid: row.user_guid,
        name: row.user_name,
        lastname: row.user_lastname,
        email: row.user_email,
        username: row.user_username,
        createdAt: row.user_createdAt,
        updatedAt: row.user_updatedAt,
        role: {
          guid: row.role_guid,
          role: row.role_role
        },
        createdBy: {
          guid: row.createdBy_guid,
          name: row.createdBy_name,
          lastname: row.createdBy_lastname,
          email: row.createdBy_email,
          username: row.createdBy_username,
          createdAt: row.createdBy_createdAt,
          updatedAt: row.createdBy_updatedAt
        },
        updatedBy: updatedBy,
        amount: row.amount
      });
    });

    return { status: 'success', data: result };
  }

  async moreAnswered(): Promise<ResponseDataDTO> {
    const subqueryA = this.challengeUserRepository
      .createQueryBuilder('cu')
      .select('w.guid', 'guid')
      .addSelect('1', 'amount')
      .innerJoin('cu.challenge', 'c')
      .innerJoin('c.word', 'w')
      .where('cu.victory = true')
      .getQuery();

    const rows = await this.wordRepository
      .createQueryBuilder('word')
      .select(WordEntity.getColumnsArrayToShow({ alias: 'word' }))
      .addSelect('SUM(a.amount)', 'amount')
      .innerJoin(`(${subqueryA})`, 'a', 'word.guid = a.guid')
      .groupBy('word.guid')
      .orderBy('SUM(a.amount)', 'DESC')
      .getRawMany();

    const result = [];
    rows.forEach((row) => {
      result.push({
        guid: row.word_guid,
        word: row.word_word,
        createdAt: row.word_createdAt,
        usedAt: row.word_usedAt,
        amount: row.amount
      });
    });

    return { status: 'success', data: result };
  }
}
