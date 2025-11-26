# UnkleAyo Meeting Scheduler - Setup Guide

## System Features
✅ Schedule meetings with time restriction (6 PM - 9 PM only)
✅ Multi-currency support (10 currencies)
✅ Bank transfer payment details
✅ Email confirmations (admin + user)
✅ Copy-to-clipboard for account details
✅ Works on ALL devices (desktop, tablet, mobile)
✅ **NEW: Remote access from anywhere in the world with ngrok**

## How to Access from ANY Device

### 1. Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### 2. On ANY Device (Desktop, Mobile, Tablet, etc.)

Open your browser and go to:
```
http://[YOUR-COMPUTER-IP]:5173
```

**Examples:**
- Desktop: `http://192.168.1.100:5173`
- Mobile: `http://192.168.1.100:5173`
- Tablet: `http://192.168.1.100:5173`

The frontend will automatically detect your device and connect to the backend on port 3001.

### 3. Network Requirements

✅ Device must be on the SAME WIFI network as your computer
✅ Firewall must allow ports 5173 (frontend) and 3001 (backend)

## 🌍 Remote Access (NEW - Worldwide Access)

Want users to access from **ANY device, ANY location**? Use ngrok!

See **`REMOTE_ACCESS_SETUP.md`** for complete instructions.

Quick start:
1. Download ngrok from https://ngrok.com/download
2. Open PowerShell and run: `ngrok http 3001`
3. Copy the HTTPS URL from ngrok
4. Edit `.env` and set: `VITE_PUBLIC_URL=https://your-ngrok-url`
5. Run `npm run dev`
6. Share the URL with users!

## Server Status

- Frontend: `http://localhost:5173` (desktop) or `http://[YOUR-IP]:5173` (any device)
- Backend API: `http://localhost:3001` (desktop) or `http://[YOUR-IP]:3001` (any device)
- Email Service: Resend (configured with API key in .env)

## Email Configuration

Emails are automatically sent to:
- Admin: `salakodeborah234@gmail.com`
- User: Email address entered in the form

API Key Status: ✅ Configured in `.env`

## Troubleshooting

**"Error connecting to server"**
- Check if backend is running (npm run dev)
- Verify your IP address and use correct URL
- Make sure devices are on same WiFi network
- Check firewall settings

**Emails not sending**
- Verify RESEND_API_KEY in `.env` file
- Restart the server after adding API key

**Time restriction not working**
- Times must be between 6:00 PM and 8:59 PM
- Format: HH:MM (24-hour format)

## Development

```bash
npm run dev    # Start both frontend and backend
npm install    # Install dependencies
```
