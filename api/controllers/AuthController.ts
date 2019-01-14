import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import AuthService from '../services/AuthService';
import { User as BitcapitalUser } from 'bitcapital-core-sdk';
import { User } from '../models';

@Controller('/auth')
export default class AuthController {
  @Post("/login")
  public static async login(request: BaseRequest, response: BaseResponse) {
    const { email, password }: { email: string, password: string } = request.body;

    const session = await AuthService.getInstance().login(email, password);
    response.setHeader("Autorization", `Bearer ${session.token}`);

    return response.success();
  }

  @Post("/register")
  public static async register(request: BaseRequest, response: BaseResponse) {
    const { first_name, last_name, email, password }: { first_name: string, last_name: string, email: string, password: string } = request.body;

    //Checking if all required fields are present
    if (!first_name || !last_name || !email || !password) {
      throw new HttpError('All fields are required.', HttpCode.Client.BAD_REQUEST);
    }

    const session = await AuthService.getInstance().register(first_name, last_name, email, password);

    response.setHeader("Authorization", `Bearer ${session.token}`);
    return response.success();
  }
}
