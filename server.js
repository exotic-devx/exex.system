const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'visits.json');

// IMPORTANTE: trust proxy per IP reali
app.set('trust proxy', true);

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json());

function getClientIp(req) {
  // Lista di header da controllare (in ordine di affidabilità)
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-forwarded-for',       // Proxy/Reverse proxy
    'x-real-ip',             // Nginx
    'x-client-ip',           // Apache
    'x-cluster-client-ip',   // Rackspace
    'forwarded-for',         // Forwarded
    'forwarded',             // Forwarded
    'x-remote-ip',           // Remote
    'x-remote-addr'          // Remote
  ];
  
  for (const header of headers) {
    const value = req.headers[header.toLowerCase()];
    if (value) {
      // Se è x-forwarded-for, prende il primo IP
      if (header === 'x-forwarded-for') {
        return value.split(',')[0].trim();
      }
      return value;
    }
  }
  
  // Fallback: usa req.ip
  const ip = req.ip;
  // Se è localhost, prova a prendere l'IP dalla connessione
  if (ip === '::1' || ip === '127.0.0.1') {
    const remoteAddr = req.connection.remoteAddress;
    if (remoteAddr && remoteAddr !== '::1' && remoteAddr !== '127.0.0.1') {
      return remoteAddr;
    }
  }
  
  return ip || 'unknown';
}

function readVisits() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function writeVisits(visits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));
}

// Debug - mostra tutte le richieste
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - IP: ${getClientIp(req)}`);
  next();
});

app.post('/api/log-visit', (req, res) => {
  try {
    const visits = readVisits();
    const ip = getClientIp(req);
    const newVisit = {
      ip: ip,
      time: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || ''
    };
    visits.push(newVisit);
    writeVisits(visits);
    console.log('✅ Visita registrata:', ip);
    res.json({ ok: true, total: visits.length });
  } catch (err) {
    console.error('❌ Errore:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

app.get('/api/visits', (req, res) => {
  const visits = readVisits();
  res.json({ total: visits.length, visits: visits.slice().reverse() });
});

app.get('/v', (req, res) => {
  res.sendFile(path.join(__dirname, 'v.html'));
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 exex.system in ascolto su http://localhost:${PORT}`);
  console.log(`📊 Pagina visite: http://localhost:${PORT}/v`);
  console.log(`🌐 Sito accessibile anche su http://192.168.x.x:${PORT}`);
});