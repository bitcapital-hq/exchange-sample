import { BaseError, Service, ServiceOptions } from 'ts-framework-common';
import Bitcapital, {User as BitcapitalUser, Session, StorageUtil, MemoryStorage} from 'bitcapital-core-sdk'
import { credentials } from '../../config/bitcapital.config';

export interface BitcapitalServiceOptions extends ServiceOptions {
}

export default class BitcapitalService extends Service {
  protected static instance: BitcapitalService;
  public options: BitcapitalServiceOptions;
  private const session = new Session({
    storage: new StorageUtil("session", new MemoryStorage()),
    http: credentials,
    oauth: credentials
  });

  constructor(options: BitcapitalServiceOptions) {
    super(options);
  }

  public static getInstance(options: BitcapitalServiceOptions) {
    if (!this.instance) {
      throw new BaseError("BitCapital service is invalid or hasn't been initialized yet");
    }
    return this.instance;
  }

  public static initialize(options: BitcapitalServiceOptions) {
    const service = new BitcapitalService(options);

    if(!this.instance) {
      this.instance = service;
    }

    return service;
  }
  
  async onMount(): Promise<void> {
    this.logger.debug('Mounting BitcapitalService instance');
  }

  async onInit(): Promise<void> {
    this.logger.debug('Initializing BitcapitalService instance');
  }

  async onReady(): Promise<void> {
    this.logger.info('BitcapitalService initialized successfully');
  }

  async onUnmount(): Promise<void> {
    this.logger.debug('Unmounting BitcapitalService instance');
  }


}