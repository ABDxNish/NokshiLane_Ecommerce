'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  FiTrash2,
} from 'react-icons/fi';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  CartItem,
} from '@/lib/types';


export default function CartPage() {
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
    loading,
    setLoading,
  ] =
    useState(true);


  async function load() {
    try {
      const response =
        await api.get(
          '/cart',
        );

      setItems(
        response.data.items,
      );

      setSubtotal(
        Number(
          response.data.subtotal,
        ),
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (
      authLoading
    ) {
      return;
    }

    if (!user) {
      window.location.href =
        '/login?next=/cart';

      return;
    }

    load()
      .catch(
        () => undefined,
      );
  }, [
    user,
    authLoading,
  ]);


  async function update(
    id: string,
    quantity: number,
  ) {
    if (
      quantity < 1
    ) {
      return;
    }

    try {
      await api.patch(
        `/cart/${id}`,
        {
          quantity,
        },
      );

      await load();
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  async function remove(
    id: string,
  ) {
    try {
      await api.delete(
        `/cart/${id}`,
      );

      await load();
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  if (
    authLoading ||
    loading
  ) {
    return (
      <section className="page-shell loading">
        Loading shopping bag...
      </section>
    );
  }


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          YOUR SELECTION
        </span>

        <h1>
          Shopping bag
        </h1>
      </div>


      {!items.length ? (
        <div className="empty-state">
          <h2>
            Your bag is empty.
          </h2>

          <Link
            href="/shop"
            className="primary-button"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(
              (item) => (
                <article
                  key={item.id}
                  className="cart-item"
                >
                  <Link
                    href={
                      `/product/${item.product.slug}`
                    }
                  >
                    <img
                      src={
                        item.product.imageUrl
                      }
                      alt={
                        item.product.name
                      }
                    />
                  </Link>


                  <div className="cart-item-copy">
                    <span>
                      {item.product.category.name}
                    </span>

                    <h3>
                      {item.product.name}
                    </h3>

                    <strong>
                      ৳
                      {Number(
                        item.product.price,
                      ).toLocaleString()}
                    </strong>
                  </div>


                  <input
                    type="number"
                    min="1"
                    max={
                      Math.min(
                        item.product.stock,
                        20,
                      )
                    }
                    value={
                      item.quantity
                    }
                    onChange={
                      (event) =>
                        update(
                          item.id,
                          Number(
                            event.target.value,
                          ),
                        )
                    }
                  />


                  <strong>
                    ৳
                    {(
                      Number(
                        item.product.price,
                      ) *
                      item.quantity
                    ).toLocaleString()}
                  </strong>


                  <button
                    type="button"
                    aria-label="Remove product"
                    onClick={() =>
                      remove(
                        item.id,
                      )
                    }
                  >
                    <FiTrash2 />
                  </button>
                </article>
              ),
            )}
          </div>


          <aside className="order-summary">
            <span>
              ORDER SUMMARY
            </span>

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

              <span>
                Calculated at checkout
              </span>
            </div>

            <hr />

            <Link
              href="/checkout"
              className="primary-button wide"
            >
              Continue to checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
