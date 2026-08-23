import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'visits.json');

function readVisits() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]');
      return [];
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeVisits(visits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));
}

export async function onRequest(context) {
  const { request } = context;
  
  const visits = readVisits();
  
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') ||
             '0.0.0.0';
  
  visits.push({
    ip: ip,
    time: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || ''
  });
  
  writeVisits(visits);
  
  return new Response(JSON.stringify({ ok: true, total: visits.length }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
