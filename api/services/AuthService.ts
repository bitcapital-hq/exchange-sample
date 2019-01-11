import { BaseError, Service, ServiceOptions } from 'ts-framework-common';
import { HttpError, HttpCode } from 'ts-framework'; 
import { User } from '../models'
import { authenticateUser } from '../../config/bitcapital.client.config';
import Session from '../models/Session';
import { getRepository, Repository } from 'typeorm';

export interface AuthServiceOptions extends ServiceOptions {
}

export default class AuthService extends Service {
  protected static instance: AuthService;
  public options: AuthServiceOptions;

  private sessionRepository: Repository<Session>

  constructor(options: AuthServiceOptions) {
    super(options);
    this.sessionRepository = getRepository(Session);
  }

  public static getInstance(options: AuthServiceOptions) {
    if (!this.instance) {
      throw new BaseError("auth service is invalid or hasn't been initialized yet");
    }
    return this.instance;
  }

  public static initialize(options: AuthServiceOptions) {
    const service = new AuthService(options);

    if(!this.instance) {
      this.instance = service;
    }

    return service;
  }
  
  async onMount(): Promise<void> {
    this.logger.debug('Mounting AuthService instance');
  }

  async onInit(): Promise<void> {
    this.logger.debug('Initializing AuthService instance');
  }

  async onReady(): Promise<void> {
    this.logger.info('AuthService initialized successfully');
  }

  async onUnmount(): Promise<void> {
    this.logger.debug('Unmounting AuthService instance');
  }

  //Login
  public async login(email: string, password: string): Promise<Session> {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new HttpError('Not found', HttpCode.Client.NOT_FOUND);
    }

    if (await user.validatePassword(password)) {
      throw new HttpError('Invalid password.', HttpCode.Client.UNAUTHORIZED)
    }

    const authenticated_user = await authenticateUser(user);
    const session = new Session({
      email: user.email,
      token: user.bitcapital_token
    });

    return await this.sessionRepository.save(session);
  }
}