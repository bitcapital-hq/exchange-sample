// Keep config as first import
import Server, { ServerOptions } from 'ts-framework';
import Config from '../config';
import * as Controllers from './controllers';
import MainDatabase from './database';
import UptimeService from './services/UptimeService';
import AuthService from './services/AuthService';
import BitCapitalService from './services/BitcapitalService';

export default class MainServer extends Server {
  constructor(options?: ServerOptions) {
    super({
      ...Config.server,
      router: {
        controllers: Controllers,
      },
      children: [
        MainDatabase.getInstance(),
        UptimeService.getInstance()
      ],
      ...options,
    });
  }

  public async onReady() {
    AuthService.initialize({name: ''});
    BitCapitalService.initialize({name: ''});
    await super.onReady();
  }
}
