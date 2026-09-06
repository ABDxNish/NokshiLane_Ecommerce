import {
  Module,
} from '@nestjs/common';

import {
  SslCommerzService,
} from './sslcommerz.service';


@Module({
  providers: [
    SslCommerzService,
  ],

  exports: [
    SslCommerzService,
  ],
})
export class PaymentsModule {}
