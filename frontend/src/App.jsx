import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'
import { API_BASE_URL, createPost, deletePost, fetchPosts } from './services/dataStormApi'

const PRODUCTS_URL = 'https://dummyjson.com/products'
const CART_STORAGE_KEY = 'shopzone-cart'
const AUTH_STORAGE_KEY = 'shopzone-guest-auth'
const INITIAL_POST_FORM = {
  title: '',
  content: '',
  authorName: '',
  authorEmail: '',
  thumbnail: null,
}

const CartContext = createContext(null)
const AuthContext = createContext(null)

function readStoredCart() {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY))
    return Array.isArray(storedCart) ? storedCart : []
  } catch {
    return []
  }
}

function readStoredAuth() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readStoredCart)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity: 1,
        },
      ]
    })
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const value = useMemo(
    () => ({
      cartCount,
      cartItems,
      cartTotal,
      addToCart,
      clearCart,
      removeFromCart,
    }),
    [cartCount, cartItems, cartTotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth)

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated))
  }, [isAuthenticated])

  function loginAsGuest() {
    setIsAuthenticated(true)
  }

  function logout() {
    setIsAuthenticated(false)
  }

  const value = useMemo(
    () => ({ isAuthenticated, loginAsGuest, logout }),
    [isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="page-shell">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/data-storm" element={<DataStorm />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function Navbar() {
  const { cartCount } = useCart()
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <Link className="brand" to="/">
          <span className="brand-mark">SZ</span>
          <span>ShopZone</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/data-storm">Data Storm</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
        </div>

        <div className="nav-actions">
          <Link className="cart-link" to="/cart" aria-label="Open shopping cart">
            Cart
            <span className="cart-badge">{cartCount}</span>
          </Link>
          {isAuthenticated ? (
            <button className="ghost-button small-button" type="button" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link className="login-link" to="/login">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Single Page E-Commerce</p>
        <h1>Welcome to ShopZone</h1>
        <p>
          Browse live inventory, open product detail URLs, and manage a cart
          that stays synced across the whole React app.
        </p>
        <Link className="primary-action" to="/shop">
          Start Shopping
        </Link>
      </div>
      <div className="hero-panel" aria-label="ShopZone feature summary">
        <div>
          <strong>30+</strong>
          <span>Live products</span>
        </div>
        <div>
          <strong>SPA</strong>
          <span>No page reload</span>
        </div>
        <div>
          <strong>Cart</strong>
          <span>Saved on refresh</span>
        </div>
      </div>
    </section>
  )
}

function DataStorm() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(INITIAL_POST_FORM)
  const [status, setStatus] = useState('loading')
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPosts() {
      try {
        setStatus('loading')
        setError('')
        const databasePosts = await fetchPosts({ signal: controller.signal })
        setPosts(databasePosts)
        setStatus('success')
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
          setStatus('error')
        }
      }
    }

    loadPosts()

    return () => controller.abort()
  }, [])

  function updateField(event) {
    const { name, value, files } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: files ? files[0] || null : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget

    try {
      setSubmitStatus('loading')
      setError('')
      const createdPost = await createPost(form)
      setPosts((currentPosts) => [createdPost, ...currentPosts])
      setForm(INITIAL_POST_FORM)
      formElement.reset()
      setSubmitStatus('success')
    } catch (submitError) {
      setError(submitError.message)
      setSubmitStatus('error')
    }
  }

  async function handleDelete(postId) {
    try {
      setError('')
      await deletePost(postId)
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId))
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <section className="integration-page">
      <div className="section-heading">
        <p className="eyebrow">MERN Integration</p>
        <h1>Data Storm Posts</h1>
        <p>
          This page hydrates data from the Express API, creates MongoDB
          documents, and deletes persisted records through the browser UI.
        </p>
      </div>

      <div className="integration-grid">
        <form className="integration-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Backend</p>
            <h2>Connected API</h2>
            <code>{API_BASE_URL}</code>
          </div>

          <label>
            Title
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={updateField}
              placeholder="Live integration post"
              required
            />
          </label>

          <label>
            Content
            <textarea
              name="content"
              rows="5"
              value={form.content}
              onChange={updateField}
              placeholder="This payload is created from the React UI."
              required
            />
          </label>

          <div className="form-row">
            <label>
              Author Name
              <input
                name="authorName"
                type="text"
                value={form.authorName}
                onChange={updateField}
                placeholder="Harman"
                required
              />
            </label>
            <label>
              Author Email
              <input
                name="authorEmail"
                type="email"
                value={form.authorEmail}
                onChange={updateField}
                placeholder="harman@example.com"
                required
              />
            </label>
          </div>

          <label>
            Thumbnail Image
            <input name="thumbnail" type="file" accept="image/*" onChange={updateField} />
          </label>

          {error ? (
            <div className="error-message" role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={submitStatus === 'loading'}>
            {submitStatus === 'loading' ? 'Creating...' : 'Create MongoDB Post'}
          </button>
        </form>

        <div className="post-panel">
          <div className="post-panel-header">
            <div>
              <p className="eyebrow">Database Payload</p>
              <h2>Persisted Posts</h2>
            </div>
            <span>{posts.length} records</span>
          </div>

          {status === 'loading' ? (
            <StatusMessage title="Loading posts" text="Fetching MongoDB documents..." />
          ) : null}

          {status === 'error' ? (
            <StatusMessage title="Backend connection failed" text={error} />
          ) : null}

          {status === 'success' && posts.length === 0 ? (
            <div className="empty-state">
              <h2>No posts yet.</h2>
              <p>Create a post to verify the fullstack pipeline.</p>
            </div>
          ) : null}

          {status === 'success' && posts.length > 0 ? (
            <div className="post-list">
              {posts.map((post) => (
                <article className="post-card" key={post._id}>
                  {post.imageUrl ? <img src={post.imageUrl} alt={post.title} /> : null}
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <small>
                      {post.authorId?.name || 'Unknown author'} |{' '}
                      {post.authorId?.email || 'No email'}
                    </small>
                  </div>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => handleDelete(post._id)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Shop() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setStatus('loading')
        const response = await fetch(PRODUCTS_URL, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Products could not be loaded.')
        }
        const data = await response.json()
        setProducts(data.products ?? [])
        setStatus('success')
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
          setStatus('error')
        }
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [])

  if (status === 'loading') {
    return <StatusMessage title="Loading products" text="Fetching inventory..." />
  }

  if (status === 'error') {
    return <StatusMessage title="Shop unavailable" text={error} />
  }

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Inventory</p>
        <h1>Shop Products</h1>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <Link className="product-card" key={product.id} to={`/product/${product.id}`}>
            <img src={product.thumbnail} alt={product.title} />
            <div>
              <p className="product-category">{product.category}</p>
              <h2>{product.title}</h2>
              <p className="product-description">{product.description}</p>
            </div>
            <strong>${product.price.toFixed(2)}</strong>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProduct() {
      try {
        setStatus('loading')
        const response = await fetch(`${PRODUCTS_URL}/${id}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Product details could not be loaded.')
        }
        const data = await response.json()
        setProduct(data)
        setStatus('success')
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
          setStatus('error')
        }
      }
    }

    loadProduct()

    return () => controller.abort()
  }, [id])

  if (status === 'loading') {
    return <StatusMessage title="Loading product" text="Hydrating product route..." />
  }

  if (status === 'error') {
    return <StatusMessage title="Product unavailable" text={error} />
  }

  return (
    <section className="detail-layout">
      <div className="detail-image">
        <img src={product.thumbnail} alt={product.title} />
      </div>
      <div className="detail-copy">
        <Link className="back-link" to="/shop">
          Back to shop
        </Link>
        <p className="eyebrow">{product.category}</p>
        <h1>{product.title}</h1>
        <p className="detail-description">{product.description}</p>
        <div className="detail-meta">
          <span>Rating {product.rating}</span>
          <span>Stock {product.stock}</span>
          <span>${product.price.toFixed(2)}</span>
        </div>
        <button type="button" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </section>
  )
}

function Contact() {
  const [messageSent, setMessageSent] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setMessageSent(true)
  }

  return (
    <section className="form-page">
      <div className="section-heading">
        <p className="eyebrow">Support</p>
        <h1>Contact ShopZone</h1>
        <p>Send a message to our demo support desk.</p>
      </div>

      {messageSent ? (
        <div className="success-message" role="status">
          Message sent successfully. ShopZone support will contact you soon.
        </div>
      ) : null}

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" placeholder="Your name" required />
        </label>
        <label>
          Email
          <input type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Message
          <textarea rows="5" placeholder="How can we help?" required />
        </label>
        <button type="submit">
          {messageSent ? 'Message Sent' : 'Send Message'}
        </button>
      </form>
    </section>
  )
}

function Cart() {
  const { cartItems, cartTotal, clearCart, removeFromCart } = useCart()

  return (
    <section>
      <div className="section-heading">
        <p className="eyebrow">Shopping Cart</p>
        <h1>Your Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is empty.</h2>
          <Link className="primary-action" to="/shop">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.thumbnail} alt={item.title} />
                <div>
                  <h2>{item.title}</h2>
                  <p>
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <h2>Order Summary</h2>
            <p>Total Price</p>
            <strong>${cartTotal.toFixed(2)}</strong>
            <Link className="primary-action full-width" to="/checkout">
              Checkout
            </Link>
            <button className="ghost-button full-width" type="button" onClick={clearCart}>
              Clear Cart
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}

function Login() {
  const { isAuthenticated, loginAsGuest } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = location.state?.from?.pathname ?? '/checkout'

  function handleLogin() {
    loginAsGuest()
    navigate(redirectTo, { replace: true })
  }

  if (isAuthenticated) {
    return <Navigate to="/checkout" replace />
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Mock Authentication</p>
      <h1>Login</h1>
      <p>Use the guest action to unlock the protected checkout route.</p>
      <button type="button" onClick={handleLogin}>
        Login as Guest
      </button>
    </section>
  )
}

function Checkout() {
  const { cartItems, cartTotal } = useCart()
  const [orderPlaced, setOrderPlaced] = useState(false)
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <section className="checkout-page">
      <div className="section-heading">
        <p className="eyebrow">Protected Route</p>
        <h1>Checkout</h1>
        <p>This page is available only after guest login.</p>
      </div>

      {orderPlaced ? (
        <div className="success-message" role="status">
          Order placed successfully. Thank you for shopping with ShopZone.
        </div>
      ) : null}

      <div className="summary-card checkout-summary">
        <h2>{orderPlaced ? 'Order Placed' : 'Ready to place order'}</h2>
        <p>Items: {itemCount}</p>
        <strong>Total: ${cartTotal.toFixed(2)}</strong>
        <button
          type="button"
          disabled={itemCount === 0 || orderPlaced}
          onClick={() => setOrderPlaced(true)}
        >
          {orderPlaced ? 'Order Placed' : 'Place Order'}
        </button>
      </div>
    </section>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function NotFound() {
  return (
    <StatusMessage
      title="Page not found"
      text="Use the navbar to return to a valid ShopZone route."
    />
  )
}

function StatusMessage({ title, text }) {
  return (
    <section className="status-card">
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  )
}

export default App
