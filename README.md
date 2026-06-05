# Shopify-Style Vercel Store

This is a working starter online store built for Vercel using Next.js.

## What is included

- Customer storefront
- Product catalog with images, descriptions and pricing
- Size, colour and quantity selection
- Cart
- Checkout form
- Fixed editable shipping cost
- Admin dashboard
- Add, edit and delete products
- View new orders
- Mark orders as packed/shipped
- Generate printable invoices

## Admin login

Default admin password:

```txt
ChangeMe123!
```

Change this before going live. In this starter version it is stored in `app/page.js` as `ADMIN_PASSWORD`.

## Important note about data

This starter version stores products, cart, shipping and orders in the browser's local storage. That means it is excellent for testing, demos and a first live preview, but a production store should use a database such as Supabase, Firebase, Neon/Postgres or Vercel Postgres.

## Online payments

The checkout includes a payment placeholder. To accept real card/EFT payments in South Africa, integrate a payment provider such as PayFast, Yoco, Paystack, Peach Payments or Stripe.

## Deploy to Vercel

### Option 1: Import from GitHub

1. Create a free account at Vercel.
2. Create a GitHub repository and upload this project folder.
3. In Vercel, click **Add New Project**.
4. Import the GitHub repository.
5. Vercel should detect Next.js automatically.
6. Click **Deploy**.
7. Vercel will give you a live URL like `https://your-store.vercel.app`.

### Option 2: Vercel CLI

Install Node.js, then run:

```bash
npm install
npm run build
npx vercel
```

Follow the prompts and Vercel will create a live link.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Recommended production upgrades

- Add a real database for products and orders
- Add secure admin authentication
- Add PayFast/Yoco/Paystack/Stripe payments
- Add email or WhatsApp order notifications
- Add inventory tracking
- Add product search and categories
- Add custom domain
