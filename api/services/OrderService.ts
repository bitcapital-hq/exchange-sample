import { BaseError, Service, ServiceOptions, Logger } from 'ts-framework-common';
import { Asset, User, Order } from '../models';
import BitCapitalService from './BitcapitalService';
import { base_asset } from '../../config/exchange.config';
import { OrderStatus, OrderType } from '../models/Order';
import { Basket } from '../interfaces/basket';

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
    await order.save();

    return order
  }

  public static async match(order: Order): Promise<Basket> {
    let basket: Basket;
    basket = {
      ableToFulfill: 0,
      amountOfBaseAssetMoved: 0,
      breakdown: [],
      partial: true
    };

    let quantityRemaining = order.quantity - order.filled;
    let orders = [];
    if (order.type == 'buy') {
      //Finding orders that can match this one, either completely or partially
      orders = await Order.createQueryBuilder()
        .where('price <= :price', { price: order.price })
        .where({asset: order.asset, type: OrderType.SELL, status: OrderStatus.OPEN})
        .orderBy({ price: 'DESC'})
        .getMany();
    } else {
      //Finding orders that can match this one, either completely or partially
      orders = await Order.createQueryBuilder()
        .where('price >= :price', { price: order.price })
        .where({asset: order.asset, type: OrderType.BUY, status: OrderStatus.OPEN})
        .orderBy({ price: 'ASC' })
        .getMany();
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
      basket.ableToFulfill += quantityToMove;
      basket.amountOfBaseAssetMoved += quantityToMove * parseInt(currentOrder.price);
      basket.breakdown.push({
        order: currentOrder,
        boughtFromThisOrder: quantityToMove
      });

      //Breaking out of the loop (if need be)
      quantityRemaining -= quantityToMove;
      if (quantityRemaining == 0) {
        basket.partial = false;
        break;
      }
    }

    return basket;
  }

  public static async executeBasket(basket: Basket, order: Order): Promise<Object[]> {
    let operations = [];
    
    //Getting the order originator wallet
    const originatorWallets = await BitCapitalService.getWallets(order.user.id.toString());

    //Iterating through the orders, and updating them
    for (let i = 0; i <= basket.breakdown.length - 1; i++) {
      const currentOrder = basket.breakdown[i];
            
      //Attempting to move funds
      try {
        const orderInfo = await Order.findOne(currentOrder.order.id);

        //Moving crypto from the seller wallet to the buyer's one
        await BitCapitalService.moveTokens(currentOrder.boughtFromThisOrder, currentOrder.order.user, orderInfo.asset.id, originatorWallets[0].id);
        operations.push({
          asset: orderInfo.asset.id,
          quantity: currentOrder.boughtFromThisOrder
        });

        //Moving base asset from the buyer's wallet to the seller one
        const orderOwnerWallets = await BitCapitalService.getWallets(currentOrder.order.user.id.toString());

        const baseAssetToMove = currentOrder.boughtFromThisOrder * parseInt(currentOrder.order.price);
        await BitCapitalService.moveTokens(baseAssetToMove, order.user, base_asset.id, orderOwnerWallets[0].id);
        operations.push({
          asset: base_asset.id,
          quantity: baseAssetToMove
        });
      } catch (e) {
        throw new BaseError('There was an error trying to move assets around.');
      }

      //Updating the order
    }

    //Updating the main originating order

    return operations;
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