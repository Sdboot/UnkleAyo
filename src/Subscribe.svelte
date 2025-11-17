<script>
  let email = ''
  let subscribeMessage = ''
  let isLoading = false

  async function handleSubscribe(e) {
    e.preventDefault()
    isLoading = true

    try {
      // Simulate a subscription request (replace with real API if needed)
      await new Promise(resolve => setTimeout(resolve, 1000))
      subscribeMessage = `Thanks! Check your email (${email}) for confirmation.`
      email = ''
      setTimeout(() => {
        subscribeMessage = ''
      }, 4000)
    } catch (error) {
      subscribeMessage = 'Something went wrong. Please try again.'
    } finally {
      isLoading = false
    }
  }
</script>

<section class="subscribe-container">
  <div class="subscribe-inner">
    <h1>Subscribe</h1>
    <p class="subtitle">Get the podcast in your inbox.</p>

    <form on:submit={handleSubscribe} class="subscribe-form">
      <input
        type="email"
        placeholder="your@email.com"
        bind:value={email}
        required
        disabled={isLoading}
        class="email-input"
      />
      <button type="submit" disabled={isLoading} class="subscribe-btn">
        {isLoading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>

    {#if subscribeMessage}
      <p class="message">{subscribeMessage}</p>
    {/if}
  </div>
</section>

<style>
  .subscribe-container {
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    margin-top: 64px;
  }

  .subscribe-inner {
    max-width: 500px;
    width: 100%;
    text-align: center;
  }

  h1 {
    font-size: 48px;
    margin: 0 0 16px 0;
    font-weight: 700;
  }

  .subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 32px 0;
  }

  .subscribe-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .email-input {
    padding: 12px 16px;
    font-size: 14px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    color: #efefef;
    font-family: inherit;
    transition: all 0.2s;
  }

  .email-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .email-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.08);
  }

  .email-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .subscribe-btn {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: #efefef;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  .subscribe-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .subscribe-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .message {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin: 16px 0 0 0;
  }

  @media (max-width: 640px) {
    .subscribe-container {
      padding: 24px 16px;
    }

    h1 {
      font-size: 36px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
</style>
