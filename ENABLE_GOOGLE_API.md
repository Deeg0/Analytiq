# How to Enable Google+ API (or People API)

## Quick Steps

### Step 1: Go to Google Cloud Console
1. Visit [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account

### Step 2: Select Your Project
- Click the project dropdown at the top (next to "Google Cloud")
- Select your project (or create a new one if needed)

### Step 3: Navigate to API Library
1. In the left sidebar, click **"APIs & Services"**
2. Click **"Library"** (or "Enabled APIs and services")

### Step 4: Search for the API
1. In the search bar at the top, type: **"People API"** or **"Google+ API"**
2. You'll see results like:
   - **"People API"** (recommended - newer)
   - **"Google+ API"** (legacy, but still works)

### Step 5: Enable the API
1. Click on **"People API"** (or "Google+ API")
2. Click the big blue **"ENABLE"** button
3. Wait a few seconds for it to enable

## Which API to Use?

**Recommended: People API**
- This is the modern replacement for Google+ API
- Works the same for OAuth authentication
- More actively maintained

**Alternative: Google+ API**
- Still works but is legacy
- Use if People API doesn't work for some reason

## Visual Guide

```
Google Cloud Console
├── [Project Dropdown] ← Select your project
│
├── ☰ Menu (hamburger icon)
│   └── APIs & Services ← Click here
│       └── Library ← Click here
│
└── Search Bar: "People API" or "Google+ API"
    └── Click on result
        └── Click "ENABLE" button
```

## After Enabling

Once enabled, you can:
1. Go to **"APIs & Services"** → **"Credentials"**
2. Create your OAuth 2.0 Client ID
3. The API will be listed in **"Enabled APIs"** section

## Troubleshooting

**Can't find the API?**
- Make sure you're in the correct project
- Try searching for "People API" instead of "Google+ API"
- Check that you have the right permissions

**"Enable" button is grayed out?**
- Make sure you're the project owner or have Editor role
- Try refreshing the page
- Check if billing is enabled (may be required for some APIs)

**API not showing up?**
- Wait a few seconds and refresh
- Check the "Enabled APIs" section to see if it's already enabled
- Try the alternative API (People API vs Google+ API)

## Quick Link

Direct link to API Library:
https://console.cloud.google.com/apis/library

Then search for "People API" or "Google+ API"

