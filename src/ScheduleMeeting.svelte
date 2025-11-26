<script>
  import { onMount } from 'svelte'
  import { loadStripe } from '@stripe/stripe-js'
  import { currencies, currencyPrices, bankDetails } from './currencyConfig'

  let step = 1
  let name = ''
  let email = ''
  let phone = ''
  let selectedDate = ''
  let selectedTime = ''
  let selectedCurrency = 'USD'
  let paymentMethod = 'card'
  let isLoading = false
  let successMessage = ''
  let errorMessage = ''
  let apiUrl = ''
  let stripe = null
  let elements = null
  let cardElement = null
  let clientSecret = ''

  const todayDate = new Date().toISOString().split('T')[0]

  onMount(async () => {
    window.scrollTo(0, 0)
    
    // Initialize Stripe
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (stripePublishableKey) {
      stripe = await loadStripe(stripePublishableKey)
    }
    
    // Set API URL
    const publicUrl = import.meta.env.VITE_PUBLIC_URL
    if (publicUrl && publicUrl.trim() !== '') {
      apiUrl = publicUrl
      console.log('✅ Using ngrok URL:', apiUrl)
    } else {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = 3001
      apiUrl = hostname === 'localhost' || hostname === '127.0.0.1' 
        ? `${protocol}//localhost:${port}`
        : `http://${hostname}:${port}`
    }
    
    console.log('API URL:', apiUrl)
  })

  function validateStep1() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      errorMessage = 'Please fill in all contact information'
      return false
    }

    if (!selectedDate || !selectedTime) {
      errorMessage = 'Please select a date and time'
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errorMessage = 'Please enter a valid email'
      return false
    }

    const [hours] = selectedTime.split(':')
    const hour = parseInt(hours)
    if (hour < 18 || hour >= 21) {
      errorMessage = 'Meetings are only available from 6:00 PM to 8:59 PM'
      return false
    }

    errorMessage = ''
    return true
  }

  function goToPayment() {
    if (validateStep1()) {
      step = 2
      window.scrollTo(0, 0)
      // Mount card element after DOM is ready - only for card payments
      setTimeout(() => {
        if (paymentMethod === 'card' && stripe && !cardElement) {
          elements = stripe.elements()
          cardElement = elements.create('card')
          cardElement.mount('#card-element')
        }
      }, 100)
    }
  }

  function backToSchedule() {
    step = 1
    errorMessage = ''
    window.scrollTo(0, 0)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (paymentMethod === 'card' && (!stripe || !cardElement)) {
      errorMessage = 'Payment system not initialized'
      return
    }

    errorMessage = ''
    successMessage = ''
    isLoading = true

    try {
      const amount = currencyPrices[selectedCurrency]

      if (paymentMethod === 'card') {
        // Card payment flow
        // Create payment intent
        const paymentResponse = await fetch(`${apiUrl}/api/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            date: selectedDate,
            time: selectedTime,
            currency: selectedCurrency,
            amount
          })
        })

        const paymentData = await paymentResponse.json()

        if (!paymentData.success) {
          throw new Error(paymentData.message || 'Failed to create payment')
        }

        clientSecret = paymentData.clientSecret

        // Confirm payment with card
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name, email, phone }
          }
        })

        if (error) {
          errorMessage = error.message
          throw error
        }

        if (paymentIntent.status === 'succeeded') {
          const confirmResponse = await fetch(`${apiUrl}/api/confirm-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              name, email, phone,
              date: selectedDate,
              time: selectedTime
            })
          })

          const confirmData = await confirmResponse.json()

          if (confirmData.success) {
            successMessage = 'Meeting scheduled successfully! Check your email.'
            name = email = phone = selectedDate = selectedTime = ''
            selectedCurrency = 'USD'
            paymentMethod = 'card'
            step = 1
            setTimeout(() => { successMessage = '' }, 5000)
          } else {
            errorMessage = confirmData.message || 'Failed to confirm meeting'
          }
        }
      } else {
        // Bank transfer payment flow - just log the details, no actual charge
        const confirmResponse = await fetch(`${apiUrl}/api/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            paymentIntentId: `bank_transfer_${Date.now()}`,
            paymentMethod: 'bank_transfer',
            name, email, phone,
            date: selectedDate,
            time: selectedTime,
            currency: selectedCurrency,
            amount
          })
        })

        const confirmData = await confirmResponse.json()

        if (confirmData.success) {
          successMessage = 'Meeting scheduled! Bank transfer details have been sent to your email. Please complete the transfer to confirm your meeting.'
          name = email = phone = selectedDate = selectedTime = ''
          selectedCurrency = 'USD'
          paymentMethod = 'card'
          step = 1
          setTimeout(() => { successMessage = '' }, 7000)
        } else {
          errorMessage = confirmData.message || 'Failed to schedule meeting'
        }
      }
    } catch (error) {
      console.error('Error:', error)
      errorMessage = error.message || 'Payment failed'
    } finally {
      isLoading = false
    }
  }

  $: amount = currencyPrices[selectedCurrency]
  $: currentCurrency = currencies.find(c => c.code === selectedCurrency)
  $: accountDetails = bankDetails[selectedCurrency]
</script>

<div class="schedule-container">
  <section class="schedule-section">
    <h1 class="schedule-title">Schedule a Meeting</h1>
    
    <div class="step-indicator">
      <div class="step" class:active={step === 1}>
        <span class="step-number" class:completed={step > 1}>1</span>
        <span class="step-label">Details</span>
      </div>
      <div class="step-line" class:active={step > 1}></div>
      <div class="step" class:active={step === 2}>
        <span class="step-number">2</span>
        <span class="step-label">Payment</span>
      </div>
    </div>

    <div class="schedule-form-wrapper">
      {#if step === 1}
        <form on:submit|preventDefault={goToPayment} class="schedule-form">
          <h2 class="step-title">Select Your Meeting Time</h2>
          
          <div class="datetime-section">
            <div class="form-group">
              <label for="date">Date:</label>
              <input type="date" id="date" bind:value={selectedDate} min={todayDate} required />
            </div>
            <div class="form-group">
              <label for="time">Time (6 PM - 9 PM):</label>
              <input type="time" id="time" bind:value={selectedTime} min="18:00" max="20:59" required />
              <small class="time-note">Available: 6:00 PM - 8:59 PM</small>
            </div>
          </div>

          <div class="contact-section">
            <h3 class="section-subtitle">Contact Information</h3>
            
            <div class="form-group">
              <label for="name">Full Name:</label>
              <input type="text" id="name" bind:value={name} placeholder="Your name" required />
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" bind:value={email} placeholder="your@email.com" required />
            </div>
            <div class="form-group">
              <label for="phone">Phone:</label>
              <input type="tel" id="phone" bind:value={phone} placeholder="+1 (555) 000-0000" required />
            </div>
          </div>

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <button type="submit" class="submit-btn next-btn">Continue to Payment</button>
        </form>
      {/if}

      {#if step === 2}
        <form on:submit={handleSubmit} class="schedule-form">
          <h2 class="step-title">Complete Payment</h2>

          <div class="meeting-summary">
            <h3 class="section-subtitle">Meeting Details</h3>
            <div class="summary-item">
              <span class="label">Name:</span>
              <span class="value">{name}</span>
            </div>
            <div class="summary-item">
              <span class="label">Email:</span>
              <span class="value">{email}</span>
            </div>
            <div class="summary-item">
              <span class="label">Date:</span>
              <span class="value">{selectedDate}</span>
            </div>
            <div class="summary-item">
              <span class="label">Time:</span>
              <span class="value">{selectedTime}</span>
            </div>
          </div>

          <div class="currency-section">
            <h3 class="section-subtitle">Currency</h3>
            <div class="currency-grid">
              {#each currencies as curr}
                <label class="currency-option">
                  <input type="radio" bind:group={selectedCurrency} value={curr.code} />
                  <div class="currency-card" class:selected={selectedCurrency === curr.code}>
                    <span class="currency-code">{curr.code}</span>
                    <span class="currency-symbol">{curr.symbol}</span>
                    <span class="currency-amount">{currencyPrices[curr.code]}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <div class="payment-amount">
            <h3 class="section-subtitle">Amount</h3>
            <div class="amount-display">
              <span class="amount-value">{currentCurrency?.symbol}{amount}</span>
              <span class="amount-currency">{selectedCurrency}</span>
            </div>
          </div>

          <div class="payment-method-section">
            <h3 class="section-subtitle">Payment Method</h3>
            <div class="payment-method-grid">
              <label class="payment-method-option">
                <input type="radio" bind:group={paymentMethod} value="card" />
                <div class="payment-method-card" class:selected={paymentMethod === 'card'}>
                  <div class="method-icon">💳</div>
                  <span class="method-name">Card Payment</span>
                  <span class="method-desc">Debit or Credit Card</span>
                </div>
              </label>
              <label class="payment-method-option">
                <input type="radio" bind:group={paymentMethod} value="transfer" />
                <div class="payment-method-card" class:selected={paymentMethod === 'transfer'}>
                  <div class="method-icon">🏦</div>
                  <span class="method-name">Bank Transfer</span>
                  <span class="method-desc">Direct Transfer</span>
                </div>
              </label>
            </div>
          </div>

          {#if paymentMethod === 'card'}
            <div class="card-section">
              <h3 class="section-subtitle">Card Details</h3>
              <div id="card-element" class="card-input"></div>
            </div>
          {:else}
            <div class="bank-details-section">
              <h3 class="section-subtitle">Bank Transfer Details</h3>
              <div class="bank-details-card">
                <div class="bank-detail-row">
                  <span class="detail-label">Bank Name:</span>
                  <span class="detail-value">{accountDetails.bankName}</span>
                </div>
                <div class="bank-detail-row">
                  <span class="detail-label">Account Name:</span>
                  <span class="detail-value">{accountDetails.accountName}</span>
                </div>
                <div class="bank-detail-row">
                  <span class="detail-label">Account Number:</span>
                  <span class="detail-value copy-value" title="Click to copy">{accountDetails.accountNumber}</span>
                </div>
                {#if accountDetails.iban}
                  <div class="bank-detail-row">
                    <span class="detail-label">IBAN:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.iban}</span>
                  </div>
                {/if}
                {#if accountDetails.sortCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Sort Code:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.sortCode}</span>
                  </div>
                {/if}
                {#if accountDetails.routingNumber}
                  <div class="bank-detail-row">
                    <span class="detail-label">Routing Number:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.routingNumber}</span>
                  </div>
                {/if}
                {#if accountDetails.swiftCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">SWIFT Code:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.swiftCode}</span>
                  </div>
                {/if}
                {#if accountDetails.bsb}
                  <div class="bank-detail-row">
                    <span class="detail-label">BSB:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.bsb}</span>
                  </div>
                {/if}
                {#if accountDetails.ifscCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">IFSC Code:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.ifscCode}</span>
                  </div>
                {/if}
                {#if accountDetails.branchCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Branch Code:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.branchCode}</span>
                  </div>
                {/if}
                {#if accountDetails.bankCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Bank Code:</span>
                    <span class="detail-value copy-value" title="Click to copy">{accountDetails.bankCode}</span>
                  </div>
                {/if}
              </div>
              <div class="bank-notice">
                <p>Please complete your bank transfer and include your name as reference. Your meeting will be confirmed once payment is received.</p>
              </div>
            </div>
          {/if}

          {#if successMessage}
            <div class="success-message">{successMessage}</div>
          {/if}

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <div class="button-group">
            <button type="button" class="submit-btn back-btn" on:click={backToSchedule} disabled={isLoading}>Back</button>
            <button type="submit" class="submit-btn confirm-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : `${paymentMethod === 'card' ? 'Pay' : 'Proceed with Transfer'} ${currentCurrency?.symbol}${amount}`}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </section>
</div>

<style>
  .schedule-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
    min-height: calc(100vh - 64px);
  }

  .schedule-section {
    padding: 40px 24px;
  }

  .schedule-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 40px;
    color: #efefef;
    text-align: center;
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 40px;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    opacity: 0.5;
    transition: opacity 0.3s;
  }

  .step.active {
    opacity: 1;
  }

  .step-number {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.3);
    font-weight: 600;
    color: #efefef;
    transition: all 0.3s;
  }

  .step-number.completed {
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border-color: #ff6b35;
    color: #000;
  }

  .step.active .step-number {
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border-color: #ff6b35;
    color: #000;
    box-shadow: 0 0 0 8px rgba(255, 107, 53, 0.1);
  }

  .step-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .step-line {
    width: 40px;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
  }

  .step-line.active {
    background: linear-gradient(90deg, #ff6b35, #f7931e);
  }

  .schedule-form-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }

  .schedule-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .step-title {
    font-size: 24px;
    font-weight: 600;
    color: #efefef;
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
  }

  .datetime-section,
  .contact-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .form-group input {
    padding: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #efefef;
    font-size: 14px;
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .time-note {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .meeting-summary {
    background: rgba(255, 107, 53, 0.05);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .summary-item .label {
    color: rgba(255, 255, 255, 0.6);
  }

  .summary-item .value {
    color: #efefef;
    font-weight: 600;
  }

  .currency-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .currency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }

  .currency-option input {
    display: none;
  }

  .currency-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
  }

  .currency-card:hover {
    border-color: rgba(255, 107, 53, 0.3);
  }

  .currency-card.selected {
    background: rgba(255, 107, 53, 0.1);
    border-color: #ff6b35;
  }

  .currency-code {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .currency-amount {
    font-size: 13px;
    font-weight: 600;
    color: #ff6b35;
  }

  .payment-amount {
    background: rgba(255, 107, 53, 0.1);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 8px;
    padding: 20px;
  }

  .amount-display {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .amount-value {
    font-size: 32px;
    font-weight: 700;
    color: #ff6b35;
  }

  .amount-currency {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
  }

  .payment-method-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .payment-method-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .payment-method-option input {
    display: none;
  }

  .payment-method-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
  }

  .payment-method-card:hover {
    border-color: rgba(255, 107, 53, 0.3);
  }

  .payment-method-card.selected {
    background: rgba(255, 107, 53, 0.1);
    border-color: #ff6b35;
  }

  .method-icon {
    font-size: 28px;
    margin-bottom: 4px;
  }

  .method-name {
    font-size: 14px;
    font-weight: 600;
    color: #efefef;
  }

  .method-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .card-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-input {
    padding: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #efefef;
  }

  .bank-details-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .bank-details-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .bank-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .bank-detail-row:last-child {
    border-bottom: none;
  }

  .detail-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-value {
    font-size: 13px;
    color: #efefef;
    font-family: 'Courier New', monospace;
    font-weight: 500;
  }

  .copy-value {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .copy-value:hover {
    background: rgba(255, 107, 53, 0.2);
    color: #ff6b35;
  }

  .bank-notice {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.2);
    border-radius: 6px;
    padding: 12px;
  }

  .bank-notice p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.5;
  }

  .success-message {
    padding: 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 6px;
    color: #86efac;
    text-align: center;
  }

  .error-message {
    padding: 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #fca5a5;
    text-align: center;
  }

  .submit-btn {
    padding: 12px 24px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 16px;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #efefef;
    flex: 1;
    margin-top: 0;
  }

  .next-btn, .confirm-btn {
    flex: 1;
    margin-top: 0;
  }

  @media (max-width: 640px) {
    .schedule-container {
      padding: 16px;
    }

    .schedule-section {
      padding: 24px 16px;
    }

    .schedule-title {
      font-size: 24px;
      margin-bottom: 32px;
    }

    .currency-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }

    .payment-method-grid {
      grid-template-columns: 1fr;
    }

    .bank-detail-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .button-group {
      flex-direction: column-reverse;
    }

    .button-group button {
      width: 100%;
    }
  }
</style>
