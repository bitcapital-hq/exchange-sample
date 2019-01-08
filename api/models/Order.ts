import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import User from './User';
import Asset from './Asset';
import { AssetType } from './Asset';
import { IsCurrency } from 'class-validator';

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export enum OrderType {
  BUY = 'buy',
  SELL = 'sell'
}

@Entity(OrderModel.tableName)
export default class OrderModel extends BaseEntity {
  private static readonly tableName = 'orders';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: false })
  public name: string;

  @ManyToOne(type => User, user => user.orders)
  public user: User;

  @ManyToOne(type => Asset, asset => asset.orders)
  public asset: Asset;

  @Column({ nullable: false, type: "int" })
  public quantity: Number;

  @IsCurrency()
  @Column({ nullable: false })
  public price: String;

  @Column({ nullable: false })
  public status: OrderStatus;

  @Column({ nullable: false })
  public type: OrderType;

  public constructor(data: DeepPartial<OrderModel> = {}) {
    super();
    this.id = data.id;
    this.name = data.name;
  }

  /**
   * Finds order based on its name.
   */ 
  public static async findByName(name: string): Promise<OrderModel | undefined> {
    return this.findOne({ where: {name} });
  }
}
