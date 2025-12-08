import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Regular expressions to match Apple Music and Spotify links
const APPLE_MUSIC_REGEX = /https?:\/\/music\.apple\.com\/[^\s]+/gi;
const SPOTIFY_REGEX = /https?:\/\/open\.spotify\.com\/[^\s]+/gi;

/**
 * Converts Apple Music or Spotify links to song.link equivalents
 * @param {string} url - The original music service URL
 * @returns {string} - The converted song.link URL
 */
function convertToSongLink(url) {
  // Remove any trailing characters that might not be part of the URL
  const cleanUrl = url.replace(/[)>]+$/, '');
  return `https://song.link/${encodeURIComponent(cleanUrl)}`;
}

/**
 * Extracts and converts all music links from a message
 * @param {string} content - The message content
 * @returns {Array<{original: string, converted: string}>} - Array of link conversions
 */
function extractAndConvertLinks(content) {
  const conversions = [];
  
  // Find Apple Music links
  const appleMusicMatches = content.match(APPLE_MUSIC_REGEX) || [];
  appleMusicMatches.forEach(link => {
    conversions.push({
      original: link,
      converted: convertToSongLink(link),
    });
  });
  
  // Find Spotify links
  const spotifyMatches = content.match(SPOTIFY_REGEX) || [];
  spotifyMatches.forEach(link => {
    conversions.push({
      original: link,
      converted: convertToSongLink(link),
    });
  });
  
  return conversions;
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📢 Monitoring channel ID: ${process.env.CHANNEL_ID}`);
  console.log(`🎵 Ready to convert music links!`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot's own messages
  if (message.author.bot) return;
  
  // Only respond in the specified channel
  if (message.channelId !== process.env.CHANNEL_ID) return;
  
  // Check if message contains music links
  const conversions = extractAndConvertLinks(message.content);
  
  if (conversions.length === 0) return;
  
  // Build response message
  let response = `🎵 **Universal Music Link${conversions.length > 1 ? 's' : ''}:**\n`;
  
  conversions.forEach(({ converted }, index) => {
    response += `${index + 1}. ${converted}\n`;
  });
  
  // Reply to the original message
  try {
    await message.reply(response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
