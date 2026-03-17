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

## 📱 Social Media Video Downloads

The bot also automatically downloads and re-uploads videos from social media when posted in a configured channel. Videos over 10 MB are automatically compressed to fit Discord's limit.

**Supported platforms:**
- Instagram Reels & posts
- TikTok (including short links)
- Twitter / X
- YouTube Shorts & regular videos
- Reddit (v.redd.it)
- Twitch clips
- Streamable

Carousel/multi-video posts will have all clips attached in a single reply. Tracking query parameters (e.g. `?igsh=...` on Instagram) are stripped automatically before downloading.

Downloads are powered by [cobalt](https://cobalt.tools). The bot uses a public community instance by default — see `.env.example` to override with your own self-hosted instance.

**Additional requirement:** `ffmpeg` must be installed on the host machine for video compression.

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg
```

---

## ⬆️ Migrating an existing `.env`

If you already have the bot running, add these new variables to your `.env` file:

```env
# Channel where the bot downloads social media videos (required for that feature)
SOCIAL_CHANNEL_ID=paste_your_channel_id_here

# Optional: use your own cobalt instance instead of the default public one
# COBALT_API_URL=https://cobalt-backend.canine.tools
```

Then install the new dependency:

```bash
npm install
```

`CHANNEL_ID` (music links) is unchanged — both channels work independently and can even be the same channel.

---

## 📋 Requirements

- **Node.js** 18 or higher ([Download here](https://nodejs.org/))
- **ffmpeg** installed on the host (required for video compression)
- A **Discord account** with permission to add bots to a server

## 🎯 Supported Platforms

**Music link conversion:**
- ✅ **Spotify** (open.spotify.com)
- ✅ **Apple Music** (music.apple.com)

Converts to song.link URLs which support Spotify, Apple Music, YouTube, YouTube Music, Deezer, Tidal, Amazon Music, Pandora, Napster, and more.

**Social media video downloads:**
- ✅ Instagram, TikTok, Twitter/X, YouTube, Reddit, Twitch, Streamable, and more

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
