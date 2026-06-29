const pad = (n) => n.toString().padStart(2, '0');

const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const info = (msg, meta) => {
  console.log(`[INFO]  ${timestamp()} - ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ''));
};

const warn = (msg, meta) => {
  console.warn(`[WARN]  ${timestamp()} - ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ''));
};

const error = (msg, meta) => {
  console.error(`[ERROR] ${timestamp()} - ${msg}` + (meta ? ` ${JSON.stringify(meta)}` : ''));
};

module.exports = { info, warn, error };
