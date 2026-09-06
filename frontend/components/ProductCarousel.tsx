'use client';

import {
  PointerEvent,
  useRef,
  useState,
} from 'react';

import {
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';

import type {
  Product,
} from '@/lib/types';

import ProductCard from './ProductCard';


export default function ProductCarousel({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle: string;
  products: Product[];
}) {
  const trackRef =
    useRef<
      HTMLDivElement
    >(null);

  const [
    dragging,
    setDragging,
  ] =
    useState(false);

  const dragState =
    useRef({
      startX: 0,
      scrollLeft: 0,
    });


  function scrollByCard(
    direction: number,
  ) {
    trackRef.current
      ?.scrollBy({
        left:
          direction *
          650,

        behavior:
          'smooth',
      });
  }


 function onPointerDown(
  event:
    PointerEvent<HTMLDivElement>,
) {
  const track =
    trackRef.current;

  if (!track) {
    return;
  }

  const target =
    event.target as HTMLElement;

  // Buttons/links must work normally.
  if (
    target.closest(
      'button, a, input, select, textarea',
    )
  ) {
    return;
  }

  // Only left mouse button should drag.
  if (
    event.pointerType ===
      'mouse' &&
    event.button !== 0
  ) {
    return;
  }

  setDragging(true);

  dragState.current = {
    startX:
      event.clientX,

    scrollLeft:
      track.scrollLeft,
  };

  track.setPointerCapture(
    event.pointerId,
  );
}


  function onPointerMove(
    event:
      PointerEvent<HTMLDivElement>,
  ) {
    const track =
      trackRef.current;

    if (
      !track ||
      !dragging
    ) {
      return;
    }

    const movement =
      event.clientX -
      dragState.current
        .startX;

    track.scrollLeft =
      dragState.current
        .scrollLeft -
      movement;
  }


  function stopDragging() {
    setDragging(false);
  }


  return (
    <section className="carousel-section">
      <div className="section-heading">
        <div>
          <span>
            {subtitle}
          </span>

          <h2>
            {title}
          </h2>
        </div>


        <div className="carousel-arrows">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() =>
              scrollByCard(-1)
            }
          >
            <FiArrowLeft />
          </button>


          <button
            type="button"
            aria-label="Next products"
            onClick={() =>
              scrollByCard(1)
            }
          >
            <FiArrowRight />
          </button>
        </div>
      </div>


      <div
        ref={trackRef}
        className={
          `product-track ${
            dragging
              ? 'dragging'
              : ''
          }`
        }
        onPointerDown={
          onPointerDown
        }
        onPointerMove={
          onPointerMove
        }
        onPointerUp={
          stopDragging
        }
        onPointerCancel={
          stopDragging
        }
        onPointerLeave={() => {
          if (dragging) {
            stopDragging();
          }
        }}
      >
        {products.map(
          (product) => (
            <div
              className="track-card"
              key={
                product.id
              }
            >
              <ProductCard
                product={
                  product
                }
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
