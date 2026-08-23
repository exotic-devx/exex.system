import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join('/tmp', 'visits.json');

function readVisits() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeVisits(visits) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));
  } catch (err) {
    console.error('Errore scrittura:', err);
  }
}

export async function onRequest(context) {
  try {
    const { request } = context;
    const visits = readVisits();
    
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') ||
               '0.0.0.0';
    
    const newVisit = {
      ip: ip,
      time: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || ''
    };
    
    visits.push(newVisit);
    writeVisits(visits);
    
    return new Response(JSON.stringify({ ok: true, total: visits.length }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Errore interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
