# How to Set Up Admin Email on Vercel

## Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Look for your project `unkle-ayo`
3. Click on it to open the project

### Step 2: Access Environment Variables
1. Click on **Settings** tab (at the top)
2. In the left sidebar, click on **Environment Variables**

### Step 3: Add the Admin Email Variable
1. Click the **Add** button (or **+ Add New**)
2. Fill in the following:
   - **Name:** `ADMIN_EMAIL`
   - **Value:** `salakodeborah234@gmail.com`
   - **Environments:** Select all three options:
     - ✓ Production
     - ✓ Preview
     - ✓ Development

3. Click **Save** or **Add Environment Variable**

### Step 4: Add Other Required Variables
While you're here, add these as well:

#### RESEND_API_KEY
- **Name:** `RESEND_API_KEY`
- **Value:** `re_trhHVqwz_4bPGFiX6mAHWVP1JhmAqu77d`
- **Environments:** All three

#### STRIPE_SECRET_KEY
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe secret key (from https://dashboard.stripe.com/apikeys)
- **Environments:** All three

### Step 5: Redeploy
After adding all variables, you need to redeploy:

**Option A: Auto-Deploy via GitHub**
1. Go to the **Deployments** tab
2. Click the three dots (...) next to the latest deployment
3. Select **Redeploy**

**Option B: Manual Deploy via CLI**
```bash
vercel --prod
```

**Option C: Push to GitHub (if connected)**
```bash
git push origin main
```

### Step 6: Verify Deployment
After redeployment:
1. Wait for the deployment to complete (you'll see a checkmark)
2. Visit your site: https://unkle-ayo.vercel.app
3. Try submitting the form
4. Check if emails are sent to both the user and admin

## Verification Checklist

✓ All three environment variables added (ADMIN_EMAIL, RESEND_API_KEY, STRIPE_SECRET_KEY)
✓ Each variable is set for Production, Preview, and Development environments
✓ Deployment redeployed (not just deployed previously)
✓ Vercel shows green checkmark for successful deployment
✓ Form submission works without "Failed to fetch" error
✓ Email received at `salakodeborah234@gmail.com`

## Troubleshooting

### "Failed to fetch" still appears
- Make sure you redeployed AFTER adding variables
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)

### Email not received
- Check RESEND_API_KEY is correct
- Log in to https://resend.com/emails to see if email is there (might be in spam)
- Check Vercel function logs for errors:
  1. Go to **Deployments** tab
  2. Click on the latest deployment
  3. Look for red errors in the logs

### Can't find Environment Variables section
- Make sure you clicked on **Settings** (not the main project settings)
- You should see: Overview, Settings (with tabs below)
- Under Settings, look for **Environment Variables** in the left sidebar

## Environment Variables Overview

| Variable | Value | Required |
|----------|-------|----------|
| `ADMIN_EMAIL` | salakodeborah234@gmail.com | ✅ Yes |
| `RESEND_API_KEY` | Your API key from resend.com | ✅ Yes |
| `STRIPE_SECRET_KEY` | Your key from Stripe dashboard | ✅ Yes |

Once all three are set and deployment is complete, your form should work perfectly!

**Need help?** Let me know if you get stuck at any step.
