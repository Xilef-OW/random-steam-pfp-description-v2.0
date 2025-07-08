#!/usr/bin/env node

// Utility to fetch a random Steam avatar, generate a random CS2-themed
// description in uwu style, and set that description on your Steam profile.
//
// Environment variables required:
//   STEAM_API_KEY      - Steam Web API key
//   STEAM_USERNAME     - Steam account username
//   STEAM_PASSWORD     - Steam account password
//   STEAM_SHARED_SECRET- (optional) shared secret for two-factor auth

const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const SteamTotp = require('steam-totp');

const STEAM_KEY = process.env.STEAM_API_KEY;
const USERNAME = process.env.STEAM_USERNAME;
const PASSWORD = process.env.STEAM_PASSWORD;
const SHARED_SECRET = process.env.STEAM_SHARED_SECRET;

const args = process.argv.slice(2);
const PREVIEW = args.includes('--preview') || args.includes('-p');

if (!STEAM_KEY) {
  console.error('Missing STEAM_API_KEY environment variable.');
  process.exit(1);
}
if (!PREVIEW && (!USERNAME || !PASSWORD)) {
  console.error('Missing STEAM_USERNAME or STEAM_PASSWORD environment variable.');
  process.exit(1);
}

/**
 * Fetch a random player's avatar from Steam.
 * Retries until it finds a valid profile.
 */
async function getRandomSteamAvatar() {
  const prefix = '7656119';
  while (true) {
    const suffix = String(Math.floor(Math.random() * 1e10)).padStart(10, '0');
    const steamId = prefix + suffix;
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${steamId}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const player = data?.response?.players?.[0];
      if (player && player.avatarfull) {
        return player.avatarfull;
      }
    } catch {
      // ignore and retry
    }
  }
}

/**
 * Convert a phrase into playful uwu style.
 */
function uwuify(text) {
  return text
    .replace(/[rl]/g, 'w')
    .replace(/[RL]/g, 'W')
    .replace(/n([aeiou])/gi, 'ny$1') +
    (Math.random() < 0.5 ? ' uwu' : ' owo');
}

/**
 * Generate a random CS2-themed description.
 */
function generateDescription() {
  const base = [
    'Ready to top frag in CS2',
    'Aiming for that ace every match',
    'Holding angles and hitting flicks',
    'Charging with my squad for the win',
    'Watching mid and locking it down',
    'Throwing nades like a pro',
    'Bunny hopping through mid',
    'Rushing B no stop',
    'Saving for the big green',
    'Practicing smokes every day',
    'Clutching one v five',
    'Sweating in ranked matches'
  ];
  const extras = [
    'lets go',
    'no fear',
    'time to shine',
    'glhf',
    'take the site',
    'watch this peek',
    'ez game',
    'gg wp'
  ];
  const phrase = `${base[Math.floor(Math.random() * base.length)]}, ${extras[Math.floor(Math.random() * extras.length)]}`;
  return uwuify(phrase);
}

/**
 * Log in to Steam and update the profile description.
 */
function setProfileDescription(description) {
  return new Promise((resolve, reject) => {
    const client = new SteamUser();
    const community = new SteamCommunity();

    const logOnOptions = {
      accountName: USERNAME,
      password: PASSWORD
    };
    if (SHARED_SECRET) {
      logOnOptions.twoFactorCode = SteamTotp.generateAuthCode(SHARED_SECRET);
    }

    client.logOn(logOnOptions);

    client.on('error', reject);

    client.on('loggedOn', () => {
      client.webLogOn();
    });

    client.on('webSession', (sessionID, cookies) => {
      community.setCookies(cookies);
      community.editProfile({ summary: description }, err => {
        client.logOff();
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

async function main() {
  const avatar = await getRandomSteamAvatar();
  const description = generateDescription();
  if (!PREVIEW) {
    await setProfileDescription(description);
  }
  console.log(JSON.stringify({ avatar, description }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
