# Stripe Payment Setup Guide

Your meeting scheduling system is now configured with Stripe payments + Resend emails!

## ✅ Setup Complete

- ✅ Stripe Secret Key: Configured
- ✅ Stripe Publishable Key: Configured  
- ✅ Resend Email API: Configured
- ✅ Backend Server: Running on port 3001
- ✅ Frontend: Running on port 5173

## 🧪 Testing Payment Flow

### Test Card Details
Use these Stripe test cards to process payments:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/26)
- CVC: Any 3 digits (e.g., 123)

**Payment Decline:**
- Card: `4000 0000 0000 0002`

**Other Test Cards:** https://stripe.com/docs/testing

### How to Test

1. **Open the app:**
   - Desktop: http://localhost:5173
   - Other devices: http://YOUR-COMPUTER-IP:5173

2. **Click "Schedule Meeting"**

3. **Step 1 - Schedule Details:**
   - Select a date (today or future)
   - Select time (6 PM - 8:59 PM)
   - Enter name, email, phone

4. **Step 2 - Payment:**
   - Select currency (USD, EUR, GBP, etc.)
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: 12/26 (or any future date)
   - CVC: 123
   - Click "Pay $XX.XX"

5. **Confirm:**
   - Success message appears
   - Check email for confirmation (user + admin)
   - Meeting is scheduled!

## 📧 Email Verification

**User receives:**
- Meeting confirmation with date/time
- Payment confirmation
- Notice about meeting link coming soon

**Admin receives:**
- New meeting notification
- Customer details
- Payment confirmation

## 🔧 Troubleshooting

### "Payment system not initialized"
- Make sure Stripe keys are in `.env`
- Reload the page
- Check browser console (F12) for errors

### Card element not appearing
- Wait 2-3 seconds after clicking "Continue to Payment"
- Refresh the page
- Check console for Stripe loading errors

### Payment fails with "card declined"
- Use test card: `4242 4242 4242 4242`
- Make sure expiry is in future
- Check Stripe dashboard for decline reason

### Emails not sending
- Verify RESEND_API_KEY in `.env`
- Check admin email is correct: `salakodeborah234@gmail.com`
- Look for Resend API errors in server logs

## 📊 Checking Payments in Stripe

1. Go to https://dashboard.stripe.com
2. Navigate to Payments
3. All test payments will appear there
4. View full transaction details

## 🚀 Going Live

When ready for production:

1. **Switch to Live Keys:**
   - Get from https://dashboard.stripe.com/apikeys
   - Replace test keys in `.env`

2. **Update ADMIN_EMAIL:**
   - Set to your real email address in `.env`

3. **Configure Stripe Webhook:**
   - Set webhook endpoint: `https://your-domain.com/api/webhook/stripe`
   - Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

4. **Deploy:**
   - Use production server instead of ngrok
   - Update URLs in all environments

## 📝 API Endpoints

**Create Payment Intent:**
```bash
POST /api/create-payment-intent
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date": "2025-12-01",
  "time": "18:30",
  "currency": "USD",
  "amount": 150
}
```

**Confirm Payment:**
```bash
POST /api/confirm-payment
{
  "paymentIntentId": "pi_xxxxx",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date": "2025-12-01",
  "time": "18:30"
}
```

**Webhook:**
```
POST /api/webhook/stripe
```

## ✨ Features

- ✅ Secure Stripe payment processing
- ✅ Multi-currency support
- ✅ Automatic email confirmations
- ✅ User-friendly interface
- ✅ Real-time validation
- ✅ Error handling
- ✅ Test & Live mode support

Your meeting scheduling system is ready for production! 🎉
