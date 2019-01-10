import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import User from './User';
import Asset from './Asset';
import { IsCurrency, validate, IsNotEmpty } from 'class-validator';
import Payment from './Payment';

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell'
}

@Entity(Order.tableName)
export default class Order extends BaseEntity {
  private static readonly tableName = 'orders';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(type => User, user => user.orders)
  public user: User;

  @ManyToOne(type => Asset, asset => asset.orders)
  public asset: Asset;

  @IsNotEmpty()
  @Column({ nullable: false, type: "int" })
  public quantity: Number;

  @IsNotEmpty()
  @IsCurrency()
  @Column({ nullable: false })
  public price: String;

  @IsNotEmpty()
  @Column({ nullable: false })
  public status: OrderStatus;

  @IsNotEmpty()
  @Column({ nullable: false })
  public type: OrderType;

  @ManyToMany(type => Payment, payments => payments.orders)
  public payments: Payment[];

  public async validate() {
    return validate(this);
  }

  public constructor(data: DeepPartial<Order> = {}) {
    super();
    this.id = data.id;
  }
  
}
