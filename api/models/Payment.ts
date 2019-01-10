import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import User from './User';
import Order from './Order';
import { IsNotEmpty, validate } from 'class-validator';

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

@Entity(Payment.tableName)
export default class Payment extends BaseEntity {
  private static readonly tableName = 'payments';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(type => User, user => user.payments)
  public origin: User;

  @ManyToOne(type => User, user => user.payments)
  public destination: User;

  @IsNotEmpty()
  @Column({ nullable: false })
  public type: PaymentType;

  @IsNotEmpty()
  @ManyToMany(type => Order, order => order.payments)
  public orders: Order[];

  public async validate() {
    return validate(this);
  }

  public constructor(data: DeepPartial<Payment> = {}) {
    super();
    this.id = data.id;
  }

  /**
   * Finds Payment based on its name.
   */ 
  public static async findByName(name: string): Promise<Payment | undefined> {
    return this.findOne({ where: {name} });
  }
}
