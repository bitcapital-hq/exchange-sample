import { BaseError, Service, ServiceOptions, Logger, LoggerUtils } from 'ts-framework-common';
import Bitcapital, {User, Session, StorageUtil, MemoryStorage, AssetSchema, Wallet} from 'bitcapital-core-sdk'
import {User as ExchangeUser, Asset} from '../models'
import { apiCredentials, mediatorCredentials } from '../../config/bitcapital.config';
import json5 = require('json5');
import { mediator_info, base_asset } from '../../config/exchange.config';

const session = new Session({
  storage: new StorageUtil("session", new MemoryStorage()),
  http: apiCredentials,
  oauth: apiCredentials
});

export interface BitCapitalServiceOptions extends ServiceOptions {
}

export default class BitCapitalService extends Service {
  public static bitCapitalClient: Bitcapital;
  public options: BitCapitalServiceOptions;
  private static mediator: User;
  
  constructor(options?: BitCapitalServiceOptions) {
    super(options);
  }

  public static async initialize(options?: BitCapitalServiceOptions) {
    this.bitCapitalClient = Bitcapital.initialize({
      session,
      ...apiCredentials
    });

    try {
      await this.authenticate();
      return this.bitCapitalClient;
    } catch (e) {
      throw new BaseError(e);
    }
  }

  public static async getInstance(options?: BitCapitalServiceOptions) {
    if (this.bitCapitalClient) {
      return this.bitCapitalClient;
    }

    return await this.initialize();
  }

  public static async authenticate(): Promise<User> {
    try {
      const client = await this.getInstance();
      const mediator = await client.session().password({
        username: mediatorCredentials.username,
        password: mediatorCredentials.password
      });

      // if (mediator.role !== 'mediator') {
      //   throw new BaseError('Could not instantiate a mediator session.');
      // }

      await Logger.getInstance().silly(`[BitCapital Service] Succesfully authenticated as ${mediatorCredentials.username}`);
      await Logger.getInstance().silly(`[BitCapital Service] Credential level: ${mediator.role}`);
      this.mediator = mediator;
      return mediator;
    } catch (e) {
      throw new BaseError(e);
    }
  }

  public static async registerConsumer(user: ExchangeUser) {
    try {
      const remoteUser = await this.bitCapitalClient.consumers().create({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        consumer: {
          taxId: user.tax_id
        }
      } as any);

      //Saving the user's BitCapital id into the database
      user.bitcapital_id = remoteUser.id;
      await user.save();
    } catch (e) {
      throw new BaseError('Could not create BitCapital user.');
    }

    return true;
  }

  public static async removeConsumer(user: ExchangeUser) {
    try {
      this.bitCapitalClient.consumers().delete(user.bitcapital_id);
    } catch (e) {
      throw new BaseError('Could not remove the customer from BitCapital.');
    }

    return true;
  }

  public static async getWallets(id: string) {
    let user = await ExchangeUser.findOne(id);
    if (!user) {
      throw new BaseError('Invalid user_id.');
    }

    try {
      const consumer = await this.bitCapitalClient.consumers().findOne(user.bitcapital_id);
      return consumer.wallets;
    } catch (e) {
      throw new BaseError('There was an error trying to get the requested user\'s wallet.');
    }
  }

  public static async getWalletInfo(id: string) {
    try {
      return await this.bitCapitalClient.wallets().findOne(id);
    } catch (e) {
      throw new BaseError('There was an error trying to get information about a wallet.');
    }
  }

  public static async getUser(user: ExchangeUser) {
    try {
      return await this.bitCapitalClient.consumers().findOne(user.bitcapital_id);
    } catch (e) {
      throw new BaseError('There was an error trying to get consumer information');
    }
  }

  public static async getAssetBalance(user: ExchangeUser, asset_id: string): Promise<string> {
    //Getting asset from database
    let asset: Asset;
    try {
      asset = await Asset.findOne(asset_id);
    } catch (e) {
      throw new BaseError('Invalid asset ID.');
    }

    const wallets = await this.getWallets(user.id.toString());
    try {
      //Iteraing through all balances and attempting to find the requested one
      const wallet_info = await this.getWalletInfo(wallets[0].id);
      for (let i = 0; i <= wallet_info.balances.length - 1; i++) {
        let in_wallet_asset_info = wallet_info.balances[i];
        if (in_wallet_asset_info.asset_code == asset.code) {
          await Logger.getInstance().debug(require('util').inspect(in_wallet_asset_info));
          return in_wallet_asset_info.balance.toString();
        }
      }

      return '0';
    } catch (e) {
      throw new BaseError('There was a problem trying to get the user\'s balance.');
    }
  }

  public static async moveFunds(quantity: number, source: string, destination: string = mediator_info.wallet): Promise<boolean> {
    try {
      const wallets = await this.getWallets(source); 
      const payment_info = await this.bitCapitalClient.payments().pay({
        asset: base_asset.bitcapital_id,
        source: wallets[0].id,
        recipients: [{
          amount: quantity.toString(),
          destination: destination
        }]
      });

      return true;
    } catch (e) {
      await Logger.getInstance().debug(require('util').inspect(e));
      throw new BaseError('There was an error trying to move funds out of the user\'s wallet.');
    }
  }

  //Methods from here on now are not meant for user-facing usage, they're just here to facilitate demonstrations/tests.
  public static async createAsset(name: string, code: string) {
    try {
      return await this.bitCapitalClient.assets().create({
        name: name,
        code: code
      });
    } catch (e) {
      throw new BaseError('There was an error trying to create the asset on BitCapital.');
    }
  }

  public static async getAllAssets() {
    try {
      return await this.bitCapitalClient.assets().findAll({});
    } catch (e) {
      throw new BaseError('There was an error querying the BitCapital API for assets.');
    }
  }

  public static async deleteAsset(id: string) {
    const asset = await this.bitCapitalClient.assets().findOne(id);
    if (!asset) {
      throw new BaseError('Invalid BitCapital asset ID.');
    }
    
    try {
      await this.bitCapitalClient.assets().delete(id);
      return asset;
    } catch (e) {
      throw new BaseError('There was an error trying to delete the asset from BitCapital.');
    }
  }

  public static async emitToken(id: string, recipient: string, amount: string) {
    //Getting the BitCapital ID of the asset
    let asset: Asset;
    try {
      asset = await Asset.findOne(id);
    } catch(e) {
      throw new BaseError('Invalid asset ID.');
    }

    if (!asset) {
      throw new BaseError('Invalid asset ID.');
    }

    //Emitting the assets
    let wallets = await this.getWallets(recipient);
    try {
      return await this.bitCapitalClient.assets().emit({
        amount: amount,
        destination: wallets[0].id,
        id: asset.bitcapital_asset_id
      });
    } catch (e) {
      throw new BaseError('There was an error trying to emit tokens on the BitCapital network, make sure you have permission to emit the given asset.');
    }
  }

  async onMount(): Promise<void> {
    this.logger.debug('Mounting BitCapitalService instance');
  }

  async onInit(): Promise<void> {
    this.logger.debug('Initializing BitCapitalService instance');
  }

  async onReady(): Promise<void> {
    this.logger.info('BitCapitalService initialized successfully');
  }

  async onUnmount(): Promise<void> {
    this.logger.debug('Unmounting BitCapitalService instance');
  }
}