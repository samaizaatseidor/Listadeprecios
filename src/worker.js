export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const PREVENTAS_EMAILS = {
      'Gustavo Najar': 'gustavo.najar@seidor.com',
      'Rocío Anaya': 'rocio.anaya@seidor.com',
      'Samuel Aiza': 'samuel.aiza@seidor.com'
    };

    const AE_EMAILS = {
      'Fernanda Richards': 'fernanda.richards@seidor.com',
      'Manuel Apón': 'manuel.apon@seidor.com',
      'Natalia Ossa': 'natalia.ossa@seidor.com',
      'Estefanía Muñoz': 'estefania.munoz@seidor.com',
      'Freda Juárez': 'freda.juarez@seidor.com',
      'Fernanda Villagómez': 'fernanda.villagomez@seidor.com',
      'Josselyn González': 'josselyn.gonzalez@seidor.com',
      'Omar Dávila': 'omar.davila@seidor.com'
    };
    const SAM_EMAIL = 'samuel.aiza@seidor.com';

    if (url.pathname === '/api/notify' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const { asignadoA, client, requerimiento, gerenteComercial } = body;
      const preventasEmail = PREVENTAS_EMAILS[asignadoA] || null;
      const aeEmail = AE_EMAILS[gerenteComercial] || null;

      // Destinatario principal: el preventas asignado; si no hay, cae al AE; si tampoco, a Sam.
      const toEmail = preventasEmail || aeEmail || SAM_EMAIL;
      const ccSet = new Set([aeEmail, SAM_EMAIL].filter(Boolean));
      ccSet.delete(toEmail);
      const ccEmails = Array.from(ccSet);

      let apiKeyValue = null;
      try {
        apiKeyValue = env.RESEND_API_KEY && typeof env.RESEND_API_KEY.get === 'function'
          ? await env.RESEND_API_KEY.get()
          : (typeof env.RESEND_API_KEY === 'string' ? env.RESEND_API_KEY : null);
      } catch (e) {
        apiKeyValue = null;
      }

      const primerNombre = (asignadoA || toEmail).split(' ')[0];
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyValue}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'CRM PresalesMX <notificaciones@crmpresalesmx.com>',
          to: [toEmail],
          cc: ccEmails,
          subject: `Nueva ficha de cliente: ${client}`,
          html: `
            <p>Hola,</p>
            <p><strong>${gerenteComercial || 'Un ejecutivo comercial'}</strong> cargó una nueva ficha de cliente para <strong>${client}</strong> (${requerimiento}).${preventasEmail ? ` Quedó preasignada a <strong>${asignadoA}</strong> en Prospección dentro del CRM PresalesMX.` : ''}</p>
            <p><a href="https://listadepreciosseidor.samuel-aiza.workers.dev/pipeline.html">Ver en el tablero →</a></p>
          `
        })
      });

      if (!resendResp.ok) {
        const errText = await resendResp.text();
        return new Response(JSON.stringify({ ok: false, error: errText }), {
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
