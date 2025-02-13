import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import config from '../config/config.json' assert { type: 'json' };
import { promptParser } from '../config/promptParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bot1Prompt = JSON.parse(
   readFileSync(path.join(__dirname, `../prompts/${config.promptName}`), 'utf8')
);

export const openaiRequest = async (trimmedHistory) => {
   try {
      const OPENAI_TOKEN = process.env.OPENAI_TOKEN;

      const promptParserData = promptParser(bot1Prompt);

      const promptMessages = [
        promptParserData,
         ...trimmedHistory // Add cleared chat history
      ];

      const response = await axios.post(
         'https://api.openai.com/v1/chat/completions',
         {
            model: 'gpt-3.5-turbo',
            messages: promptMessages
         },
         {
            headers: {
               Authorization: `Bearer ${OPENAI_TOKEN}`,
               'Content-Type': 'application/json'
            }
         }
      );

      const botReply = response.data.choices[0].message.content.trim();

      return botReply;
   } catch (error) {
      console.log('Error fetching from OpenAI: ', error.message);
   }
};
