import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';

@Controller('/order')
export default class OrderController {

  @Post('/create')
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { asset, type, quantity }: { asset: string, type: string, quantity: number } = request.body;
    throw new HttpError('Not implemented yet.', HttpCode.Server.INTERNAL_SERVER_ERROR);
  }

}