import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(password: string): Promise<string> {
    const hash = process.env.ADMIN_PASSWORD_HASH ?? '';
    const valid = await bcrypt.compare(password, hash);
    if (!valid) throw new UnauthorizedException('Invalid password');
    return this.jwt.sign({ role: 'admin' });
  }
}
