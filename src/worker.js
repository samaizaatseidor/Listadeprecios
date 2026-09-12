export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const PREVENTAS_EMAILS = {
      'Gustavo Najar': 'gustavo.najar@seidor.com',
      'Rocío Anaya': 'rocio.anaya@seidor.com',
      'Samuel Aiza': 'samuel.aiza@seidor.com'
    };

    if (url.pathname === '/api/notify' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const { asignadoA, client, requerimiento, gerenteComercial } = body;
      const toEmail = PREVENTAS_EMAILS[asignadoA];
      if (!toEmail) {
        return new Response(JSON.stringify({ ok: false, reason: 'Sin destinatario para: ' + asignadoA }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // DIAGNÓSTICO TEMPORAL — no revela la key, solo si existe y cuántos caracteres tiene
      const keyPresent = typeof env.RESEND_API_KEY === 'string' && env.RESEND_API_KEY.length > 0;
      const keyLength = keyPresent ? env.RESEND_API_KEY.length : 0;
      const keyPreview = keyPresent ? env.RESEND_API_KEY.slice(0, 3) + '...' + env.RESEND_API_KEY.slice(-3) : null;

      const primerNombre = asignadoA.split(' ')[0];
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CRM PresalesMX <notificaciones@crmpresalesmx.com>',
          to: [toEmail],
          subject: `Nueva ficha de cliente asignada: ${client}`,
          html: `
            <p>Hola ${primerNombre},</p>
            <p><strong>${gerenteComercial || 'Un ejecutivo comercial'}</strong> cargó una nueva ficha de cliente para <strong>${client}</strong> (${requerimiento}), y quedó asignada a ti en el CRM PresalesMX.</p>
            <p><a href="https://listadepreciosseidor.samuel-aiza.workers.dev/pipeline.html">Ver en el tablero →</a></p>
          `
        })
      });

      if (!resendResp.ok) {
        const errText = await resendResp.text();
        return new Response(JSON.stringify({ ok: false, error: errText, debug: { keyPresent, keyLength, keyPreview } }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/projects') {
      if (request.method === 'GET') {
        const raw = await env.PM_KV.get('projects');
        if (!raw) {
          return new Response(
            JSON.stringify({ projects: [], updatedBy: null, updatedAt: null }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
      }

      if (request.method === 'POST') {
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

      return new Response('Method not allowed', { status: 405 });
    }

    // Cualquier otra ruta: sirve los archivos estáticos normalmente
    return env.ASSETS.fetch(request);
  }
};
