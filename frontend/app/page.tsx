'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import HeroSlider from '@/components/HeroSlider';
import ProductCarousel from '@/components/ProductCarousel';

import {
  api,
} from '@/lib/api';

import type {
  Category,
  Product,
  ProductListResponse,
} from '@/lib/types';


export default function HomePage() {
  const [
    featured,
    setFeatured,
  ] =
    useState<Product[]>([]);

  const [
    bestsellers,
    setBestsellers,
  ] =
    useState<Product[]>([]);

  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([]);


  useEffect(() => {
    Promise.all([
      api.get<ProductListResponse>(
        '/products?featured=true&limit=12',
      ),

      api.get<ProductListResponse>(
        '/products?bestseller=true&limit=12',
      ),

      api.get<Category[]>(
        '/categories',
      ),
    ])
      .then(
        ([
          featuredResponse,
          bestsellerResponse,
          categoryResponse,
        ]) => {
          setFeatured(
            featuredResponse.data.items,
          );

          setBestsellers(
            bestsellerResponse.data.items,
          );

          setCategories(
            categoryResponse.data,
          );
        },
      )
      .catch(
        () => undefined,
      );
  }, []);


  return (
    <>
      <div className="promo-ticker">
  <div className="promo-ticker-track">
    <span>
      FREE DELIVERY IN DHAKA OVER ৳5,000
    </span>

    <i>✦</i>

    <span>
      CASH ON DELIVERY
    </span>

    <i>✦</i>

    <span>
      SECURE ONLINE PAYMENT
    </span>

    <i>✦</i>

    <span>
      EASY ORDER TRACKING
    </span>

    <i>✦</i>

    <span>
      FREE DELIVERY IN DHAKA OVER ৳5,000
    </span>

    <i>✦</i>

    <span>
      CASH ON DELIVERY
    </span>

    <i>✦</i>

    <span>
      SECURE ONLINE PAYMENT
    </span>

    <i>✦</i>

    <span>
      EASY ORDER TRACKING
    </span>
  </div>
</div>


      <HeroSlider />


      <section className="category-section">
        <div className="section-heading">
          <div>
            <span>
              SHOP YOUR WAY
            </span>

            <h2>
              Explore categories
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-link"
          >
            View all →
          </Link>
        </div>


        <div className="category-grid">
          {categories.map(
            (category) => (
              <Link
                key={category.id}
                href={
                  `/shop?category=${category.slug}`
                }
                className="category-card"
              >
                <img
                  src={
                    category.imageUrl ||
                    ''
                  }
                  alt={
                    category.name
                  }
                />

                <div>
                  <strong>
                    {category.name}
                  </strong>

                  <span>
                    Explore →
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>


      <ProductCarousel
        title="Selected for you"
        subtitle="FEATURED DROP"
        products={featured}
      />


      <section className="editorial-grid">
        <div
          className="editorial-large"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgba(0,0,0,.62), rgba(0,0,0,.03)), url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1500&q=90")',
          }}
        >
          <div>
            <span>
              WOMEN / NEW EDIT
            </span>

            <h2>
              Soft structure.
              <br />
              Strong presence.
            </h2>

            <Link
              href="/shop?category=women"
              className="light-button"
            >
              Shop women
            </Link>
          </div>
        </div>


        <div className="editorial-side">
          <img
            src="/promo-animated.svg"
            alt="NokshiLane promotion"
          />

          <div className="editorial-copy">
            <span>
              LIMITED DROP
            </span>

            <h3>
              Weekend edit
            </h3>

            <p>
              Fresh seasonal pieces,
              easy styling and selected
              markdowns.
            </p>

            <Link
              href="/shop"
              className="dark-button"
            >
              Discover now
            </Link>
          </div>
        </div>
      </section>


      <ProductCarousel
        title="Most wanted"
        subtitle="BESTSELLERS"
        products={bestsellers}
      />


      <section className="service-strip">
        <div>
          <strong>
            Bangladesh delivery
          </strong>

          <span>
            Dhaka and nationwide courier
          </span>
        </div>

        <div>
          <strong>
            Secure checkout
          </strong>

          <span>
            COD + SSLCOMMERZ
          </span>
        </div>

        <div>
          <strong>
            Easy account
          </strong>

          <span>
            Password or Google Sign-In
          </span>
        </div>

        <div>
          <strong>
            Realtime updates
          </strong>

          <span>
            Pusher order notifications
          </span>
        </div>
      </section>
    </>
  );
}
