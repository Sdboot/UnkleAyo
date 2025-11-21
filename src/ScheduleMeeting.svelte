<script>
  import { onMount } from 'svelte'

  let name = ''
  let email = ''
  let phone = ''
  let selectedDate = ''
  let selectedTime = ''
  let isLoading = false
  let successMessage = ''
  let errorMessage = ''

  const todayDate = new Date().toISOString().split('T')[0]

  onMount(() => {
    window.scrollTo(0, 0)
  })

  function handleSubmit() {
    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedDate || !selectedTime) {
      errorMessage = 'Please fill in all fields'
      setTimeout(() => {
        errorMessage = ''
      }, 3000)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errorMessage = 'Please enter a valid email'
      setTimeout(() => {
        errorMessage = ''
      }, 3000)
      return
    }

    isLoading = true

    // Prepare the email data
    const meetingData = {
      name,
      email,
      phone,
      date: selectedDate,
      time: selectedTime,
      message: `New meeting request from ${name}. Contact: ${email}, ${phone}. Requested date: ${selectedDate} at ${selectedTime}`
    }

    // Send to backend API endpoint (you'll need to set this up)
    fetch('/api/schedule-meeting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meetingData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          successMessage = 'Meeting request sent! We will contact you soon.'
          name = ''
          email = ''
          phone = ''
          selectedDate = ''
          selectedTime = ''
          setTimeout(() => {
            successMessage = ''
          }, 5000)
        } else {
          errorMessage = data.message || 'Failed to send meeting request'
          setTimeout(() => {
            errorMessage = ''
          }, 3000)
        }
      })
      .catch(error => {
        console.error('Error:', error)
        errorMessage = 'Error sending request. Please try again.'
        setTimeout(() => {
          errorMessage = ''
        }, 3000)
      })
      .finally(() => {
        isLoading = false
      })
  }
</script>

<div class="schedule-container">
  <section class="schedule-section">
    <h1 class="schedule-title">Schedule a Meeting with UnkleAyo</h1>
    
    <div class="schedule-form-wrapper">
      <form on:submit|preventDefault={handleSubmit} class="schedule-form">
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
            <label for="time">Select Time:</label>
            <input
              type="time"
              id="time"
              bind:value={selectedTime}
              required
            />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="contact-section">
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

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Schedule Meeting'}
        </button>
      </form>
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

  .schedule-form-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }

  .schedule-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
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

    .schedule-form {
      gap: 24px;
    }

    .datetime-section,
    .contact-section {
      gap: 16px;
    }
  }
</style>
