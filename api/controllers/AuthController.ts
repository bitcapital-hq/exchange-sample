import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import AuthService from '../services/AuthService';
import BitCapitalService from '../services/BitcapitalService';
import Validate, { Params } from 'ts-framework-validation';
import {isValidName, isValidEmail, isValidPassword, isValidCPF} from '../Validators';

@Controller('/user')
export default class AuthController {
  @Post("/login", [
    Validate.middleware('email', Params.isValidEmail),
    Validate.middleware('password', Params.isValidPassword)
  ])
  public static async login(request: BaseRequest, response: BaseResponse) {
    const { email, password }: { email: string, password: string } = request.body;

    const service_response = await AuthService.getInstance().login(email, password);
    return response.success({
      access_token: service_response.token
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

    //Registering the user into the BitCapital service
    try {
      const bitcapital = await BitCapitalService.getInstance();
      const mediator = await BitCapitalService.authenticate();
      
    } catch (e) {

    }

    const service_response = await AuthService.getInstance().register(first_name, last_name, tax_id, email, password);
    return response.success({
      access_token: service_response.token
    });
  }
}