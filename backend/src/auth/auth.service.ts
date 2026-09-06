import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  OAuth2Client,
} from 'google-auth-library';

import bcrypt = require('bcrypt');

import {
  randomInt,
} from 'crypto';

import {
  resolveMx,
} from 'dns/promises';

import {
  Repository,
} from 'typeorm';

import {
  MailService,
} from '../integrations/mail.service';

import {
  User,
} from '../users/user.entity';

import {
  UserRole,
} from './auth.types';

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


@Injectable()
export class AuthService {
  private readonly googleClient:
    OAuth2Client;


  private readonly otpExpiryMinutes =
    10;


  private readonly otpResendCooldownSeconds =
    60;


  private readonly maxOtpAttempts =
    5;


  constructor(
    @InjectRepository(User)
    private readonly users:
      Repository<User>,

    private readonly config:
      ConfigService,

    private readonly mail:
      MailService,
  ) {
    this.googleClient =
      new OAuth2Client(
        config.get<string>(
          'GOOGLE_CLIENT_ID',
        ),
      );
  }


  private publicUser(
    user: User,
  ) {
    return {
      id:
        user.id,

      name:
        user.name,

      email:
        user.email,

      phone:
        user.phone,

      role:
        user.role,

      emailVerified:
        user.emailVerified,
    };
  }


  /*
   * We cannot reliably ask Gmail/Yahoo
   * whether a particular mailbox exists.
   *
   * But we CAN reject invalid domains
   * and common typing mistakes before
   * sending the OTP.
   */
  private async validateEmailDomain(
    email: string,
  ) {
    const domain =
      email
        .split('@')[1]
        ?.toLowerCase();


    if (!domain) {
      throw new BadRequestException(
        'Enter a valid email address',
      );
    }


    const commonTypos:
      Record<
        string,
        string
      > = {
      'gmil.com':
        'gmail.com',

      'gmai.com':
        'gmail.com',

      'gmial.com':
        'gmail.com',

      'gmal.com':
        'gmail.com',

      'gmail.co':
        'gmail.com',

      'gmail.con':
        'gmail.com',

      'hotmai.com':
        'hotmail.com',

      'hotmal.com':
        'hotmail.com',

      'outlok.com':
        'outlook.com',

      'outloo.com':
        'outlook.com',

      'yaho.com':
        'yahoo.com',
    };


    const suggestion =
      commonTypos[
        domain
      ];


    if (suggestion) {
      throw new BadRequestException(
        `Email domain looks incorrect. Did you mean ${suggestion}?`,
      );
    }


    try {
      const records =
        await resolveMx(
          domain,
        );


      if (
        !records ||
        records.length === 0
      ) {
        throw new BadRequestException(
          'This email domain cannot receive email. Please check the address.',
        );
      }
    } catch (error) {
      if (
        error instanceof
        BadRequestException
      ) {
        throw error;
      }


      const dnsError =
        error as NodeJS.ErrnoException;


      /*
       * ENOTFOUND / ENODATA strongly
       * indicate an invalid mail domain.
       *
       * Temporary DNS errors should not
       * permanently reject a real user.
       */
      if (
        dnsError.code ===
          'ENOTFOUND' ||
        dnsError.code ===
          'ENODATA'
      ) {
        throw new BadRequestException(
          'This email domain does not appear to exist. Please check your email address.',
        );
      }
    }
  }


  private generateOtp() {
    return randomInt(
      100000,
      1000000,
    ).toString();
  }


  private otpExpiryDate() {
    return new Date(
      Date.now() +
        this.otpExpiryMinutes *
          60 *
          1000,
    );
  }


