import { Controller, Get, BaseRequest, BaseResponse, HttpError, HttpCode, Post, Delete } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import {isValidAssetCode, isValidGuid, isValidAmount} from '../Validators';
import BitCapitalService from '../services/BitcapitalService';
import { Asset } from '../models';
import { AssetType } from '../models/Asset';
import { Logger } from 'ts-framework-common';
import { UserRole } from 'bitcapital-core-sdk';

@Controller('/asset')
export default class AssetController {

  @Post('/create', [
    Validate.middleware('name', Params.isValidName),
    Validate.middleware('code', isValidAssetCode)
  ])
  public static async create(request: BaseRequest, response: BaseResponse) {
    const { name, code, type }: { name: string, code: string, type: string } = request.body;
    
    try {
      const asset = await BitCapitalService.createAsset(name, code);
      const exchange_asset = new Asset({
        name: name,
        code: code,
        type: (type == 'fiat' ? AssetType.FIAT : AssetType.CRYPTO)
      });
      exchange_asset.bitcapital_asset_id = asset.id;
      await exchange_asset.save();
      response.success(exchange_asset);
    } catch (e) {
      throw new HttpError('An error occured whilst trying to create the asset in the BitCapital service.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/emit', [
    Validate.middleware('id', isValidGuid),
    Validate.middleware('recipient', isValidGuid),
    Validate.middleware('amount', isValidAmount)
  ])
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

  @Delete('/delete', [
    Validate.middleware('id', isValidGuid)
  ])
  public static async delete(request: BaseRequest, response: BaseResponse) {
    const { id }: { id: string } = request.body;
    try {
      const asset = await Asset.findOne(id);
      if (!asset) {
        throw new HttpError('Invalid asset ID.', HttpCode.Client.BAD_REQUEST);
      }
      
      const deletedAssets = await BitCapitalService.deleteAsset(asset.bitcapital_asset_id);
      await asset.remove();
      response.success(deletedAssets);
    } catch (e) {
      await Logger.getInstance().debug(require('util').inspect(e));
      throw new HttpError('There was an error trying to delete the requested asset.', HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }
}