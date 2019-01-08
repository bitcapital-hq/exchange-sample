// Keep config as first import
import Server, { ServerOptions } from 'ts-framework';
import Config from '../config';
import StatusController from './controllers/StatusController';
import UptimeService from './services/UptimeService';
import MainDatabase from './database';

export default class MainServer extends Server {
  constructor(options?: ServerOptions) {
    super({
      ...Config.server,
      router: {
        controllers: { StatusController }
      },
      children: [
        MainDatabase.getInstance(),
        UptimeService.getInstance()
      ],
      ...options,
    });
  }
}
