import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import User from './User';
import Order from './Order';

export enum PaymentType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

@Entity(PaymentModel.tableName)
export default class PaymentModel extends BaseEntity {
  private static readonly tableName = 'payments';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(type => User, user => user.payments)
  public origin: User;

  @ManyToOne(type => User, user => user.payments)
  public destination: User;

  @Column({ nullable: false })
  public type: PaymentType;

  @ManyToMany(type => Order, order => order.payments)
  public orders: Order[];

  public constructor(data: DeepPartial<PaymentModel> = {}) {
    super();
    this.id = data.id;
  }

  /**
   * Finds Payment based on its name.
   */ 
  public static async findByName(name: string): Promise<PaymentModel | undefined> {
    return this.findOne({ where: {name} });
  }
}
