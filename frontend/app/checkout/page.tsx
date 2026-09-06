'use client';

import {
  useEffect,
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
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import {
  checkoutSchema,
} from '@/lib/schemas';

import type {
  CartItem,
} from '@/lib/types';


type FormData =
  z.infer<
    typeof checkoutSchema
  >;


export default function CheckoutPage() {
  const {
    user,
    loading: authLoading,
  } =
    useAuth();

  const [
    items,
    setItems,
  ] =
    useState<CartItem[]>([]);

  const [
    subtotal,
    setSubtotal,
  ] =
    useState(0);

  const [
    serverError,
    setServerError,
  ] =
    useState('');


  const {
    register,
    handleSubmit,
    watch,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<FormData>({
      resolver:
        zodResolver(
          checkoutSchema,
        ),

      defaultValues: {
        recipientName:
          '',

        phone:
          '',

        city:
          'Dhaka',

        area:
          '',

        address:
          '',

        postcode:
          '',

        paymentMethod:
          'COD',
      },
    });


  const city =
    watch('city');


  const shipping =
    city
      ?.trim()
      .toLowerCase() ===
    'dhaka'
      ? 80
      : 120;


  useEffect(() => {
    if (
      authLoading
    ) {
      return;
    }

    if (!user) {
      window.location.href =
        '/login?next=/checkout';

      return;
    }

    api.get(
      '/cart',
    )
      .then(
        (response) => {
          setItems(
            response.data.items,
          );

          setSubtotal(
            Number(
              response.data.subtotal,
            ),
          );
        },
      )
      .catch(
        () => undefined,
      );
  }, [
    user,
    authLoading,
  ]);


  async function submit(
    values: FormData,
  ) {
    try {
      setServerError('');

      const response =
        await api.post(
          '/orders/checkout',
          values,
        );


      if (
        response.data.paymentUrl
      ) {
        window.location.href =
          response.data.paymentUrl;

        return;
      }


      window.location.href =
        `/orders/${response.data.order.id}`;
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          SECURE CHECKOUT
        </span>

        <h1>
          Delivery & payment
        </h1>
      </div>


      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={
            handleSubmit(
              submit,
            )
          }
        >
          <h2>
            Shipping information
          </h2>


          <div className="form-grid">
            <label className="full">
              Recipient name

              <input
                placeholder="Full name"
                {...register(
                  'recipientName',
                )}
              />

              {errors.recipientName && (
                <small className="form-error">
                  {errors.recipientName.message}
                </small>
              )}
            </label>


            <label>
              Mobile number

              <input
                placeholder="01XXXXXXXXX"
                {...register(
                  'phone',
                )}
              />

              {errors.phone && (
                <small className="form-error">
                  {errors.phone.message}
                </small>
              )}
            </label>


            <label>
              City

              <input
                placeholder="Dhaka"
                {...register(
                  'city',
                )}
              />

              {errors.city && (
                <small className="form-error">
                  {errors.city.message}
                </small>
              )}
            </label>


            <label>
              Area / Thana

              <input
                placeholder="Dhanmondi"
                {...register(
                  'area',
                )}
              />

              {errors.area && (
                <small className="form-error">
                  {errors.area.message}
                </small>
              )}
            </label>


            <div className="checkout-field">
  <label htmlFor="postcode">
    Postcode
  </label>

  <input
    id="postcode"
    type="text"
    inputMode="numeric"
    maxLength={4}
    placeholder="e.g. 1205"
    {...register('postcode')}
  />

  {errors.postcode && (
    <p className="form-error">
      {errors.postcode.message}
    </p>
  )}
</div>


            <label className="full">
              Full delivery address

              <textarea
                placeholder="House, road, block, landmark..."
                {...register(
                  'address',
                )}
              />

              {errors.address && (
                <small className="form-error">
                  {errors.address.message}
                </small>
              )}
            </label>
          </div>


          <h2>
            Payment method
          </h2>


          <div className="payment-options">
            <label>
              <input
                type="radio"
                value="COD"
                {...register(
                  'paymentMethod',
                )}
              />

              <div>
                <strong>
                  Cash on Delivery
                </strong>

                <span>
                  Pay the courier when
                  the order arrives.
                </span>
              </div>
            </label>


            <label>
              <input
                type="radio"
                value="SSLCOMMERZ"
                {...register(
                  'paymentMethod',
                )}
              />

              <div>
                <strong>
                  SSLCOMMERZ
                </strong>

                <span>
                  Secure hosted online
                  payment gateway.
                </span>
              </div>
            </label>
          </div>


          {serverError && (
            <div className="form-alert">
              {serverError}
            </div>
          )}


          <button
            className="primary-button wide"
            disabled={
              isSubmitting ||
              !items.length
            }
          >
            {isSubmitting
              ? 'Placing order...'
              : 'Place order'}
          </button>
        </form>


        <aside className="checkout-summary">
          <span>
            YOUR ORDER
          </span>

          {items.map(
            (item) => (
              <div
                key={item.id}
                className="mini-order"
              >
                <img
                  src={
                    item.product.imageUrl
                  }
                  alt=""
                />

                <div>
                  <strong>
                    {item.product.name}
                  </strong>

                  <span>
                    Qty
                    {' '}
                    {item.quantity}
                  </span>
                </div>

                <strong>
                  ৳
                  {(
                    Number(
                      item.product.price,
                    ) *
                    item.quantity
                  ).toLocaleString()}
                </strong>
              </div>
            ),
          )}


          <hr />


          <div>
            <span>
              Subtotal
            </span>

            <strong>
              ৳
              {subtotal.toLocaleString()}
            </strong>
          </div>


          <div>
            <span>
              Delivery
            </span>

            <strong>
              ৳{shipping}
            </strong>
          </div>


          <div className="grand-total">
            <span>
              Total
            </span>

            <strong>
              ৳
              {(
                subtotal +
                shipping
              ).toLocaleString()}
            </strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
