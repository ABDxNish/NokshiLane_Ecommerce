import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  Order,
} from '../orders/order.entity';

import {
  User,
} from '../users/user.entity';


type SslInitiationResponse = {
  status?: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
};


export type SslValidationResponse = {
  status?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_brand?: string;
  risk_level?: string;
  risk_title?: string;
};


@Injectable()
export class SslCommerzService {
  constructor(
    private readonly config:
      ConfigService,
  ) {}


  // =========================================
  // ENVIRONMENT
  // =========================================

  private live() {
    return (
      this.config.get<string>(
        'SSL_IS_LIVE',
        'false',
      ) === 'true'
    );
  }


  private isProduction() {
    return (
      this.config.get<string>(
        'NODE_ENV',
      ) === 'production'
    );
  }


  // =========================================
  // SSLCOMMERZ CREDENTIALS
  // =========================================

  private credentials() {
    const storeId =
      this.config
        .get<string>(
          'SSL_STORE_ID',
        )
        ?.trim();


    const storePassword =
      this.config
        .get<string>(
          'SSL_STORE_PASSWORD',
        )
        ?.trim();


    if (
      !storeId ||
      !storePassword
    ) {
      throw new BadGatewayException(
        'SSLCOMMERZ is not configured. Add SSL_STORE_ID and SSL_STORE_PASSWORD.',
      );
    }


    return {
      storeId,
      storePassword,
    };
  }


  // =========================================
  // PUBLIC BACKEND URL
  // =========================================

  private backendPublicUrl() {
    const configuredUrl =
      this.config
        .get<string>(
          'BACKEND_PUBLIC_URL',
        )
        ?.trim();


    /*
     * Production must NEVER silently
     * fall back to localhost.
     */
    if (
      !configuredUrl &&
      this.isProduction()
    ) {
      throw new BadGatewayException(
        'BACKEND_PUBLIC_URL is not configured for production',
      );
    }


    /*
     * Local fallback is allowed only
     * during development.
     */
    const url =
      configuredUrl ||
      'http://localhost:3001';


    /*
     * Remove trailing slash:
     *
     * https://api.com/
     * becomes
     * https://api.com
     */
    return url.replace(
      /\/+$/,
      '',
    );
  }


  // =========================================
  // INITIATE PAYMENT
  // =========================================

  async initiate(
    order: Order,
    user: User,
  ) {
    const {
      storeId,
      storePassword,
    } =
      this.credentials();


    const backendUrl =
      this.backendPublicUrl();


    const endpoint =
      this.live()
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php';


    const productNames =
      (
        order.items || []
      )
        .map(
          (item) =>
            item.productName,
        )
        .join(', ')
        .slice(
          0,
          250,
        ) ||
      'NokshiLane Order';


    /*
     * These callback URLs are sent
     * to SSLCOMMERZ when a payment
     * session is created.
     *
     * Production example:
     *
     * https://nokshilane-api.onrender.com/orders/payment/success
     */
    const successUrl =
      `${backendUrl}/orders/payment/success`;


    const failUrl =
      `${backendUrl}/orders/payment/fail`;


    const cancelUrl =
      `${backendUrl}/orders/payment/cancel`;


    const ipnUrl =
      `${backendUrl}/orders/payment/ipn`;


    const form =
      new URLSearchParams({
        store_id:
          storeId,

        store_passwd:
          storePassword,

        total_amount:
          Number(
            order.total,
          ).toFixed(2),

        currency:
          'BDT',

        tran_id:
          order.transactionId!,

        success_url:
          successUrl,

        fail_url:
          failUrl,

        cancel_url:
          cancelUrl,

        ipn_url:
          ipnUrl,

        cus_name:
          order.recipientName,

        cus_email:
          user.email,

        cus_add1:
          order.address,

        cus_city:
          order.city,

        cus_postcode:
          order.postcode ||
          '1200',

        cus_country:
          'Bangladesh',

        cus_phone:
          order.phone,

        shipping_method:
          'YES',

        num_of_item:
          String(
            order.items
              ?.length ||
            1,
          ),

        ship_name:
          order.recipientName,

        ship_add1:
          order.address,

        ship_city:
          order.city,

        ship_postcode:
          order.postcode ||
          '1200',

        ship_country:
          'Bangladesh',

        product_name:
          productNames,

        product_category:
          'Fashion',

        product_profile:
          'general',

        value_a:
          order.id,

        value_b:
          order.orderNumber,
      });


    let response:
      Response;


    try {
      response =
        await fetch(
          endpoint,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
            },

            body:
              form.toString(),
          },
        );
    } catch {
      throw new BadGatewayException(
        'Could not connect to SSLCOMMERZ',
      );
    }


    if (
      !response.ok
    ) {
      throw new BadGatewayException(
        `SSLCOMMERZ initiation failed with HTTP ${response.status}`,
      );
    }


    const result =
      (
        await response
          .json()
      ) as SslInitiationResponse;


    if (
      result.status !==
        'SUCCESS' ||
      !result.GatewayPageURL
    ) {
      throw new BadGatewayException(
        result.failedreason ||
        'SSLCOMMERZ did not return a payment URL',
      );
    }


    return {
      paymentUrl:
        result.GatewayPageURL,

      sessionKey:
        result.sessionkey ||
        null,
    };
  }


  // =========================================
  // VALIDATE PAYMENT
  // =========================================

  async validate(
    valId: string,
  ):
    Promise<
      SslValidationResponse
    > {
    const {
      storeId,
      storePassword,
    } =
      this.credentials();


    const endpoint =
      this.live()
        ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';


    const url =
      new URL(
        endpoint,
      );


    url.searchParams.set(
      'val_id',
      valId,
    );


    url.searchParams.set(
      'store_id',
      storeId,
    );


    url.searchParams.set(
      'store_passwd',
      storePassword,
    );


    url.searchParams.set(
      'format',
      'json',
    );


    let response:
      Response;


    try {
      response =
        await fetch(
          url,
        );
    } catch {
      throw new BadGatewayException(
        'Could not connect to SSLCOMMERZ validation API',
      );
    }


    if (
      !response.ok
    ) {
      throw new BadGatewayException(
        `SSLCOMMERZ validation failed with HTTP ${response.status}`,
      );
    }


    return (
      await response
        .json()
    ) as SslValidationResponse;
  }
}