'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';


const slides = [
  {
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90',

    eyebrow:
      'NEW SEASON / 2026',

    title:
      'Wear the moment.',

    text:
      'A refined edit of everyday silhouettes, statement accessories and easy layers.',

    href:
      '/shop',
  },

  {
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90',

    eyebrow:
      'WOMEN / EDIT',

    title:
      'Quiet confidence.',

    text:
      'Clean lines, thoughtful textures and modern pieces made to move with you.',

    href:
      '/shop?category=women',
  },

  {
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90',

    eyebrow:
      'WEEKEND DROP',

    title:
      'Fresh fits, zero fuss.',

    text:
      'Mix, match and build a wardrobe that works from weekday to weekend.',

    href:
      '/shop',
  },
];


export default function HeroSlider() {
  const [
    index,
    setIndex,
  ] =
    useState(0);


  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setIndex(
            (current) =>
              (
                current + 1
              ) %
              slides.length,
          );
        },
        5500,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, []);


  return (
    <section className="hero-slider">
      {slides.map(
        (
          slide,
          slideIndex,
        ) => (
          <article
            key={
              slide.title
            }
            className={
              `hero-slide ${
                slideIndex ===
                index
                  ? 'active'
                  : ''
              }`
            }
            style={{
              backgroundImage:
                `linear-gradient(90deg, rgba(6,10,9,.80), rgba(6,10,9,.12)), url("${slide.image}")`,
            }}
          >
            <div className="hero-copy">
              <span>
                {slide.eyebrow}
              </span>

              <h1>
                {slide.title}
              </h1>

              <p>
                {slide.text}
              </p>

              <Link
                href={
                  slide.href
                }
                className="light-button"
              >
                Shop collection
              </Link>
            </div>
          </article>
        ),
      )}


      <div className="hero-dots">
        {slides.map(
          (
            _,
            slideIndex,
          ) => (
            <button
              type="button"
              key={
                slideIndex
              }
              aria-label={
                `Go to slide ${slideIndex + 1}`
              }
              className={
                slideIndex ===
                index
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setIndex(
                  slideIndex,
                )
              }
            />
          ),
        )}
      </div>
    </section>
  );
}
