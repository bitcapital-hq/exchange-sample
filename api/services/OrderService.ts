import { BaseError, Service, ServiceOptions, Logger } from 'ts-framework-common';
import { Asset, User, Order } from '../models';
import BitCapitalService from './BitcapitalService';
import { base_asset } from '../../config/exchange.config';
import { OrderStatus, OrderType } from '../models/Order';
import { LessThan, MoreThan } from 'typeorm';

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
  
  public static async create(asset: string, type: string, quantity: number, price: string, user: User) {
    //Checking if the given asset ID is valid
    const database_asset = await Asset.findOne({where: [
      {id: asset},
      {code: asset}
    ]});
    if (!database_asset) {
      throw new BaseError('Invalid asset.');
    }

    //Checking if the user has enough money on his wallet to liquidate this position (if it's a buy), or enough of an asset if it's a sell
    if (type == 'buy') {
      //Getting the user balance on our base asset
      let balance = parseInt(await BitCapitalService.getAssetBalance(user, base_asset.id));
      let order_total = quantity * parseInt(price);
      if (balance < order_total) {
        throw new BaseError("You don't have enough funds to open this position.");
      }

      //Moving funds out of the user wallet
      await BitCapitalService.moveTokens(order_total, user);
    } else {
      //Getting the user balance on the desired asset
      let balance = parseInt(await BitCapitalService.getAssetBalance(user, asset));
      if (balance < quantity) {
        throw new BaseError("You don't have enough of the requested asset to sell.");
      }

      //Moving the tokens out of the user wallet
      await BitCapitalService.moveTokens(quantity, user, database_asset.id);
    }

    //Adding the order to the book
    const order = new Order();
    order.user = user;
    order.asset = await Asset.findOne(asset);
    order.quantity = quantity;
    order.price = price;
    order.status = OrderStatus.OPEN;
    order.type = (type == 'buy' ? OrderType.BUY : OrderType.SELL)
    // await order.save();

    return order
  }

  public static async match(order: Order): Promise<object> {
    let basket = {
      ableToFullfil: 0,
      amountOfBaseAssetMoved: 0,
      breakdown: []
    };

    let quantityRemaining = order.quantity - order.filled;
    let orders = [];
    if (order.type == 'buy') {
      //Finding orders that can match this one, either completely or partially
      orders = await Order.find({
        where: {asset: order.asset, type: OrderType.SELL, status: OrderStatus.OPEN, price: LessThan(order.price)},
        order: {price: "ASC"}
      });
    } else {
      //Finding orders that can match this one, either completely or partially
      orders = await Order.find({
        where: {asset: order.asset, type: OrderType.BUY, status: OrderStatus.OPEN, price: MoreThan(order.price)},
        order: {price: "DESC"}
      });
    }
 
    //Building the basket
    for (let i = 0; i <= orders.length - 1; i++) {
      let currentOrder = orders[i];
      let quantityAvailable = currentOrder.quantity - currentOrder.filled;

      //Determining how much we're moving from this specific order
      let quantityToMove = 0;
      if (quantityAvailable >= quantityRemaining) {
        quantityToMove = quantityRemaining;
      } else {
        quantityToMove = quantityAvailable;
      }

      //Adding this order to the basket
      basket.ableToFullfil += quantityToMove;
      basket.amountOfBaseAssetMoved += quantityToMove * parseInt(currentOrder.price);
      basket.breakdown.push({
        order: currentOrder,
        boughtFromThisOrder: quantityToMove
      });

      //Breaking out of the loop (if need be)
      quantityRemaining -= quantityToMove;
      if (quantityRemaining == 0) {
        break;
      }
    }

    return basket;
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