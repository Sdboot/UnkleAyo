<script>
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'

  let products = [
    {
      id: 1,
      name: '2026 Habit Tracker',
      price: 40000,
      image: 'https://files.selar.co/product-images/2025/products/salakoayomide/2026-habit-tracker-selar.com-692419c2eb4cb.webp',
      description: 'A carefully designed habit tracker for 2026 across 6 different categories. Track consistency, not perfection.',
      details: 'What you don\'t journal, you cannot track. What you cannot track, you cannot measure. What you cannot measure, you cannot control. What you cannot control, you cannot optimise.'
    },
    {
      id: 2,
      name: 'Cost of Living / Savings Tracker',
      price: 15000,
      image: 'https://via.placeholder.com/300x400?text=Savings+Tracker',
      description: 'Track your expenses and savings with detailed analytics.',
      details: 'Comprehensive expense tracking and savings monitoring tool.'
    },
    {
      id: 3,
      name: 'Global Scholarships Resource Pack',
      price: 40000,
      image: 'https://via.placeholder.com/300x400?text=Scholarships',
      description: 'Complete resource pack for Bachelors, Masters, and PhD scholarships.',
      details: 'Access to global scholarship opportunities and application guides.'
    }
  ]

  let cart = []
  let showCart = false
  let email = ''
  let fullName = ''
  let phone = ''
  let isLoading = false
  let errorMessage = ''
  let successMessage = ''
  let apiUrl = ''
  let selectedProduct = null
  let showProductModal = false

  onMount(async () => {
    // Set API URL
    const publicUrl = import.meta.env.VITE_PUBLIC_URL
    if (publicUrl && publicUrl.trim() !== '') {
      apiUrl = publicUrl
    } else {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const protocol = window.location.protocol
        const port = 3001
        apiUrl = `${protocol}//${window.location.hostname}:${port}`
      } else {
        apiUrl = window.location.origin
      }
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('store_cart')
    if (savedCart) {
      cart = JSON.parse(savedCart)
    }
  })

  function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart = [...cart, { ...product, quantity: 1 }]
    }
    localStorage.setItem('store_cart', JSON.stringify(cart))
  }

  function showProduct(product) {
    selectedProduct = product
    showProductModal = true
  }

  function closeProductModal() {
    showProductModal = false
    setTimeout(() => {
      selectedProduct = null
    }, 300)
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId)
    localStorage.setItem('store_cart', JSON.stringify(cart))
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      const item = cart.find(item => item.id === productId)
      if (item) {
        item.quantity = quantity
        cart = [...cart]
        localStorage.setItem('store_cart', JSON.stringify(cart))
      }
    }
  }

  let cartTotal = 0
  let itemCount = 0

  $: {
    cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    itemCount = cart.reduce((count, item) => count + item.quantity, 0)
  }

  async function handleCheckout(e) {
    e.preventDefault()

    if (!email || !fullName || !phone) {
      errorMessage = 'Please fill in all fields'
      return
    }

    if (cart.length === 0) {
      errorMessage = 'Your cart is empty'
      return
    }

    errorMessage = ''
    successMessage = ''
    isLoading = true

    try {
      if (!window.PaystackPop) {
        throw new Error('Paystack is not loaded. Please refresh the page.')
      }

      const totalAmount = cartTotal
      const items = cart.map(item => `${item.quantity}x ${item.name}`).join(', ')

      const paystackHandler = window.PaystackPop.setup({
        key: 'pk_test_e1aec9e9771dbc0a474a7eebaac972d5097b6d0f',
        email: email,
        amount: totalAmount * 100, // Paystack uses kobo (cents)
        ref: `store_${Date.now()}`,
        currency: 'NGN',
        onClose: function() {
          errorMessage = 'Payment window closed'
          isLoading = false
        },
        onSuccess: async function(response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${apiUrl}/api/verify-store-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                reference: response.reference,
                fullName, email, phone,
                items: cart,
                totalAmount
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              successMessage = '✅ Payment successful! Your order has been confirmed. Check your email for details.'
              cart = []
              localStorage.removeItem('store_cart')
              email = ''
              fullName = ''
              phone = ''
              showCart = false

              setTimeout(() => {
                successMessage = ''
              }, 5000)
            } else {
              throw new Error(verifyData.message || 'Payment verification failed')
            }
          } catch (err) {
            console.error('Error verifying payment:', err)
            errorMessage = err.message || 'Payment verification failed'
          } finally {
            isLoading = false
          }
        }
      })

      paystackHandler.openIframe()
    } catch (error) {
      console.error('Error in payment:', error)
      errorMessage = error.message || 'Payment failed. Please try again.'
      isLoading = false
    }
  }
</script>

