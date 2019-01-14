import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, Generated } from 'typeorm';

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

  @Column({ nullable: false })
  @Generated('uuid')
  public token: string;

  public constructor(data: DeepPartial<Session> = {}) {
    super();
    this.created_at = new Date();
    Object.assign(this, data);
  }

}
