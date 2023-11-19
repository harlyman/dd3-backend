import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChallengeUserEntity } from './challengeUser.entity';

@Entity({ name: 'attempts' })
export class AttemptEntity {
  // Columns

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'attempts_pk' })
  guid?: string;

  @ManyToOne(() => ChallengeUserEntity, (challenge) => challenge.attempts, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'attempts_fk_1', name: 'challengeUserGuid', referencedColumnName: 'guid' })
  challenge: ChallengeUserEntity;

  @Column({ type: 'varchar', length: 30, nullable: false })
  word: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Methods

  static getColumnsToShow(): any {
    return {
      guid: true,
      word: true
    };
  }

  static getColumnsArrayToShow(params: { alias: string }): string[] {
    const response = [`${params.alias}.guid`, `${params.alias}.word`];
    return response;
  }
}
