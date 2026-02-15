# Firebase Setup Guide

This guide will help you set up Firebase Realtime Database for the multiplayer chess feature.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Realtime Database

1. In your Firebase project, go to **Build > Realtime Database**
2. Click "Create Database"
3. Choose a location (select one closest to your users)
4. Start in **test mode** for development (we'll configure rules next)

## Step 3: Configure Database Rules

1. In the Realtime Database console, go to the **Rules** tab
2. Replace the default rules with the following:

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**Note:** These rules allow public read/write access, which is acceptable for development and live games. For production, consider adding authentication and more restrictive rules.

3. Click **Publish** to save the rules

## Step 4: Get Firebase Configuration

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to create a web app
4. Register your app with a nickname (e.g., "Chess Mentor Web")
5. Copy the `firebaseConfig` object values

## Step 5: Configure Environment Variables

1. In your project root, create a `.env.local` file (copy from `.env.local.example`)
2. Fill in the values from your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Save the file and restart your development server

## Step 6: Test the Feature

1. Run your development server: `npm run dev`
2. Navigate to "Play Against Friend"
3. Create a game and copy the link
4. Open the link in an incognito window or different browser
5. You should be able to play chess in real-time between the two windows!

## Troubleshooting

### Error: "Firebase not initialized"

- Make sure your `.env.local` file exists and has the correct values
- Restart your development server after adding environment variables
- Check that all environment variable names start with `NEXT_PUBLIC_`

### Error: "Permission denied"

- Verify your Realtime Database rules allow read/write access
- Make sure you published the rules in the Firebase Console
- Check that the database URL in your `.env.local` is correct

### Moves not syncing

- Open the browser console and check for errors
- Verify both players are connected (green status indicator)
- Check the Firebase Console > Realtime Database > Data tab to see if moves are being written

### Connection issues

- Make sure you're online and can access Firebase
- Check if your Firebase project has billing enabled (free tier should be sufficient for development)
- Verify the database URL ends with `.firebaseio.com`

## Security Considerations

### For Development (Current Setup)
- Public read/write rules are acceptable
- Games auto-expire after inactivity
- No authentication required

### For Production (Recommended)
Consider implementing:
- Firebase Authentication for user identity
- Restrictive database rules:
  ```json
  {
    "rules": {
      "games": {
        "$gameId": {
          ".read": "auth != null",
          ".write": "auth != null && (
            !data.exists() ||
            data.child('playerWhite/id').val() === auth.uid ||
            data.child('playerBlack/id').val() === auth.uid
          )"
        }
      }
    }
  }
  ```
- Rate limiting to prevent spam
- Game expiration (TTL) to clean up old games

## Cost Considerations

Firebase Realtime Database has a generous free tier:
- **Simultaneous connections:** 100
- **GB stored:** 1 GB
- **GB downloaded:** 10 GB/month

For a chess app with live games only (no persistence):
- Each game uses minimal storage (~1-5 KB)
- Each move is a small write operation
- 100 simultaneous connections = ~50 concurrent games

This should be sufficient for development and small-scale personal use. For larger deployments, monitor usage in the Firebase Console.

## Next Steps

Once you have multiplayer working:
1. Add authentication for player identity
2. Implement game history/replay features
3. Add chat functionality
4. Create a lobby system for finding opponents
5. Add time controls and rated games

Happy coding!
