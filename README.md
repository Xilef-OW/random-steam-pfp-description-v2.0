# Random Steam Profile Description v2.0

This small utility fetches a random Steam avatar and generates a CS2-themed description in a playful "uwu" style. It can also update your Steam profile with the generated description.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your credentials:
   - `STEAM_API_KEY` - your Steam Web API key
   - `STEAM_USERNAME` - Steam account username
   - `STEAM_PASSWORD` - Steam account password
   - `STEAM_SHARED_SECRET` - optional two-factor auth shared secret

## Usage

Run the script with Node.js:

```bash
node index.js
```

The script outputs the chosen avatar URL and the description in JSON format after updating your profile summary.

### Preview mode

If you just want to see the generated avatar and description without logging in to Steam, run:

```bash
node index.js --preview
```

This mode does not require `STEAM_USERNAME` or `STEAM_PASSWORD`.
