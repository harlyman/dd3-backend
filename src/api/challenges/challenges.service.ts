import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultService } from 'src/defaults/defatul.service';
import { AttemptEntity } from 'src/entities/attempt.entity';
import { ChallengeEntity } from 'src/entities/challenge.entity';
import { ChallengeUserEntity } from 'src/entities/challengeUser.entity';
import { UserEntity } from 'src/entities/users.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { Repository } from 'typeorm';
import { ChallengeBodyDTO, ChallengeResponseDTO } from '../../dto/challenge.dto';

@Injectable()
export class ChallengesService extends DefaultService {
  @InjectRepository(WordEntity)
  private readonly wordRepository: Repository<WordEntity>;
  @InjectRepository(ChallengeEntity)
  private readonly challengeRepository: Repository<ChallengeEntity>;
  @InjectRepository(ChallengeUserEntity)
  private readonly challengeUserRepository: Repository<ChallengeUserEntity>;
  @InjectRepository(AttemptEntity)
  private readonly attemptRepository: Repository<AttemptEntity>;
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
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

  private async _createChallenge(): Promise<ChallengeEntity> {
    try {
      const word = await this._getWord();

      const now = new Date();
      return await this.challengeRepository.save({
        word: word,
        beginAt: now,
        endAt: new Date(now.getTime() + parseInt(this.configService.get<string>('CHALLENGE_TIME')))
      });
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_createChallenge]:${error.message}`);
    }
  }

  private async _getChallenge(): Promise<ChallengeEntity> {
    try {
      const query = await this.challengeRepository
        .createQueryBuilder('challenge')
        .select(ChallengeEntity.getColumnsArrayToShow({ alias: 'challenge' }))
        .where('challenge.endAt >= :now', { now: new Date() });

      let challenge = await query.getOne();
      if (!challenge) {
        challenge = await this._createChallenge();
      }
      return challenge;
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_getChallenge]:${error.message}`);
    }
  }

  private async _createChallengeUser(params: { challenge: ChallengeEntity; playerGuid: string }): Promise<ChallengeUserEntity> {
    try {
      const user = await this.userRepository.findOneBy({ guid: params.playerGuid });
      return await this.challengeUserRepository.save({
        challenge: params.challenge,
        user: user
      });
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_createChallengeUser]:${error.message}`);
    }
  }

  private async _getChallengeUser(params: { challenge: ChallengeEntity; playerGuid: string }): Promise<ChallengeUserEntity> {
    try {
      const query = await this.challengeUserRepository
        .createQueryBuilder('challengeuser')
        .select(ChallengeUserEntity.getColumnsArrayToShow({ alias: 'challengeuser' }))
        .addSelect(AttemptEntity.getColumnsArrayToShow({ alias: 'attempts' }))
        .leftJoin('challengeuser.attempts', 'attempts')
        .innerJoin('challengeuser.challenge', 'challenge')
        .innerJoin('challengeuser.user', 'user')
        .where('challengeuser.challenge.guid = :challengeGuid', { challengeGuid: params.challenge.guid })
        .andWhere('challengeuser.user.guid = :playerGuid', { playerGuid: params.playerGuid });

      let challenge = await query.getOne();
      if (!challenge) {
        challenge = await this._createChallengeUser(params);
      }
      return challenge;
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_getChallengeUser]:${error.message}`);
    }
  }

  private async _createAttempt(params: { challenge: ChallengeUserEntity; word: string }): Promise<AttemptEntity> {
    try {
      return await this.attemptRepository.save({
        challenge: params.challenge,
        word: params.word
      });
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_createAttempt]:${error.message}`);
    }
  }

  async play(params: { body: ChallengeBodyDTO; playerGUID: string }): Promise<ChallengeResponseDTO[]> {
    try {
      const challenge = await this._getChallenge();
      const challengeUser = await this._getChallengeUser({ challenge: challenge, playerGuid: params.playerGUID });
      await this._createAttempt({ challenge: challengeUser, word: params.body.user_word });
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
