import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import fs from 'fs/promises';

const DAILY_LIMIT = 100;
const MIN_LENGTH = 120;
const MAX_LENGTH = 500;

// Read the environment variables to protect our api key 
dotenv.config({ path: path.join(__dirname, '..', '.env.scripts') });

// Build the request request
const userId = process.env.QUOTES_USER_ID;
const format: 'json' | 'xml' = 'json';
const apiKey = process.env.QUOTES_API_KEY;
const baseUrl = 'https://www.abbreviations.com/services/v2/quotes.php';
const searchParams = [`uid=${userId}`, `tokenid=${apiKey}`, `format=${format}`];
const url = `${baseUrl}?${searchParams.join('&')}`;

const quotesFilePath = path.join(__dirname, '..', 'data', 'quotes.json'); 

(async () => {
  // Read the existing quotes file into a set
  let quotes = new Set<string>()
  const quotesFile = await fs.readFile(quotesFilePath, 'utf-8')
  try {
    const fileQuotes = JSON.parse(quotesFile)
    fileQuotes.forEach((quote: string) => quotes.add(JSON.stringify(quote)))
  } catch (_) {
  }

  // Request 
  for (let i = 0; i < DAILY_LIMIT; i += 1) {
    try {
      const res = await axios.get(url);
      const quoteInfo = res?.data?.result;

      // Can occur if the daily quota is exceeded
      if (!quoteInfo?.quote || !quoteInfo?.author) {
        console.log('Daily Quota Reached; Stopping now.');
        break;
      }

      // For the purpose of the app, try to find quotes that take 30s - 90s to type.
      if (quoteInfo.quote.length < MIN_LENGTH || quoteInfo.quote.length > MAX_LENGTH) {
        continue
      }

      quotes.add(JSON.stringify(quoteInfo));
    } catch (error) {
      console.log(error);
    }
  }

  // Write the updated quotes back to the file
  const result = JSON.stringify(Array.from(quotes.values()).map((quote) => JSON.parse(quote)))
  await fs.writeFile(quotesFilePath, result)
})();
