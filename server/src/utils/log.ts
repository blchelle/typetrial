/* eslint-disable no-console */
import fs from 'fs';
import { NodeEnv } from '../config/environment';

type LogType = 'anomaly' | 'error' | 'info';

interface Log {
    event: string;
    user?: string;
    [info: string]: any;
}

let logFile: fs.WriteStream;
let errorFile: fs.WriteStream;
let anomalyFile: fs.WriteStream;

const writeToConsole = (logLine: string, type: LogType) => {
  if (type === 'info') console.log(logLine);
  else if (type === 'error') console.error(logLine);
  else console.warn(logLine);
};

const writeToFile = (logLine: string, type: LogType) => {
  if (type === 'info') logFile.write(`${logLine}\n`);
  else if (type === 'error') errorFile.write(`${logLine}\n`);
  else anomalyFile.write(`${logLine}\n`);
};

export const openLogFiles = async () => {
  if (!fs.existsSync('logs/')) {
    await fs.promises.mkdir('logs/');
  }

  logFile = fs.createWriteStream('logs/info.log', { flags: 'a' });
  errorFile = fs.createWriteStream('logs/error.log', { flags: 'a' });
  anomalyFile = fs.createWriteStream('logs/anomaly.log', { flags: 'a' });
};

export const writeLog = (log: Log, logType: LogType) => {
  const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
  const logInfo = Object.entries(log).map(([key, value]) => `${key}: ${value}`).join(', ');
  const logString = `${timestamp} - ${logInfo}`;

  if (process.env.NODE_ENV as NodeEnv === 'production') {
    writeToFile(logString, logType);
  } else {
    writeToConsole(logString, logType);
  }
};
