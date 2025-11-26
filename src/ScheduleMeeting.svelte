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
  let paymentMethod = 'transfer'
  let isLoading = false
  let successMessage = ''
  let errorMessage = ''
  let apiUrl = ''
  let stripe = null
  let elements = null
  let cardElement = null
  let clientSecret = ''
  let copiedText = ''

  const todayDate = new Date().toISOString().split('T')[0]

  onMount(async () => {
    window.scrollTo(0, 0)
    
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
        ? `${protocol}//${hostname}:${port}`
        : `${protocol}//${hostname}:${port}`
    }
    
    console.log('API URL set to:', apiUrl)
    
    // Test API connectivity
    try {
      const testResponse = await fetch(`${apiUrl}/api/test`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      })
      if (testResponse.ok) {
        console.log('✅ API is reachable')
      }
    } catch (err) {
      console.error('⚠️ API test failed:', err.message)
    }
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
    }
  }

  function backToSchedule() {
    step = 1
    errorMessage = ''
    window.scrollTo(0, 0)
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      copiedText = text
      setTimeout(() => {
        copiedText = ''
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  async function confirmBankPayment() {
    if (!name || !email || !phone || !selectedDate || !selectedTime) {
      errorMessage = 'Please complete all meeting details'
      return
    }

    errorMessage = ''
    successMessage = ''
    isLoading = true

    try {
      const amount = currencyPrices[selectedCurrency]

      console.log('Confirming bank payment for:', { name, email, amount, selectedCurrency })
      
      if (!apiUrl) {
        throw new Error('API URL not initialized. Please refresh the page.')
      }

      console.log('Sending request to:', `${apiUrl}/api/confirm-payment`)

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

      console.log('Response status:', confirmResponse.status)

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text()
        console.error('API error response:', errorText)
        throw new Error(`API returned ${confirmResponse.status}: ${errorText}`)
      }

      const confirmData = await confirmResponse.json()
      console.log('API response:', confirmData)

      if (confirmData.success) {
        successMessage = '✅ Your meeting is being scheduled! Check your email for confirmation details.'
        setTimeout(() => {
          name = email = phone = selectedDate = selectedTime = ''
          selectedCurrency = 'USD'
          paymentMethod = 'transfer'
          step = 1
          successMessage = ''
        }, 3000)
      } else {
        errorMessage = confirmData.message || 'Failed to schedule meeting'
      }
    } catch (error) {
      console.error('Error confirming bank payment:', error)
      console.error('Error stack:', error.stack)
      errorMessage = `Error: ${error.message}`
    } finally {
      isLoading = false
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    errorMessage = ''
    successMessage = ''
    isLoading = true

    try {
      const amount = currencyPrices[selectedCurrency]

      if (!apiUrl) {
        throw new Error('API URL not initialized. Please refresh the page.')
      }

      // Bank transfer payment flow
      console.log('Processing bank transfer...')
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

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text()
        throw new Error(`Request failed: ${errorText}`)
      }

      const confirmData = await confirmResponse.json()

      if (confirmData.success) {
        successMessage = 'Meeting scheduled! Bank transfer details have been sent to your email. Please complete the transfer to confirm your meeting.'
        name = email = phone = selectedDate = selectedTime = ''
        selectedCurrency = 'USD'
        step = 1
        setTimeout(() => { successMessage = '' }, 7000)
      } else {
        errorMessage = confirmData.message || 'Failed to schedule meeting'
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      errorMessage = error.message || 'Scheduling failed. Please try again.'
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
                  <div class="copy-container">
                    <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.accountNumber)} title="Click to copy">{accountDetails.accountNumber}</span>
                    <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.accountNumber)} title="Copy account number">
                      {copiedText === accountDetails.accountNumber ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
                {#if accountDetails.iban}
                  <div class="bank-detail-row">
                    <span class="detail-label">IBAN:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.iban)} title="Click to copy">{accountDetails.iban}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.iban)} title="Copy IBAN">
                        {copiedText === accountDetails.iban ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.sortCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Sort Code:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.sortCode)} title="Click to copy">{accountDetails.sortCode}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.sortCode)} title="Copy sort code">
                        {copiedText === accountDetails.sortCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.routingNumber}
                  <div class="bank-detail-row">
                    <span class="detail-label">Routing Number:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.routingNumber)} title="Click to copy">{accountDetails.routingNumber}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.routingNumber)} title="Copy routing number">
                        {copiedText === accountDetails.routingNumber ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.swiftCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">SWIFT Code:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.swiftCode)} title="Click to copy">{accountDetails.swiftCode}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.swiftCode)} title="Copy SWIFT code">
                        {copiedText === accountDetails.swiftCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.bsb}
                  <div class="bank-detail-row">
                    <span class="detail-label">BSB:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.bsb)} title="Click to copy">{accountDetails.bsb}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.bsb)} title="Copy BSB">
                        {copiedText === accountDetails.bsb ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.ifscCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">IFSC Code:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.ifscCode)} title="Click to copy">{accountDetails.ifscCode}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.ifscCode)} title="Copy IFSC code">
                        {copiedText === accountDetails.ifscCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.branchCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Branch Code:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.branchCode)} title="Click to copy">{accountDetails.branchCode}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.branchCode)} title="Copy branch code">
                        {copiedText === accountDetails.branchCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
                {#if accountDetails.bankCode}
                  <div class="bank-detail-row">
                    <span class="detail-label">Bank Code:</span>
                    <div class="copy-container">
                      <span class="detail-value copy-value" on:click={() => copyToClipboard(accountDetails.bankCode)} title="Click to copy">{accountDetails.bankCode}</span>
                      <button type="button" class="copy-btn" on:click={() => copyToClipboard(accountDetails.bankCode)} title="Copy bank code">
                        {copiedText === accountDetails.bankCode ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
              <div class="bank-notice">
                <p>Please complete your bank transfer and include your name as reference. Your meeting will be confirmed once payment is received.</p>
              </div>
            </div>

          {#if successMessage}
            <div class="success-message">{successMessage}</div>
          {/if}

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <div class="button-group">
            <button type="button" class="submit-btn back-btn" on:click={backToSchedule} disabled={isLoading}>Back</button>
            <button type="submit" class="submit-btn confirm-btn" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Proceed with Bank Transfer'}
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

  .copy-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .copy-value {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
    flex: 1;
  }

  .copy-value:hover {
    background: rgba(255, 107, 53, 0.2);
    color: #ff6b35;
  }

  .copy-btn {
    padding: 4px 10px;
    background: rgba(255, 107, 53, 0.2);
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 4px;
    color: #ff6b35;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .copy-btn:hover {
    background: rgba(255, 107, 53, 0.3);
    border-color: #ff6b35;
  }

  .copy-btn:active {
    transform: scale(0.95);
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

    .bank-detail-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .copy-container {
      width: 100%;
      gap: 6px;
    }

    .copy-value {
      flex: 1;
    }

    .copy-btn {
      flex-shrink: 0;
      font-size: 11px;
      padding: 3px 8px;
    }

    .button-group {
      flex-direction: column-reverse;
    }

    .button-group button {
      width: 100%;
    }
  }
</style>
