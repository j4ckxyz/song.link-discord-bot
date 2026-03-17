import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Music link detection ─────────────────────────────────────────────────────

const APPLE_MUSIC_REGEX = /https?:\/\/music\.apple\.com\/[^\s]+/gi;
const SPOTIFY_REGEX = /https?:\/\/open\.spotify\.com\/[^\s]+/gi;

function convertToSongLink(url) {
  const cleanUrl = url.replace(/[)>]+$/, '');
  return `https://song.link/${encodeURIComponent(cleanUrl)}`;
}

function extractAndConvertLinks(content) {
  const conversions = [];

  const appleMusicMatches = content.match(APPLE_MUSIC_REGEX) || [];
  appleMusicMatches.forEach(link => {
    conversions.push({ original: link, converted: convertToSongLink(link) });
  });

  const spotifyMatches = content.match(SPOTIFY_REGEX) || [];
  spotifyMatches.forEach(link => {
    conversions.push({ original: link, converted: convertToSongLink(link) });
  });

  return conversions;
}

// ── Social media link detection ──────────────────────────────────────────────

// Matches Instagram, TikTok, Twitter/X, YouTube, Reddit, and more
const SOCIAL_REGEX =
  /https?:\/\/(?:www\.)?(?:instagram\.com\/(?:reel|p|tv)\/|tiktok\.com\/@[^\s/]+\/video\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/|twitter\.com\/\w+\/status\/|x\.com\/\w+\/status\/|youtube\.com\/(?:watch|shorts\/)[^\s]*|youtu\.be\/[^\s]+|reddit\.com\/r\/[^\s]+\/comments\/[^\s]+|v\.redd\.it\/[^\s]+|twitch\.tv\/[^\s]+\/clip\/[^\s]+|streamable\.com\/[^\s]+|clips\.twitch\.tv\/[^\s]+)[^\s]*/gi;

// Strip tracking query params from Instagram and TikTok URLs
function cleanSocialUrl(url) {
  const cleaned = url.replace(/[)>.,]+$/, '');
  try {
    const parsed = new URL(cleaned);
    if (
      parsed.hostname.includes('instagram.com') ||
      parsed.hostname.includes('tiktok.com')
    ) {
      return `${parsed.origin}${parsed.pathname}`;
    }
    return cleaned;
  } catch {
    return cleaned;
  }
}

// ── Cobalt API ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// If COBALT_API_URL is set, use only that. Otherwise try these in order.
const COBALT_INSTANCES = process.env.COBALT_API_URL
  ? [process.env.COBALT_API_URL]
  : [
      'https://cobalt-backend.canine.tools',
      'https://cobalt-api.meowing.de',
      'https://capi.3kh0.net',
    ];

async function callCobaltApi(url) {
  let lastError;
  for (const instance of COBALT_INSTANCES) {
    try {
      const res = await fetch(`${instance}/`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, videoQuality: '1080' }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`Cobalt HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Cobalt instance ${instance} failed: ${err.message}`);
      lastError = err;
    }
  }
  throw lastError;
}

// ── File download & compression ──────────────────────────────────────────────

async function downloadToTemp(url, filename) {
  const ext = path.extname(filename) || '.mp4';
  const tmpPath = path.join(os.tmpdir(), `discord-social-${Date.now()}${ext}`);
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  await fs.promises.writeFile(tmpPath, Buffer.from(buffer));
  return tmpPath;
}

function getVideoDuration(filepath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

async function compressVideo(inputPath) {
  const outputPath = inputPath.replace(/(\.\w+)$/, '_c.mp4');

  // Target 9 MB to leave headroom; calculate required bitrate from duration
  const duration = await getVideoDuration(inputPath);
  const targetBits = 9 * 1024 * 1024 * 8;
  const audioBitrateKbps = 128;
  const videoBitrateKbps = Math.max(100, Math.floor(targetBits / duration / 1000) - audioBitrateKbps);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .videoBitrate(videoBitrateKbps)
      .audioBitrate(audioBitrateKbps)
      .outputOptions(['-preset', 'fast', '-movflags', '+faststart'])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  await fs.promises.unlink(inputPath);
  return outputPath;
}

async function safeUnlink(filepath) {
  try { await fs.promises.unlink(filepath); } catch {}
}

// ── Main social media processor ──────────────────────────────────────────────

async function processSocialUrl(rawUrl) {
  const url = cleanSocialUrl(rawUrl);
  const data = await callCobaltApi(url);

  let downloadUrl, filename;

  if (data.status === 'tunnel' || data.status === 'redirect') {
    downloadUrl = data.url;
    filename = data.filename || 'video.mp4';
  } else if (data.status === 'picker') {
    // Send all video items; fall back to first item if no video found
    const videos = data.picker.filter(item => item.type === 'video');
    const items = videos.length ? videos : [data.picker[0]];
    return { items, isCarousel: true, audioUrl: data.audio };
  } else {
    throw new Error(`Cobalt: ${data.error?.code ?? data.status}`);
  }

  let tmpPath = await downloadToTemp(downloadUrl, filename);

  const { size } = await fs.promises.stat(tmpPath);
  if (size > MAX_FILE_SIZE) {
    tmpPath = await compressVideo(tmpPath);
    const { size: finalSize } = await fs.promises.stat(tmpPath);
    if (finalSize > MAX_FILE_SIZE) {
      await safeUnlink(tmpPath);
      throw new Error('File exceeds 10 MB even after compression');
    }
  }

  return { items: [{ tmpPath, filename }], isCarousel: false };
}

// ── Discord event handlers ───────────────────────────────────────────────────

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📢 Music channel: ${process.env.CHANNEL_ID}`);
  console.log(`📱 Social channel: ${process.env.SOCIAL_CHANNEL_ID}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ── Song.link conversion ──────────────────────────────────────────────────
  if (message.channelId === process.env.CHANNEL_ID) {
    const conversions = extractAndConvertLinks(message.content);
    if (conversions.length > 0) {
      let response = `🎵 **Universal Music Link${conversions.length > 1 ? 's' : ''}:**\n`;
      conversions.forEach(({ converted }, i) => {
        response += `${i + 1}. ${converted}\n`;
      });
      try {
        await message.reply(response);
      } catch (err) {
        console.error('Error sending music link reply:', err);
      }
    }
  }

  // ── Social media download ─────────────────────────────────────────────────
  if (message.channelId === process.env.SOCIAL_CHANNEL_ID) {
    const matches = [...message.content.matchAll(SOCIAL_REGEX)];
    if (matches.length === 0) return;

    for (const match of matches) {
      const rawUrl = match[0];
      try {
        const result = await processSocialUrl(rawUrl);

        if (result.isCarousel) {
          // Download each item and send as a single message with multiple attachments
          const tmpPaths = [];
          const attachments = [];

          for (const item of result.items) {
            const ext = item.type === 'photo' ? '.jpg' : '.mp4';
            const tmp = await downloadToTemp(item.url, `media${ext}`);
            tmpPaths.push(tmp);
            attachments.push(new AttachmentBuilder(tmp));
          }

          await message.reply({ files: attachments });
          for (const p of tmpPaths) await safeUnlink(p);
        } else {
          const { tmpPath, filename } = result.items[0];
          const attachment = new AttachmentBuilder(tmpPath, { name: filename });
          await message.reply({ files: [attachment] });
          await safeUnlink(tmpPath);
        }
      } catch (err) {
        console.error(`Social download error for ${rawUrl}:`, err.message);
      }
    }
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
