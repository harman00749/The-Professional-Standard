# ShopZone

ShopZone is a React e-commerce Single Page Application built with Vite. It demonstrates client-side routing, REST API data fetching, dynamic product detail pages, global cart state, localStorage persistence, mock authentication, and protected checkout routing.

Sprint 11 adds a fullstack integration page that connects the React UI to the Data Storm Express/MongoDB API.

## Tech Stack

- React
- Vite
- React Router DOM
- Context API
- CSS
- localStorage
- DummyJSON Products API
- Data Storm Express API
- Vitest coverage tests

## Features

- Home page with a welcome banner.
- Shop page that fetches products from `https://dummyjson.com/products`.
- Product grid with clickable product cards.
- Dynamic product detail route using `/product/:id`.
- Product detail page using `useParams()` to fetch selected product data.
- Add to Cart action from the product detail page.
- Global cart state using React Context API.
- Persistent navbar with live cart badge.
- Cart page with selected items, quantities, and total price.
- Cart data saved in localStorage, so it survives browser refresh.
- Contact page with a functional form UI.
- Message sent confirmation after contact form submission.
- Login page with "Login as Guest" mock authentication.
- Protected checkout route that redirects logged-out users to `/login`.
- Order placed confirmation on checkout.
- `Prompts.md` file documenting AI debugging and planning sessions.
- Data Storm page that fetches persisted posts from MongoDB through the backend.
- React form that creates MongoDB post documents from the browser.
- Delete action that removes persisted posts and updates the DOM.
- Loading and error UI states for backend connection handling.

## Routes

```text
/              Home
/shop          Product listing
/data-storm    Fullstack MongoDB posts integration
/product/:id   Product details
/contact       Contact form
/cart          Shopping cart
/login         Guest login
/checkout      Protected checkout
```

## How To Run

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

On Windows PowerShell, use:

```bash
npm.cmd install
npm.cmd run dev
```

Create a `.env` file for local integration:

```env
VITE_API_BASE_URL=http://localhost:5000
```

To test against the deployed backend instead:

```env
VITE_API_BASE_URL=https://the-data-storm-afcz.onrender.com
```

Open the local Vite URL in the browser:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The production build will be generated in the `dist` folder.

## Tests

Run the Sprint 11 test suite and coverage report:

```bash
npm test
```

On Windows PowerShell:

```bash
npm.cmd test
```

The coverage report validates the frontend API service that fetches, creates, and deletes Data Storm posts.

## Vercel Deployment

Recommended Vercel settings:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://the-data-storm-afcz.onrender.com`

After Vercel deployment, update the backend Render service with:

```text
CLIENT_ORIGIN=http://localhost:5173,https://YOUR_VERCEL_URL.vercel.app
```

## Demo Checklist

- Open `/shop` and show products loading from the API.
- Click a product and show the URL changing to `/product/1`.
- Add the product to cart and show the cart badge update.
- Open `/cart` and show total price calculation.
- Refresh the page and show cart persistence.
- Open `/checkout` while logged out and show redirect to `/login`.
- Click `Login as Guest` and show checkout access.
- Click `Place Order` and show order confirmation.
- Open `/contact`, submit the form, and show message sent confirmation.
- Run `npm test` and show the passing coverage report.
- Open `/data-storm`, create a post from the React form, and show it appears in the UI.
- Hard refresh the browser and show the created post still appears.
- Delete the post from the UI and show the DOM updates.

## Project Notes

This project was created for a React SPA assignment focused on enterprise-style routing, Context API state management, API consumption, cart persistence, mock authentication, protected routes, and deployment readiness.
