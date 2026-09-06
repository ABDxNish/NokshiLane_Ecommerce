'use client';

import {
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import ProductCard from '@/components/ProductCard';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import type {
  Category,
  Product,
  ProductListResponse,
} from '@/lib/types';


function ShopContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  /*
   * This changes whenever:
   *
   * /shop
   * /shop?category=men
   * /shop?category=women
   * /shop?search=shirt
   *
   * changes through Next.js navigation.
   */
  const searchParamsKey =
    searchParams.toString();


  const urlCategory =
    searchParams.get(
      'category',
    ) || '';

  const urlSearch =
    searchParams.get(
      'search',
    ) || '';


  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([]);


  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([]);


  const [
    page,
    setPage,
  ] =
    useState(1);


  const [
    pages,
    setPages,
  ] =
    useState(1);


  const [
    total,
    setTotal,
  ] =
    useState(0);


  /*
   * Search input has its own state
   * because user should be able to type
   * before pressing Search.
   */
  const [
    search,
    setSearch,
  ] =
    useState(
      urlSearch,
    );


  const [
    sort,
    setSort,
  ] =
    useState(
      'newest',
    );


  const [
    maxPrice,
    setMaxPrice,
  ] =
    useState(
      '10000',
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState('');


  /*
   * Prevent sort/max-price effect
   * from causing another request
   * during the first render.
   */
  const filterEffectReady =
    useRef(false);


  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  async function load(
    requestedPage = 1,
    requestedCategory =
      urlCategory,
    requestedSearch =
      urlSearch,
  ) {
    try {
      setLoading(true);
      setError('');


      const params =
        new URLSearchParams();


      params.set(
        'page',
        String(
          requestedPage,
        ),
      );


      params.set(
        'limit',
        '12',
      );


      params.set(
        'sort',
        sort,
      );


      params.set(
        'maxPrice',
        maxPrice,
      );


      if (
        requestedSearch.trim()
      ) {
        params.set(
          'search',
          requestedSearch.trim(),
        );
      }


      if (
        requestedCategory
      ) {
        params.set(
          'category',
          requestedCategory,
        );
      }


      const response =
        await api.get<
          ProductListResponse
        >(
          `/products?${params.toString()}`,
        );


      setProducts(
        response.data.items,
      );


      setPage(
        response.data.page,
      );


      setPages(
        response.data.pages,
      );


      setTotal(
        response.data.total,
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
        ),
      );
    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // LOAD CATEGORIES ONCE
  // ==========================================================

  useEffect(() => {
    async function loadCategories() {
      try {
        const response =
          await api.get<
            Category[]
          >(
            '/categories',
          );


        setCategories(
          response.data,
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error,
          ),
        );
      }
    }


    loadCategories();
  }, []);


  // ==========================================================
  // REACT TO URL CHANGES
  //
  // This fixes:
  //
  // Men -> Women -> Accessories
  // without manually refreshing.
  // ==========================================================

  useEffect(() => {
    const incomingCategory =
      searchParams.get(
        'category',
      ) || '';


    const incomingSearch =
      searchParams.get(
        'search',
      ) || '';


    /*
     * Keep input synchronized
     * when user navigates using navbar.
     */
    setSearch(
      incomingSearch,
    );


    load(
      1,
      incomingCategory,
      incomingSearch,
    );


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParamsKey,
  ]);


  // ==========================================================
  // SORT / PRICE CHANGES
  //
  // Small debounce prevents the price slider
  // from firing too many requests.
  // ==========================================================

  useEffect(() => {
    if (
      !filterEffectReady.current
    ) {
      filterEffectReady.current =
        true;

      return;
    }


    const timer =
      window.setTimeout(
        () => {
          load(
            1,
            urlCategory,
            urlSearch,
          );
        },
        250,
      );


    return () => {
      window.clearTimeout(
        timer,
      );
    };


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sort,
    maxPrice,
  ]);


  // ==========================================================
  // UPDATE URL
  // ==========================================================

  function navigateFilters(
    nextCategory: string,
    nextSearch: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );


    if (nextCategory) {
      params.set(
        'category',
        nextCategory,
      );
    } else {
      params.delete(
        'category',
      );
    }


    if (
      nextSearch.trim()
    ) {
      params.set(
        'search',
        nextSearch.trim(),
      );
    } else {
      params.delete(
        'search',
      );
    }


    /*
     * Reset page whenever filter changes.
     */
    params.delete(
      'page',
    );


    const query =
      params.toString();


    const nextUrl =
      query
        ? `/shop?${query}`
        : '/shop';


    const currentUrl =
      searchParamsKey
        ? `/shop?${searchParamsKey}`
        : '/shop';


    /*
     * If URL is already the same,
     * router won't necessarily trigger
     * another navigation.
     */
    if (
      nextUrl ===
      currentUrl
    ) {
      load(
        1,
        nextCategory,
        nextSearch,
      );

      return;
    }


    router.push(
      nextUrl,
      {
        scroll: false,
      },
    );
  }


  // ==========================================================
  // SEARCH
  // ==========================================================

  function submit(
    event: FormEvent,
  ) {
    event.preventDefault();


    navigateFilters(
      urlCategory,
      search,
    );
  }


  // ==========================================================
  // CATEGORY
  // ==========================================================

  function changeCategory(
    nextCategory: string,
  ) {
    navigateFilters(
      nextCategory,
      search,
    );
  }


  // ==========================================================
  // CLEAR CATEGORY
  // ==========================================================

  function clearCategory() {
    navigateFilters(
      '',
      search,
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          SHOP THE EDIT
        </span>


        <h1>
          {urlCategory
            ? categories.find(
                (item) =>
                  item.slug ===
                  urlCategory,
              )?.name ||
              'Shop'
            : 'All products'}
        </h1>


        <p>
          Search, filter and
          discover the complete
          NokshiLane collection.
        </p>
      </div>


      <div className="shop-layout">
        {/* ================================================
            FILTER PANEL
        ================================================= */}

        <aside className="filter-panel">
          <form
            onSubmit={
              submit
            }
          >
            <label>
              Search


              <input
                value={
                  search
                }
                placeholder="Search products..."
                onChange={
                  (event) =>
                    setSearch(
                      event.target.value,
                    )
                }
              />
            </label>


            <button
              type="submit"
              className="dark-button wide"
            >
              Search
            </button>
          </form>


          {/* CATEGORY */}

          <label>
            Category


            <select
              value={
                urlCategory
              }
              onChange={
                (event) =>
                  changeCategory(
                    event.target.value,
                  )
              }
            >
              <option value="">
                All categories
              </option>


              {categories.map(
                (item) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.slug
                    }
                  >
                    {item.name}
                  </option>
                ),
              )}
            </select>
          </label>


          {/* SORT */}

          <label>
            Sort


            <select
              value={
                sort
              }
              onChange={
                (event) =>
                  setSort(
                    event.target.value,
                  )
              }
            >
              <option value="newest">
                Newest
              </option>


              <option value="price-asc">
                Price:
                Low to high
              </option>


              <option value="price-desc">
                Price:
                High to low
              </option>


              <option value="rating">
                Highest rated
              </option>
            </select>
          </label>


          {/* PRICE */}

          <label>
            Maximum:
            {' '}
            ৳
            {Number(
              maxPrice,
            ).toLocaleString()}


            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={
                maxPrice
              }
              onChange={
                (event) =>
                  setMaxPrice(
                    event.target.value,
                  )
              }
            />
          </label>
        </aside>


        {/* ================================================
            PRODUCTS
        ================================================= */}

        <div>
          <div className="shop-result-top">
            <strong>
              {total}
              {' '}
              product
              {total === 1
                ? ''
                : 's'}
            </strong>


            {urlCategory && (
              <button
                type="button"
                className="clear-filter"
                onClick={
                  clearCategory
                }
              >
                Clear category ×
              </button>
            )}
          </div>


          {error && (
            <div className="form-alert">
              {error}
            </div>
          )}


          {loading ? (
            <div className="empty-state">
              Loading products...
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={
                        product.id
                      }
                      product={
                        product
                      }
                    />
                  ),
                )}
              </div>


              {!products.length && (
                <div className="empty-state">
                  No products match
                  your filters.
                </div>
              )}
            </>
          )}


          {/* ==============================================
              PAGINATION
          =============================================== */}

          {pages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={
                  loading ||
                  page <= 1
                }
                onClick={() =>
                  load(
                    page - 1,
                    urlCategory,
                    urlSearch,
                  )
                }
              >
                ← Previous
              </button>


              <span>
                Page
                {' '}
                {page}
                {' '}
                of
                {' '}
                {pages}
              </span>


              <button
                type="button"
                disabled={
                  loading ||
                  page >= pages
                }
                onClick={() =>
                  load(
                    page + 1,
                    urlCategory,
                    urlSearch,
                  )
                }
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


/*
 * Suspense is included because
 * useSearchParams() is used.
 *
 * This also makes production
 * Next.js builds safer.
 */

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <section className="page-shell">
          <div className="empty-state">
            Loading shop...
          </div>
        </section>
      }
    >
      <ShopContent />
    </Suspense>
  );
}