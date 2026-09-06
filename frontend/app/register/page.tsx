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
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from 'react-icons/fi';

import GoogleSignInButton from '@/components/GoogleSignInButton';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import {
  registerSchema,
} from '@/lib/schemas';


type RegisterFormData =
  z.infer<
    typeof registerSchema
  >;


export default function RegisterPage() {
  const [
    serverError,
    setServerError,
  ] = useState('');


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<RegisterFormData>({
      resolver:
        zodResolver(
          registerSchema,
        ),

      defaultValues: {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      },
    });


  async function onSubmit(
    values:
      RegisterFormData,
  ) {
    try {
      setServerError('');


      /*
       * These fields are only used
       * on the frontend.
       *
       * Do not send them to NestJS DTO.
       */
      const {
        confirmPassword,
        acceptTerms,
        ...formValues
      } = values;


      const payload = {
        ...formValues,

        name:
          formValues.name
            .trim(),

        email:
          formValues.email
            .trim()
            .toLowerCase(),

        phone:
          formValues.phone
            .trim(),
      };


     await api.post(
  '/auth/register',
  payload,
);


window.location.href =
  `/verify-email?email=${encodeURIComponent(
    payload.email,
  )}`;
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  return (
    <section className="nl-auth-page nl-register-page">

      {/* LEFT IMAGE */}

      <div className="nl-auth-image nl-register-image">
        <div className="nl-auth-image-shade" />

        <div className="nl-auth-image-content">

          <div className="nl-image-chip">
            JOIN NOKSHILANE
          </div>

          <h2>
            Find it.
            <br />
            Save it.
            <br />
            Wear it.
          </h2>

          <p>
            Create your account
            and make NokshiLane
            your personal fashion edit.
          </p>

          <div className="nl-image-features">
            <span>
              Save favourites
            </span>

            <span>
              Track orders
            </span>
          </div>

        </div>
      </div>


      {/* RIGHT FORM AREA */}

      <div className="nl-auth-panel">

        <div className="nl-auth-orb nl-orb-one" />
        <div className="nl-auth-orb nl-orb-two" />


        <div className="nl-auth-card nl-register-card">

          <div className="nl-auth-badge">
            <span />
            CREATE YOUR ACCOUNT
          </div>


          <h1 className="nl-register-heading">
            Join the
            <br />
            edit.
          </h1>


          <p className="nl-auth-description">
            Save products you love,
            manage your orders and
            make checkout easier.
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


          <form
            className="nl-auth-form nl-register-form"

            onSubmit={
              handleSubmit(
                onSubmit,

                (validationErrors) => {
                  console.log(
                    'REGISTER VALIDATION ERRORS:',
                    validationErrors,
                  );
                },
              )
            }
          >

            {/* FULL NAME */}

            <div className="nl-auth-field">

              <label htmlFor="register-name">
                Full name
              </label>

              <div className="nl-input-box">

                <FiUser />

                <input
                  id="register-name"
                  type="text"
                  placeholder="e.g. Abdus Salam"
                  autoComplete="name"

                  {...register(
                    'name',
                  )}
                />

              </div>

              {errors.name && (
                <p className="nl-field-error">
                  {errors.name.message}
                </p>
              )}

            </div>


            {/* EMAIL */}

            <div className="nl-auth-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="nl-input-box">

                <FiMail />

                <input
                  id="register-email"
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
                  {errors.email.message}
                </p>
              )}

            </div>


            {/* PHONE */}

            <div className="nl-auth-field">

              <label htmlFor="register-phone">
                Bangladesh phone
              </label>

              <div className="nl-input-box">

                <FiPhone />

                <input
                  id="register-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"

                  {...register(
                    'phone',
                  )}
                />

              </div>

              {errors.phone && (
                <p className="nl-field-error">
                  {errors.phone.message}
                </p>
              )}

            </div>


            {/* PASSWORD */}

            <div className="nl-auth-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="nl-input-box">

                <FiLock />

                <input
                  id="register-password"

                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }

                  placeholder="Create a strong password"
                  autoComplete="new-password"

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
                      (current) =>
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
                  {errors.password.message}
                </p>
              )}

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="nl-auth-field">

              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="nl-input-box">

                <FiCheck />

                <input
                  id="register-confirm-password"

                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }

                  placeholder="Enter password again"
                  autoComplete="new-password"

                  {...register(
                    'confirmPassword',
                  )}
                />


                <button
                  type="button"
                  className="nl-password-toggle"

                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }

                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current,
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

              {errors.confirmPassword && (
                <p className="nl-field-error">
                  {
                    errors
                      .confirmPassword
                      .message
                  }
                </p>
              )}

            </div>


            {/* TERMS & CONDITIONS */}

            <div className="nl-auth-terms">

              <label className="nl-terms-label">

                <input
                  type="checkbox"

                  {...register(
                    'acceptTerms',
                  )}
                />

                <span>
                  I agree to the{' '}

                  <Link href="/terms">
                    Terms & Conditions
                  </Link>

                  {' '}and{' '}

                  <Link href="/privacy">
                    Privacy Policy
                  </Link>
                </span>

              </label>


              {errors.acceptTerms && (
                <p className="nl-field-error">
                  {
                    errors
                      .acceptTerms
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
                  ? 'Creating account...'
                  : 'Create account'}
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


          {/* LOGIN LINK */}

          <p className="nl-auth-switch">
            Already have an account?

            {' '}

            <Link href="/login">
              Sign in →
            </Link>
          </p>


          {/* TRUST */}

          <div className="nl-auth-trust">

            <span>
              Secure account
            </span>

            <i />

            <span>
              Order tracking
            </span>

            <i />

            <span>
              Wishlist
            </span>

          </div>

        </div>
      </div>

    </section>
  );
}