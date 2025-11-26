<script>
  import { onMount } from 'svelte'
  import { currencies, currencyPrices, bankDetails } from './currencyConfig'

  let step = 1
  let name = ''
  let email = ''
  let phone = ''
  let selectedDate = ''
  let selectedTime = ''
  let selectedCurrency = 'USD'
  let isLoading = false
  let successMessage = ''
  let errorMessage = ''
  let copiedField = null
  let apiUrl = ''

  const todayDate = new Date().toISOString().split('T')[0]

  onMount(async () => {
    window.scrollTo(0, 0)
    
    // Check if there's a public URL set via environment variable
    const publicUrl = import.meta.env.VITE_PUBLIC_URL
    
    if (publicUrl && publicUrl.trim() !== '') {
      // Use the public URL (e.g., from ngrok or production deployment)
      apiUrl = publicUrl
      console.log('✅ Using public URL from VITE_PUBLIC_URL:', apiUrl)
    } else {
      // Auto-detect based on current device
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = 3001
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        apiUrl = `${protocol}//localhost:${port}`
      } else {
        // For other devices on same WiFi, use HTTP
        apiUrl = `http://${hostname}:${port}`
      }
      console.log('⚠️ Using auto-detected URL:', apiUrl)
    }
    
    console.log('Current hostname:', window.location.hostname)
    console.log('API URL set to:', apiUrl)
    
    // Test connection to backend
    try {
      const testResponse = await fetch(`${apiUrl}/api/test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      })
      if (testResponse.ok) {
        console.log('✅ Backend connection successful')
      } else {
        console.warn('⚠️ Backend responded with status:', testResponse.status)
      }
    } catch (err) {
      console.error('❌ Backend connection failed:', err.message)
      console.error('Trying to connect to:', apiUrl)
    }
  })

  function copyToClipboard(text, fieldName) {
    navigator.clipboard.writeText(text).then(() => {
      copiedField = fieldName
      setTimeout(() => {
        copiedField = null
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
    })
  }

  function validateStep1() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      errorMessage = 'Please fill in all contact information'
      return false
    }

    if (!selectedDate || !selectedTime) {
      errorMessage = 'Please select a date and time'
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errorMessage = 'Please enter a valid email'
      return false
    }

    // Validate time is 6pm-9pm (18:00-20:59)
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

  function handleSubmit() {
    errorMessage = ''
    successMessage = ''
    isLoading = true

    const amount = currencyPrices[selectedCurrency]

    const meetingData = {
      name,
      email,
      phone,
      date: selectedDate,
      time: selectedTime,
      currency: selectedCurrency,
      amount
    }

    // Send to backend API endpoint
    fetch(`${apiUrl}/api/schedule-meeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData),
      mode: 'cors',
      credentials: 'omit'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (data.success) {
          successMessage = 'Meeting scheduled successfully! Check your email for confirmation.'
          name = ''
          email = ''
          phone = ''
          selectedDate = ''
          selectedTime = ''
          selectedCurrency = 'USD'
          step = 1
          setTimeout(() => {
            successMessage = ''
          }, 5000)
        } else {
          errorMessage = data.message || 'Failed to schedule meeting'
        }
      })
      .catch(error => {
        console.error('❌ Error connecting to server:', error.message)
        console.error('API URL was:', apiUrl)
        let errorMsg = 'Error connecting to server'
        
        // Provide specific guidance based on the scenario
        if (!apiUrl.includes('ngrok') && !apiUrl.includes('localhost')) {
          // User is not on localhost and no ngrok URL is configured
          errorMsg += '. For local network access, ensure devices are on the same WiFi. For remote access, use ngrok (see Setup Guide).'
        } else if (!apiUrl.includes('ngrok')) {
          errorMsg += '. Make sure backend is running and devices are on the same WiFi network.'
        } else {
          errorMsg += '. Check your ngrok tunnel is still active.'
        }
        
        errorMessage = errorMsg
      })
      .finally(() => {
        isLoading = false
      })
  }

  $: currentBankDetails = bankDetails[selectedCurrency]
  $: amount = currencyPrices[selectedCurrency]
  $: currentCurrency = currencies.find(c => c.code === selectedCurrency)
