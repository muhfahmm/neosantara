// WARDBG-TEMP
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  console.log('[WARDBG]', JSON.stringify(body));
  return Response.json({ ok: true });
}
