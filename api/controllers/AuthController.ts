import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import AuthService from '../services/AuthService';
import BitCapitalService from '../services/BitcapitalService';
import Validate, { Params } from 'ts-framework-validation';
import {isValidName, isValidEmail, isValidPassword, isValidCPF, isValidGuid} from '../Validators';
import { Session } from '../models';
import OrderService from '../services/OrderService';

@Controller('/user')
export default class AuthController {
  @Post("/login", [
    Validate.middleware('email', Params.isValidEmail),
    Validate.middleware('password', Params.isValidPassword)
  ])
  public static async login(request: BaseRequest, response: BaseResponse) {
    const { email, password }: { email: string, password: string } = request.body;

    const login_information = await AuthService.getInstance().login(email, password);
    return response.success({
      id: login_information.user.id,
      access_token: login_information.token,
      bitcapital_id: login_information.user.bitcapital_id
    });
  }

  @Post("/register", [
    Validate.middleware('first_name', isValidName),
    Validate.middleware('last_name', isValidName),
    Validate.middleware('email', isValidEmail),
    Validate.middleware('password', isValidPassword),
    Validate.middleware('tax_id', isValidCPF)
  ])
  public static async register(request: BaseRequest, response: BaseResponse) {
    const { first_name, last_name, email, password, tax_id }: { first_name: string, last_name: string, email: string, password: string, tax_id: string } = request.body;

    //Registering the user into our database
    const user_creation_info = await AuthService.getInstance().register(first_name, last_name, tax_id, email, password);
    
    //Registering the user into the BitCapital service
    try {
      const bitcapital_user = await BitCapitalService.registerConsumer(user_creation_info.user);
    } catch (e) {
      //Deleting session and user from the database
      Session.delete(user_creation_info.token);
      user_creation_info.user.remove();
      throw new HttpError('There was an error trying to register the user in the BitCapital service.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
    
    return response.success({
      id: user_creation_info.user.id,
      access_token: user_creation_info.token,
      bitcapital_id: user_creation_info.user.bitcapital_id
    });
  }

  @Post("/me", [
    Validate.middleware('token', isValidGuid)
  ])
  public static async me(request: BaseRequest, response: BaseResponse) {
      const { token }: { token: string } = request.body;

      //Checking if the given token is valid
      const token_info = await AuthService.getInstance().getTokenInfo(token);
      if (!token_info.valid) {
        throw new HttpError('Invalid token.', HttpCode.Client.FORBIDDEN);
      }
      
      try {
        const userInfo = {
          balances: await BitCapitalService.getPrettyBalances(token_info.owner)
        }

        response.success(userInfo);
      } catch (e) {
        throw new HttpError('There was an error whilst gathering information about an user.', HttpCode.Server.INTERNAL_SERVER_ERROR, e);
      }
  }

  @Post("/orders", [
    Validate.middleware('token', isValidGuid)
  ])
  public static async orders(request: BaseRequest, response: BaseResponse) {
    const { token }: { token: string } = request.body;

    //Checking if the given token is valid
    const token_info = await AuthService.getInstance().getTokenInfo(token);
    if (!token_info.valid) {
      throw new HttpError('Invalid token.', HttpCode.Client.FORBIDDEN);
    }
    
    try {
      response.success(await OrderService.getOrdersFromUser(token_info.owner));
    } catch (e) {
      throw new HttpError('There was an error trying to get order information about an user.', HttpCode.Server.INTERNAL_SERVER_ERROR, e);
    }
  }
}