</script>

<div class="schedule-container">
  <section class="schedule-section">
    <h1 class="schedule-title">Schedule a Meeting with UnkleAyo</h1>
    
    <!-- Step Indicator -->
    <div class="step-indicator">
      <div class="step" class:active={step === 1}>
        <span class="step-number" class:completed={step > 1}>1</span>
        <span class="step-label">Schedule</span>
      </div>
      <div class="step-line" class:active={step > 1}></div>
      <div class="step" class:active={step === 2}>
        <span class="step-number">2</span>
        <span class="step-label">Payment</span>
      </div>
    </div>

    <div class="schedule-form-wrapper">
      <!-- STEP 1: Schedule Information -->
      {#if step === 1}
        <form on:submit|preventDefault={goToPayment} class="schedule-form">
          <h2 class="step-title">Select Your Meeting Time</h2>
          
          <!-- Calendar and Time Selection -->
          <div class="datetime-section">
            <div class="form-group">
              <label for="date">Select Date:</label>
              <input
                type="date"
                id="date"
                bind:value={selectedDate}
                min={todayDate}
                required
              />
            </div>

            <div class="form-group">
              <label for="time">Select Time (6 PM - 9 PM):</label>
              <input
                type="time"
                id="time"
                bind:value={selectedTime}
                min="18:00"
                max="20:59"
                required
              />
              <small class="time-note">Available times: 6:00 PM to 8:59 PM</small>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="contact-section">
            <h3 class="section-subtitle">Contact Information</h3>
            
            <div class="form-group">
              <label for="name">Full Name:</label>
              <input
                type="text"
                id="name"
                bind:value={name}
                placeholder="Your full name"
                required
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
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                bind:value={phone}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
          </div>

          <!-- Messages -->
          {#if successMessage}
            <div class="success-message">{successMessage}</div>
          {/if}

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <!-- Navigation Buttons -->
          <button type="submit" class="submit-btn next-btn">
            Continue to Payment
          </button>
        </form>
      {/if}

      <!-- STEP 2: Payment Information -->
      {#if step === 2}
        <form on:submit|preventDefault={handleSubmit} class="schedule-form">
          <h2 class="step-title">Complete Your Payment</h2>

          <!-- Meeting Summary -->
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
              <span class="label">Phone:</span>
              <span class="value">{phone}</span>
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

          <!-- Currency Selection -->
          <div class="currency-section">
            <h3 class="section-subtitle">Select Payment Currency</h3>
            <div class="currency-grid">
              {#each currencies as curr}
                <label class="currency-option">
                  <input
                    type="radio"
                    bind:group={selectedCurrency}
                    value={curr.code}
                  />
                  <div class="currency-card" class:selected={selectedCurrency === curr.code}>
                    <span class="currency-code">{curr.code}</span>
                    <span class="currency-symbol">{curr.symbol}</span>
                    <span class="currency-amount">{currencyPrices[curr.code]}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Bank Details -->
          {#if currentBankDetails}
            <div class="bank-details">
              <h3 class="section-subtitle">Bank Transfer Details</h3>
              <div class="bank-info">
                <div class="info-row">
                  <div class="info-content">
                    <span class="info-label">Account Name:</span>
                    <span class="info-value">{currentBankDetails.accountName}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-content">
                    <span class="info-label">Account Number:</span>
                    <span class="info-value">{currentBankDetails.accountNumber}</span>
                  </div>
                  <button 
                    type="button"
                    class="copy-btn"
                    class:copied={copiedField === 'accountNumber'}
                    on:click={() => copyToClipboard(currentBankDetails.accountNumber, 'accountNumber')}
                    title="Copy account number"
                  >
                    {copiedField === 'accountNumber' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div class="info-row">
                  <div class="info-content">
                    <span class="info-label">Bank Name:</span>
                    <span class="info-value">{currentBankDetails.bankName}</span>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-content">
                    <span class="info-label">SWIFT Code:</span>
                    <span class="info-value">{currentBankDetails.swiftCode}</span>
                  </div>
                </div>
                <div class="info-row amount-row">
                  <div class="info-content">
                    <span class="info-label">Amount to Pay:</span>
                    <span class="info-value amount-value">
                      {currentCurrency.symbol}{amount}
                    </span>
                  </div>
                  <button 
                    type="button"
                    class="copy-btn"
                    class:copied={copiedField === 'amount'}
                    on:click={() => copyToClipboard(`${currentCurrency.symbol}${amount}`, 'amount')}
                    title="Copy amount"
                  >
                    {copiedField === 'amount' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div class="info-row">
                  <div class="info-content">
                    <span class="info-label">Payment Reference:</span>
                    <span class="info-value">{name.toUpperCase()} - {selectedDate}</span>
                  </div>
                </div>
              </div>
              <p class="bank-note">
                Please use the payment reference above when transferring. We will confirm your payment and send the meeting link once received.
              </p>
            </div>
          {/if}

          <!-- Messages -->
          {#if successMessage}
            <div class="success-message">{successMessage}</div>
          {/if}

          {#if errorMessage}
            <div class="error-message">{errorMessage}</div>
          {/if}

          <!-- Navigation Buttons -->
          <div class="button-group">
            <button 
              type="button" 
              class="submit-btn back-btn"
              on:click={backToSchedule}
              disabled={isLoading}
            >
              Back
            </button>
            <button 
              type="submit" 
              class="submit-btn confirm-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm & Schedule'}
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
    font-weight: 500;
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
    font-family: inherit;
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .time-note {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  /* Meeting Summary */
  .meeting-summary {
    background: rgba(255, 107, 53, 0.05);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .summary-item .label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .summary-item .value {
    font-size: 13px;
    color: #efefef;
    font-weight: 600;
  }

  /* Currency Selection */
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

  .currency-option {
    cursor: pointer;
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
    transition: all 0.3s;
    text-align: center;
  }

  .currency-card:hover {
    border-color: rgba(255, 107, 53, 0.3);
    background: rgba(255, 107, 53, 0.05);
  }

  .currency-card.selected {
    background: rgba(255, 107, 53, 0.1);
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  .currency-code {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .currency-symbol {
    font-size: 16px;
    color: #efefef;
  }

  .currency-amount {
    font-size: 13px;
    font-weight: 600;
    color: #ff6b35;
  }

  /* Bank Details */
  .bank-details {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .bank-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  .info-row.amount-row {
    background: rgba(255, 107, 53, 0.1);
    border: 1px solid rgba(255, 107, 53, 0.2);
  }

  .info-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .info-value {
    font-size: 13px;
    color: #efefef;
    font-weight: 600;
    text-align: right;
  }

  .amount-value {
    color: #ff6b35;
    font-size: 16px;
  }

  .bank-note {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.5;
    margin-top: 8px;
  }

  /* Info Content */
  .info-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  /* Copy Button */
  .copy-btn {
    padding: 6px 12px;
    background: rgba(255, 107, 53, 0.2);
    border: 1px solid rgba(255, 107, 53, 0.4);
    border-radius: 4px;
    color: #ff6b35;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    margin-left: 12px;
  }

  .copy-btn:hover {
    background: rgba(255, 107, 53, 0.3);
    border-color: rgba(255, 107, 53, 0.6);
  }

  .copy-btn.copied {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.4);
    color: #86efac;
  }

  /* Messages */
  .success-message {
    padding: 16px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 6px;
    color: #86efac;
    font-size: 14px;
    text-align: center;
  }

  .error-message {
    padding: 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #fca5a5;
    font-size: 14px;
    text-align: center;
  }

  /* Buttons */
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

  .back-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  .next-btn,
  .confirm-btn {
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

    .step-indicator {
      gap: 12px;
    }

    .step-line {
      width: 20px;
    }

    .schedule-form {
      gap: 24px;
    }

    .datetime-section,
    .contact-section {
      gap: 16px;
    }

    .currency-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }

    .button-group {
      flex-direction: column-reverse;
    }

    .button-group button {
      width: 100%;
    }
  }
</style>
