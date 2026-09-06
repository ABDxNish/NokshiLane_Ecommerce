'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  Order,
} from '@/lib/types';


const possibleStatuses = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];


export default function AdminOrdersPage() {
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


  async function update(
    id: string,
    status: string,
  ) {
    try {
      await api.patch(
        `/orders/admin/${id}/status`,
        {
          status,
        },
      );

      await load();
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
        ),
      );

      await load();
    }
  }


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          ADMIN / ORDERS
        </span>

        <h1>
          Order management
        </h1>
      </div>


      <div className="admin-card table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                Order
              </th>

              <th>
                Customer
              </th>

              <th>
                Total
              </th>

              <th>
                Payment
              </th>

              <th>
                Status
              </th>
            </tr>
          </thead>


          <tbody>
            {orders.map(
              (order) => (
                <tr key={order.id}>
                  <td>
                    <strong>
                      {order.orderNumber}
                    </strong>

                    <br />

                    <small>
                      {new Date(
                        order.createdAt,
                      ).toLocaleString()}
                    </small>
                  </td>


                  <td>
                    {order.user?.name}

                    <br />

                    <small>
                      {order.user?.email}
                    </small>
                  </td>


                  <td>
                    ৳
                    {Number(
                      order.total,
                    ).toLocaleString()}
                  </td>


                  <td>
                    {order.paymentMethod}

                    <br />

                    <small>
                      {order.paymentStatus}
                    </small>
                  </td>


                  <td>
                    <select
                      value={
                        order.status
                      }
                      disabled={
                        order.status ===
                        'CANCELLED' ||
                        order.status ===
                        'DELIVERED'
                      }
                      onChange={
                        (event) =>
                          update(
                            order.id,
                            event.target.value,
                          )
                      }
                    >
                      {order.status ===
                        'PENDING_PAYMENT' && (
                        <option value="PENDING_PAYMENT">
                          PENDING PAYMENT
                        </option>
                      )}

                      {possibleStatuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status.replaceAll(
                              '_',
                              ' ',
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
