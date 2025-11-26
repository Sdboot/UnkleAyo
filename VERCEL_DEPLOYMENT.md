# Vercel Deployment Guide

## Quick Setup

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy
vercel
```

### 2. Set Environment Variables

Go to your Vercel project dashboard and add these environment variables:

| Variable | Value | Where to get |
|----------|-------|--------------|
| `RESEND_API_KEY` | Your Resend API key | https://resend.com/api-keys |
| `STRIPE_SECRET_KEY` | Your Stripe secret key | https://dashboard.stripe.com/apikeys |
| `ADMIN_EMAIL` | salakodeborah234@gmail.com | Already set in code |

**Steps to add variables:**
1. Go to https://vercel.com/dashboard
2. Select your project `unkle-ayo`
3. Go to Settings → Environment Variables
4. Add each variable above
5. Redeploy (or push to GitHub to trigger auto-deploy)

### 3. Verify Deployment

After deployment, test the API:
```
https://unkle-ayo.vercel.app/api/test
```

You should see:
```json
{
  "success": true,
  "message": "API is working correctly",
  "timestamp": "..."
}
```

## How It Works

- **Frontend**: Deployed at `https://unkle-ayo.vercel.app`
- **Backend APIs**: Deployed at `https://unkle-ayo.vercel.app/api/*`
  - `/api/test` - Health check
  - `/api/confirm-payment` - Schedule meeting & send emails
  - `/api/create-payment-intent` - Create Stripe payment (currently unused)
  - `/api/webhook-stripe` - Stripe webhooks

All API calls are now handled by Vercel serverless functions!

## Local Development

Still works the same way:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Troubleshooting

### "Failed to fetch" error
- Check that environment variables are set in Vercel
- Restart deployment after adding variables
- Check Vercel function logs for errors

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard to see if emails are in spam

### Old Vercel deployment issues
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
