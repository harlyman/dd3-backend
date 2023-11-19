import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { ChallengeUserEntity } from './challengeUser.entity';
import { RoleEntity, RoleEnum } from './roles.entity';

@Entity({ name: 'users' })
@Unique('users_uk', ['username'])
export class UserEntity {
  //Columns

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'users_pk' })
  guid: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastname: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string;

  @Column({
    type: 'varchar',
    length: 200,
    generatedIdentity: 'ALWAYS',
    generatedType: 'STORED',
    asExpression: "name || COALESCE(lastName, '') || COALESCE(email, '') || username"
  })
  search?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, { nullable: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'users_fk_1', name: 'roleGuid' })
  role: RoleEntity;

  @Column({ type: 'boolean', nullable: false, default: 'true' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 250, nullable: false })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.userCreated, { nullable: true, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'users_fk_2', name: 'createdBy', referencedColumnName: 'guid' })
  createdBy?: UserEntity;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.userUpdated, { nullable: true, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'users_fk_3', name: 'updatedBy', referencedColumnName: 'guid' })
  updatedBy?: UserEntity;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.userDeleted, { nullable: true, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ foreignKeyConstraintName: 'users_fk_4', name: 'deletedBy', referencedColumnName: 'guid' })
  deletedBy?: UserEntity;

  //Relations

  @OneToMany(() => UserEntity, (user) => user.createdBy)
  userCreated: UserEntity[];

  @OneToMany(() => UserEntity, (user) => user.updatedBy)
  userUpdated: UserEntity[];

  @OneToMany(() => UserEntity, (user) => user.deletedBy)
  userDeleted: UserEntity[];

  @OneToMany(() => ChallengeUserEntity, (challenge) => challenge.user)
  challenges: ChallengeUserEntity[];

  // Methods

  static getColumnsToShow(params?: { withPassword?: boolean }): any {
    return {
      guid: true,
      name: true,
      lastname: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      password: params?.withPassword || false
    };
  }

  static getColumnsArrayToShow(params: { alias: string; withPassword?: boolean }): string[] {
    const response = [
      `${params.alias}.guid`,
      `${params.alias}.name`,
      `${params.alias}.lastname`,
      `${params.alias}.email`,
      `${params.alias}.username`,
      `${params.alias}.createdAt`,
      `${params.alias}.updatedAt`
    ];
    if (params.withPassword) {
      response.push(`${params.alias}.password`);
    }
    return response;
  }

  isAdmin(): boolean {
    return this.role.guid === RoleEnum.Admin;
  }

  isUser(): boolean {
    return this.role.guid === RoleEnum.Player;
  }
}
