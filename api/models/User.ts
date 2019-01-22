import { IsAlphanumeric, IsEmail, validate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, OneToOne, ManyToOne } from "typeorm";
import Order from './Order';
import Payment from './Payment'
import { hashPassword, generateSalt } from "../helpers/SecurityHelper";
import { RelationCountMetadata } from "typeorm/metadata/RelationCountMetadata";
import { Logger } from "ts-framework-common";
import { Wallet, Session } from "bitcapital-core-sdk";
import BitCapitalService from "../services/BitcapitalService";

@Entity(User.tableName)
export default class User extends BaseEntity {
  public static readonly tableName = 'users';

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  first_name: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  @Column({ nullable: false })
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false })
  tax_id: string;

  @IsNotEmpty()
  @IsEmail()
  @Column({ nullable: false, unique: true })
  email: string;

  @IsOptional()
  @Column({ nullable: true })
  bitcapital_id: string; 

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

  public validatePassword(givenPassword: string) {
    //Generating the hash of the given password to compare with the hash on the database
    const given_password_hash = hashPassword(givenPassword, this.password_salt);
    
    if (given_password_hash === this.password_hash) {
      return true;
    } else {
      return false;
    }
  }

  public async setPassword(password: string) {
    this.password_salt = generateSalt();
    this.password_hash = hashPassword(password, this.password_salt);
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