<div class="store-container">
  <section class="store-header">
    <h1>UnkleAyo Store</h1>
    <p>Resources for wisdom, growth, and success</p>
  </section>

  {#if successMessage}
    <div class="success-banner">{successMessage}</div>
  {/if}

  <div class="store-wrapper" class:cart-visible={showCart}>
    <div class="products-section">
      <h2>Products</h2>
      <div class="products-grid">
        {#each products as product (product.id)}
          <button class="product-card" on:click={() => showProduct(product)} type="button" aria-label="View {product.name} details">
            <img src={product.image} alt={product.name} class="product-image" />
            <div class="product-content">
              <h3>{product.name}</h3>
              <p class="product-desc">{product.description}</p>
              <div class="product-footer">
                <span class="price">₦{product.price.toLocaleString()}</span>
                <button
                  class="add-btn"
                  on:click|stopPropagation={() => addToCart(product)}
                  disabled={isLoading}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <aside class="cart-section" class:open={showCart}>
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="close-btn" on:click={() => showCart = false}>✕</button>
      </div>

      {#if cart.length === 0}
        <div class="empty-cart">
          <p>Your cart is empty</p>
        </div>
      {:else}
        <div class="cart-items">
          {#each cart as item (item.id)}
            <div class="cart-item">
              <div class="item-info">
                <h4>{item.name}</h4>
                <span class="item-price">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              <div class="item-controls">
                <button on:click={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span class="quantity">{item.quantity}</span>
                <button on:click={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button class="remove-btn" on:click={() => removeFromCart(item.id)}>Remove</button>
            </div>
          {/each}
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>Items:</span>
            <strong>{itemCount}</strong>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <strong>₦{cartTotal.toLocaleString()}</strong>
          </div>
        </div>

        <form on:submit={handleCheckout} class="checkout-form">
          <h3>Checkout</h3>

          <div class="form-group">
            <label for="fullname">Full Name:</label>
            <input
              type="text"
              id="fullname"
              bind:value={fullName}
              placeholder="Your name"
              required
              disabled={isLoading}
            />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              bind:value={phone}
              placeholder="+234 (XXX) XXX-XXXX"
              required
              disabled={isLoading}
            />
          </div>

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <button type="submit" class="checkout-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : `Pay ₦${cartTotal.toLocaleString()}`}
          </button>
        </form>
      {/if}
    </aside>
  </div>

  <button class="cart-toggle" on:click={() => showCart = !showCart}>
    <span class="cart-icon-wrapper">
      🛒
      {#if itemCount > 0}
        <span class="notification-dot"></span>
      {/if}
    </span>
  </button>
</div>

{#if showProductModal && selectedProduct}
  <div class="modal-backdrop" on:keydown={(e) => e.key === 'Escape' && closeProductModal()} on:click={closeProductModal} transition:fade={{ duration: 300 }} role="button" tabindex="0" aria-label="Close modal">
    <div class="product-modal" on:click|stopPropagation transition:scale={{ duration: 300, start: 0.9 }} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal-close" on:click={closeProductModal}>✕</button>
      
      <div class="modal-content">
        <div class="modal-image">
          <img src={selectedProduct.image} alt={selectedProduct.name} />
        </div>
        
        <div class="modal-info">
          <h2 id="modal-title">{selectedProduct.name}</h2>
          <p class="modal-description">{selectedProduct.details}</p>
          
          <div class="modal-price">
            <span class="price-label">Price:</span>
            <span class="price-value">₦{selectedProduct.price.toLocaleString()}</span>
          </div>
          
          <button class="modal-add-btn" on:click={() => {
            addToCart(selectedProduct)
            closeProductModal()
          }} disabled={isLoading}>
            ✓ Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .store-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
    min-height: calc(100vh - 64px);
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), rgba(255, 157, 77, 0.05));
  }

  .store-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .store-header h1 {
    font-size: 40px;
    font-weight: 700;
    color: #efefef;
    margin-bottom: 12px;
  }

  .store-header p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .success-banner {
    padding: 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 6px;
    color: #86efac;
    text-align: center;
    margin-bottom: 24px;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .store-wrapper {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 32px;
  }

  .products-section h2 {
    font-size: 24px;
    font-weight: 600;
    color: #efefef;
    margin-bottom: 24px;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
  }

  .product-card {
    background: rgba(255, 107, 53, 0.05);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    all: unset;
    display: block;
    background: rgba(255, 107, 53, 0.05);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(255, 107, 53, 0.15);
    border-color: rgba(255, 107, 53, 0.4);
  }

  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .product-content {
    padding: 16px;
  }

  .product-content h3 {
    font-size: 16px;
    font-weight: 600;
    color: #efefef;
    margin-bottom: 8px;
  }

  .product-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price {
    font-size: 16px;
    font-weight: 700;
    color: #ff6b35;
  }

  .add-btn {
    padding: 8px 12px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }

  .add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cart-section {
    background: rgba(255, 107, 53, 0.08);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 12px;
    padding: 20px;
    height: fit-content;
    position: sticky;
    top: 100px;
    display: flex;
    flex-direction: column;
  }

  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .cart-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #efefef;
    margin: 0;
  }

  .close-btn {
    display: none;
    background: none;
    border: none;
    color: #efefef;
    font-size: 24px;
    cursor: pointer;
  }

  .empty-cart {
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.5);
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    max-height: 300px;
    overflow-y: auto;
  }

  .cart-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .item-info {
    margin-bottom: 8px;
  }

  .item-info h4 {
    font-size: 13px;
    font-weight: 600;
    color: #efefef;
    margin: 0 0 4px 0;
  }

  .item-price {
    font-size: 12px;
    color: #ff6b35;
    font-weight: 600;
  }

  .item-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .item-controls button {
    width: 24px;
    height: 24px;
    border: 1px solid rgba(255, 107, 53, 0.3);
    background: rgba(255, 107, 53, 0.1);
    color: #ff6b35;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .item-controls button:hover {
    background: rgba(255, 107, 53, 0.2);
  }

  .quantity {
    min-width: 20px;
    text-align: center;
    color: #efefef;
    font-size: 12px;
    font-weight: 600;
  }

  .remove-btn {
    width: 100%;
    padding: 4px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
  }

  .cart-summary {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 0;
    margin-bottom: 16px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 4px;
  }

  .summary-row.total {
    font-size: 16px;
    color: #efefef;
    font-weight: 600;
  }

  .checkout-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkout-form h3 {
    font-size: 14px;
    font-weight: 600;
    color: #efefef;
    margin: 0 0 8px 0;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-group label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .form-group input {
    padding: 8px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: #efefef;
    font-size: 12px;
  }

  .form-group input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .form-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 8px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 4px;
    color: #fca5a5;
    font-size: 12px;
    text-align: center;
  }

  .checkout-btn {
    padding: 10px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 4px;
  }

  .checkout-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }

  .checkout-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cart-toggle {
    display: none;
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 16px;
    background: #ffffff;
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  

  @media (max-width: 1024px) {
    .store-wrapper {
      grid-template-columns: 1fr;
    }

    .cart-section {
      position: fixed;
      top: 0;
      right: -350px;
      bottom: 0;
      width: 350px;
      border-radius: 0;
      height: 100vh;
      z-index: 200;
      transition: right 0.3s ease;
      border-left: 1px solid rgba(255, 107, 53, 0.2);
      border-radius: 8px 0 0 8px;
    }

    .cart-section.open {
      right: 0;
    }

    .close-btn {
      display: block;
    }

    .cart-toggle {
      display: block;
    }
    .cart-icon-wrapper {
    position: relative;
    display: inline-block;
  }

  .notification-dot {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: #ff0000;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }
  }

  @media (max-width: 640px) {
    .store-container {
      padding: 24px 16px;
    }

    .store-wrapper.cart-visible::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 190;
    }

    .store-wrapper.cart-visible .store-container {
      display: none;
    }

    .store-header h1 {
      font-size: 28px;
    }

    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .cart-section {
      width: 100vw;
      right: -100vw;
      max-width: 100vw;
    }

    .cart-section.open {
      right: 0;
    }

    .store-container {
      overflow: hidden;
      transition: opacity 0.3s ease;
    }

    .cart-toggle {
      top: 16px;
      bottom: auto;
      right: 16px;
      padding: 10px 12px;
      font-size: 13px;
    }

    .product-modal {
      max-width: 90vw;
      max-height: 85vh;
    }

    .modal-content {
      grid-template-columns: 1fr;
      gap: 16px;
      padding: 20px;
    }

    .modal-close {
      width: 40px;
      height: 40px;
      font-size: 24px;
      z-index: 1000;
    }
  }

  /* Product Modal Styles */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    padding: 20px;
  }

  .product-modal {
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95));
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    color: #efefef;
    font-size: 20px;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s;
  }

  .modal-close:hover {
    background: rgba(255, 107, 53, 0.2);
    transform: rotate(90deg);
  }

  .modal-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    padding: 32px;
  }

  .modal-image {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  .modal-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .modal-info h2 {
    font-size: 24px;
    font-weight: 700;
    color: #efefef;
    margin: 0 0 16px 0;
  }

  .modal-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .modal-price {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 107, 53, 0.2);
  }

  .price-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .price-value {
    font-size: 28px;
    font-weight: 700;
    color: #ff6b35;
  }

  .modal-add-btn {
    padding: 14px 24px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }

  .modal-add-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
  }

  .modal-add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .modal-content {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 24px;
    }

    .modal-info h2 {
      font-size: 20px;
    }

    .price-value {
      font-size: 24px;
    }
  }
</style>
