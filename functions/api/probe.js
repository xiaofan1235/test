export default async function handler(request, context) {
  return new Response(JSON.stringify({
    status: 'ok',
    message: 'Diagnostic API is running',
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
