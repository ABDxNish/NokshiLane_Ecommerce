import {
  Global,
  Module,
} from '@nestjs/common';

import {
  MailService,
} from './mail.service';

import {
  RealtimeService,
} from './realtime.service';

@Global()
@Module({
  providers: [
    MailService,
    RealtimeService,
  ],

  exports: [
    MailService,
    RealtimeService,
  ],
})
export class IntegrationsModule {}
