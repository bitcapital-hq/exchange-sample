import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post, Delete } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import {isValidAssetCode} from '../Validators';
import BitCapitalService from '../services/BitcapitalService';
import Bitcapital, { AssetSchema } from 'bitcapital-core-sdk';
import { Logger } from 'ts-framework-common';
import { HTTPTransport } from '@sentry/node/dist/transports';

@Controller('/asset')
export default class AssetController {

  @Post('/create', [
    Validate.middleware('name', Params.isValidName),
    Validate.middleware('code', isValidAssetCode)
  ])
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { name, code }: { name: string, code: string } = request.body;
    let asset: AssetSchema;

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
      const token = await BitCapitalService.emitToken(id, recipient, amount);
      response.success(token);
    } catch (e) {
      throw new HttpError('There was an error trying to emit tokens.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/all')
  public static async getAll(request: BaseRequest, response: BaseResponse) {
    try {
      const assets = await BitCapitalService.getAllAssets();
      response.success(assets);
    } catch (e) {
      throw new HttpError('There was an error trying to get all assets.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/delete')
  public static async delete(request: BaseRequest, response: BaseResponse) {
    const { id }: { id:string } = request.body;
    try {
      const deleteAssets = await BitCapitalService.deleteAsset(id);
      response.success(deleteAssets);
    } catch (e) {
      throw new HttpError('There was an error trying to delete the requested asset.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }
}