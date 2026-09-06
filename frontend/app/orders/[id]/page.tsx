'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  Order,
} from '@/lib/types';


export default function OrderDetailPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState('');


  useEffect(() => {
    if (!params.id) {
      return;
    }

    api.get<Order>(
      `/orders/${params.id}`,
    )
      .then(
        (response) =>
          setOrder(
            response.data,
          ),
      )
      .catch(
        (error) =>
          setError(
            getErrorMessage(
              error,
            ),
          ),
      );
  }, [
    params.id,
  ]);


  if (error) {
    return (
      <section className="page-shell">
        <div className="form-alert">
          {error}
        </div>
      </section>
    );
  }


  if (!order) {
    return (
      <section className="page-shell loading">
        Loading order...
      </section>
    );
  }


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          ORDER
          {' '}
          {order.orderNumber}
        </span>

        <h1>
          {order.status.replaceAll(
            '_',
            ' ',
          )}
        </h1>

        <p>
          Payment:
          {' '}
          {order.paymentStatus}
          {' · '}
          {order.paymentMethod}
        </p>
      </div>


      <div className="order-detail-grid">
        <div className="order-items-card">
          {order.items.map(
            (item) => (
              <div
                key={item.id}
                className="mini-order large"
              >
                <img
                  src={
                    item.imageUrl
                  }
                  alt=""
                />

                <div>
                  <strong>
                    {item.productName}
                  </strong>

                  <span>
                    {item.sku}
                    {' · '}
                    Qty
                    {' '}
                    {item.quantity}
                  </span>
                </div>

                <strong>
                  ৳
                  {(
                    Number(
                      item.unitPrice,
                    ) *
                    item.quantity
                  ).toLocaleString()}
                </strong>
              </div>
            ),
          )}
        </div>


        <aside className="order-summary">
          <span>
            DELIVERY
          </span>

          <strong>
            {order.recipientName}
          </strong>

          <p>
            {order.address}
            <br />
            {order.area},
            {' '}
            {order.city}
            <br />
            {order.postcode || ''}
            <br />
            {order.phone}
          </p>


          <hr />


          <div>
            <span>
              Subtotal
            </span>

            <strong>
              ৳
              {Number(
                order.subtotal,
              ).toLocaleString()}
            </strong>
          </div>


          <div>
            <span>
              Delivery
            </span>

            <strong>
              ৳
              {Number(
                order.shippingFee,
              ).toLocaleString()}
            </strong>
          </div>


          <div>
            <span>
              Total
            </span>

            <strong>
              ৳
              {Number(
                order.total,
              ).toLocaleString()}
            </strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
