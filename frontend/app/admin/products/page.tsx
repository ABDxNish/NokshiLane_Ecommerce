'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useForm,
} from 'react-hook-form';

import {
  zodResolver,
} from '@hookform/resolvers/zod';

import {
  z,
} from 'zod';

import {
  useAuth,
} from '@/components/AuthProvider';

import {
  api,
  getErrorMessage,
} from '@/lib/api';

import {
  productSchema,
} from '@/lib/schemas';

import type {
  Category,
  Product,
  ProductListResponse,
} from '@/lib/types';


type FormData =
  z.infer<
    typeof productSchema
  >;


const defaults:
  Partial<FormData> = {
    name:
      '',

    slug:
      '',

    sku:
      '',

    brand:
      'NokshiLane',

    description:
      '',

    price:
      1000,

    compareAtPrice:
      null,

    stock:
      0,

    imageUrl:
      '',

    imagesText:
      '',

    featured:
      false,

    bestseller:
      false,

    rating:
      4.5,

    categoryId:
      '',
  };


export default function AdminProductsPage() {
  const {
    user,
    loading,
  } =
    useAuth();

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
    editing,
    setEditing,
  ] =
    useState<Product | null>(
      null,
    );

  const [
    serverError,
    setServerError,
  ] =
    useState('');


  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<FormData>({
      resolver:
        zodResolver(
          productSchema,
        ),

      defaultValues:
        defaults as FormData,
    });


  async function load() {
    const [
      productsResponse,
      categoriesResponse,
    ] =
      await Promise.all([
        api.get<ProductListResponse>(
          '/products?limit=48',
        ),

        api.get<Category[]>(
          '/categories',
        ),
      ]);


    setProducts(
      productsResponse.data.items,
    );

    setCategories(
      categoriesResponse.data,
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


  function startEdit(
    product: Product,
  ) {
    setEditing(
      product,
    );

    reset({
      name:
        product.name,

      slug:
        product.slug,

      sku:
        product.sku,

      brand:
        product.brand ||
        '',

      description:
        product.description,

      price:
        Number(
          product.price,
        ),

      compareAtPrice:
        product.compareAtPrice
          ? Number(
              product.compareAtPrice,
            )
          : null,

      stock:
        Number(
          product.stock,
        ),

      imageUrl:
        product.imageUrl,

      imagesText:
        (
          product.images ||
          []
        ).join(', '),

      featured:
        product.featured,

      bestseller:
        product.bestseller,

      rating:
        Number(
          product.rating,
        ),

      categoryId:
        product.category.id,
    });


    window.scrollTo({
      top: 0,
      behavior:
        'smooth',
    });
  }


  function clearForm() {
    setEditing(null);

    setServerError('');

    reset(
      defaults as FormData,
    );
  }


  async function submit(
    values: FormData,
  ) {
    try {
      setServerError('');


      const images =
        values.imagesText
          ?.split(',')
          .map(
            (value) =>
              value.trim(),
          )
          .filter(Boolean) ||
        [];


      const payload = {
        name:
          values.name.trim(),

        slug:
          values.slug
            .trim()
            .toLowerCase(),

        sku:
          values.sku
            .trim()
            .toUpperCase(),

        brand:
          values.brand?.trim() ||
          undefined,

        description:
          values.description.trim(),

        price:
          values.price,

        compareAtPrice:
          values.compareAtPrice ||
          undefined,

        stock:
          values.stock,

        imageUrl:
          values.imageUrl.trim(),

        images,

        featured:
          values.featured,

        bestseller:
          values.bestseller,

        rating:
          values.rating,

        categoryId:
          values.categoryId,
      };


      if (editing) {
        await api.patch(
          `/products/id/${editing.id}`,
          payload,
        );
      } else {
        await api.post(
          '/products',
          payload,
        );
      }


      clearForm();

      await load();
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
        ),
      );
    }
  }


  async function remove(
    id: string,
  ) {
    if (
      !window.confirm(
        'Delete this product?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/products/id/${id}`,
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


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          ADMIN / CATALOGUE
        </span>

        <h1>
          {editing
            ? 'Edit product'
            : 'Add product'}
        </h1>
      </div>


      <form
        className="admin-card"
        onSubmit={
          handleSubmit(
            submit,
          )
        }
      >
        <div className="form-grid">
          <label>
            Product name

            <input
              {...register(
                'name',
              )}
            />

            {errors.name && (
              <small className="form-error">
                {errors.name.message}
              </small>
            )}
          </label>


          <label>
            Slug

            <input
              placeholder="midnight-flow-dress"
              {...register(
                'slug',
              )}
            />

            {errors.slug && (
              <small className="form-error">
                {errors.slug.message}
              </small>
            )}
          </label>


          <label>
            SKU

            <input
              placeholder="NK-W-004"
              {...register(
                'sku',
              )}
            />

            {errors.sku && (
              <small className="form-error">
                {errors.sku.message}
              </small>
            )}
          </label>


          <label>
            Brand

            <input
              {...register(
                'brand',
              )}
            />
          </label>


          <label>
            Selling price

            <input
              type="number"
              step="0.01"
              {...register(
                'price',
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            {errors.price && (
              <small className="form-error">
                {errors.price.message}
              </small>
            )}
          </label>


          <label>
            Compare-at price

            <input
              type="number"
              step="0.01"
              {...register(
                'compareAtPrice',
                {
                  setValueAs:
                    (value) =>
                      value === ''
                        ? null
                        : Number(
                            value,
                          ),
                },
              )}
            />

            {errors.compareAtPrice && (
              <small className="form-error">
                {errors.compareAtPrice.message}
              </small>
            )}
          </label>


          <label>
            Stock

            <input
              type="number"
              {...register(
                'stock',
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            {errors.stock && (
              <small className="form-error">
                {errors.stock.message}
              </small>
            )}
          </label>


          <label>
            Rating

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              {...register(
                'rating',
                {
                  valueAsNumber:
                    true,
                },
              )}
            />

            {errors.rating && (
              <small className="form-error">
                {errors.rating.message}
              </small>
            )}
          </label>


          <label>
            Category

            <select
              {...register(
                'categoryId',
              )}
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>

            {errors.categoryId && (
              <small className="form-error">
                {errors.categoryId.message}
              </small>
            )}
          </label>


          <label className="full">
            Main image URL

            <input
              {...register(
                'imageUrl',
              )}
            />

            {errors.imageUrl && (
              <small className="form-error">
                {errors.imageUrl.message}
              </small>
            )}
          </label>


          <label className="full">
            Gallery image URLs
            (comma separated)

            <input
              {...register(
                'imagesText',
              )}
            />
          </label>


          <label className="full">
            Description

            <textarea
              {...register(
                'description',
              )}
            />

            {errors.description && (
              <small className="form-error">
                {errors.description.message}
              </small>
            )}
          </label>
        </div>


        <div className="check-group">
          <label className="check-row">
            <input
              type="checkbox"
              {...register(
                'featured',
              )}
            />

            Featured product
          </label>


          <label className="check-row">
            <input
              type="checkbox"
              {...register(
                'bestseller',
              )}
            />

            Bestseller
          </label>
        </div>


        {serverError && (
          <div className="form-alert">
            {serverError}
          </div>
        )}


        <div className="admin-form-actions">
          <button
            className="primary-button"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? 'Saving...'
              : editing
                ? 'Update product'
                : 'Add product'}
          </button>


          {editing && (
            <button
              type="button"
              className="outline-button"
              onClick={
                clearForm
              }
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>


      <div className="admin-product-grid">
        {products.map(
          (product) => (
            <article
              key={product.id}
              className="admin-product-card"
            >
              <img
                src={
                  product.imageUrl
                }
                alt={
                  product.name
                }
              />

              <div>
                <span>
                  {product.sku}
                </span>

                <h3>
                  {product.name}
                </h3>

                <p>
                  ৳
                  {Number(
                    product.price,
                  ).toLocaleString()}
                  {' · '}
                  Stock
                  {' '}
                  {product.stock}
                </p>


                <div>
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(
                        product,
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(
                        product.id,
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
