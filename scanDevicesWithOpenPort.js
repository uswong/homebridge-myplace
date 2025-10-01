// scan for devices with open port
const os = require('os');
const net = require('net');

// Get local IPv4 address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Chop off last octet → return subnet base
function getBaseIP(ip) {
  const parts = ip.split('.');
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

// Try connecting to ip:port, return ip if open
function checkPort(ip, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve(ip);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => {
      resolve(null);
    });

    socket.connect(port, ip);
  });
}

// Main scanning function
async function scanDevicesWithOpenPort(port = 2025) {
  const localIP = getLocalIP();
  if (!localIP) throw new Error('❌ Local IP not found');

  const baseIP = getBaseIP(localIP);
  const tasks = [];

  for (let i = 2; i <= 254; i++) {
    const ip = `${baseIP}.${i}`;
    if (ip !== localIP) {
      tasks.push(checkPort(ip, port));
    }
  }

  const results = await Promise.all(tasks);
  const matches = results.filter(ip => ip !== null).slice(0, 3);

  return {
    AAIP1: matches[0] || null,
    AAIP2: matches[1] || null,
    AAIP3: matches[2] || null
  };
}

module.exports = { scanDevicesWithOpenPort };

