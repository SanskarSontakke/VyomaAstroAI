const LEVELS = { debug:'#7B6FA0', info:'#3b82f6', warn:'#f59e0b', error:'#ef4444' };


const fmt = (level, scope, msg) => [
  `%c[VYOMA ${level.toUpperCase()}] %c${scope}%c — ${msg}`,
  `color:${LEVELS[level]};font-weight:700;font-family:monospace`,
  `color:#EDE8D0;font-weight:500`,
  `color:#8A8170`
];

export const log = {
  debug: (scope, msg, data)  => { console.debug(...fmt('debug', scope, msg)); if(data) console.debug(data); },
  info:  (scope, msg, data)  => { console.info( ...fmt('info',  scope, msg)); if(data) console.info(data);  },
  warn:  (scope, msg, data)  => { console.warn( ...fmt('warn',  scope, msg)); if(data) console.warn(data);  },
  error: (scope, msg, err)   => {
    console.error(...fmt('error', scope, msg));
    if(err instanceof Error) {
      console.error('  Message:', err.message);
      console.error('  Stack:',   err.stack);
    } else if(err) {
      console.error('  Detail:', err);
    }
  },
  group: (label, fn) => { console.group(label); fn(); console.groupEnd(); },
};
