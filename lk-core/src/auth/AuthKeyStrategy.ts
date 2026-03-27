import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import APIService from '../services/api.service';
import { Service } from '../entity/Service';

@Injectable()
export class AuthKeyStrategy extends PassportStrategy(Strategy, 'auth-key') {
  private readonly HEADER_NAME = 'Auth-Key'.toLowerCase();
  constructor(private readonly service: APIService) {
      super();
  }
  async validate(request: any): Promise<Service | null> {
      const authKey = request.headers[this.HEADER_NAME];
      if (!authKey) return null;
      return this.service.findByAuthKey(authKey).catch(e => {
          if (!e.message.includes(`invalid input syntax for type uuid:`))
              throw e;
          return null;
      });
  }
}
