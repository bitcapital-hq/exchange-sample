import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import {isValidAssetCode} from '../Validators';
import BitCapitalService from '../services/BitcapitalService';
import Bitcapital, { AssetSchema } from 'bitcapital-core-sdk';
import { Logger } from 'ts-framework-common';

@Controller('/asset')
export default class AssetController {

  @Post('/create', [
    Validate.middleware('name', Params.isValidName),
    Validate.middleware('code', isValidAssetCode)
  ])
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { name, code }: { name: string, code: string } = request.body;
    let asset: AssetSchema;
    // response.success(await BitCapitalService.createAsset(name, code));
    // return true;

    try {
      let asset = await BitCapitalService.createAsset(name, code);
      response.success(asset);
    } catch (e) {
      throw new HttpError('An error occured whilst trying to create the asset in the BitCapital service.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }

    
  }

  @Post('/emit')
  public static async emit(request: BaseRequest, response: BaseResponse) {
    const { id, recipient, amount }: { id: string, recipient: string, amount: string } = request.body;
    try {
      await BitCapitalService.emitToken(id, recipient, amount);
    } catch (e) {
      throw new HttpError('There was an error trying to emit tokens.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/consumers')
  public static async getConsumers(request: BaseRequest, response: BaseResponse) {
    response.success(await BitCapitalService.getAllConsumers());
  }
}