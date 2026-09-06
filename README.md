# NokshiLane

NokshiLane is a Bangladesh-focused full-stack fashion and lifestyle
e-commerce application built with Next.js, React, NestJS, PostgreSQL
and TypeORM.

The project intentionally follows a straightforward controller-service-
repository architecture so that the code remains understandable while
still demonstrating realistic e-commerce functionality.

---

## Main Stack

### Frontend

- Next.js
- React
- TypeScript
- React Hook Form
- Zod
- Axios
- Pusher JS
- Custom CSS

### Backend

- NestJS
- PostgreSQL
- TypeORM
- express-session
- bcrypt
- class-validator
- google-auth-library
- Pusher
- Nodemailer

### Payments

- Cash on Delivery
- SSLCOMMERZ Hosted Checkout

---

# Features

## Customer

- Homepage
- Large image hero slider
- Automatic hero rotation
- Category cards
- Horizontal draggable product carousel
- Swipe support
- Product search
- Category filtering
- Price filtering
- Sorting
- Pagination
- Product details
- Multiple product images
- Product gallery
- Stock availability
- Quantity selection
- Wishlist
- Shopping cart
- Persistent database cart
- Registration
- Login
- Logout
- Google Sign-In
- Customer profile
- Bangladesh delivery address
- COD checkout
- SSLCOMMERZ checkout
- Order history
- Order details
- Realtime order notifications

---

## Admin

- Admin dashboard
- Total order statistics
- Paid revenue
- Active order count
- Delivered order count
- Product CRUD
- Category CRUD
- Stock control
- Price management
- Featured products
- Bestseller products
- Order management
- Controlled order-status transitions

---

# Validation

## Frontend

React Hook Form + Zod validates:

- Name
- Email
- Bangladesh phone
- Password
- Password confirmation
- Terms acceptance
- Checkout fields
- Product form
- Product price
- Compare-at price
- Product stock
- Image URLs
- Category selection

---

## Backend

NestJS DTO validation handles:

- Registration
- Login
- Google credential
- Category data
- Product data
- Product filters
- Cart quantity
- Checkout
- Order status

---

## Business Logic Validation

Services also enforce:

- Unique email
- Unique phone
- Unique category slug
- Unique product slug
- Unique SKU
- Valid product stock
- Cart quantity limits
- Checkout stock validation
- Server-side price calculation
- User ownership of orders
- Valid order status progression
- Payment transaction validation
- Payment amount validation
- Payment currency validation

---

# Database

Create:

```sql
CREATE DATABASE nokshilane_ecommerce;
```

For the full setup process, read:

START_HERE.txt

Important development notes:

- DB_SYNC=true is intended for local development.
- Use TypeORM migrations for real production.
- Change the default admin credentials before deployment.
- Configure Google, Pusher, Nodemailer and SSLCOMMERZ only after the basic application is running.
