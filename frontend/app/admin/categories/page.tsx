'use client';

import {
  FormEvent,
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
  Category,
} from '@/lib/types';


const emptyForm = {
  name: '',
  slug: '',
  imageUrl: '',
  description: '',
};


export default function AdminCategoriesPage() {
  const {
    user,
    loading,
  } =
    useAuth();

  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([]);

  const [
    form,
    setForm,
  ] =
    useState(
      emptyForm,
    );

  const [
    editing,
    setEditing,
  ] =
    useState<string | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState('');


  async function load() {
    const response =
      await api.get<Category[]>(
        '/categories',
      );

    setCategories(
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


  function edit(
    category: Category,
  ) {
    setEditing(
      category.id,
    );

    setForm({
      name:
        category.name,

      slug:
        category.slug,

      imageUrl:
        category.imageUrl ||
        '',

      description:
        category.description ||
        '',
    });

    window.scrollTo({
      top: 0,
      behavior:
        'smooth',
    });
  }


  function reset() {
    setEditing(null);

    setForm(
      emptyForm,
    );

    setError('');
  }


  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    try {
      setError('');

      const payload = {
        name:
          form.name.trim(),

        slug:
          form.slug
            .trim()
            .toLowerCase(),

        imageUrl:
          form.imageUrl.trim() ||
          undefined,

        description:
          form.description.trim() ||
          undefined,
      };


      if (
        payload.name.length <
        2
      ) {
        throw new Error(
          'Category name must be at least 2 characters',
        );
      }


      if (
        !/^[a-z0-9-]+$/.test(
          payload.slug,
        )
      ) {
        throw new Error(
          'Slug can contain lowercase letters, numbers and hyphens only',
        );
      }


      if (editing) {
        await api.patch(
          `/categories/${editing}`,
          payload,
        );
      } else {
        await api.post(
          '/categories',
          payload,
        );
      }


      reset();

      await load();
    } catch (error) {
      setError(
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
        'Delete this category?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/categories/${id}`,
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
          ADMIN / CATEGORIES
        </span>

        <h1>
          Category management
        </h1>
      </div>


      <form
        className="admin-card"
        onSubmit={
          submit
        }
      >
        <div className="form-grid">
          <label>
            Category name

            <input
              value={
                form.name
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
              }
            />
          </label>


          <label>
            Slug

            <input
              value={
                form.slug
              }
              placeholder="women"
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    slug:
                      event.target.value,
                  })
              }
            />
          </label>


          <label className="full">
            Category image URL

            <input
              value={
                form.imageUrl
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    imageUrl:
                      event.target.value,
                  })
              }
            />
          </label>


          <label className="full">
            Description

            <textarea
              value={
                form.description
              }
              onChange={
                (event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
              }
            />
          </label>
        </div>


        {error && (
          <div className="form-alert">
            {error}
          </div>
        )}


        <div className="admin-form-actions">
          <button className="primary-button">
            {editing
              ? 'Update category'
              : 'Add category'}
          </button>

          {editing && (
            <button
              type="button"
              className="outline-button"
              onClick={
                reset
              }
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>


      <div className="admin-product-grid">
        {categories.map(
          (category) => (
            <article
              key={category.id}
              className="admin-product-card"
            >
              <img
                src={
                  category.imageUrl ||
                  '/logo.svg'
                }
                alt={
                  category.name
                }
              />

              <div>
                <span>
                  {category.slug}
                </span>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description ||
                    'No description'}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      edit(
                        category,
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(
                        category.id,
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
