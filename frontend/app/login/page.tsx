'use client';

import Link from 'next/link';

import {
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from 'react-icons/fi';

import GoogleSignInButton from '@/components/GoogleSignInButton';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import {
  loginSchema,
} from '@/lib/schemas';


type LoginFormData =
  z.infer<
    typeof loginSchema
  >;


export default function LoginPage() {
  const [
    serverError,
    setServerError,
  ] =
    useState('');


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<LoginFormData>({
      resolver:
        zodResolver(
          loginSchema,
        ),

      defaultValues: {
        email: '',
        password: '',
      },
    });


  async function onSubmit(
    values:
      LoginFormData,
  ) {
    try {
      setServerError('');


      await api.post(
        '/auth/login',
        {
          email:
            values.email
              .trim()
              .toLowerCase(),

          password:
            values.password,
        },
      );


      /*
       * Full navigation is intentional.
       * It makes the navbar/profile read
       * the newly-created session again.
       */
      window.location.href =
        '/profile';
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  return (
    <section className="nl-auth-page">
      {/* =========================================
          LEFT IMAGE
      ========================================== */}

      <div className="nl-auth-image nl-login-image">
        <div className="nl-auth-image-shade" />

        <div className="nl-auth-image-content">
          <div className="nl-image-chip">
            NOKSHILANE
          </div>

          <h2>
            Wear your
            <br />
            own story.
          </h2>

          <p>
            Curated fashion,
            effortless shopping
            and nationwide delivery.
          </p>

          <div className="nl-image-features">
            <span>
              New collections
            </span>

            <span>
              Bangladesh delivery
            </span>
          </div>
        </div>
      </div>


      {/* =========================================
          RIGHT FORM AREA
      ========================================== */}

      <div className="nl-auth-panel">
        <div className="nl-auth-orb nl-orb-one" />

        <div className="nl-auth-orb nl-orb-two" />


        <div className="nl-auth-card">
          {/* TOP BADGE */}

          <div className="nl-auth-badge">
            <span />

            NOKSHILANE ACCOUNT
          </div>


          {/* HEADING */}

          <h1>
            Welcome
            <br />
            back.
          </h1>


          <p className="nl-auth-description">
            Sign in to track your
            orders, manage favourites
            and enjoy a faster checkout.
          </p>


          {/* SERVER ERROR */}

          {serverError && (
            <div className="nl-auth-alert">
              <strong>
                !
              </strong>

              <span>
                {serverError}
              </span>
            </div>
          )}


          {/* FORM */}

          <form
            className="nl-auth-form"
            onSubmit={
              handleSubmit(
                onSubmit,
              )
            }
          >
            {/* EMAIL */}

            <div className="nl-auth-field">
              <label
                htmlFor="login-email"
              >
                Email address
              </label>


              <div className="nl-input-box">
                <FiMail />

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"

                  {...register(
                    'email',
                  )}
                />
              </div>


              {errors.email && (
                <p className="nl-field-error">
                  {
                    errors.email
                      .message
                  }
                </p>
              )}
            </div>


            {/* PASSWORD */}

            <div className="nl-auth-field">
              <label
                htmlFor="login-password"
              >
                Password
              </label>


              <div className="nl-input-box">
                <FiLock />

                <input
                  id="login-password"

                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }

                  placeholder="Enter your password"

                  autoComplete="current-password"

                  {...register(
                    'password',
                  )}
                />


                <button
                  type="button"
                  className="nl-password-toggle"

                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }

                  onClick={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>


              {errors.password && (
                <p className="nl-field-error">
                  {
                    errors.password
                      .message
                  }
                </p>
              )}
            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="nl-auth-submit"

              disabled={
                isSubmitting
              }
            >
              <span>
                {isSubmitting
                  ? 'Signing in...'
                  : 'Sign in'}
              </span>


              {!isSubmitting && (
                <span className="nl-submit-arrow">
                  <FiArrowRight />
                </span>
              )}
            </button>
          </form>


          {/* DIVIDER */}

          <div className="nl-auth-divider">
            <span />

            <p>
              OR
            </p>

            <span />
          </div>


          {/* GOOGLE */}

          <div className="nl-google-area">
            <GoogleSignInButton />
          </div>


          {/* REGISTER LINK */}

          <p className="nl-auth-switch">
            New to NokshiLane?

            {' '}

            <Link href="/register">
              Create an account
              {' '}
              →
            </Link>
          </p>


          {/* TRUST */}

          <div className="nl-auth-trust">
            <span>
              Secure login
            </span>

            <i />

            <span>
              Saved favourites
            </span>

            <i />

            <span>
              Fast checkout
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}