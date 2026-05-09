export default function handler(request, context) {
  return new Response(JSON.stringify({
    message: 'Hello from EdgeOne Pages Functions!',
    timestamp: Date.now(),
    method: request.method,
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
