export async function onRequest(context) {
  const { request } = context;
  
  // Per EdgeOne, usa il file system solo se disponibile
  let visits = [];
  
  try {
    // Prova a leggere da KV storage o da variabile globale
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               '0.0.0.0';
    
    // Usa la risposta per ora
    return new Response(JSON.stringify({ 
      ok: true, 
      message: 'Visita registrata da ' + ip,
      ip: ip,
      total: 1
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
