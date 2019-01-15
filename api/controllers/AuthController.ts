import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import AuthService from '../services/AuthService';
import Validate, { Params } from 'ts-framework-validation';
import {isValidName, isValidEmail, isValidPassword} from '../Validators';

@Controller('/user')
export default class AuthController {
  @Post("/login", [
    Validate.middleware('email', Params.isValidEmail),
    Validate.middleware('password', Params.isValidPassword)
  ])
  public static async login(request: BaseRequest, response: BaseResponse) {
    const { email, password }: { email: string, password: string } = request.body;

    const session = await AuthService.getInstance().login(email, password);
    return response.success({
      access_token: session
    });
  }

  @Post("/register", [
    Validate.middleware('first_name', isValidName),
    Validate.middleware('last_name', isValidName),
    Validate.middleware('email', isValidEmail),
    Validate.middleware('password', isValidPassword)
  ])
  public static async register(request: BaseRequest, response: BaseResponse) {
    const { first_name, last_name, email, password }: { first_name: string, last_name: string, email: string, password: string } = request.body;

    const session = await AuthService.getInstance().register(first_name, last_name, email, password);
    return response.success({
      access_token: session
    });
  }
}
