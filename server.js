import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import TelegramBot from 'node-telegram-bot-api';
import { openaiRequest } from './services/openaiRequest.js';
import config from './config/config.json' assert { type: 'json' };
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 4001;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// console.log('TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN);
const tgBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const allowedOrigins = config.enableForDomains;

app.use(
   cors({
      origin: (origin, callback) => {
         if (
            !origin ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            allowedOrigins.includes(origin)
         ) {
            callback(null, true);
         } else {
            callback(new Error('Not allowed by CORS')); // Запрещено
         }
      }
   })
);
app.use(bodyParser.json());

// Setting Request Rate Limiting
const limiter = rateLimit({
   windowMs: 1 * 60 * 1000,
   max: 60,
   message: 'Too many requests from this IP, please try again later.'
});

app.use('/chat', limiter);

app.post('/chat', async (req, res) => {
   try {
      const { messages } = req.body;
      console.log('messages', messages);

      // Clear HTML tags from all messages and handle message objects
      const cleanedMessages = messages
         .map((msg) => {
            if (typeof msg === 'string') {
               return msg
                  .replace(/<.*?>/g, '')
                  .replace(/^You:\s*/, '')
                  .trim();
            }
            if (msg.message) {
               return msg.message
                  .replace(/<.*?>/g, '')
                  .replace(/^You:\s*/, '')
                  .trim();
            }
            return '';
         })
         .filter((msg) => msg); // Remove empty messages

      // Converting messages to OpenAI API format
      const chatHistory = [];
      for (let i = 0; i < cleanedMessages.length; i++) {
         if (i % 2 === 0) {
            chatHistory.push({ role: 'user', content: cleanedMessages[i] });
         } else {
            // Skip "is typing" messages
            if (!cleanedMessages[i].includes('is typing')) {
               chatHistory.push({
                  role: 'assistant',
                  content: cleanedMessages[i]
               });
            }
         }
      }

      // Limit the history (for example, to the last 10 messages)
      const trimmedHistory = chatHistory.slice(-10);

      const botReply = await openaiRequest(trimmedHistory);

      res.json({ reply: botReply });
   } catch (error) {
      console.error('Error: ', error);
      res.status(500).json({
         error: 'Error sending request: ' + error.message
      });
   }
});

const botUsername = process.env.TG_BOT_USERNAME;
const botNicknameForReply = config.botNicknameForReply;
const MAX_HISTORY = config.tgMaxHistoryMessagesCount;
const userConversations = new Map();

tgBot.on('message', async (msg) => {
   try {
      const chatId = msg.chat.id;
      const text = msg.text;
      const userId = msg.from.id;
      const userKey = `${chatId}:${userId}`;

      if (!text) return;
      console.log(text.toLocaleLowerCase(), botNicknameForReply.toLowerCase());
      const isGroupChat =
         msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      const isMentioned = text
         .toLowerCase()
         .startsWith(`/${botNicknameForReply.toLowerCase()}`);
      // console.log('msg.reply_to_message.from.first_name', msg.reply_to_message);
      const isReplyToBot =
         msg.reply_to_message &&
         msg.reply_to_message.from &&
         msg.reply_to_message.from.first_name &&
         msg.reply_to_message.from.first_name.toLowerCase() ===
            botUsername.toLowerCase();

      if (isGroupChat && !(isMentioned || isReplyToBot)) {
         return;
      }

      if (!userConversations.has(userKey)) {
         userConversations.set(userKey, []);
      }

      const messages = userConversations.get(userKey);

      messages.push({ role: 'user', content: text });

      if (messages.length > MAX_HISTORY) {
         messages.shift();
      }

      const botReply = await openaiRequest(messages);

      messages.push({ role: 'system', content: botReply });

      if (messages.length > MAX_HISTORY) {
         messages.shift();
      }

      const options = isGroupChat
         ? { reply_to_message_id: msg.message_id }
         : {};

      tgBot.sendMessage(chatId, botReply, options);
   } catch (error) {
      console.error('Error tg bot: ', error.message);
   }
});

app.listen(PORT, () => {
   console.log(`Server is running on port: ${PORT}`);
});
