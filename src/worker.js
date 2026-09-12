async function getResendKey(env) {
  try {
    return env.RESEND_API_KEY && typeof env.RESEND_API_KEY.get === 'function'
      ? await env.RESEND_API_KEY.get()
      : (typeof env.RESEND_API_KEY === 'string' ? env.RESEND_API_KEY : null);
  } catch (e) {
    return null;
  }
}

async function sendEmail(env, { to, cc, subject, html }) {
  const apiKeyValue = await getResendKey(env);
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKeyValue}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'CRM PresalesMX <notificaciones@crmpresalesmx.com>',
      to,
      cc: cc || [],
      subject,
      html
    })
  });
}

const STAGE_LABELS = {
  prospeccion: 'Prospección',
  asignada_preventa: 'Asignada a preventa',
  propuesta: 'Propuesta / RFP',
  scoping: 'Scoping / SOW',
  implementacion: 'Implementación',
  pausado: 'Pausado',
  no_go: 'No-Go'
};

function buildWeeklySummaryHtml(projects) {
  const now = new Date();
  const porEtapa = {};
  Object.keys(STAGE_LABELS).forEach(s => porEtapa[s] = 0);
  projects.forEach(p => { if (porEtapa[p.stage] !== undefined) porEtapa[p.stage]++; });

  const estancadas = projects.filter(p => {
    if (!p.stageHistory || !p.stageHistory.length) return false;
    if (p.stage === 'pausado' || p.stage === 'no_go') return false;
    const last = p.stageHistory[p.stageHistory.length - 1];
    const days = (now - new Date(last.at)) / (1000 * 60 * 60 * 24);
    return days >= 14;
  });

  const etapaRows = Object.entries(STAGE_LABELS)
    .map(([id, label]) => `<tr><td style="padding:4px 12px 4px 0;">${label}</td><td style="padding:4px 0; font-weight:600;">${porEtapa[id]}</td></tr>`)
    .join('');

  const estancadasRows = estancadas.length
    ? estancadas.map(p => `<li>${p.client} — ${STAGE_LABELS[p.stage] || p.stage}</li>`).join('')
    : '<li>Ninguna 🎉</li>';

  return `
    <h2 style="color:#0E1E3F;">Resumen semanal — CRM PresalesMX</h2>
    <p>Corte al ${now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    <h3 style="color:#0E1E3F;">Oportunidades por etapa</h3>
    <table>${etapaRows}</table>
    <h3 style="color:#0E1E3F;">Tarjetas sin movimiento hace 14+ días</h3>
    <ul>${estancadasRows}</ul>
    <p><a href="https://listadepreciosseidor.samuel-aiza.workers.dev/pipeline.html">Ver el tablero completo →</a></p>
  `;
}

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

      const primerNombre = (asignadoA || toEmail).split(' ')[0];
      const resendResp = await sendEmail(env, {
        to: [toEmail],
        cc: ccEmails,
        subject: `Nueva ficha de cliente: ${client}`,
        html: `
          <p>Hola,</p>
          <p><strong>${gerenteComercial || 'Un ejecutivo comercial'}</strong> cargó una nueva ficha de cliente para <strong>${client}</strong> (${requerimiento}).${preventasEmail ? ` Quedó preasignada a <strong>${asignadoA}</strong> en Prospección dentro del CRM PresalesMX.` : ''}</p>
          <p><a href="https://listadepreciosseidor.samuel-aiza.workers.dev/pipeline.html">Ver en el tablero →</a></p>
        `
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

    if (url.pathname === '/api/whoami') {
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      return new Response(JSON.stringify({ email }), { headers: { 'Content-Type': 'application/json' } });
    }

    const ALLOWED_DOC_EXT = ['ppt', 'pptx', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];

    if (url.pathname === '/api/docs' && request.method === 'GET') {
      const listed = await env.DOCS_BUCKET.list();
      const files = listed.objects.map(o => ({
        key: o.key,
        size: o.size,
        uploaded: o.uploaded,
        uploadedBy: (o.customMetadata && o.customMetadata.uploadedBy) || 'desconocido'
      })).sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
      return new Response(JSON.stringify({ files }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/docs' && request.method === 'POST') {
      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return new Response('No se recibió ningún archivo', { status: 400 });
      }
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_DOC_EXT.includes(ext)) {
        return new Response('Tipo de archivo no permitido. Solo PPT, PDF, Word o Excel.', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      await env.DOCS_BUCKET.put(file.name, file.stream(), {
        httpMetadata: { contentType: file.type || 'application/octet-stream' },
        customMetadata: { uploadedBy: email, uploadedAt: new Date().toISOString() }
      });
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/docs/file' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key) return new Response('Falta el parámetro key', { status: 400 });
      const obj = await env.DOCS_BUCKET.get(key);
      if (!obj) return new Response('Archivo no encontrado', { status: 404 });
      return new Response(obj.body, {
        headers: {
          'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${key}"`
        }
      });
    }

    if (url.pathname === '/api/docs/file' && request.method === 'DELETE') {
      const key = url.searchParams.get('key');
      if (!key) return new Response('Falta el parámetro key', { status: 400 });
      await env.DOCS_BUCKET.delete(key);
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
  },

  async scheduled(event, env, ctx) {
    const raw = await env.PM_KV.get('projects');
    const projects = raw ? (JSON.parse(raw).projects || []) : [];
    const html = buildWeeklySummaryHtml(projects);
    await sendEmail(env, {
      to: ['samuel.aiza@seidor.com'],
      cc: [],
      subject: `Resumen semanal CRM PresalesMX — ${new Date().toLocaleDateString('es-MX')}`,
      html
    });
  }
};
