export async function onRequestGet({ env }) {
  const raw = await env.PM_KV.get('projects');
  if (!raw) {
    return new Response(
      JSON.stringify({ projects: [], updatedBy: null, updatedAt: null }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost({ request, env }) {
  let projects;
  try {
    projects = await request.json();
    if (!Array.isArray(projects)) throw new Error('not an array');
  } catch (e) {
    return new Response('JSON inválido: se esperaba un arreglo de proyectos', { status: 400 });
  }

  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
  const payload = JSON.stringify({
    projects,
    updatedBy: email,
    updatedAt: new Date().toISOString()
  });

  await env.PM_KV.put('projects', payload);
  return new Response(JSON.stringify({ ok: true, updatedBy: email }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
