import { BaseEntity, Column, DeepPartial, Entity, PrimaryGeneratedColumn, OneToMany, Code } from 'typeorm';
import Order from './Order';
import { IsNotEmpty, validate } from 'class-validator';

export enum AssetType {
  FIAT = 'fiat',
  CRYPTO = 'crypto',
}

@Entity(Asset.tableName)
export default class Asset extends BaseEntity {
  private static readonly tableName = 'assets';

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  public name: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  public code: string;

  @IsNotEmpty()
  @Column({ nullable: false })
  public type: AssetType;

  @OneToMany(type => Order, order => order.user)
  public orders: Order[];

  public constructor(data: DeepPartial<Asset> = {}) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.type = data.type;
  }
  
  public async validate() {
    return validate(this)
  }

  /**
   * Finds Assets based on its name.
   */ 
  public static async findByName(name: string): Promise<Asset | undefined> {
    return this.findOne({ where: {name} });
  }
}