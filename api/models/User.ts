import { IsAlphanumeric, IsEmail, validate } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Order from './Order';
import Payment from './Payment'

@Entity(User.tableName)
export default class User extends BaseEntity {
  public static readonly tableName = 'users';

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsAlphanumeric()
  @Column({ nullable: false })
  firstName: string;

  @IsAlphanumeric()
  @Column({ nullable: false })
  lastName: string;

  @IsEmail()
  @Column({ nullable: false, unique: true })
  email: string;

  @OneToMany(type => Order, order => order.user)
  public orders: Order[];

  @OneToMany(type => Payment, payment => payment.origin)
  public payments: Payment[]

  constructor(data: Partial<User>) {
    super();
    Object.assign(this, data, {});
  }

  public async validate() {
    return validate(this);
  }

  /**
   * Finds user by its email.
   * 
   * @param email The email address
   */
  public static async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
}