  private async sendVerificationOtp(
    user: User,
  ) {
    if (
      !this.mail.configured()
    ) {
      throw new ServiceUnavailableException(
        'Email verification service is not configured',
      );
    }


    const code =
      this.generateOtp();


    const codeHash =
      await bcrypt.hash(
        code,
        10,
      );


    user.emailVerificationCodeHash =
      codeHash;

    user.emailVerificationExpiresAt =
      this.otpExpiryDate();

    user.emailVerificationAttempts =
      0;

    user.emailVerificationLastSentAt =
      new Date();


    await this.users.save(
      user,
    );


    try {
      await this.mail
        .emailVerificationCode(
          user.email,
          user.name,
          code,
        );
    } catch {
      throw new ServiceUnavailableException(
        'Verification email could not be sent. Please try again.',
      );
    }
  }


  async register(
    dto: RegisterDto,
  ) {
    const email =
      dto.email
        .trim()
        .toLowerCase();


    const phone =
      dto.phone
        .replace(
          /\s+/g,
          '',
        );


    await this.validateEmailDomain(
      email,
    );


    const emailExists =
      await this.users
        .findOne({
          where: {
            email,
          },
        });


    if (emailExists) {
      if (
        !emailExists
          .emailVerified
      ) {
        throw new ConflictException(
          'This email is already waiting for verification. Use Resend code.',
        );
      }


      throw new ConflictException(
        'Email is already registered',
      );
    }


    const phoneExists =
      await this.users
        .findOne({
          where: {
            phone,
          },
        });


    if (phoneExists) {
      throw new ConflictException(
        'Phone number is already registered',
      );
    }


    const password =
      await bcrypt.hash(
        dto.password,
        12,
      );


    const user =
      await this.users.save(
        this.users.create({
          name:
            dto.name
              .trim(),

          email,

          phone,

          password,

          googleId:
            null,

          role:
            UserRole.CUSTOMER,

          emailVerified:
            false,

          emailVerificationCodeHash:
            null,

          emailVerificationExpiresAt:
            null,

          emailVerificationAttempts:
            0,

          emailVerificationLastSentAt:
            null,
        }),
      );


    await this.sendVerificationOtp(
      user,
    );


    return {
      message:
        'Verification code sent',

      email:
        user.email,

      expiresInMinutes:
        this.otpExpiryMinutes,
    };
  }


