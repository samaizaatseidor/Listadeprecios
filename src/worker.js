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

function splitConcatenatedJson(text) {
  // Extrae objetos JSON completos de un texto que puede venir con o sin
  // separadores "data:" / saltos de línea entre ellos.
  const objects = [];
  let depth = 0, start = -1, inString = false, escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}') { depth--; if (depth === 0 && start !== -1) { objects.push(text.slice(start, i + 1)); start = -1; } }
  }
  return objects;
}

const DELFOS_PROJECT_ID = 'a5485014-2353-4526-996b-d583b5f4adaf';
const DELFOS_MODEL_ID = 'gemini-3.1-pro-preview-GCP';
const DELFOS_TENANT = 'seidorcorpo';

async function getDelfosToken(env) {
  try {
    return env.DELFOS_API_TOKEN && typeof env.DELFOS_API_TOKEN.get === 'function'
      ? await env.DELFOS_API_TOKEN.get()
      : (typeof env.DELFOS_API_TOKEN === 'string' ? env.DELFOS_API_TOKEN : null);
  } catch (e) {
    return null;
  }
}

async function delfosUploadFile(token, sessionId, username, file) {
  const form = new FormData();
  form.append('project_id', DELFOS_PROJECT_ID);
  form.append('session_id', sessionId);
  form.append('username', username);
  form.append('message_id', crypto.randomUUID());
  form.append('files', file, file.name);
  form.append('tenant', DELFOS_TENANT);

  const resp = await fetch(`https://delfos-api.seidor.ai/api/v3/projects/${DELFOS_PROJECT_ID}/chat/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Origin': 'https://delfos.seidor.ai'
    },
    body: form
  });
  if (!resp.ok) throw new Error('Subida a Delfos falló: ' + await resp.text());
  const data = await resp.json();

  // La respuesta real de Delfos viene envuelta en { files: [ {...} ] }
  const entry = (data.files && data.files[0]) ? data.files[0] : data;
  const url = entry.short_url || entry.url || entry.blob_location || entry.location || entry.file_url;
  const fileRef = {
    filename: entry.filename || file.name,
    url,
    mimetype: entry.mimetype || entry.mime_type || file.type || 'application/octet-stream'
  };
  return fileRef;
}

function extractCompleteJsonObjects(text) {
  // Igual que splitConcatenatedJson, pero regresa también el sobrante sin cerrar
  // para poder seguir acumulando conforme llegan más datos del stream.
  const objects = [];
  let depth = 0, start = -1, inString = false, escape = false, lastCompleteEnd = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(text.slice(start, i + 1));
        lastCompleteEnd = i + 1;
        start = -1;
      }
    }
  }
  return { complete: objects, rest: text.slice(lastCompleteEnd) };
}

function ndjsonStream() {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  return {
    readable,
    write: (obj) => writer.write(encoder.encode(JSON.stringify(obj) + '\n')),
    close: () => writer.close()
  };
}

async function delfosStreamToClient(token, { sessionId, username, text, fileRef, useOnlineSearch }, out) {
  let resp;
  try {
    resp = await fetch('https://delfos-api.seidor.ai/api/v1/getCompletion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://delfos.seidor.ai'
      },
      body: JSON.stringify({
        text,
        project_id: DELFOS_PROJECT_ID,
        session_id: sessionId,
        username,
        detect_multi_query: false,
        user_common_name: username,
        language: 'es',
        streaming: true,
        message_id: crypto.randomUUID(),
        files: fileRef ? [fileRef] : [],
        premium_model: false,
        use_ragtool: false,
        use_onlinesearchtool: !!useOnlineSearch,
        tenant: DELFOS_TENANT,
        model_id: DELFOS_MODEL_ID
      })
    });
  } catch (e) {
    await out.write({ type: 'error', text: 'No se pudo conectar con Delfos: ' + String(e.message || e) });
    return;
  }

  if (!resp.ok) {
    await out.write({ type: 'error', text: 'Análisis de Delfos falló: ' + await resp.text() });
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { complete, rest } = extractCompleteJsonObjects(buffer);
    buffer = rest;

    for (const chunkStr of complete) {
      try {
        const obj = JSON.parse(chunkStr);
        const msg = obj.choices && obj.choices[0] && obj.choices[0].messages && obj.choices[0].messages[0];
        if (!msg || msg.content == null) continue;
        const content = msg.content;
        if (typeof content !== 'string') continue;
        const trimmed = content.trim();
        if (trimmed.startsWith('{') && trimmed.includes('"step"')) {
          try {
            const toolObj = JSON.parse(trimmed);
            if (toolObj.step && String(toolObj.step).endsWith('_start')) {
              await out.write({ type: 'status', text: toolObj.input || 'Consultando una herramienta externa…' });
            }
          } catch (e) { /* traza no parseable, se ignora */ }
          continue;
        }
        if (content) await out.write({ type: 'delta', text: content });
      } catch (e) { /* fragmento incompleto, se ignora */ }
    }
  }

  await out.write({ type: 'done' });
}

async function delfosGetCompletion(token, { sessionId, username, text, fileRef, useOnlineSearch }) {
  const resp = await fetch('https://delfos-api.seidor.ai/api/v1/getCompletion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${token}`,
      'Origin': 'https://delfos.seidor.ai'
    },
    body: JSON.stringify({
      text,
      project_id: DELFOS_PROJECT_ID,
      session_id: sessionId,
      username,
      detect_multi_query: false,
      user_common_name: username,
      language: 'es',
      streaming: true,
      message_id: crypto.randomUUID(),
      files: fileRef ? [fileRef] : [],
      premium_model: false,
      use_ragtool: false,
      use_onlinesearchtool: !!useOnlineSearch,
      tenant: DELFOS_TENANT,
      model_id: DELFOS_MODEL_ID
    })
  });
  if (!resp.ok) throw new Error('Análisis de Delfos falló: ' + await resp.text());

  const raw = await resp.text();
  const chunks = splitConcatenatedJson(raw);
  let full = '';
  for (const chunk of chunks) {
    try {
      const obj = JSON.parse(chunk);
      const msg = obj.choices && obj.choices[0] && obj.choices[0].messages && obj.choices[0].messages[0];
      if (!msg || msg.content == null) continue;
      const content = msg.content;
      // El contenido de un paso real de respuesta siempre es texto plano.
      // Los pasos internos de herramientas (búsqueda en línea, etc.) llegan como
      // objetos, o como texto que en realidad es un JSON de traza tipo
      // {"name":"serpapi_tool","step":"serpapi_tool_start"} — los descartamos.
      if (typeof content !== 'string') continue;
      const trimmed = content.trim();
      if (trimmed.startsWith('{') && trimmed.includes('"step"')) continue;
      full += content;
    } catch (e) { /* fragmento no parseable, se ignora */ }
  }
  return full;
}

