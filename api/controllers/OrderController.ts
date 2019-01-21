import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import OrderService from '../services/OrderService';
import AuthService from '../services/AuthService';

@Controller('/order')
export default class OrderController {

  @Post('/create')
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { asset, type, quantity, price, token }: { asset: string, type: string, quantity: number, price: string, token: string } = request.body;
    
    //Checking if the given token is valid
    const token_info = await AuthService.getInstance().getTokenInfo(token);
    if (!token_info.valid) {
      response.success(token_info);
      throw new HttpError('Invalid token.', HttpCode.Client.FORBIDDEN);
    }

    throw new HttpError('Not implemented yet.', HttpCode.Server.NOT_IMPLEMENTED);
    return true;

    try {
      const order = await OrderService.create(asset, type, quantity, price);
      response.success(order);
    } catch (e) {
      throw new HttpError('There was an error trying to create an order.', HttpCode.Server.INTERNAL_SERVER_ERROR, e);
    }
  }

}