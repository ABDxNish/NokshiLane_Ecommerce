import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import Pusher = require('pusher');

@Injectable()
export class RealtimeService {
  private readonly pusher?:
    Pusher;

  constructor(
    config:
      ConfigService,
  ) {
    const appId =
      config.get<string>(
        'PUSHER_APP_ID',
      );

    const key =
      config.get<string>(
        'PUSHER_KEY',
      );

    const secret =
      config.get<string>(
        'PUSHER_SECRET',
      );

    const cluster =
      config.get<string>(
        'PUSHER_CLUSTER',
      ) || 'ap2';

    if (
      appId &&
      key &&
      secret
    ) {
      this.pusher =
        new Pusher({
          appId,
          key,
          secret,
          cluster,
          useTLS: true,
        });
    }
  }

  configured() {
    return Boolean(
      this.pusher,
    );
  }

  async notifyUser(
    userId: string,

    payload:
      Record<
        string,
        unknown
      >,
  ) {
    if (!this.pusher) {
      return;
    }

    await this.pusher.trigger(
      `user-${userId}`,
      'notification',
      payload,
    );
  }

  async notifyAdmin(
    payload:
      Record<
        string,
        unknown
      >,
  ) {
    if (!this.pusher) {
      return;
    }

    await this.pusher.trigger(
      'admin-orders',
      'order-created',
      payload,
    );
  }
}