const SOW_REVIEW_PROMPT = `Eres un revisor experto de propuestas comerciales SAP para SEIDOR, una consultora partner de SAP. Analiza el documento adjunto (puede ser un Statement of Work o una estimación económica) y responde en español, usando exactamente este formato con encabezados en mayúsculas:

RIESGOS IDENTIFICADOS
- (riesgos de alcance, técnicos o de ejecución que veas en el documento; si no hay, escribe "Ninguno identificado")

RIESGOS ECONÓMICOS
- (riesgos de precio, margen, horas mal dimensionadas, supuestos de facturación poco claros; si no hay, escribe "Ninguno identificado")

INFORMACIÓN FALTANTE
- (datos que deberían estar y no aparecen: fechas, supuestos, exclusiones, SLAs, forma de pago, etc.; si no hay, escribe "Ninguno identificado")

DISCREPANCIAS
- (inconsistencias internas del documento: alcance vs. horas cotizadas, entregables vs. cronograma, texto vs. tablas de precio, etc.; si no hay, escribe "Ninguna identificada")

SUPUESTOS Y EXCLUSIONES POCO CLAROS
- (supuestos que el documento da por hecho sin declararlos explícitamente, o exclusiones de alcance ambiguas que podrían generar disputas con el cliente; si no hay, escribe "Ninguno identificado")

SUGERENCIAS DE MEJORA
- (cambios concretos que harían la propuesta más sólida, clara o competitiva; si no hay, escribe "Ninguna")

Sé específico y, cuando puedas, cita o referencia partes concretas del documento.`;

