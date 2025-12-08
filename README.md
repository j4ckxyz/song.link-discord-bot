# Song.link Discord Bot

A Discord bot that automatically detects Apple Music and Spotify links in a specific channel and converts them to universal song.link URLs.

## Features

- 🎵 Automatically detects Apple Music and Spotify links
- 🔗 Converts links to song.link for universal compatibility
- 📍 Works in a single configured channel
- 💬 Replies to messages with converted links

## Setup

### Prerequisites

- Node.js 18 or higher
- A Discord bot token
- A Discord server where you have permission to add bots

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd /Volumes/SSD/Code/song.link-discord-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a Discord Bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" and give it a name
   - Go to the "Bot" section and click "Add Bot"
   - Under "Privileged Gateway Intents", enable:
     - MESSAGE CONTENT INTENT
   - Copy the bot token

4. **Invite the bot to your server:**
   - Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot`
   - Select bot permissions: `Send Messages`, `Read Messages/View Channels`, `Read Message History`
   - Copy the generated URL and open it in your browser
   - Select your server and authorize

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - `DISCORD_TOKEN`: Your bot token from the Discord Developer Portal
   - `CHANNEL_ID`: The ID of the channel where the bot should work
     - To get a channel ID: Right-click the channel > Copy ID
     - (You may need to enable Developer Mode in Discord settings first)

### Running the Bot

**Development mode (with auto-restart on file changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## Usage

Once the bot is running:

1. Post a message in the configured channel with an Apple Music or Spotify link
2. The bot will automatically reply with the converted song.link URL(s)

**Example:**

```
User: Check out this song! https://open.spotify.com/track/abc123

Bot: 🎵 Universal Music Link:
1. https://song.link/https%3A%2F%2Fopen.spotify.com%2Ftrack%2Fabc123
```

## Supported Platforms

- ✅ Apple Music (music.apple.com)
- ✅ Spotify (open.spotify.com)

## How It Works

The bot:
1. Listens for messages in the specified channel
2. Uses regex to detect Apple Music and Spotify URLs
3. Converts them to song.link format
4. Replies to the original message with the universal links

## License

MIT
