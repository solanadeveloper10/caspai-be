# Telegram & Web Bot

A chatbot for Telegram and the web using OpenAI.

## Installation

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file:
   ```env
   OPENAI_TOKEN=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TG_BOT_USERNAME=bots_username
   ```

## Configuration

Edit `config/config.json`:

```json
{
   "botNicknameForReply": "custom_bot_name_for_reply",
   "tgMaxHistoryMessagesCount": 10,
   "promptName": "default_prompt.json",
   "enableForDomains": ["example.com"]
}
```
-  `botNicknameForReply` – Bot name for reply.
-  `tgMaxHistoryMessagesCount` – Max messages per user.
-  `promptName` – Prompt file in `prompts/`.
-  `enableForDomains` – Allowed domains.

If prompt keys change, update `config/promptParser.js` accordingly.

## Running

Start the bot:

```sh
npm start
```

For development:

```sh
npm run dev
```
