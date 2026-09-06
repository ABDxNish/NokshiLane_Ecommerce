import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  Request,
} from 'express';

import {
  SessionGuard,
} from '../auth/session.guard';

import {
  UsersService,
} from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users:
      UsersService,
  ) {}

  @Get('profile')
  @UseGuards(
    SessionGuard,
  )
  profile(
    @Req()
    req: Request,
  ) {
    return this.users.profile(
      req.session.user!.id,
    );
  }
}
