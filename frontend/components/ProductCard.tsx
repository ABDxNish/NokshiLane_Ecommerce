'use client';

import Link from 'next/link';

import {
  FiHeart,
  FiShoppingBag,
} from 'react-icons/fi';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  Product,
} from '@/lib/types';

import {
  useAuth,
} from './AuthProvider';


export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const {
    user,
  } =
    useAuth();


  async function addToCart() {
    if (!user) {
      window.location.href =
        `/login?next=${encodeURIComponent(
          `/product/${product.slug}`,
        )}`;

      return;
    }

    try {
      await api.post(
        '/cart',
        {
          productId:
            product.id,

          quantity:
            1,
        },
      );

      window.alert(
        'Added to shopping bag',
      );
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  async function toggleWishlist() {
    if (!user) {
      window.location.href =
        '/login?next=/wishlist';

      return;
    }

    try {
      const response =
        await api.post(
          `/wishlist/${product.id}/toggle`,
        );

      window.alert(
        response.data.message,
      );
    } catch (error) {
      window.alert(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link
          href={
            `/product/${product.slug}`
          }
        >
          <img
            src={
              product.imageUrl
            }
            alt={
              product.name
            }
            className="product-image"
          />
        </Link>


        {product.compareAtPrice && (
          <span className="sale-badge">
            SALE
          </span>
        )}


        <button
          type="button"
          className="wish-button"
          aria-label="Toggle wishlist"
          onClick={
            toggleWishlist
          }
        >
          <FiHeart />
        </button>


        <button
          type="button"
          className="quick-add"
          disabled={
            product.stock <= 0
          }
          onClick={
            addToCart
          }
        >
          <FiShoppingBag />

          {product.stock > 0
            ? 'Quick add'
            : 'Out of stock'}
        </button>
      </div>


      <div className="product-meta">
        <span>
          {product.category?.name}
        </span>

        <Link
          href={
            `/product/${product.slug}`
          }
        >
          <h3>
            {product.name}
          </h3>
        </Link>


        <div className="price-line">
          <strong>
            ৳
            {Number(
              product.price,
            ).toLocaleString()}
          </strong>

          {product.compareAtPrice && (
            <del>
              ৳
              {Number(
                product.compareAtPrice,
              ).toLocaleString()}
            </del>
          )}
        </div>


        <small>
          ★{' '}
          {Number(
            product.rating,
          ).toFixed(1)}
          {' '}
          ({product.reviewCount})
        </small>
      </div>
    </article>
  );
}
