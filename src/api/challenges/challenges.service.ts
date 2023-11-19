import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DefaultService } from 'src/defaults/defatul.service';
import { AttemptEntity } from 'src/entities/attempt.entity';
import { ChallengeEntity } from 'src/entities/challenge.entity';
import { ChallengeUserEntity } from 'src/entities/challengeUser.entity';
import { UserEntity } from 'src/entities/users.entity';
import { WordEntity } from 'src/entities/wrod.entity';
import { MaxAttepmtsException } from 'src/exceptions/challenge.exception';
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
      await this.challengeRepository.save({
        word: word,
        beginAt: now,
        endAt: new Date(now.getTime() + parseInt(this.configService.get<string>('CHALLENGE_TIME')))
      });
      return await this._getChallenge();
    } catch (error) {
      throw new Error(`${ChallengesService.name}[_createChallenge]:${error.message}`);
    }
  }

  private async _getChallenge(): Promise<ChallengeEntity> {
    try {
      const query = await this.challengeRepository
        .createQueryBuilder('challenge')
        .select(ChallengeEntity.getColumnsArrayToShow({ alias: 'challenge' }))
        .addSelect(AttemptEntity.getColumnsArrayToShow({ alias: 'word' }))
        .leftJoin('challenge.word', 'word')
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
      await this.challengeUserRepository.save({
        challenge: params.challenge,
        user: user
      });
      return this._getChallengeUser({ challenge: params.challenge, playerGuid: params.playerGuid });
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
      if (params.challenge.attempts.length === parseInt(this.configService.get<string>('CHALLENGE_MAX_ATTEMPTS'))) {
        throw new MaxAttepmtsException();
      }
      return await this.attemptRepository.save({
        challenge: params.challenge,
        word: params.word
      });
    } catch (error) {
      if (error.status) {
        error.message = `${ChallengesService.name}[_createAttempt]:${error.message}`;
        throw error;
      }
      throw new Error(`${ChallengesService.name}[_createAttempt]:${error.message}`);
    }
  }

  private _evaluateWord(params: { challenge: ChallengeEntity; word: string }): ChallengeResponseDTO[] {
    const result: ChallengeResponseDTO[] = [];
    const wordOfPlayer = params.word;
    const wordOdChallenge = params.challenge.word.word;
    for (let i = 0; i < wordOfPlayer.length; i++) {
      const letterOfPlayer = wordOfPlayer.charAt(i);
      const letterOfChallenge = wordOdChallenge.charAt(i);

      if (letterOfPlayer === letterOfChallenge) {
        // La letra está en el mismo lugar
        result.push({ letter: letterOfPlayer, value: 1 });
      } else if (wordOdChallenge.includes(letterOfPlayer)) {
        // La letra está en la palabra2 pero en un lugar diferente
        result.push({ letter: letterOfPlayer, value: 2 });
      } else {
        // La letra no se encuentra en la palabra2
        result.push({ letter: letterOfPlayer, value: 3 });
      }
    }
    return result;
  }

  async play(params: { body: ChallengeBodyDTO; playerGUID: string }): Promise<ChallengeResponseDTO[]> {
    try {
      const challenge = await this._getChallenge();
      const challengeUser = await this._getChallengeUser({ challenge: challenge, playerGuid: params.playerGUID });
      await this._createAttempt({ challenge: challengeUser, word: params.body.user_word });
      const result = this._evaluateWord({ challenge: challenge, word: params.body.user_word });
      this.logger.debug(`word: ${challenge.word.word}`);

      let isVictory = true;
      result.forEach((element) => {
        if (element.value !== 1) {
          isVictory = false;
        }
      });
      if (isVictory) {
        await this.challengeUserRepository.update({ guid: challengeUser.guid }, { victory: true });
      }

      return result;
    } catch (error) {
      if (error.status) {
        error.message = `${ChallengesService.name}[play]:${error.message}`;
        throw error;
      }
      throw new Error(`${ChallengesService.name}[play]:${error.message}`);
    }
  }
}
