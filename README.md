# 🎵 Song.link Discord Bot

Automatically converts Apple Music and Spotify links to universal [song.link](https://song.link) URLs so everyone can listen in their preferred app!

## ✨ What It Does

When someone posts a music link in your configured channel:
```
User: Check this out! https://open.spotify.com/track/abc123

Bot: 🎵 Universal Music Link:
1. https://song.link/https%3A%2F%2Fopen.spotify.com%2Ftrack%2Fabc123
```

The song.link URL works with **all music platforms** - Spotify, Apple Music, YouTube Music, Tidal, Deezer, and more!

## 🚀 Quick Start (5 minutes)

### Step 1: Create Your Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Name it (e.g., "Song Link Bot")
3. Go to **"Bot"** tab → Click **"Reset Token"** → Copy the token (save it for later!)
4. Scroll down to **"Privileged Gateway Intents"** and enable:
   - ✅ **MESSAGE CONTENT INTENT**
5. Click **"Save Changes"**

### Step 2: Invite Bot to Your Server

1. Still in Developer Portal, go to **"OAuth2"** → **"URL Generator"**
2. Select these **Scopes**:
   - ✅ `bot`
3. Select these **Bot Permissions**:
   - ✅ `Send Messages`
   - ✅ `Read Messages/View Channels`
   - ✅ `Read Message History`
4. Copy the generated URL at the bottom
5. Paste it in your browser and invite the bot to your server

### Step 3: Get Your Channel ID

1. In Discord, go to **Settings** → **Advanced** → Enable **Developer Mode**
2. Right-click the channel where you want the bot to work
3. Click **"Copy Channel ID"**

### Step 4: Install and Configure

```bash
# Clone this repository
git clone https://github.com/j4ckxyz/song.link-discord-bot.git
cd song.link-discord-bot

# Install dependencies
npm install

# Create configuration file
cp .env.example .env
```

Now edit the `.env` file and add your details:
```env
DISCORD_TOKEN=paste_your_bot_token_here
CHANNEL_ID=paste_your_channel_id_here
```

### Step 5: Run the Bot

```bash
npm start
```

You should see:
```
✅ Logged in as YourBot#1234
📢 Monitoring channel ID: 123456789
🎵 Ready to convert music links!
```

That's it! 🎉

## 📋 Requirements

- **Node.js** 18 or higher ([Download here](https://nodejs.org/))
- A **Discord account** with permission to add bots to a server

## 🎯 Supported Platforms

- ✅ **Spotify** (open.spotify.com)
- ✅ **Apple Music** (music.apple.com)

The bot converts these to song.link URLs which support:
- Spotify, Apple Music, YouTube, YouTube Music, Deezer, Tidal, Amazon Music, Pandora, Napster, and more!

## 🛠️ Advanced

### Development Mode
Run with auto-restart on file changes:
```bash
npm run dev
```

### Running in Production
For 24/7 uptime, consider using:
- **PM2**: `pm2 start index.js --name songlink-bot`
- **Docker**: Deploy using the included `Dockerfile` (coming soon)
- **Cloud hosting**: Deploy to Railway, Heroku, or AWS

## 🤝 Contributing

Issues and pull requests are welcome! Feel free to suggest improvements.

## 📄 License

MIT - Feel free to use this bot in your own servers!

## 💡 Credits

- Built with [discord.js](https://discord.js.org/)
- Powered by [song.link](https://song.link) API
