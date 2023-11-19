import { Controller, Get, HttpCode, HttpStatus, Inject, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, DefaultController } from 'src/defaults/default.controller';
import { ResponseDataDTO } from 'src/dto/api.dto';
import { RoleEnum } from 'src/entities/roles.entity';
import { UtilsService } from 'src/utils/utils.service';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('Reports')
export class ReportsController extends DefaultController {
  @Inject(ReportsService)
  private readonly reportService: ReportsService;
  @Inject(UtilsService)
  private readonly utilsService: UtilsService;

  constructor() {
    super(ReportsController);
  }

  @Get('/users/:guid')
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user report' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  async users(@Param('guid') guid: string): Promise<ResponseDataDTO> {
    try {
      return await this.reportService.users({ playerGUID: guid });
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ReportsController, error: error });
    }
  }

  @Get('/ranking')
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user report' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  async ranking(): Promise<ResponseDataDTO> {
    try {
      return await this.reportService.ranking();
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ReportsController, error: error });
    }
  }

  @Get('/words/moreAnswered')
  @Auth(RoleEnum.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user report' })
  @ApiResponse({ type: ResponseDataDTO, status: HttpStatus.OK })
  async moreAnswered(): Promise<ResponseDataDTO> {
    try {
      return await this.reportService.moreAnswered();
    } catch (error) {
      this.utilsService.throwHTTPException({ controller: ReportsController, error: error });
    }
  }
}
