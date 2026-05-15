const chalk = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  blue: (t) => `\x1b[34m${t}\x1b[0m`,
};

const timestamp = () => new Date().toISOString();

const logger = {
  info: (message) => console.log(`${chalk.blue('[INFO]')} ${timestamp()} - ${message}`),
  warn: (message) => console.warn(`${chalk.yellow('[WARN]')} ${timestamp()} - ${message}`),
  error: (message) => console.error(`${chalk.red('[ERROR]')} ${timestamp()} - ${message}`),
  success: (message) => console.log(`${chalk.green('[SUCCESS]')} ${timestamp()} - ${message}`),
};

module.exports = logger;
