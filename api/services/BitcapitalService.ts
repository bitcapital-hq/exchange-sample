import { BaseError, Service, ServiceOptions, Logger } from 'ts-framework-common';
import Bitcapital, {User, Session, StorageUtil, MemoryStorage, AssetSchema} from 'bitcapital-core-sdk'
import {User as ExchangeUser} from '../models'
import { apiCredentials, mediatorCredentials } from '../../config/bitcapital.config';
import json5 = require('json5');

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

      if (mediator.role !== 'mediator') {
        throw new BaseError('Could not instantiate a mediator session.');
      }

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

  public static async getAllConsumers() {
    try {
      return this.bitCapitalClient.consumers().findAll({skip: 0});
    } catch (e) {
      throw new BaseError('There was an error whilst querying BitCapital for consumers.');
    }
  }

  public static async getWallets(id: string) {
    let user = await ExchangeUser.findOne({where: {id: id}});
    if (!user) {
      throw new BaseError('Invalid user_id.');
    }

    try {
      return await this.bitCapitalClient.consumers().findWalletsById(user[0].bitcapital_id);
    } catch (e) {
      throw new BaseError('There was an error trying to get the requested user\'s wallet.', e);
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

  public static async listAssets() {
    return await this.bitCapitalClient.assets().findAll({});
  }

  public static async deleteAsset(id: string) {
    try {
      return await this.bitCapitalClient.assets().delete(id);
    } catch (e) {
      throw new BaseError('There was an error trying to delete the asset from BitCapital.');
    }
  }

  public static async emitToken(id: string, recipient: string, amount: string) {
    try {
      const wallet = this.getWallets(id);
      return await this.bitCapitalClient.assets().emit({
        amount: amount,
        id: id,
        destination: wallet[0]
      });
    } catch (e) {
      throw new BaseError('There was an error trying to emit assets to a wallet, make sure you have permission to generate tokens of this asset.');
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