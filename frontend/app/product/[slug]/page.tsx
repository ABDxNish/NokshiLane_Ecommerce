'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import {
  FiHeart,
  FiShoppingBag,
} from 'react-icons/fi';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  Product,
} from '@/lib/types';


export default function ProductDetailPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const {
    user,
  } =
    useAuth();

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    activeImage,
    setActiveImage,
  ] =
    useState('');

  const [
    quantity,
    setQuantity,
  ] =
    useState(1);

  const [
    error,
    setError,
  ] =
    useState('');


  useEffect(() => {
    if (!params.slug) {
      return;
    }

    api.get<Product>(
      `/products/${params.slug}`,
    )
      .then(
        (response) => {
          setProduct(
            response.data,
          );

          setActiveImage(
            response.data.imageUrl,
          );
        },
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
    params.slug,
  ]);


  async function addCart() {
    if (
      !product
    ) {
      return;
    }

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

          quantity,
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


  async function wishlist() {
    if (!product) {
      return;
    }

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


  if (error) {
    return (
      <section className="page-shell">
        <div className="form-alert">
          {error}
        </div>
      </section>
    );
  }


  if (!product) {
    return (
      <section className="page-shell loading">
        Loading product...
      </section>
    );
  }


  const gallery =
    [
      product.imageUrl,
      ...(product.images || []),
    ]
      .filter(Boolean)
      .filter(
        (
          image,
          index,
          list,
        ) =>
          list.indexOf(
            image,
          ) === index,
      );


  return (
    <section className="product-detail page-shell">
      <div className="product-gallery">
        <div className="thumb-list">
          {gallery.map(
            (image) => (
              <button
                type="button"
                key={image}
                className={
                  image === activeImage
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveImage(
                    image,
                  )
                }
              >
                <img
                  src={image}
                  alt=""
                />
              </button>
            ),
          )}
        </div>


        <img
          className="detail-main-image"
          src={
            activeImage
          }
          alt={
            product.name
          }
        />
      </div>


      <div className="detail-copy">
        <span className="eyebrow">
          {product.category.name}
          {' · '}
          {product.brand || 'NokshiLane'}
        </span>

        <h1>
          {product.name}
        </h1>


        <div className="detail-rating">
          ★
          {' '}
          {Number(
            product.rating,
          ).toFixed(1)}
          {' · '}
          {product.reviewCount}
          {' '}
          reviews
        </div>


        <div className="detail-price">
          <span>
            ৳
            {Number(
              product.price,
            ).toLocaleString()}
          </span>

          {product.compareAtPrice && (
            <del>
              ৳
              {Number(
                product.compareAtPrice,
              ).toLocaleString()}
            </del>
          )}
        </div>


        <p>
          {product.description}
        </p>


        <div className="stock-line">
          {product.stock > 0
            ? `${product.stock} item(s) in stock`
            : 'Out of stock'}
        </div>


        <label className="qty-row">
          Quantity

          <input
            type="number"
            min="1"
            max={
              Math.max(
                1,
                Math.min(
                  product.stock,
                  20,
                ),
              )
            }
            value={
              quantity
            }
            onChange={
              (event) => {
                const next =
                  Number(
                    event.target.value,
                  );

                setQuantity(
                  Math.min(
                    Math.max(
                      next || 1,
                      1,
                    ),
                    Math.max(
                      1,
                      Math.min(
                        product.stock,
                        20,
                      ),
                    ),
                  ),
                );
              }
            }
          />
        </label>


        <div className="detail-actions">
          <button
            type="button"
            className="primary-button"
            disabled={
              product.stock <= 0
            }
            onClick={
              addCart
            }
          >
            <FiShoppingBag />
            Add to bag
          </button>

          <button
            type="button"
            className="outline-button"
            onClick={
              wishlist
            }
          >
            <FiHeart />
            Wishlist
          </button>
        </div>


        <div className="detail-benefits">
          <div>
            <strong>
              Delivery
            </strong>

            <span>
              Dhaka ৳80 · Outside Dhaka ৳120
            </span>
          </div>

          <div>
            <strong>
              Payment
            </strong>

            <span>
              COD or SSLCOMMERZ
            </span>
          </div>

          <div>
            <strong>
              SKU
            </strong>

            <span>
              {product.sku}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
