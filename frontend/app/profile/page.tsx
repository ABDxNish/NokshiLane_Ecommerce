'use client';

import Link from 'next/link';

import {
  useAuth,
} from '@/components/AuthProvider';


export default function ProfilePage() {
  const {
    user,
    loading,
    logout,
  } =
    useAuth();


  if (loading) {
    return (
      <section className="page-shell loading">
        Loading profile...
      </section>
    );
  }


  if (!user) {
    if (
      typeof window !==
      'undefined'
    ) {
      window.location.href =
        '/login';
    }

    return null;
  }


  return (
    <section className="page-shell">
      <div className="page-intro">
        <span>
          YOUR ACCOUNT
        </span>

        <h1>
          Hello,
          {' '}
          {user.name}
        </h1>
      </div>


      <div className="profile-grid">
        <div className="profile-card">
          <span>
            ACCOUNT DETAILS
          </span>

          <h3>
            {user.name}
          </h3>

          <p>
            {user.email}
          </p>

          <p>
            {user.phone ||
              'Phone not added'}
          </p>

          <p>
            Role:
            {' '}
            {user.role}
          </p>

          <button
            type="button"
            className="outline-button"
            onClick={
              logout
            }
          >
            Logout
          </button>
        </div>


        <Link
          href="/orders"
          className="profile-link-card"
        >
          <span>
            ORDERS
          </span>

          <h3>
            Track purchases →
          </h3>
        </Link>


        <Link
          href="/wishlist"
          className="profile-link-card"
        >
          <span>
            WISHLIST
          </span>

          <h3>
            Saved favourites →
          </h3>
        </Link>


        {user.role ===
          'ADMIN' && (
          <Link
            href="/admin"
            className="profile-link-card"
          >
            <span>
              ADMIN
            </span>

            <h3>
              Store dashboard →
            </h3>
          </Link>
        )}
      </div>
    </section>
  );
}
