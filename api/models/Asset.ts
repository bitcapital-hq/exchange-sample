import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, OneToMany, Code } from 'typeorm';
import Order from './Order';

export enum AssetType {
  FIAT = 'fiat',
  CRYPTO = 'crypto',
}

@Entity(AssetsModel.tableName)
export default class AssetsModel extends BaseEntity {
  private static readonly tableName = 'Assets';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: false })
  public code: string;

  @Column({ nullable: false })
  public type: AssetType;

  @OneToMany(type => Order, order => order.user)
  public orders: Order[];

  public constructor(data: DeepPartial<AssetsModel> = {}) {
    super();
    this.id = data.id;
    this.name = data.name;
  }

  /**
   * Finds Assets based on its name.
   */ 
  public static async findByName(name: string): Promise<AssetsModel | undefined> {
    return this.findOne({ where: {name} });
  }
}