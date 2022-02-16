import { Logs } from "./constants";
import dotenv from "dotenv";

dotenv.config();

/** This function return undefined **/
function noop(): void {
  // No operation performed.
}

const defaultLogger = {
  debug: noop,
  error: noop,
  info: noop,
  logException: noop,
  warn: noop,
};

export enum consoleColors {
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
}

const logger = process.env.SHOW_LOGS === Logs.SHOW ? console : defaultLogger;

export default logger;
