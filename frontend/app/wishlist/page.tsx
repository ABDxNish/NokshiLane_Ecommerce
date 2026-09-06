'use client';

import {
  useEffect,
  useState,
} from 'react';

import ProductCard from '@/components/ProductCard';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
} from '@/lib/api';

import type {
  WishlistItem,
} from '@/lib/types';


export default function WishlistPage() {
  const {
    user,
    loading,
  } =
    useAuth();

  const [
    items,
    setItems,
  ] =
    useState<WishlistItem[]>([]);


  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      window.location.href =
        '/login?next=/wishlist';

      return;
    }

    api.get<WishlistItem[]>(
      '/wishlist',
    )
      .then(
        (response) =>
          setItems(
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
          SAVED FOR LATER
        </span>

        <h1>
          Wishlist
        </h1>
      </div>


      <div className="product-grid">
        {items.map(
          (item) => (
            <ProductCard
              key={item.id}
              product={
                item.product
              }
            />
          ),
        )}
      </div>


      {!items.length && (
        <div className="empty-state">
          Your wishlist is empty.
        </div>
      )}
    </section>
  );
}
