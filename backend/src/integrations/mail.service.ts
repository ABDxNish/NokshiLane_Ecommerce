import {
  Injectable,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import nodemailer = require('nodemailer');


@Injectable()
export class MailService {
  private transporter?:
    nodemailer.Transporter;


  private readonly provider:
    'smtp' | 'brevo';


  private readonly smtpFrom:
    string;


  private readonly brevoApiKey:
    string;


  private readonly brevoSenderEmail:
    string;


  private readonly brevoSenderName:
    string;


  constructor(
    private readonly config:
      ConfigService,
  ) {
    const isProduction =
      config.get<string>(
        'NODE_ENV',
      ) === 'production';


    /*
     * Default:
     * development -> Gmail SMTP
     * production  -> Brevo API
     *
     * MAIL_PROVIDER can override this.
     */
    this.provider =
      config.get<string>(
        'MAIL_PROVIDER',
      ) === 'brevo'
        ? 'brevo'
        : config.get<string>(
              'MAIL_PROVIDER',
            ) === 'smtp'
          ? 'smtp'
          : isProduction
            ? 'brevo'
            : 'smtp';


    // =====================================
    // LOCAL SMTP / GMAIL
    // =====================================

    const user =
      config.get<string>(
        'MAIL_USER',
      );


    const password =
      config.get<string>(
        'MAIL_PASSWORD',
      );


    this.smtpFrom =
      config.get<string>(
        'MAIL_FROM',
      ) ||
      user ||
      'NokshiLane';


    if (
      user &&
      password
    ) {
      this.transporter =
        nodemailer.createTransport({
          host:
            config.get<string>(
              'MAIL_HOST',
            ) ||
            'smtp.gmail.com',

          port:
            Number(
              config.get<string>(
                'MAIL_PORT',
              ) ||
              587,
            ),

          secure:
            false,

          auth: {
            user,
            pass:
              password,
          },
        });
    }


    // =====================================
    // BREVO PRODUCTION API
    // =====================================

    this.brevoApiKey =
      config.get<string>(
        'BREVO_API_KEY',
      ) || '';


    this.brevoSenderEmail =
      config.get<string>(
        'BREVO_SENDER_EMAIL',
      ) || '';


    this.brevoSenderName =
      config.get<string>(
        'BREVO_SENDER_NAME',
      ) ||
      'NokshiLane';
  }


  configured() {
    if (
      this.provider ===
      'brevo'
    ) {
      return Boolean(
        this.brevoApiKey &&
        this.brevoSenderEmail,
      );
    }


    return Boolean(
      this.transporter,
    );
  }


  private escapeHtml(
    value: string,
  ) {
    return value
      .replace(
        /&/g,
        '&amp;',
      )
      .replace(
        /</g,
        '&lt;',
      )
      .replace(
        />/g,
        '&gt;',
      )
      .replace(
        /"/g,
        '&quot;',
      )
      .replace(
        /'/g,
        '&#039;',
      );
  }


  private async sendViaBrevo(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    if (
      !this.brevoApiKey ||
      !this.brevoSenderEmail
    ) {
      throw new Error(
        'Brevo email service is not configured',
      );
    }


    const body:
      Record<
        string,
        unknown
      > = {
      sender: {
        name:
          this.brevoSenderName,

        email:
          this.brevoSenderEmail,
      },

      to: [
        {
          email:
            to,
        },
      ],

      subject,
    };


    /*
     * Brevo accepts either HTML
     * or plain-text content.
     */
    if (html) {
      body.htmlContent =
        html;
    } else {
      body.textContent =
        text;
    }


    const response =
      await fetch(
        'https://api.brevo.com/v3/smtp/email',
        {
          method:
            'POST',

          headers: {
            accept:
              'application/json',

            'api-key':
              this.brevoApiKey,

            'content-type':
              'application/json',
          },

          body:
            JSON.stringify(
              body,
            ),
        },
      );


    if (
      !response.ok
    ) {
      const responseText =
        await response.text();


      throw new Error(
        `Brevo email failed (${response.status}): ${responseText}`,
      );
    }
  }


  private async sendViaSmtp(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    if (
      !this.transporter
    ) {
      throw new Error(
        'SMTP mail service is not configured',
      );
    }


    await this.transporter
      .sendMail({
        from:
          this.smtpFrom,

        to,

        subject,

        text,

        html,
      });
  }


  async send(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    if (
      this.provider ===
      'brevo'
    ) {
      return this.sendViaBrevo(
        to,
        subject,
        text,
        html,
      );
    }


    return this.sendViaSmtp(
      to,
      subject,
      text,
      html,
    );
  }


  async emailVerificationCode(
    email: string,
    name: string,
    code: string,
  ) {
    const safeName =
      this.escapeHtml(
        name,
      );


    const subject =
      `${code} is your NokshiLane verification code`;


    const text = [
      `Hello ${name},`,
      '',
      'Welcome to NokshiLane.',
      '',
      'Your email verification code is:',
      '',
      code,
      '',
      'This code expires in 10 minutes.',
      '',
      'If you did not create a NokshiLane account, you can ignore this email.',
    ].join('\n');


    const html = `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: 0 auto;
          padding: 32px;
          background: #fffdf8;
          color: #11140f;
          border-radius: 18px;
        "
      >
        <h2 style="margin-bottom: 8px;">
          NokshiLane
        </h2>

        <p>
          Hello ${safeName},
        </p>

        <p>
          Use the following code
          to verify your email address:
        </p>

        <div
          style="
            margin: 28px 0;
            padding: 18px;
            text-align: center;
            background: #eef2e6;
            border-radius: 14px;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
          "
        >
          ${code}
        </div>

        <p>
          This code expires in
          <strong>10 minutes</strong>.
        </p>

        <p
          style="
            color: #6e7268;
          "
        >
          If you did not create
          a NokshiLane account,
          you can ignore this email.
        </p>
      </div>
    `;


    return this.send(
      email,
      subject,
      text,
      html,
    );
  }


  async orderConfirmation(
    email: string,
    orderNumber: string,
    total: number,
  ) {
    return this.send(
      email,

      `Order ${orderNumber} received`,

      [
        'Thank you for shopping with NokshiLane.',
        '',
        `Order: ${orderNumber}`,
        `Total: BDT ${total.toFixed(2)}`,
        '',
        'You can follow your order from the My Orders page.',
      ].join('\n'),
    );
  }


  async orderStatus(
    email: string,
    orderNumber: string,
    status: string,
  ) {
    return this.send(
      email,

      `Order ${orderNumber} updated`,

      [
        `Your order ${orderNumber} has been updated.`,
        '',
        `New status: ${status.replaceAll('_', ' ')}`,
        '',
        'Thank you for choosing NokshiLane.',
      ].join('\n'),
    );
  }
}