import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { Auth, DefaultController } from 'src/defaults/default.controller';
import { ArrayGuidDTO, ResponseDTO, ResponseDataDTO, ResposePaginationDTO } from 'src/dto/api.dto';
import { UserCreateDTO, UserSearchPaginationDTO, UserUpdateDTO } from 'src/dto/user.dto';
import { RoleEnum } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { UtilsService } from 'src/utils/utils.service';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController extends DefaultController {
  @Inject(UsersService)
  private readonly userService: UsersService;
  @Inject(AuthService)
  private readonly authService: AuthService;
  @Inject(UtilsService)
  private readonly utilsService: UtilsService;

  constructor() {
    super(UsersController);
  }

  @Get()
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ type: ResposePaginationDTO, status: HttpStatus.OK })
  async all(@Query() query: UserSearchPaginationDTO): Promise<ResposePaginationDTO> {
    try {
      return { status: 'success', data: await this.userService.all({ query: query }) };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }

  @Get('whoami')
  @Auth(RoleEnum.Admin, RoleEnum.Player)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Who am I' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.NOT_FOUND })
  async whoami(@Req() request: { user: UserEntity }): Promise<ResponseDataDTO> {
    try {
      const user = await this.userService.getBy({ query: { guid: request.user.guid } });
      return { status: 'success', data: user };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }

  @Get(':guid')
  @Auth(RoleEnum.Admin, RoleEnum.Player)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get one user by guid' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.NOT_FOUND })
  async findOne(@Param('guid') guid: string, @Req() request: { user: UserEntity }): Promise<ResponseDataDTO> {
    try {
      const query: { guid: string } = { guid: guid };
      if (request.user.role.guid === RoleEnum.Player) {
        query.guid = request.user.guid;
      }

      return { status: 'success', data: await this.userService.getBy({ query: query }) };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }

  @Post()
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.CREATED })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.CONFLICT })
  async create(@Body() body: UserCreateDTO, @Req() request: { user: UserEntity }): Promise<any> {
    try {
      const user: UserEntity = await this.userService.create({ body: body, createdByGUID: request.user.guid });
      return { status: 'success', data: user };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }

  @Patch(':guid')
  @Auth(RoleEnum.Admin, RoleEnum.Player)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.NOT_FOUND })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.CONFLICT })
  async update(@Param('guid') guid: string, @Body() body: UserUpdateDTO, @Req() request: { user: UserEntity }): Promise<ResponseDataDTO> {
    try {
      const updatedUser = await this.userService.update({ guid: guid, body: body, updatedByGUID: request.user.guid });
      return { status: 'success', data: updatedUser };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }

  @Delete()
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Users' })
  @ApiResponse({ type: ResponseDTO, status: HttpStatus.CONFLICT })
  async $delete(@Body() body: ArrayGuidDTO, @Req() request: { user: UserEntity }): Promise<ResponseDataDTO> {
    try {
      await this.userService.$delete({ body: body, deletedByGUID: request.user.guid });
      return { status: 'success', data: body.guids };
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: UsersController, error: error });
    }
  }
}
