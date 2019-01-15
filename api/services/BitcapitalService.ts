import { BaseError, Service, ServiceOptions } from 'ts-framework-common';
import Bitcapital, {User, Session, StorageUtil, MemoryStorage} from 'bitcapital-core-sdk'
import { credentials } from '../../config/bitcapital.config';

const session = new Session({
  storage: new StorageUtil("session", new MemoryStorage()),
  http: credentials,
  oauth: credentials
});

export interface BitCapitalServiceOptions extends ServiceOptions {
}

export default class BitCapitalService extends Service {
  public static bitCapitalClient: Bitcapital;
  public options: BitCapitalServiceOptions;

  constructor(options?: BitCapitalServiceOptions) {
    super(options);
  }

  public static async initialize(options?: BitCapitalServiceOptions) {
    this.bitCapitalClient = Bitcapital.initialize({
      session,
      ...credentials
    });

    try {
      await this.bitCapitalClient.session().clientCredentials();

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

  public static async authenticate(username: string, password: string): Promise<User> {
    try {
      const client = await this.getInstance();
      const mediator = await client.session().password({
        username: credentials.clientId,
        password: credentials.clientSecret
      });

      if (mediator.role !== 'mediator') {
        throw new BaseError('Could not instantiate a mediator session.');
      }

      return mediator;
    } catch (e) {
      throw new BaseError(e);
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