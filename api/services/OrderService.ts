import { BaseError, Service, ServiceOptions, Logger } from 'ts-framework-common';
import { Asset, User } from '../models';
import BitCapitalService from './BitcapitalService';
import { base_asset } from '../../config/exchange.config';

export interface OrderServiceOptions extends ServiceOptions {
}

export default class OrderService extends Service {
  protected static instance: OrderService;
  public options: OrderServiceOptions;

  constructor(options: OrderServiceOptions) {
    super(options);
  }

  public static getInstance(options: OrderServiceOptions) {
    if (!this.instance) {
      throw new BaseError("Order service is invalid or hasn't been initialized yet");
    }
    return this.instance;
  }

  public static initialize(options: OrderServiceOptions) {
    const service = new OrderService(options);

    if(!this.instance) {
      this.instance = service;
    }

    return service;
  }
  
  public static async create(asset, type, quantity, price, user: User) {
    //Checking if the given asset ID is valid
    const database_asset = Asset.findOne(asset);
    if (!database_asset) {
      throw new BaseError('Invalid asset.');
    }

    //Checking if the user has enough money on his wallet to liquidate this position (if it's a buy)
    if (type == 'buy') {
      //Getting the user balance on our base asset
      await BitCapitalService.getAssetBalance(user, base_asset.bitcapital_id);
    }
  }

  async onMount(): Promise<void> {
    this.logger.debug('Mounting OrderService instance');
  }

  async onInit(): Promise<void> {
    this.logger.debug('Initializing OrderService instance');
  }

  async onReady(): Promise<void> {
    this.logger.info('OrderService initialized successfully');
  }

  async onUnmount(): Promise<void> {
    this.logger.debug('Unmounting OrderService instance');
  }
}