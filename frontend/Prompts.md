# ShopZone AI Prompt Log

## Assignment Summary

Build a React single page e-commerce app with route-based navigation, product fetching from `https://dummyjson.com/products`, Context API cart state, localStorage persistence, mock authentication, and protected checkout routing.

## AI Debugging / Pair-Programming Sessions

### Session 1: Requirement Breakdown

Prompt:

```text
Explain what this ShopZone sprint assignment is asking me to build in React.
```

Outcome:

- Identified React Router requirements: `/`, `/shop`, `/product/:id`, `/contact`, `/cart`, `/login`, and `/checkout`.
- Confirmed Context API should be used for global cart state instead of Redux.
- Confirmed localStorage is required so the cart survives browser refresh.

### Session 2: Implementation Checklist

Prompt:

```text
Help me structure the React SPA so the cart and login state work across routes without prop drilling.
```

Outcome:

- Used `CartContext` for cart items, cart count, total price, add, remove, and clear actions.
- Used `AuthContext` for guest login state and logout.
- Wrapped the route tree with both providers.
- Added a protected route component that redirects unauthorized users to `/login`.

### Session 3: QA Checklist

Prompt:

```text
Create a short QA checklist for demonstrating that React Router changes the URL without a full page reload.
```

Outcome:

- Open `/shop` and click any product card.
- Confirm URL changes to `/product/:id` without a browser reload.
- Add the product to cart and confirm navbar badge updates immediately.
- Refresh the browser and confirm the cart remains.
- Open `/checkout` while logged out and confirm redirect to `/login`.
- Click `Login as Guest` and confirm checkout becomes accessible.

### Session 4: UI Feedback Improvements

Prompt:

```text
Improve the ShopZone UI slightly and add visible success states when a user places an order or sends a contact message.
```

Outcome:

- Added a submitted state to the contact form that shows `Message sent successfully`.
- Added an order placed state to checkout that changes the button and heading after placing an order.
- Improved the visual treatment of the hero area, buttons, product cards, form focus states, and success alerts.

### Session 5: Sprint 11 Fullstack Integration

Prompt:

```text
Implement Sprint 11 Track B by connecting the React/Vite SPA to the Sprint 10 Express/MongoDB API, including data fetching, post creation, deletion, loading states, error states, tests, and deployment environment variables.
```

Outcome:

- Added a `/data-storm` React route that uses `useEffect` to fetch MongoDB posts from the backend.
- Added a browser form that sends multipart `FormData` to `POST /posts`.
- Added delete buttons that call `DELETE /posts/:id` and update local UI state.
- Added loading and error states for asynchronous backend calls.
- Added `VITE_API_BASE_URL` environment configuration for local and Vercel deployments.
- Added Vitest coverage tests for the frontend API service.
