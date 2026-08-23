export async function onRequest(context) {
  try {
    // Per ora restituisce dati di esempio
    return new Response(JSON.stringify({ 
      total: 1,
      visits: [
        {
          ip: '0.0.0.0',
          time: new Date().toISOString(),
          userAgent: 'EdgeOne Pages'
        }
      ]
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Errore: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
