# UnkleAyo - Remote Access Setup Guide (ngrok)

If you want users to access your meeting scheduler from **ANY device in the world** (not just same WiFi), follow this guide.

## Option 1: Same WiFi Network (No setup required)

If all users are on the same WiFi as your computer:

```bash
npm run dev
```

Then access from any device on the network at: `http://YOUR-COMPUTER-IP:5173`

---

## Option 2: Remote Access with ngrok (Recommended)

This allows users to access from anywhere in the world.

### Step 1: Download ngrok

1. Go to https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the ngrok.exe file to a folder (e.g., `C:\ngrok` or Desktop)

### Step 2: Create a Permanent Authtoken (Optional but Recommended)

1. Go to https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken
3. Open PowerShell and run:
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

### Step 3: Start the Backend with ngrok

**Option A: Using the ngrok GUI (Easiest)**
1. Download ngrok
2. Run `ngrok.exe`
3. Enter: `ngrok http 3001`
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: Using Command Line**

Open a new PowerShell terminal and run:
```powershell
ngrok http 3001
```

You'll see output like:
```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001
```

### Step 4: Add Public URL to Environment

1. Open `.env` file
2. Find this line:
   ```
   VITE_PUBLIC_URL=
   ```
3. Add the ngrok URL (keep the https://):
   ```
   VITE_PUBLIC_URL=https://abc123.ngrok.io
   ```

### Step 5: Start Your Application

In your main terminal (not the ngrok one), run:
```bash
npm run dev
```

### Step 6: Share Your URL

Share this URL with users:
```
http://YOUR-COMPUTER-IP:5173
```

The frontend will automatically use the ngrok URL for backend API calls.

---

## Testing Remote Access

1. **Get your ngrok URL** (from the ngrok terminal)
2. **Share the frontend URL**: `http://YOUR-COMPUTER-IP:5173`
3. **Users can now**:
   - Access from any device (mobile, tablet, laptop)
   - Access from anywhere (different WiFi, different country)
   - Schedule meetings successfully

---

## Important Notes

### ngrok URL Changes
- **Free plan**: URL changes every time you restart ngrok
- **Pro plan**: Get a permanent URL
- Update `.env` VITE_PUBLIC_URL each time if using free plan

### Firewall Settings
- Ensure ports 5173 (frontend) and 3001 (backend) are not blocked
- ngrok creates a public tunnel, so firewall typically won't block it

### Security
- ngrok URLs are publicly accessible - anyone with the URL can access
- For production, use authentication or restrict access
- Don't share your ngrok URL publicly if sensitive

### Troubleshooting

**"Error connecting to server"**
- Verify ngrok terminal shows "online"
- Check `.env` VITE_PUBLIC_URL is set correctly
- Restart both ngrok and `npm run dev`
- **ngrok Free Tier**: The app now automatically adds headers to bypass the ngrok interstitial warning page

**ngrok URL not working after restart**
- ngrok free plan generates new URL each session
- Update VITE_PUBLIC_URL with new URL
- Reload the webpage

**Still getting WiFi error message**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console (F12) for actual error
- Verify backend is running
- Make sure you're accessing from the correct URL (frontend on port 5173, backend uses ngrok tunnel automatically)

---

## Automated Setup Script

To automate this, create `start-remote.bat`:

```batch
@echo off
echo Starting UnkleAyo with remote access...
echo.
echo Step 1: Make sure ngrok is running in another terminal
echo Command: ngrok http 3001
echo.
echo Step 2: When ngrok shows the forwarding URL, copy the HTTPS URL
echo Step 3: Update .env file with VITE_PUBLIC_URL=your_ngrok_url
echo.
timeout /t 5
npm run dev
```

Run this batch file instead of `npm run dev` to get the reminder.

---

## Quick Reference

| Scenario | What to do |
|----------|-----------|
| Same WiFi only | Just run `npm run dev` - no ngrok needed |
| Remote access worldwide | Run ngrok, add URL to `.env`, run `npm run dev` |
| Users getting "Error connecting" | Check ngrok is active and URL is in `.env` |
| New ngrok session | Update VITE_PUBLIC_URL in `.env` with new URL |

