<script>
  import { onMount } from 'svelte'

  let step = 1
  let name = ''
  let email = ''
  let phone = ''
  let selectedDate = ''
  let selectedTime = ''
  let isLoading = false
  let successMessage = ''
  let errorMessage = ''
  let apiUrl = ''

  const todayDate = new Date().toISOString().split('T')[0]
  const ngnPrice = 75000
  const paystackPublicKey = 'pk_test_e1aec9e9771dbc0a474a7eebaac972d5097b6d0f'

  onMount(async () => {
    window.scrollTo(0, 0)
    
    // Set API URL
    const publicUrl = import.meta.env.VITE_PUBLIC_URL
    if (publicUrl && publicUrl.trim() !== '') {
      apiUrl = publicUrl
      console.log('✅ Using public URL from VITE_PUBLIC_URL:', apiUrl)
    } else {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const protocol = window.location.protocol
        const port = 3001
        apiUrl = `${protocol}//${window.location.hostname}:${port}`
        console.log('✅ Local development mode, using:', apiUrl)
      } else {
        apiUrl = window.location.origin
        console.log('✅ Production mode (Vercel), using same origin:', apiUrl)
      }
    }
    
    console.log('Final API URL set to:', apiUrl)
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

  async function handlePaystackPayment(e) {
    e.preventDefault()

    errorMessage = ''
    successMessage = ''
    isLoading = true

    try {
      if (!window.PaystackPop) {
        throw new Error('Paystack is not loaded. Please refresh the page.')
      }

      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const paystackHandler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: email,
        amount: ngnPrice * 100, // Paystack uses kobo (cents)
        ref: `meeting_${Date.now()}`,
        currency: 'NGN',
        onClose: function() {
          errorMessage = 'Payment window closed'
          isLoading = false
        },
        onSuccess: async function(response) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${apiUrl}/api/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                reference: response.reference,
                name, email, phone,
                date: selectedDate,
                time: selectedTime
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              successMessage = '✅ Payment successful! Meeting is being scheduled. Confirmation emails have been sent to you and the admin.'
              setTimeout(() => {
                name = email = phone = selectedDate = selectedTime = ''
                step = 1
                successMessage = ''
              }, 3000)
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
        <form on:submit={handlePaystackPayment} class="schedule-form">
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
            <div class="summary-item">
              <span class="label">Amount:</span>
              <span class="amount-value">₦{ngnPrice.toLocaleString()}</span>
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
              {isLoading ? 'Processing...' : 'Pay ₦' + ngnPrice.toLocaleString()}
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

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .payment-method {
    background: rgba(255, 107, 53, 0.08);
    border: 1px solid rgba(255, 107, 53, 0.2);
    border-radius: 8px;
    padding: 16px;
  }

  .method-title {
    font-size: 15px;
    font-weight: 600;
    color: #ff6b35;
    margin: 0 0 12px 0;
  }

  .method-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 13px;
    color: #efefef;
    font-weight: 500;
  }

  .value.monospace {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    word-break: break-all;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
  }

  .copy-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .copy-value {
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;
    flex: 1;
    min-width: 0;
    word-break: break-all;
    word-wrap: break-word;
    overflow-wrap: break-word;
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

  .amount-value {
    font-size: 18px;
    font-weight: 700;
    color: #ff6b35;
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

    .copy-group {
      flex-direction: column;
      align-items: stretch;
    }

    .copy-value {
      width: 100%;
      min-width: auto;
      word-break: break-all;
      word-wrap: break-word;
      overflow-wrap: break-word;
      padding: 8px;
    }

    .copy-btn {
      width: 100%;
    }

    .button-group {
      flex-direction: column-reverse;
    }

    .button-group button {
      width: 100%;
    }
  }
</style>
