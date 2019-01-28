import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import OrderService from '../services/OrderService';
import AuthService from '../services/AuthService';
import { User } from '../models';
import Validate, { Params } from 'ts-framework-validation';
import { isValidAmount, isValidGuid, isValidOrderType, isValidAssetHybrid } from '../Validators';

@Controller('/order')
export default class OrderController {
  @Post('/create/', [
    Validate.middleware('asset', isValidAssetHybrid),
    Validate.middleware('type', isValidOrderType),
    Validate.middleware('quantity', isValidAmount),
    Validate.middleware('price', isValidAmount),
    Validate.middleware('token', isValidGuid)
  ])
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { asset, type, quantity, price, token }: { asset: string, type: string, quantity: number, price: string, token: string } = request.body;

    //Checking if the given token is valid
    const token_info = await AuthService.getInstance().getTokenInfo(token);
    if (!token_info.valid) {
      throw new HttpError('Invalid token.', HttpCode.Client.FORBIDDEN);
    }

    try {
      //Getting the token holder's user info
      const user = await User.findOne(token_info.owner);
      const order = await OrderService.create(asset, type, quantity, price, user);
      response.success(order);
    } catch (e) {
      if (e.hasOwnProperty('originalMessage') && e.originalMessage == "You don't have enough funds to open this position.") {
        throw new HttpError('You do not have enough funds to fully liquidate this position once open.', HttpCode.Client.BAD_REQUEST);  
      }

      throw new HttpError('There was an error trying to create an order.', HttpCode.Server.INTERNAL_SERVER_ERROR, e);
    }
  }
}