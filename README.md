# Amazon India Modern Clone

![Next.js](https://img.shields.io/badge/Next.js-15-111827?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-0ea5e9?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-2563eb?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Prisma-16a34a?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635bff?style=for-the-badge&logo=stripe&logoColor=white)

A professional full-stack ecommerce marketplace inspired by Amazon India. The project combines a polished storefront, cart, checkout, authentication, user dashboard, admin management, MongoDB data models, and Stripe payments in a clean Next.js 15 App Router architecture.

## Preview

| Home | Product Detail |
| --- | --- |
| ![Amazon India clone homepage](public/screenshots/home.png) | ![Product detail page](public/screenshots/product-detail.png) |

| Search & Filters | Admin Overview |
| --- | --- |
| ![Search and filtering page](public/screenshots/search-filters.png) | ![Admin overview dashboard](public/screenshots/admin-overview.png) |

## Highlights

- Amazon India-inspired responsive UI with sticky navigation, category bar, hero carousel, deal shelves, product sections, and footer
- NextAuth authentication with credentials login, signup, logout, and Google OAuth provider support
- Product catalogue with cards, gallery, ratings, reviews, discount badges, stock state, Prime-style labels, and SEO metadata
- Cart with add, remove, quantity update, subtotal, shipping, GST estimate, and local persistence through Zustand
- Checkout flow with shipping address form, Stripe Checkout session creation, order records, and webhook payment updates
- User dashboard for order history, profile management, and saved addresses
- Admin panel for products, orders, and users with protected API routes
- Search experience with keyword search, category filter, rating filter, price/rating/discount sorting, pagination controls, and infinite loading
- Dark mode, toast notifications, loading skeletons, Framer Motion transitions, and mobile-first responsive layout
- Prisma MongoDB schema, seed script, typed API routes, validation with Zod, and production build support

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion, Lucide React |
| State & UX | Zustand, next-themes, Sonner |
| Auth | NextAuth.js credentials provider and Google OAuth |
| Database | MongoDB with Prisma ORM |
| Payments | Stripe Checkout and Stripe webhooks |
| Validation | Zod |

## Project Structure

```text
app/
  api/
    admin/              Admin product, order, and user APIs
    auth/               NextAuth and registration routes
    cart/               Cart sync API
    checkout/           Stripe Checkout API
    orders/             User order API
    products/           Product search/detail APIs
    stripe/webhook/     Stripe webhook handler
    wishlist/           Wishlist API
  admin/                Seller/admin pages
  cart/                 Cart page
  checkout/             Checkout and success pages
  dashboard/            User account pages
  products/[slug]/      Product detail pages
  search/               Search and filtering page
components/
  admin/                Admin management components
  auth/                 Login and signup UI
  cart/                 Cart and checkout UI
  dashboard/            Dashboard shell
  home/                 Homepage sections
  layout/               Header and footer
  product/              Product cards, gallery, filters, infinite grid
  providers/            Session, theme, and cart providers
  ui/                   Reusable UI primitives
lib/
  auth.ts               NextAuth configuration
  data.ts               Dummy catalogue and hero data
  prisma.ts             Prisma client singleton
  products.ts           Product search helpers
  stripe.ts             Stripe server client
  validators.ts         Zod schemas
prisma/
  schema.prisma         MongoDB data model
scripts/
  seed.ts               Demo seed data
public/screenshots/     README screenshots
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MongoDB database, such as MongoDB Atlas
- Stripe test account
- Google OAuth app, optional for Google sign-in

### Installation

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill in the required variables:

```bash
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/amazon-clone?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate Prisma Client and sync the database schema:

```bash
npm run prisma:generate
npm run db:push
```

Seed demo products, users, addresses, and an order:

```bash
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

After running `npm run db:seed`, use:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| Customer | `customer@example.com` | `User@123` |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MongoDB connection string used by Prisma |
| `NEXTAUTH_URL` | Yes | Local or deployed app URL for NextAuth callbacks |
| `NEXTAUTH_SECRET` | Yes | Long random secret for signing auth tokens |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe server-side secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key for client-side integrations |
| `STRIPE_WEBHOOK_SECRET` | Recommended | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL used for Stripe success and cancel redirects |

Generate a NextAuth secret with:

```bash
openssl rand -base64 32
```

## Stripe Setup

The checkout API creates a Stripe Checkout session from cart items and stores an order before redirecting the customer.

For local webhook testing, install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

Use this test card in Stripe Checkout:

```text
4242 4242 4242 4242
Any future expiry
Any 3-digit CVC
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and build the production app |
| `npm run start` | Start the production server after building |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run db:push` | Push the Prisma schema to MongoDB |
| `npm run db:seed` | Seed demo users, products, addresses, and order data |
| `npm run prisma:studio` | Open Prisma Studio |

## Core Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with hero carousel, categories, deals, and product sections |
| `/search` | Product search, filtering, sorting, pagination, and infinite loading |
| `/products/[slug]` | Product detail page with gallery, reviews, and cart actions |
| `/cart` | Shopping cart and order summary |
| `/checkout` | Shipping address and Stripe payment handoff |
| `/dashboard/orders` | Customer order history |
| `/dashboard/profile` | Customer profile management |
| `/dashboard/addresses` | Saved address management |
| `/admin` | Admin overview |
| `/admin/products` | Product create, edit, and delete UI |
| `/admin/orders` | Order management UI |
| `/admin/users` | User role management UI |

## API Overview

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/auth/register` | POST | Credentials signup |
| `/api/products` | GET | Product search with filters |
| `/api/products/[id]` | GET | Product detail lookup |
| `/api/cart` | GET/POST/DELETE | Authenticated cart sync |
| `/api/wishlist` | GET/POST/DELETE | Authenticated wishlist sync |
| `/api/checkout` | POST | Create order and Stripe Checkout session |
| `/api/orders` | GET | Authenticated user orders |
| `/api/admin/products` | GET/POST | Admin product management |
| `/api/admin/products/[id]` | PATCH/DELETE | Admin product update/delete |
| `/api/admin/orders` | GET | Admin order list |
| `/api/admin/orders/[id]` | PATCH | Admin order status update |
| `/api/admin/users` | GET | Admin user list |
| `/api/admin/users/[id]` | PATCH | Admin role update |
| `/api/stripe/webhook` | POST | Stripe checkout completion handler |

## Data Model

The Prisma schema includes:

- `User`, `Account`, `Session`, and `VerificationToken` for NextAuth
- `Product` with images, ratings, tags, category, pricing, stock, and feature flags
- `Review` for product feedback
- `CartItem` and `WishlistItem` for customer shopping state
- `Address` for saved shipping addresses
- `Order` and `OrderItem` with shipping, totals, status, payment status, and Stripe metadata

## Deployment

1. Create a MongoDB database and set `DATABASE_URL`.
2. Create Stripe test/live keys and configure `STRIPE_SECRET_KEY`.
3. Configure the Stripe webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
5. Add `NEXTAUTH_SECRET` and optional Google OAuth credentials.
6. Run:

```bash
npm run build
```

7. Deploy to Vercel or another Node-compatible hosting provider.

## Development Notes

- The storefront can render from local dummy catalogue data before MongoDB is configured, which makes visual review quick.
- API routes are Prisma-ready and will persist data once `DATABASE_URL`, `db:push`, and `db:seed` are complete.
- Admin API routes require `session.user.role === "ADMIN"`.
- The admin UI includes demo-friendly local state so the portfolio screens remain explorable without a configured database session.
- Screenshots in this README were captured from the local app and stored in `public/screenshots`.

## Quality Checks

Run these before shipping changes:

```bash
npm run typecheck
npm run build
```

The current project has been verified with both commands.
