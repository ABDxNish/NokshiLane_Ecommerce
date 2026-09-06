'use client';

import {
  useState,
} from 'react';

import Link from 'next/link';

import {
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from 'react-icons/fi';

import {
  useAuth,
} from './AuthProvider';


const navigation = [
  [
    '/',
    'Home',
  ],

  [
    '/shop',
    'Shop',
  ],

  [
    '/shop?category=women',
    'Women',
  ],

  [
    '/shop?category=men',
    'Men',
  ],

  [
    '/shop?category=footwear',
    'Footwear',
  ],

  [
    '/shop?category=accessories',
    'Accessories',
  ],
] as const;


export default function Navbar() {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const {
    user,
    logout,
  } =
    useAuth();


  return (
    <>
      <header className="site-header">
        <Link
          href="/"
          className="brand"
        >
          nokshi
          <span>
            lane
          </span>
        </Link>


        <nav className="desktop-nav">
          {navigation.map(
            (
              [
                href,
                label,
              ],
            ) => (
              <Link
                key={label}
                href={href}
              >
                {label}
              </Link>
            ),
          )}
        </nav>


        <div className="nav-actions">
          <Link
            href="/shop"
            aria-label="Search products"
          >
            <FiSearch />
          </Link>


          <Link
            href="/wishlist"
            aria-label="Wishlist"
          >
            <FiHeart />
          </Link>


          <Link
            href="/cart"
            aria-label="Shopping cart"
          >
            <FiShoppingBag />
          </Link>


          {user ? (
            <Link
              href={
                user.role ===
                'ADMIN'
                  ? '/admin'
                  : '/profile'
              }
              aria-label="Account"
            >
              <FiUser />
            </Link>
          ) : (
            <Link
              href="/login"
              className="nav-login"
            >
              Login
            </Link>
          )}


          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setOpen(true)
            }
            aria-label="Open navigation menu"
          >
            <FiMenu />
          </button>
        </div>
      </header>


      <button
        type="button"
        aria-label="Close navigation menu"
        className={
          `sidebar-overlay ${
            open
              ? 'show'
              : ''
          }`
        }
        onClick={() =>
          setOpen(false)
        }
      />


      <aside
        className={
          `mobile-sidebar ${
            open
              ? 'open'
              : ''
          }`
        }
      >
        <div className="sidebar-top">
          <Link
            href="/"
            className="brand"
            onClick={() =>
              setOpen(false)
            }
          >
            nokshi
            <span>
              lane
            </span>
          </Link>


          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setOpen(false)
            }
          >
            <FiX />
          </button>
        </div>


        <nav className="sidebar-links">
          {navigation.map(
            (
              [
                href,
                label,
              ],
            ) => (
              <Link
                key={label}
                href={href}
                onClick={() =>
                  setOpen(false)
                }
              >
                {label}
              </Link>
            ),
          )}


          <Link
            href="/cart"
            onClick={() =>
              setOpen(false)
            }
          >
            Shopping Bag
          </Link>


          <Link
            href="/wishlist"
            onClick={() =>
              setOpen(false)
            }
          >
            Wishlist
          </Link>


          {user && (
            <Link
              href="/orders"
              onClick={() =>
                setOpen(false)
              }
            >
              My Orders
            </Link>
          )}


          {user?.role ===
            'ADMIN' && (
            <Link
              href="/admin"
              onClick={() =>
                setOpen(false)
              }
            >
              Admin Dashboard
            </Link>
          )}
        </nav>


        <div className="sidebar-account">
          {user ? (
            <>
              <strong>
                {user.name}
              </strong>

              <span>
                {user.email}
              </span>

              <button
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="primary-button"
              onClick={() =>
                setOpen(false)
              }
            >
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
