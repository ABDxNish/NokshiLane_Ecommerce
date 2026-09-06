'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
} from '@/lib/api';

import type {
  Order,
} from '@/lib/types';


export default function OrdersPage() {
  const {
    user,
    loading,
  } =
    useAuth();

  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>([]);


  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      window.location.href =
        '/login?next=/orders';

      return;
    }

    api.get<Order[]>(
      '/orders/my',
    )
      .then(
        (response) =>
          setOrders(
            response.data,
          ),
      )
      .catch(
        () => undefined,
      );
  }, [
    user,
    loading,
  ]);


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          ACCOUNT
        </span>

        <h1>
          My orders
        </h1>
      </div>


      <div className="order-list">
        {orders.map(
          (order) => (
            <Link
              key={order.id}
              href={
                `/orders/${order.id}`
              }
              className="order-row"
            >
              <div>
                <span>
                  Order
                </span>

                <strong>
                  {order.orderNumber}
                </strong>
              </div>


              <div>
                <span>
                  Date
                </span>

                <strong>
                  {new Date(
                    order.createdAt,
                  ).toLocaleDateString()}
                </strong>
              </div>


              <div>
                <span>
                  Status
                </span>

                <strong>
                  {order.status.replaceAll(
                    '_',
                    ' ',
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Payment
                </span>

                <strong>
                  {order.paymentStatus}
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
            </Link>
          ),
        )}
      </div>


      {!orders.length && (
        <div className="empty-state">
          You have not placed
          an order yet.
        </div>
      )}
    </section>
  );
}
