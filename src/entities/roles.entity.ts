import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './users.entity';

export enum RoleEnum {
  Admin = '0667613a-d6a5-42e6-9a9e-0b2a362f6015',
  Player = '1573dc11-a742-4665-a7f0-c349ef084f71'
}

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'roles_pk' })
  guid?: string;

  @Column({ type: 'varchar', length: 45, nullable: false })
  role: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description?: string;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];

  static getColumnsToShow(): any {
    return {
      guid: true,
      role: true,
      description: true
    };
  }

  static getColumnsArrayToShow(params: { alias: string }): string[] {
    return [`${params.alias}.guid`, `${params.alias}.role`, `${params.alias}.description`];
  }
}
