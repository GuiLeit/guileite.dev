import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin login — sets HttpOnly cookie' })
  @ApiBody({ schema: { properties: { password: { type: 'string' } } } })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.auth.login(body.password);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { authenticated: true };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin logout — clears cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { authenticated: false };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check auth status' })
  me(@Req() req: Request) {
    return { authenticated: true, user: (req as any).user };
  }
}
