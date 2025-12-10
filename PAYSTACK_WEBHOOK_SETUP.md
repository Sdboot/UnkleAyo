# Paystack Webhook Configuration Guide

## Setup Instructions

### 1. Get Your Paystack Secret Key
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → Developer → API Keys & Webhooks**
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Add it to your `.env` file:
   ```dotenv
   PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   ```

### 2. Deploy Your Website
- Push your code to production (Vercel, etc.)
- Ensure your webhook endpoint is accessible at:
  ```
  https://yourdomain.com/api/webhook-paystack
  ```

### 3. Configure Webhook in Paystack Dashboard
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → Developer → API Keys & Webhooks**
3. Under **Webhooks**, click **Add Webhook** or edit existing
4. Enter your webhook URL:
   ```
   https://yourdomain.com/api/webhook-paystack
   ```
5. Select events to listen to:
   - ✅ `charge.success` - When payment is successful
   - ✅ `charge.failed` - When payment fails
   - ✅ `transfer.success` - When transfer completes
6. Click **Save**

### 4. Test Webhook (Optional)
1. In Paystack Dashboard, go to Webhooks section
2. Find your webhook and click **Test**
3. Check your server logs to verify it's received

## How It Works

1. **Customer makes payment** → Paystack processes it
2. **Paystack sends webhook** → Your endpoint receives event
3. **Webhook verifies signature** → Ensures it's from Paystack
4. **Server processes event** → Logs success/failure
5. **Confirmation emails sent** → Via verify-payment & verify-store-payment endpoints

## Environment Variables Required

```dotenv
# Paystack
PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
VITE_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE

# Admin notifications
ADMIN_EMAIL=your_email@example.com
```

## Testing Locally (with ngrok)

If you want to test webhooks locally:

1. Start your local server:
   ```bash
   npm run dev
   ```

2. Expose with ngrok:
   ```bash
   ngrok http 3001
   ```

3. Use the ngrok URL for webhook testing:
   ```
   https://YOUR_NGROK_URL.ngrok.io/api/webhook-paystack
   ```

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `charge.success` | Log success, process order |
| `charge.failed` | Log failure, notify user |
| `transfer.success` | Log transfer completion |

## Troubleshooting

**Webhook not received?**
- Verify URL is publicly accessible
- Check that PAYSTACK_SECRET_KEY is set in environment
- Test with Paystack's webhook tester in dashboard

**Signature validation failing?**
- Ensure PAYSTACK_SECRET_KEY matches your Paystack account
- Verify webhook body is passed as raw JSON
