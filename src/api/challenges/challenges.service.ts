import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultService } from 'src/defaults/defatul.service';
import { ChallengeEntity } from 'src/entities/challenge.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { Repository } from 'typeorm';
import { ChallengeBodyDTO, ChallengeResponseDTO } from '../../dto/challenge.dto';

@Injectable()
export class ChallengesService extends DefaultService {
  @InjectRepository(ChallengeEntity)
  private readonly challengeRepository: Repository<ChallengeEntity>;
  @InjectRepository(WordEntity)
  private readonly wordRepository: Repository<WordEntity>;
  @Inject()
  private readonly configService: ConfigService;

  constructor() {
    super(ChallengesService);
  }

  private async _getWord(): Promise<WordEntity> {
    try {
      const query = await this.wordRepository
        .createQueryBuilder('word')
        .where('word.usedAt IS NULL')
        .where('LENGTH(word.word) <= :length', { length: parseInt(this.configService.get<string>('LENGTH_WORD')) })
        .orderBy('RANDOM()')
        .limit(1);

      return await query.getOne();
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_getWord]:${error.message}`);
    }
  }

  private async _create(): Promise<ChallengeEntity> {
    try {
      const word = await this._getWord();

      const now = new Date();
      return await this.challengeRepository.save({
        word: word,
        beginAt: now,
        endAt: new Date(now.getTime() + parseInt(this.configService.get<string>('CHALLENGE_TIME')))
      });
    } catch (error) {
      throw new Error(`${ChallengesService.name}[create]:${error.message}`);
    }
  }

  private async _getChallenge(): Promise<ChallengeEntity> {
    const query = await this.challengeRepository
      .createQueryBuilder('challenge')
      .select(ChallengeEntity.getColumnsArrayToShow({ alias: 'challenge' }))
      .where('challenge.endAt >= :now', { now: new Date() });

    let challenge = await query.getOne();
    if (!challenge) {
      challenge = await this._create();
    }
    return challenge;
  }

  async play(params: { body: ChallengeBodyDTO; playerGUID: string }): Promise<ChallengeResponseDTO[]> {
    try {
      const challenge = await this._getChallenge();
      return [
        {
          letter: '',
          value: 1
        }
      ];
    } catch (error) {
      throw new Error(`${ChallengesService.name}[all]:${error.message}`);
    }
  }
}
