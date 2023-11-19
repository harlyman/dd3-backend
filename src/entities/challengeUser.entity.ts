import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttemptEntity } from './attempt.entity';
import { ChallengeEntity } from './challenge.entity';
import { UserEntity } from './users.entity';

@Entity({ name: 'challenges_users' })
export class ChallengeUserEntity {
  // Columns

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'challenges_users_pk' })
  guid?: string;

  @Column({ type: 'boolean', nullable: false, default: 'false' })
  victory: boolean;

  @ManyToOne(() => ChallengeEntity, (challenge) => challenge.challengeUsers, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'challenges_users_fk_1', name: 'challengeGuid', referencedColumnName: 'guid' })
  challenge: ChallengeEntity;

  @ManyToOne(() => UserEntity, (user) => user.challenges, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'challenges_users_fk_2', name: 'userGuid', referencedColumnName: 'guid' })
  user: UserEntity;

  // Relations

  @OneToMany(() => AttemptEntity, (attempt) => attempt.challenge)
  attempts: AttemptEntity[];

  // Methods

  static getColumnsToShow(): any {
    return {
      guid: true,
      victory: true
    };
  }

  static getColumnsArrayToShow(params: { alias: string }): string[] {
    const response = [`${params.alias}.guid`, `${params.alias}.victory`];
    return response;
  }
}
