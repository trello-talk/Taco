const { createLogger, format, transports } = require('winston');
const util = require('util');

module.exports = (prefix = '') => {
  return createLogger({
    format: format.combine(
      format.timestamp(),
      format.align(),
      format.printf(
        info => {
          if(!process.env.LOGGER_DEBUG && info.level === 'debug') return;
          return `${prefix} ${new Date(info.timestamp).toTimeString().split(' ')[0]} ${info.level.toUpperCase()}: ${info.message}${
            info[Symbol.for('splat')] ? ': ' +
                info[Symbol.for('splat')].map(v => util.inspect(v)).join(' ')
              : ''
          }`;
        },
      ),
    ),
    transports: [new transports.Console({ level: 'debug' })],
  });
};
