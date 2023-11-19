import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChallengeEntity } from './challenge.entity';

@Entity({ name: 'words' })
export class WordEntity {
  // Columns

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'words_pk' })
  guid?: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  word: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt?: Date;

  // Relations

  @OneToOne(() => ChallengeEntity, (challenge) => challenge.word)
  challenge: ChallengeEntity;

  // Methods

  static getColumnsToShow(): any {
    return {
      guid: true,
      word: true,
      createdAt: true,
      usedAt: true
    };
  }

  static getColumnsArrayToShow(params: { alias: string }): string[] {
    const response = [`${params.alias}.guid`, `${params.alias}.word`, `${params.alias}.createdAt`, `${params.alias}.usedAt`];
    return response;
  }
}