  async verifyEmail(
    dto: VerifyEmailDto,
  ) {
    const email =
      dto.email
        .trim()
        .toLowerCase();


    const user =
      await this.users
        .createQueryBuilder(
          'user',
        )
        .addSelect(
          'user.emailVerificationCodeHash',
        )
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email,
          },
        )
        .getOne();


    if (!user) {
      throw new BadRequestException(
        'Verification request not found',
      );
    }


    if (
      user.emailVerified
    ) {
      return this.publicUser(
        user,
      );
    }


    if (
      !user
        .emailVerificationCodeHash ||
      !user
        .emailVerificationExpiresAt
    ) {
      throw new BadRequestException(
        'No active verification code. Please request a new code.',
      );
    }


    if (
      user
        .emailVerificationAttempts >=
      this.maxOtpAttempts
    ) {
      throw new HttpException(
  'Too many incorrect attempts. Please request a new verification code.',
  HttpStatus.TOO_MANY_REQUESTS,
);
    }


    if (
      user
        .emailVerificationExpiresAt
        .getTime() <
      Date.now()
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new code.',
      );
    }


    const valid =
      await bcrypt.compare(
        dto.code,
        user
          .emailVerificationCodeHash,
      );


    if (!valid) {
      user
        .emailVerificationAttempts +=
        1;


      await this.users.save(
        user,
      );


      const remaining =
        this.maxOtpAttempts -
        user
          .emailVerificationAttempts;


      throw new BadRequestException(
        remaining > 0
          ? `Invalid verification code. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect attempts. Please request a new code.',
      );
    }


    user.emailVerified =
      true;

    user.emailVerificationCodeHash =
      null;

    user.emailVerificationExpiresAt =
      null;

    user.emailVerificationAttempts =
      0;

    user.emailVerificationLastSentAt =
      null;


    const saved =
      await this.users.save(
        user,
      );


    return this.publicUser(
      saved,
    );
  }


  async resendVerification(
    dto:
      ResendVerificationDto,
  ) {
    const email =
      dto.email
        .trim()
        .toLowerCase();


    await this.validateEmailDomain(
      email,
    );


    const user =
      await this.users
        .findOne({
          where: {
            email,
          },
        });


    /*
     * Generic response is safer because
     * it does not reveal whether random
     * email addresses have accounts.
     */
    if (!user) {
      return {
        message:
          'If this email has a pending account, a new verification code will be sent.',
      };
    }


    if (
      user.emailVerified
    ) {
      throw new BadRequestException(
        'This email is already verified',
      );
    }


    if (
      user
        .emailVerificationLastSentAt
    ) {
      const elapsedMs =
        Date.now() -
        user
          .emailVerificationLastSentAt
          .getTime();


      const cooldownMs =
        this
          .otpResendCooldownSeconds *
        1000;


      if (
        elapsedMs <
        cooldownMs
      ) {
        const secondsRemaining =
          Math.ceil(
            (
              cooldownMs -
              elapsedMs
            ) /
              1000,
          );


        throw new HttpException(
  `Please wait ${secondsRemaining} seconds before requesting another code.`,
  HttpStatus.TOO_MANY_REQUESTS,
);
      }
    }


    await this
      .sendVerificationOtp(
        user,
      );


    return {
      message:
        'A new verification code has been sent',
    };
  }


  async login(
    dto: LoginDto,
  ) {
    const email =
      dto.email
        .trim()
        .toLowerCase();


    const user =
      await this.users
        .createQueryBuilder(
          'user',
        )
        .addSelect(
          'user.password',
        )
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email,
          },
        )
        .getOne();


    if (
      !user ||
      !user.password
    ) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }


    const valid =
      await bcrypt.compare(
        dto.password,
        user.password,
      );


    if (!valid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }


    if (
      !user.emailVerified
    ) {
      throw new ForbiddenException(
        'Please verify your email before signing in',
      );
    }


    return this.publicUser(
      user,
    );
  }


  async googleLogin(
    credential: string,
  ) {
    const clientId =
      this.config.get<string>(
        'GOOGLE_CLIENT_ID',
      );


    if (!clientId) {
      throw new UnauthorizedException(
        'Google Sign-In is not configured',
      );
    }


    const ticket =
      await this
        .googleClient
        .verifyIdToken({
          idToken:
            credential,

          audience:
            clientId,
        });


    const payload =
      ticket.getPayload();


    if (
      !payload?.sub ||
      !payload.email ||
      !payload.email_verified
    ) {
      throw new UnauthorizedException(
        'Google account could not be verified',
      );
    }


    const email =
      payload.email
        .toLowerCase();


    let user =
      await this.users
        .findOne({
          where: [
            {
              googleId:
                payload.sub,
            },

            {
              email,
            },
          ],
        });


    if (!user) {
      user =
        await this.users.save(
          this.users.create({
            name:
              payload.name ||
              email
                .split('@')[0],

            email,

            phone:
              null,

            password:
              null,

            googleId:
              payload.sub,

            role:
              UserRole.CUSTOMER,

            /*
             * Google only reaches this
             * point when Google says
             * email_verified = true.
             */
            emailVerified:
              true,

            emailVerificationCodeHash:
              null,

            emailVerificationExpiresAt:
              null,

            emailVerificationAttempts:
              0,

            emailVerificationLastSentAt:
              null,
          }),
        );
    } else {
      let changed =
        false;


      if (
        !user.googleId
      ) {
        user.googleId =
          payload.sub;

        changed =
          true;
      }


      /*
       * Google verified this exact email,
       * so an existing matching manual
       * account can safely be marked
       * verified.
       */
      if (
        !user.emailVerified
      ) {
        user.emailVerified =
          true;

        user.emailVerificationCodeHash =
          null;

        user.emailVerificationExpiresAt =
          null;

        user.emailVerificationAttempts =
          0;

        user.emailVerificationLastSentAt =
          null;

        changed =
          true;
      }


      if (changed) {
        user =
          await this.users
            .save(
              user,
            );
      }
    }


    return this.publicUser(
      user,
    );
  }
}