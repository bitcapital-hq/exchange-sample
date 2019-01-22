import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, Generated, OneToOne } from 'typeorm';
import { User } from '.';
import { IsNotEmpty } from 'class-validator';

@Entity(Session.tableName)
export default class Session extends BaseEntity {
  private static readonly tableName = 'sessions';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: false })
  public email: string;

  @Column({ nullable: false })
  public created_at: Date;

  @Column({ default: true, nullable: false })
  public is_valid: boolean = true;

  @IsNotEmpty()
  @OneToOne(type => User)
  public owner: string;
  
  public constructor(data: DeepPartial<Session> = {}) {
    super();
    this.created_at = new Date();
    Object.assign(this, data);
  }

}