const PROSPECTO_PROMPT = `Eres un asistente de investigación comercial para el equipo de ventas (AEs y BDRs) de SEIDOR, consultora partner de SAP en México. Investiga la empresa "{{EMPRESA}}" usando fuentes públicas disponibles y responde en español, usando exactamente este formato con encabezados en mayúsculas:

NOMBRE COMERCIAL
- 

RAZÓN SOCIAL
- (si no la encuentras con certeza, indícalo)

RFC
- (si no lo encuentras con certeza, indícalo — nunca inventes un RFC)

INDUSTRIA
- 

PRINCIPALES CONTACTOS O PERSONAS CLAVE
- (nombres y cargos de personas relevantes para una venta B2B: dirección general, TI, finanzas, operaciones, compras; si no encuentras nombres específicos, indica qué roles buscar)

QUÉ PODRÍA HACER SENTIDO DEL PORTAFOLIO SAP
- (qué soluciones SAP — S/4HANA, SuccessFactors, BTP, Analytics Cloud, etc. — encajarían mejor con esta empresa dado su tamaño, industria y posible madurez tecnológica, y cómo posicionarlo en una llamada o correo en frío)

VALUE DRIVERS PARA ENGANCHAR
- (los 3-5 argumentos de valor más relevantes para esta empresa específica: eficiencia operativa, cumplimiento fiscal, escalabilidad, reducción de costos, etc., adaptados a su contexto)

OTROS DATOS ÚTILES PARA LA LLAMADA
- (cualquier cosa adicional relevante: noticias recientes, expansión, cambios de liderazgo, retos del sector, competidores, tamaño aproximado de la empresa, presencia geográfica, etc.)

Si no encuentras información confiable sobre algún punto, dilo explícitamente en vez de inventar datos.`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/sow-review' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'No se recibió ningún archivo' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();
      const promptText = form.get('prompt') || SOW_REVIEW_PROMPT;

      const stream = ndjsonStream();
      ctx.waitUntil((async () => {
        try {
          const fileRef = await delfosUploadFile(token, sessionId, username, file);
          await delfosStreamToClient(token, { sessionId, username, text: promptText, fileRef, useOnlineSearch: false }, stream);
        } catch (e) {
          await stream.write({ type: 'error', text: String(e.message || e) });
        } finally {
          await stream.close();
        }
      })());
      return new Response(stream.readable, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }

    if (url.pathname === '/api/alta/extract' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const file = form.get('file');
      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'No se recibió ningún archivo' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const extractPrompt = `Analiza el documento adjunto (un SOW, propuesta o estimación comercial de SAP) y extrae SOLO estos datos, si están presentes. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, con exactamente estas llaves (usa null si un dato no aparece en el documento):

{
  "nombreComercial": "",
  "razonSocial": "",
  "rfc": "",
  "direccionFiscal": "",
  "nombreProyecto": "",
  "fechaInicio": "",
  "fechaFinal": "",
  "liderProyecto": ""
}

Las fechas deben ir en formato DD/MM/AAAA. No inventes datos que no estén en el documento.`;

      try {
        const fileRef = await delfosUploadFile(token, sessionId, username, file);
        const raw = await delfosGetCompletion(token, { sessionId, username, text: extractPrompt, fileRef, useOnlineSearch: false });
        const match = raw.match(/\{[\s\S]*\}/);
        const extracted = match ? JSON.parse(match[0]) : {};
        return new Response(JSON.stringify({ ok: true, extracted }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }
const MINUTAS_PROMPT = `Eres un asistente de Project Management para SEIDOR, consultora partner de SAP en México. Convierte las notas informales de una llamada de seguimiento de proyecto en una minuta estructurada. Responde en español, usando exactamente este formato con encabezados en mayúsculas:

ESTATUS GENERAL
- (Rojo/Amarillo/Verde y una frase justificando el color)

ACUERDOS
- (decisiones tomadas en la llamada)

PENDIENTES
- (tareas con responsable y fecha si se mencionan; si no hay responsable claro, dilo)

RIESGOS O TEMAS DE ATENCIÓN
- (cualquier riesgo, bloqueo o preocupación mencionada; si no hay, escribe "Ninguno identificado")

Sé conciso y no inventes nombres, fechas ni compromisos que no estén en las notas.`;

const CORREO_CLIENTE_PROMPT_BASE = `Eres un asistente de comunicación para Project Managers de SEIDOR, consultora partner de SAP en México. Ayuda a redactar un correo profesional y diplomático para un cliente, dada la siguiente situación:

{{SITUACION}}

Tipo de comunicación: {{TIPO}}
{{CLIENTE_LINE}}

Escribe EXACTAMENTE 2 opciones de correo con enfoques distintos (por ejemplo, uno más directo y otro más conciliador), en español, con este formato:

OPCIÓN 1 — [nombre corto del enfoque]
Asunto: ...
(cuerpo del correo)

OPCIÓN 2 — [nombre corto del enfoque]
Asunto: ...
(cuerpo del correo)

Sé profesional, claro, y evita sonar defensivo o culpar al cliente.`;

    if (url.pathname === '/api/minutas' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const notes = form.get('notes');
      const file = form.get('file');
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const stream = ndjsonStream();
      ctx.waitUntil((async () => {
        try {
          let fileRef = null;
          let text = MINUTAS_PROMPT;
          if (file && typeof file !== 'string') {
            fileRef = await delfosUploadFile(token, sessionId, username, file);
          } else if (notes) {
            text = MINUTAS_PROMPT + '\n\nNotas de la llamada:\n' + notes;
          }
          await delfosStreamToClient(token, { sessionId, username, text, fileRef, useOnlineSearch: false }, stream);
        } catch (e) {
          await stream.write({ type: 'error', text: String(e.message || e) });
        } finally {
          await stream.close();
        }
      })());
      return new Response(stream.readable, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }

    if (url.pathname === '/api/correo-cliente' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { situacion, tipo, cliente } = body;
      if (!situacion) return new Response(JSON.stringify({ ok: false, error: 'Falta describir la situación' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();
      const promptText = CORREO_CLIENTE_PROMPT_BASE
        .replace('{{SITUACION}}', situacion)
        .replace('{{TIPO}}', tipo || 'Actualización general')
        .replace('{{CLIENTE_LINE}}', cliente ? `Cliente: ${cliente}` : '');

      const stream = ndjsonStream();
      ctx.waitUntil(delfosStreamToClient(token, { sessionId, username, text: promptText, useOnlineSearch: false }, stream).catch(async e => {
        await stream.write({ type: 'error', text: String(e.message || e) });
      }).finally(() => stream.close()));
      return new Response(stream.readable, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }

    if (url.pathname === '/api/prospecto' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { companyName, prompt } = body;
      if (!companyName) return new Response(JSON.stringify({ ok: false, error: 'Falta el nombre de la empresa' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();
      const promptTextProspecto = (prompt || PROSPECTO_PROMPT).replace('{{EMPRESA}}', companyName);

      const stream = ndjsonStream();
      ctx.waitUntil(delfosStreamToClient(token, { sessionId, username, text: promptTextProspecto, useOnlineSearch: true }, stream).catch(async e => {
        await stream.write({ type: 'error', text: String(e.message || e) });
      }).finally(() => stream.close()));
      return new Response(stream.readable, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }

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

    if (url.pathname === '/api/proyecto-dashboard' && request.method === 'GET') {
      const raw = await env.PM_KV.get('proyecto_dashboard');
      return new Response(raw || '{"proyectos":[],"raid":[],"dependencias":[],"compromisos":[]}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/proyecto-dashboard' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
        if (!body || !Array.isArray(body.proyectos) || !Array.isArray(body.raid) || !Array.isArray(body.dependencias) || !Array.isArray(body.compromisos)) throw new Error('shape inválido');
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      await env.PM_KV.put('proyecto_dashboard', JSON.stringify({ ...body, updatedBy: email, updatedAt: new Date().toISOString() }));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/proyecto-resumen' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { proyecto, raid, dependencias, compromisos } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const resumenPrompt = `Eres un asistente de Project Management para SEIDOR, consultora partner de SAP en México. Con base en estos datos del proyecto "${proyecto}", escribe un resumen ejecutivo de 2 a 3 oraciones, en español, para un Steering Committee. Destaca el mayor riesgo o bloqueo si existe, y el estado general. Sé directo, no inventes información que no esté en los datos, y no uses encabezados ni viñetas, solo prosa corrida.

RAID:
${JSON.stringify(raid)}

DEPENDENCIAS CRÍTICAS:
${JSON.stringify(dependencias)}

COMPROMISOS:
${JSON.stringify(compromisos)}`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: resumenPrompt, useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/audit' && request.method === 'GET') {
      const raw = await env.PM_KV.get('audit_log');
      return new Response(raw || '{"entries":[]}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/audit' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { page, action, detail } = body;
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      const raw = await env.PM_KV.get('audit_log');
      let log = raw ? JSON.parse(raw) : { entries: [] };
      log.entries.push({ at: new Date().toISOString(), by: email, page: page || 'desconocida', action: action || '', detail: detail || '' });
      if (log.entries.length > 1000) log.entries = log.entries.slice(-1000);
      await env.PM_KV.put('audit_log', JSON.stringify(log));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/whoami') {
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      return new Response(JSON.stringify({ email }), { headers: { 'Content-Type': 'application/json' } });
    }

    const ALLOWED_DOC_EXT = ['ppt', 'pptx', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    const DOC_SECTIONS = ['Procesos', 'Templates de SOW', 'Calculadoras de estimación', 'Beneficios comerciales por tipo de deal'];

    if (url.pathname === '/api/documentos' && request.method === 'GET') {
      const raw = await env.PM_KV.get('documentos');
      let registry = raw ? JSON.parse(raw) : [];

      // Reconciliar con R2: cualquier archivo ya subido que no esté en el registro
      // (por ejemplo, subidos antes de tener este registro) aparece como "Sin clasificar".
      const listed = await env.DOCS_BUCKET.list();
      const registeredKeys = new Set(registry.filter(d => d.type === 'file').map(d => d.r2Key));
      const orphans = listed.objects
        .filter(o => !registeredKeys.has(o.key))
        .map(o => ({
          id: 'orphan-' + o.key,
          section: 'Sin clasificar',
          title: o.key,
          description: '',
          type: 'file',
          r2Key: o.key,
          size: o.size,
          uploadedBy: (o.customMetadata && o.customMetadata.uploadedBy) || 'desconocido',
          uploadedAt: o.uploaded
        }));

      return new Response(JSON.stringify({ documentos: registry.concat(orphans), sections: DOC_SECTIONS }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/documentos' && request.method === 'POST') {
      const form = await request.formData();
      const type = form.get('type');
      const section = form.get('section') || 'Sin clasificar';
      const title = form.get('title') || '';
      const description = form.get('description') || '';
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';

      const raw = await env.PM_KV.get('documentos');
      let registry = raw ? JSON.parse(raw) : [];

      if (type === 'link') {
        const linkUrl = form.get('url');
        if (!linkUrl) return new Response('Falta la liga', { status: 400 });
        registry.push({
          id: 'doc-' + Date.now().toString(36), section, title, description,
          type: 'link', url: linkUrl, uploadedBy: email, uploadedAt: new Date().toISOString()
        });
      } else {
        const file = form.get('file');
        if (!file || typeof file === 'string') return new Response('No se recibió ningún archivo', { status: 400 });
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_DOC_EXT.includes(ext)) {
          return new Response('Tipo de archivo no permitido. Solo PPT, PDF, Word o Excel.', { status: 400 });
        }
        const r2Key = Date.now().toString(36) + '-' + file.name;
        await env.DOCS_BUCKET.put(r2Key, file.stream(), {
          httpMetadata: { contentType: file.type || 'application/octet-stream' },
          customMetadata: { uploadedBy: email, uploadedAt: new Date().toISOString() }
        });
        registry.push({
          id: 'doc-' + Date.now().toString(36), section, title: title || file.name, description,
          type: 'file', r2Key, filename: file.name, size: file.size,
          uploadedBy: email, uploadedAt: new Date().toISOString()
        });
      }

      await env.PM_KV.put('documentos', JSON.stringify(registry));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/documentos' && request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Falta el id', { status: 400 });
      const raw = await env.PM_KV.get('documentos');
      let registry = raw ? JSON.parse(raw) : [];
      const entry = registry.find(d => d.id === id);
      if (entry && entry.type === 'file') {
        await env.DOCS_BUCKET.delete(entry.r2Key);
      } else if (id.startsWith('orphan-')) {
        await env.DOCS_BUCKET.delete(id.replace('orphan-', ''));
      }
      registry = registry.filter(d => d.id !== id);
      await env.PM_KV.put('documentos', JSON.stringify(registry));
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
