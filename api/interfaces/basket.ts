import { Order } from "../models";

export interface OrderBreakdown {
  order: Order,
  boughtFromThisOrder: number
}

export interface Basket {
    ableToFulfill: number,
    amountOfBaseAssetMoved: number,
    breakdown: OrderBreakdown[],
    partial: boolean
  }  