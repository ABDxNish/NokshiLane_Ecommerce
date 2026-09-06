import {
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';

import {
  Request,
} from 'express';

import {
  AuthService,
} from './auth.service';

import {
  GoogleDto,
} from './dto/google.dto';

import {
  LoginDto,
} from './dto/login.dto';

import {
  RegisterDto,
} from './dto/register.dto';

import {
  ResendVerificationDto,
} from './dto/resend-verification.dto';

import {
  VerifyEmailDto,
} from './dto/verify-email.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth:
      AuthService,
  ) {}


  @Post('register')
  async register(
    @Body()
    dto: RegisterDto,
  ) {
    /*
     * IMPORTANT:
     *
     * Do NOT create the login session here.
     * Email must be verified first.
     */
    return this.auth
      .register(
        dto,
      );
  }


  @Post('verify-email')
  async verifyEmail(
    @Body()
    dto: VerifyEmailDto,

    @Req()
    req: Request,
  ) {
    const user =
      await this.auth
        .verifyEmail(
          dto,
        );


    /*
     * Account becomes logged in
     * only after successful OTP.
     */
    req.session.user =
      user;


    return user;
  }


  @Post('resend-verification')
  async resendVerification(
    @Body()
    dto:
      ResendVerificationDto,
  ) {
    return this.auth
      .resendVerification(
        dto,
      );
  }


  @Post('login')
  async login(
    @Body()
    dto: LoginDto,

    @Req()
    req: Request,
  ) {
    const user =
      await this.auth
        .login(
          dto,
        );


    req.session.user =
      user;


    return user;
  }


  @Post('google')
  async google(
    @Body()
    dto: GoogleDto,

    @Req()
    req: Request,
  ) {
    const user =
      await this.auth
        .googleLogin(
          dto.credential,
        );


    req.session.user =
      user;


    return user;
  }


  @Get('me')
  me(
    @Req()
    req: Request,
  ) {
    return (
      req.session.user ||
      null
    );
  }


  @Post('logout')
  logout(
    @Req()
    req: Request,
  ) {
    return new Promise(
      (
        resolve,
        reject,
      ) => {
        req.session
          .destroy(
            (error) => {
              if (error) {
                reject(
                  error,
                );

                return;
              }


              resolve({
                message:
                  'Logged out successfully',
              });
            },
          );
      },
    );
  }
}