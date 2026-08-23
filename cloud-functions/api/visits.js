import fs from 'fs';
import path from 'path';

// Usa una cartella temporanea per i dati su EdgeOne
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
    const visits = readVisits();
    
    return new Response(JSON.stringify({ 
      total: visits.length, 
      visits: visits.slice().reverse() 
    }), {
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
