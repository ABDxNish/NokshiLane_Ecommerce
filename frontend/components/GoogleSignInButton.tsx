'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FcGoogle,
} from 'react-icons/fc';

import {
  api,
  getErrorMessage,
} from '@/lib/api';


declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          
          initialize:
            (
              config: {
                client_id:
                  string;

                callback:
                  (
                    response: {
                      credential:
                        string;
                    },
                  ) =>
                    void;
              },
            ) =>
              void;

          renderButton:
            (
              element:
                HTMLElement,

              options:
                Record<
                  string,
                  string | number
                >,
            ) =>
              void;
        };
      };
    };
  }
}


export default function GoogleSignInButton() {
  const buttonRef =
    useRef<
      HTMLDivElement
    >(
      null,
    );


  const [
    error,
    setError,
  ] =
    useState('');


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const clientId =
    process.env
      .NEXT_PUBLIC_GOOGLE_CLIENT_ID;


  useEffect(() => {
    if (
      !clientId ||
      !buttonRef.current
    ) {
      return;
    }


    let cancelled =
      false;


    function setupGoogle() {
      if (
        cancelled ||
        !clientId ||
        !window.google ||
        !buttonRef.current
      ) {
        return;
      }


      buttonRef.current
        .replaceChildren();

console.log(
  'Google origin:',
  window.location.origin,
);

console.log(
  'Google client ID:',
  clientId,
);
      window.google
        .accounts
        .id
        .initialize({
          client_id:
            clientId,

          callback:
            async (
              response,
            ) => {
              try {
                setLoading(
                  true,
                );

                setError('');


                if (
                  !response
                    .credential
                ) {
                  setError(
                    'Google authentication failed.',
                  );

                  return;
                }


                await api.post(
                  '/auth/google',
                  {
                    credential:
                      response
                        .credential,
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
                setLoading(
                  false,
                );
              }
            },
        });


      window.google
        .accounts
        .id
        .renderButton(
          buttonRef.current,
          {
            theme:
              'outline',

            size:
              'large',

            shape:
              'pill',

            text:
              'continue_with',

            logo_alignment:
              'left',

            width:
              400,
          },
        );
    }


    /*
     * Google script may already
     * exist from a previous page.
     */
    if (
      window.google
    ) {
      setupGoogle();

      return () => {
        cancelled =
          true;
      };
    }


    const existing =
      document.querySelector<
        HTMLScriptElement
      >(
        'script[data-google-identity="true"]',
      );


    if (existing) {
      existing.addEventListener(
        'load',
        setupGoogle,
      );


      return () => {
        cancelled =
          true;

        existing
          .removeEventListener(
            'load',
            setupGoogle,
          );
      };
    }


    const script =
      document.createElement(
        'script',
      );


    script.src =
      'https://accounts.google.com/gsi/client';

    script.async =
      true;

    script.defer =
      true;

    script.dataset
      .googleIdentity =
      'true';


    script.addEventListener(
      'load',
      setupGoogle,
    );


    script.addEventListener(
      'error',
      () => {
        if (
          !cancelled
        ) {
          setError(
            'Unable to load Google Sign-In.',
          );
        }
      },
    );


    document.head
      .appendChild(
        script,
      );


    return () => {
      cancelled =
        true;

      script
        .removeEventListener(
          'load',
          setupGoogle,
        );
    };
  }, [
    clientId,
  ]);


  /*
   * Client ID is optional during
   * local project development.
   */
  if (!clientId) {
    return (
      <button
        type="button"
        className="nl-google-disabled"
        disabled
      >
        <FcGoogle />

        <span>
          Continue with Google
        </span>

        <small>
          Setup required
        </small>
      </button>
    );
  }


  return (
    <div className="nl-google-signin">
      {loading && (
        <p className="nl-google-loading">
          Signing in with
          Google...
        </p>
      )}


      <div
        ref={
          buttonRef
        }
        className="nl-google-button"
      />


      {error && (
        <p className="nl-field-error nl-google-error">
          {error}
        </p>
      )}
    </div>
  );
}