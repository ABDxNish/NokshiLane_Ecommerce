'use client';

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import {
  FiCheckCircle,
  FiMail,
} from 'react-icons/fi';

import {
  api,
  getErrorMessage,
} from '@/lib/api';


function VerifyEmailContent() {
  const searchParams =
    useSearchParams();


  const email =
    searchParams.get(
      'email',
    ) || '';


  const [
    code,
    setCode,
  ] =
    useState('');


  const [
    error,
    setError,
  ] =
    useState('');


  const [
    message,
    setMessage,
  ] =
    useState('');


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    resending,
    setResending,
  ] =
    useState(false);


  const [
    countdown,
    setCountdown,
  ] =
    useState(60);


  useEffect(
    () => {
      if (
        countdown <= 0
      ) {
        return;
      }


      const timer =
        window.setInterval(
          () => {
            setCountdown(
              (current) =>
                Math.max(
                  current - 1,
                  0,
                ),
            );
          },
          1000,
        );


      return () =>
        window.clearInterval(
          timer,
        );
    },
    [
      countdown,
    ],
  );


  async function verify(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setError('');
    setMessage('');


    if (
      !/^\d{6}$/.test(
        code,
      )
    ) {
      setError(
        'Enter the 6-digit verification code',
      );

      return;
    }


    try {
      setSubmitting(
        true,
      );


      await api.post(
        '/auth/verify-email',
        {
          email,
          code,
        },
      );


      window.location.href =
        '/profile';
    } catch (error) {
      setError(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }


  async function resend() {
    if (
      countdown > 0
    ) {
      return;
    }


    setError('');
    setMessage('');


    try {
      setResending(
        true,
      );


      await api.post(
        '/auth/resend-verification',
        {
          email,
        },
      );


      setMessage(
        'A new verification code has been sent.',
      );


      setCountdown(
        60,
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setResending(
        false,
      );
    }
  }


  return (
    <section className="nl-verify-page">
      <div className="nl-verify-card">

        <div className="nl-verify-icon">
          <FiMail />
        </div>


        <p className="nl-auth-badge">
          <span />
          EMAIL VERIFICATION
        </p>


        <h1>
          Check your
          <br />
          inbox.
        </h1>


        <p className="nl-verify-description">
          We sent a 6-digit
          verification code to
        </p>


        <strong className="nl-verify-email">
          {email}
        </strong>


        <form
          onSubmit={
            verify
          }
          className="nl-verify-form"
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"

            maxLength={
              6
            }

            value={
              code
            }

            placeholder="000000"

            onChange={
              (
                event,
              ) => {
                const value =
                  event
                    .target
                    .value
                    .replace(
                      /\D/g,
                      '',
                    )
                    .slice(
                      0,
                      6,
                    );


                setCode(
                  value,
                );
              }
            }
          />


          {error && (
            <p className="nl-field-error">
              {error}
            </p>
          )}


          {message && (
            <p className="nl-verify-success">
              <FiCheckCircle />

              {message}
            </p>
          )}


          <button
            type="submit"
            className="nl-auth-submit"

            disabled={
              submitting ||
              code.length !== 6
            }
          >
            {submitting
              ? 'Verifying...'
              : 'Verify email'}
          </button>
        </form>


        <div className="nl-verify-resend">
          <span>
            Didn't receive the code?
          </span>


          <button
            type="button"

            disabled={
              countdown > 0 ||
              resending
            }

            onClick={
              resend
            }
          >
            {resending
              ? 'Sending...'
              : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend code'}
          </button>
        </div>

      </div>
    </section>
  );
}


export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}