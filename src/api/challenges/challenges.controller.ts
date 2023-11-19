import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, DefaultController } from 'src/defaults/default.controller';
import { ChallengeBodyDTO, ChallengeResponseDTO } from 'src/dto/challenge.dto';
import { RoleEnum } from 'src/entities/roles.entity';
import { UserEntity } from 'src/entities/users.entity';
import { UtilsService } from 'src/utils/utils.service';
import { ChallengesService } from './challenges.service';

@Controller('challenges')
@ApiTags('Challenges')
export class ChallengesController extends DefaultController {
  @Inject(ChallengesService)
  private readonly challengeService: ChallengesService;
  @Inject(UtilsService)
  private readonly utilsService: UtilsService;

  constructor() {
    super(ChallengesController);
  }

  @Post('/play')
  @Auth(RoleEnum.Admin, RoleEnum.Player)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Play Challenge' })
  @ApiResponse({ type: ChallengeResponseDTO, status: HttpStatus.OK })
  async play(@Body() body: ChallengeBodyDTO, @Req() request: { user: UserEntity }): Promise<ChallengeResponseDTO[]> {
    try {
      return await this.challengeService.play({ body: body, playerGUID: request.user.guid });
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ChallengesController, error: error });
    }
  }
}
