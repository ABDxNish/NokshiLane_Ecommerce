'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import Pusher from 'pusher-js';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
} from '@/lib/api';

import type {
  Order,
} from '@/lib/types';


export default function AdminPage() {
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


  async function load() {
    const response =
      await api.get<Order[]>(
        '/orders/admin/all',
      );

    setOrders(
      response.data,
    );
  }


  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      user?.role !==
      'ADMIN'
    ) {
      window.location.href =
        '/';

      return;
    }

    load()
      .catch(
        () => undefined,
      );
  }, [
    user,
    loading,
  ]);


  useEffect(() => {
    if (
      user?.role !==
      'ADMIN'
    ) {
      return;
    }

    const key =
      process.env
        .NEXT_PUBLIC_PUSHER_KEY;

    if (!key) {
      return;
    }

    const pusher =
      new Pusher(
        key,
        {
          cluster:
            process.env
              .NEXT_PUBLIC_PUSHER_CLUSTER ||
            'ap2',
        },
      );

    const channel =
      pusher.subscribe(
        'admin-orders',
      );

    channel.bind(
      'order-created',
      () => {
        load()
          .catch(
            () => undefined,
          );
      },
    );

    return () => {
      channel.unbind_all();

      pusher.unsubscribe(
        'admin-orders',
      );

      pusher.disconnect();
    };
  }, [
    user,
  ]);


  const revenue =
    useMemo(
      () =>
        orders
          .filter(
            (order) =>
              order.paymentStatus ===
              'PAID',
          )
          .reduce(
            (
              total,
              order,
            ) =>
              total +
              Number(
                order.total,
              ),
            0,
          ),
      [orders],
    );


  const pending =
    orders.filter(
      (order) =>
        order.status ===
        'PENDING_PAYMENT' ||
        order.status ===
        'CONFIRMED' ||
        order.status ===
        'PROCESSING',
    ).length;


  const delivered =
    orders.filter(
      (order) =>
        order.status ===
        'DELIVERED',
    ).length;


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          ADMIN CONTROL
        </span>

        <h1>
          Store dashboard
        </h1>
      </div>


      <div className="stats-grid">
        <div>
          <span>
            Total orders
          </span>

          <strong>
            {orders.length}
          </strong>
        </div>

        <div>
          <span>
            Paid revenue
          </span>

          <strong>
            ৳
            {revenue.toLocaleString()}
          </strong>
        </div>

        <div>
          <span>
            Active orders
          </span>

          <strong>
            {pending}
          </strong>
        </div>

        <div>
          <span>
            Delivered
          </span>

          <strong>
            {delivered}
          </strong>
        </div>
      </div>


      <div className="admin-links">
        <Link href="/admin/products">
          Manage products →
        </Link>

        <Link href="/admin/categories">
          Manage categories →
        </Link>

        <Link href="/admin/orders">
          Manage orders →
        </Link>
      </div>


      <div className="admin-card">
        <h2>
          Recent orders
        </h2>

        {orders
          .slice(
            0,
            8,
          )
          .map(
            (order) => (
              <div
                key={order.id}
                className="admin-order-row"
              >
                <span>
                  {order.orderNumber}
                </span>

                <strong>
                  {order.user?.name ||
                    'Customer'}
                </strong>

                <span>
                  {order.status.replaceAll(
                    '_',
                    ' ',
                  )}
                </span>

                <span>
                  ৳
                  {Number(
                    order.total,
                  ).toLocaleString()}
                </span>
              </div>
            ),
          )}
      </div>
    </section>
  );
}
