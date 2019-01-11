import { IsAlphanumeric, IsEmail, validate, IsNotEmpty, IsOptional } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Order from './Order';
import Payment from './Payment'
import { generateHash, generatePassword } from "../helpers/SecurityHelper";
import { RelationCountMetadata } from "typeorm/metadata/RelationCountMetadata";

@Entity(User.tableName)
export default class User extends BaseEntity {
  public static readonly tableName = 'users';

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  firstName: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Column({ nullable: false, unique: true })
  email: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  bitcapital_id: string; 

  @Column({ nullable: true })
  bitcapital_token: string;

  @IsOptional()
  @Column({ nullable: true })
  password_hash: string;

  @IsOptional()
  @Column({ nullable: true })
  password_salt: string;
  
  @OneToMany(type => Order, order => order.user)
  public orders: Order[];

  @OneToMany(type => Payment, payment => payment.origin)
  public payments: Payment[]

  constructor(data: Partial<User>) {
    super();
    Object.assign(this, data);
  }

  public async validate() {
    return validate(this);
  }

  public async validatePassword(password): Promise<boolean> {
    if (!password || !this.password_hash || !this.password_salt) {   
      return false;
    }

    const newHash = await generateHash(password, this.password_salt);
    return newHash === this.password_hash;
  }

  public async setPassword(password: string) {
    const { salt, hash } = await generatePassword(password);
    this.password_salt = salt;
    this.password_hash = hash;
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