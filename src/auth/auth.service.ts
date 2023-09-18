import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(id: number): Promise<any> {
    const payload = { id: id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
