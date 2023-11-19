import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChallengeUserEntity } from './challengeUser.entity';
import { WordEntity } from './wrod.entity';

@Entity({ name: 'challenges' })
export class ChallengeEntity {
  // Columns

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'challenges_pk' })
  guid?: string;

  @OneToOne(() => WordEntity, (word) => word.challenge, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'challenges_fk_1', name: 'wordGuid', referencedColumnName: 'guid' })
  word: WordEntity;

  @CreateDateColumn({ type: 'timestamp' })
  beginAt?: Date;

  @Column({ type: 'timestamp' })
  endAt: Date;

  // Relations

  @OneToMany(() => ChallengeUserEntity, (attempt) => attempt.challenge)
  challengeUsers: ChallengeUserEntity[];

  // Methods

  static getColumnsToShow(): any {
    return {
      guid: true,
      word: true,
      beginAt: true,
      endAt: true
    };
  }

  static getColumnsArrayToShow(params: { alias: string }): string[] {
    const response = [`${params.alias}.guid`, `${params.alias}.word`, `${params.alias}.beginAt`, `${params.alias}.endAt`];
    return response;
  }
}
