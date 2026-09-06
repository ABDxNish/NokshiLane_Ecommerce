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

  private readonly from:
    string;


  constructor(
    private readonly config:
      ConfigService,
  ) {
    const user =
      config.get<string>(
        'MAIL_USER',
      );

    const password =
      config.get<string>(
        'MAIL_PASSWORD',
      );


    this.from =
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
        nodemailer
          .createTransport({
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
  }


  configured() {
    return Boolean(
      this.transporter,
    );
  }


  async send(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    if (
      !this.transporter
    ) {
      throw new Error(
        'Mail service is not configured',
      );
    }


    await this.transporter
      .sendMail({
        from:
          this.from,

        to,

        subject,

        text,

        html,
      });
  }


  async emailVerificationCode(
    email: string,
    name: string,
    code: string,
  ) {
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
          Hello ${name},
        </p>

        <p>
          Use the following code to verify
          your email address:
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

        <p style="color: #6e7268;">
          If you did not create a NokshiLane
          account, you can ignore this email.
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