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
const DELFOS_MODEL_ID = 'gemini-3-flash-preview-GCP'; // 3er y último modelo permitido sin probar — gpt-5.6-sol filtraba razonamiento, gpt-4.5-preview daba "No he podido procesar tu solicitud"
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

async function delfosStreamToClient(token, { sessionId, username, text, fileRefs, useOnlineSearch }, out) {
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
        files: fileRefs || [],
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

async function delfosGetCompletion(token, { sessionId, username, text, fileRefs, useOnlineSearch }) {
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
      files: fileRefs || [],
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

const PROSPECTO_PROMPT = `Eres un asistente de investigación comercial para el equipo de ventas (AEs y BDRs) de SEIDOR, consultora partner de SAP en México. Investiga la empresa "{{EMPRESA}}" usando fuentes públicas y responde en español, usando exactamente este formato con encabezados en mayúsculas.

PRIORIDAD DE FUENTES — búscalas en este orden y prefiere siempre la fuente más confiable disponible para cada dato:
Nivel 1 (máxima confianza): sitio web oficial de la empresa, su página de LinkedIn y las de sus directivos.
Nivel 2 (registros de gobierno): SAT (para verificar razón social/RFC), DENUE del INEGI, CompraNet o la Plataforma Nacional de Transparencia (si la empresa trabaja con gobierno), SIGER, y si cotiza en bolsa o es subsidiaria de una empresa pública, sus reportes 10-K o trimestrales (BMV o SEC EDGAR según corresponda).
Nivel 3 (cámaras y asociaciones del sector, solo si aplica al giro de la empresa): CANACINTRA, AMIA, CANIETI, CAINTRA — sus directorios de afiliados y reportes anuales.
Nivel 4 (prensa de negocios, para nombramientos recientes, voceros oficiales o entrevistas): El Economista, El Financiero, Expansión, Google News.
Evita blogs sin firma, directorios genéricos sin verificación, o páginas que agregan datos de terceros sin fuente propia.

Para cada dato importante que reportes (RFC, nombres de directivos, cifras, nombramientos recientes), indica entre paréntesis de qué fuente salió, por ejemplo: "(fuente: LinkedIn)" o "(fuente: El Economista, ago 2026)". Si un dato viene de una fuente de nivel 3 o 4, o si no pudiste verificarlo en más de una fuente, dilo explícitamente ("dato sin confirmar en fuente oficial").

NOMBRE COMERCIAL
- 

RAZÓN SOCIAL
- (si no la encuentras con certeza, indícalo)

RFC
- (si no lo encuentras con certeza, indícalo — nunca inventes un RFC; idealmente confirmado contra el SAT)

INDUSTRIA
- 

PRINCIPALES CONTACTOS O PERSONAS CLAVE
- (nombres y cargos de personas relevantes para una venta B2B: dirección general, TI, finanzas, operaciones, compras; cita la fuente de cada nombre — LinkedIn es la más confiable aquí; si no encuentras nombres específicos, indica qué roles buscar)

QUÉ PODRÍA HACER SENTIDO DEL PORTAFOLIO SAP
- (qué soluciones SAP — S/4HANA, SuccessFactors, BTP, Analytics Cloud, etc. — encajarían mejor con esta empresa dado su tamaño, industria y posible madurez tecnológica, y cómo posicionarlo en una llamada o correo en frío)

VALUE DRIVERS PARA ENGANCHAR
- (los 3-5 argumentos de valor más relevantes para esta empresa específica: eficiencia operativa, cumplimiento fiscal, escalabilidad, reducción de costos, etc., adaptados a su contexto)

OTROS DATOS ÚTILES PARA LA LLAMADA
- (cualquier cosa adicional relevante: noticias recientes, expansión, cambios de liderazgo, retos del sector, competidores, tamaño aproximado de la empresa, presencia geográfica, etc. — con su fuente)

FUENTES CONSULTADAS
- (lista las fuentes concretas que sí usaste para esta investigación, con el nivel de confianza de cada una: ej. "LinkedIn (empresa) — Nivel 1", "El Financiero, jul 2026 — Nivel 4". Si no encontraste nada útil en alguna categoría de fuente, no la incluyas aquí.)

Si no encuentras información confiable sobre algún punto, dilo explícitamente en vez de inventar datos.`;

/* ======================= ROLES Y PERMISOS ======================= */
// Correo con acceso de Admin garantizado siempre, sin importar lo que diga la
// configuración guardada — así una mala edición en /roles.html nunca puede
// dejar a todo el equipo (incluido este correo) sin poder entrar a arreglarlo.
const BOOTSTRAP_ADMIN = 'samuel.aiza@seidor.com';

const PAGINAS_REGISTRO = {
  'precios': 'Lista de Precios',
  'ficha': 'Ficha del Cliente',
  'prospecto': 'Investigación de Prospecto',
  'alta': 'Generador de Formato de Alta',
  'metricas-sap': 'Explicador de Métricas SAP',
  'kyc': 'Formularios KYC / Diligencia Debida',
  'contactos-sap': 'Contactos SAP',
  'pipeline': 'CRM PresalesMX',
  'documentos': 'Documentos de Apoyo',
  'kpis': 'Tablero de Control',
  'sow-review': 'Revisor de SOW y Estimaciones',
  'handover': 'Handover Comercial → Operaciones',
  'estimador': 'Estimador de Esfuerzo',
  'tecnicas-presentacion': 'Técnicas de Presentación',
  'dias-habiles': 'Días Hábiles México',
  'minutas': 'Generador de Minutas / Status',
  'correo-cliente': 'Redactor de Correos a Cliente',
  'proyecto': 'Dashboard de Proyecto',
  'checklist': 'Checklist de Quality Gates y Cutover',
  'iniciar-proyecto': 'Iniciar Proyecto desde SOW/DDA',
  'vista-general': 'Vista General del Proyecto',
  'reporte-cuenta': 'Reporte de Cuenta (QBR)',
  'cartera': 'Cartera Vencida',
  'wbr-finanzas': 'WBR — Finanzas',
  'wbr-ventas': 'WBR — Ventas & Pipeline',
  'wbr-operaciones': 'WBR — Operaciones',
  'wbr-productos': 'WBR — Target de Clientes',
  'wbr-bx': 'WBR — Business Experience',
  'wbr-ccflex': 'WBR — CCFlex',
  'wbr-cta': 'WBR — Call to Action',
  'wbr-anuncios': 'WBR — Anuncios',
  'auditoria': 'Auditoría',
  'agentes': 'Agentes',
};

async function getRolesConfig(env){
  const raw = await env.PM_KV.get('roles_config');
  const cfg = raw ? JSON.parse(raw) : {};
  return {
    admins: Array.isArray(cfg.admins) ? cfg.admins : [],
    roles: cfg.roles && typeof cfg.roles === 'object' ? cfg.roles : {},
    asignaciones: cfg.asignaciones && typeof cfg.asignaciones === 'object' ? cfg.asignaciones : {},
  };
}

function esAdmin(email, cfg){
  if (!email) return false;
  const lista = new Set([BOOTSTRAP_ADMIN, ...(cfg.admins||[])].map(e=>e.toLowerCase()));
  return lista.has(email.toLowerCase());
}

// 'completo' > 'lectura' > 'ninguno'. Sin rol asignado = 'completo' (compatibilidad
// hacia atrás: nadie pierde acceso el día que se activa este sistema, hasta que
// un Admin lo asigne explícitamente a un rol).
async function getPermiso(env, email, pageId){
  const cfg = await getRolesConfig(env);
  if (esAdmin(email, cfg)) return 'completo';
  const rolNombre = cfg.asignaciones[(email||'').toLowerCase()];
  if (!rolNombre) return 'completo';
  const rol = cfg.roles[rolNombre];
  if (!rol) return 'completo';
  const nivel = rol[pageId];
  return nivel || 'completo';
}

function pageIdFromReferer(request){
  const ref = request.headers.get('Referer') || '';
  try {
    const path = new URL(ref).pathname;
    const m = path.match(/\/([a-z0-9-]+)\.html$/i);
    return m ? m[1].toLowerCase() : null;
  } catch(e){ return null; }
}

const NIVEL_RANGO = { 'ninguno': 0, 'lectura': 1, 'completo': 2 };

// Llamar al inicio de cualquier endpoint que guarde o borre datos.
// Devuelve null si el usuario puede continuar, o una Response 403 lista para regresar.
async function requierePermiso(request, env, nivelMinimo){
  const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
  const pageId = pageIdFromReferer(request);
  if (!pageId) return null; // si no se puede determinar la página de origen, no se bloquea (evita falsos bloqueos)
  const permiso = await getPermiso(env, email, pageId);
  if (NIVEL_RANGO[permiso] >= NIVEL_RANGO[nivelMinimo]) return null;
  return new Response(JSON.stringify({ ok:false, error: 'No tienes permiso de edición para esta página. Pide a un Administrador que revise tu rol en Roles y Permisos.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
}
/* ==================== FIN ROLES Y PERMISOS ==================== */

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
          await delfosStreamToClient(token, { sessionId, username, text: promptText, fileRefs: [fileRef], useOnlineSearch: false }, stream);
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
        const raw = await delfosGetCompletion(token, { sessionId, username, text: extractPrompt, fileRefs: [fileRef], useOnlineSearch: false });
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
          await delfosStreamToClient(token, { sessionId, username, text, fileRefs: fileRef ? [fileRef] : [], useOnlineSearch: false }, stream);
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
      if (!raw) {
        return new Response('{"proyectos":[],"raid":[],"dependencias":[],"compromisos":[],"changeRequests":[]}', { headers: { 'Content-Type': 'application/json' } });
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.changeRequests)) parsed.changeRequests = [];
      return new Response(JSON.stringify(parsed), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/proyecto-dashboard' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try {
        body = await request.json();
        if (!body || !Array.isArray(body.proyectos) || !Array.isArray(body.raid) || !Array.isArray(body.dependencias) || !Array.isArray(body.compromisos)) throw new Error('shape inválido');
        if (!Array.isArray(body.changeRequests)) body.changeRequests = [];
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
      const { proyecto, raid, dependencias, compromisos, changeRequests } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const resumenPrompt = `Eres un asistente de Project Management para SEIDOR, consultora partner de SAP en México. Con base en estos datos del proyecto "${proyecto}", escribe un resumen ejecutivo de 2 a 3 oraciones, en español, para un Steering Committee. Destaca el mayor riesgo o bloqueo si existe, y el estado general. Sé directo, no inventes información que no esté en los datos, y no uses encabezados ni viñetas, solo prosa corrida.

RAID:
${JSON.stringify(raid)}

DEPENDENCIAS CRÍTICAS:
${JSON.stringify(dependencias)}

COMPROMISOS:
${JSON.stringify(compromisos)}

CHANGE REQUESTS:
${JSON.stringify(changeRequests || [])}`;

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

    if (url.pathname === '/api/audit-resumen' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { entries } = body;
      if (!Array.isArray(entries) || !entries.length) {
        return new Response(JSON.stringify({ ok: false, error: 'No hay actividad para resumir' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un asistente que resume bitácoras de actividad de un sitio interno de SEIDOR México. Con base en este log de acciones (más reciente primero), escribe un resumen en español, en prosa corrida (sin encabezados ni viñetas), de máximo 5 oraciones, agrupando por tipo de acción y destacando primero cualquier borrado masivo o de proyecto completo si lo hay. No inventes información que no esté en los datos.

LOG:
${JSON.stringify(entries)}`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/checklist' && request.method === 'GET') {
      const raw = await env.PM_KV.get('checklist_log');
      return new Response(raw || '{"progreso":{}}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/checklist' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try {
        body = await request.json();
        if (!body || typeof body.progreso !== 'object') throw new Error('shape inválido');
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      await env.PM_KV.put('checklist_log', JSON.stringify({ progreso: body.progreso, updatedBy: email, updatedAt: new Date().toISOString() }));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/checklist-resumen' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { proyecto, fases } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un asistente de PM para SEIDOR México. Con base en este avance de checklist de Quality Gates (metodología SAP Activate) del proyecto "${proyecto}", escribe un resumen ejecutivo de 2 a 3 oraciones, en español, en prosa corrida (sin encabezados ni viñetas). Destaca qué fase está más atrasada o con más pendientes críticos, y el estado general de preparación para cutover. No inventes información que no esté en los datos.

DATOS:
${JSON.stringify(fases)}`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/iniciar-proyecto/extract' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const sowFile = form.get('sow');
      const ddaFile = form.get('dda');
      const propuestaFile = form.get('propuesta');
      if (!sowFile || typeof sowFile === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'Falta el SOW' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const extractPrompt = `Analiza los documentos adjuntos de un proyecto de implementación SAP (un SOW obligatorio, y opcionalmente un DDA/Digital Discovery Assessment y/o una propuesta comercial/estimación). Extrae SOLO estos datos y responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown:

{
  "clienteNombre": "",
  "nombreProyecto": "",
  "alcanceResumen": "",
  "fueraDeAlcance": ["..."],
  "riesgos": [{"riesgo":"", "probabilidad":"", "impacto":"", "mitigacion":""}],
  "integraciones": [{"sistema":"", "descripcion":"", "direccion":"", "tecnologia":""}],
  "fases": [{"fase":"", "duracion":"", "fechas":"", "entregables":""}],
  "presupuestoHoras": [{"rol":"", "horas":""}],
  "inversionTotal": "",
  "moneda": ""
}

Usa "" o [] si un dato no aparece. No inventes información. Si el SOW tiene una tabla explícita de riesgos, úsala tal cual para "riesgos". Si tiene una tabla de integraciones o interfaces (RICEF/RICEFW), úsala para "integraciones". Si el SOW o la estimación tienen una tabla de equipo/esfuerzo con horas por rol o por consultor, úsala para "presupuestoHoras" (agrupa por rol si hay varias personas con el mismo rol, sumando sus horas).`;

      try {
        const fileRefs = [];
        fileRefs.push(await delfosUploadFile(token, sessionId, username, sowFile));
        if (ddaFile && typeof ddaFile !== 'string') fileRefs.push(await delfosUploadFile(token, sessionId, username, ddaFile));
        if (propuestaFile && typeof propuestaFile !== 'string') fileRefs.push(await delfosUploadFile(token, sessionId, username, propuestaFile));

        const raw = await delfosGetCompletion(token, { sessionId, username, text: extractPrompt, fileRefs, useOnlineSearch: false });
        const match = raw.match(/\{[\s\S]*\}/);
        const extracted = match ? JSON.parse(match[0]) : {};
        return new Response(JSON.stringify({ ok: true, extracted }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/estimador/public' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const ddaFile = form.get('dda');
      if (!ddaFile || typeof ddaFile === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'Falta el DDA' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Analiza este documento de SAP Cloud ERP Digital Discovery Assessment (DDA). Extrae la tabla de "Resumen" que lista prioridades empresariales / áreas funcionales junto con el número de "Posiciones en alcance" de cada una. Responde ÚNICAMENTE con un arreglo JSON válido, sin texto adicional, sin markdown, con este formato:

[{"area":"", "posiciones": 0}]

Incluye solo las áreas con posiciones mayores a 0. No inventes datos.`;

      try {
        const fileRef = await delfosUploadFile(token, sessionId, username, ddaFile);
        const raw = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [fileRef], useOnlineSearch: false });
        const match = raw.match(/\[[\s\S]*\]/);
        const areas = match ? JSON.parse(match[0]) : [];
        return new Response(JSON.stringify({ ok: true, areas }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/estimador/private' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const simplificationFile = form.get('simplification');
      const interfaceFile = form.get('interfaces');
      const customCodeFile = form.get('customCode');
      if (!simplificationFile || typeof simplificationFile === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'Falta el archivo de Simplification Items' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Analiza estos exports de SAP Readiness Check (Simplification Items obligatorio; Interface Impact Analysis y Custom Code Analysis opcionales si se adjuntaron). Cuenta y agrupa la información. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, con este formato:

{
  "simplificationItems": [{"area":"", "cantidad": 0}],
  "interfaces": [{"criticidad":"", "cantidad": 0}],
  "customCode": [{"severidad":"", "cantidad": 0}]
}

Para "simplificationItems", agrupa por área funcional/componente de aplicación. Para "interfaces", agrupa por criticidad si el archivo la indica (si no, usa "No especificada" con el total). Para "customCode", agrupa por severidad/prioridad de hallazgo si el archivo la indica. Si no se adjuntó el archivo de interfaces o de custom code, deja ese arreglo vacío []. No inventes datos.`;

      try {
        const fileRefs = [];
        fileRefs.push(await delfosUploadFile(token, sessionId, username, simplificationFile));
        if (interfaceFile && typeof interfaceFile !== 'string') fileRefs.push(await delfosUploadFile(token, sessionId, username, interfaceFile));
        if (customCodeFile && typeof customCodeFile !== 'string') fileRefs.push(await delfosUploadFile(token, sessionId, username, customCodeFile));

        const raw = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs, useOnlineSearch: false });
        const match = raw.match(/\{[\s\S]*\}/);
        const resultado = match ? JSON.parse(match[0]) : { simplificationItems: [], interfaces: [], customCode: [] };
        return new Response(JSON.stringify({ ok: true, resultado }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/resumen-cuenta' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { cliente, proyectos } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un asistente de Project Management para SEIDOR México. Con base en el estado de TODOS los proyectos activos del cliente "${cliente}", escribe un resumen ejecutivo de cuenta de 4 a 6 oraciones, en español, en prosa corrida (sin encabezados ni viñetas), pensado para una revisión trimestral de negocio (QBR) con dirección. Cubre: salud general de la cuenta en conjunto, cuál proyecto está más en riesgo o más atrasado si alguno destaca, y el panorama de Change Requests pendientes. No inventes información que no esté en los datos.

PROYECTOS DEL CLIENTE:
${JSON.stringify(proyectos || [])}`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/handover-extraer' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const sowFile = form.get('sow');
      const estimacionFile = form.get('estimacion');
      if (!sowFile || typeof sowFile === 'string') {
        return new Response(JSON.stringify({ ok: false, error: 'Falta el SOW' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Analiza el/los documento(s) adjuntos de un proyecto de implementación SAP: un SOW obligatorio, y opcionalmente una Estimación/propuesta económica interna. Extrae la información para un documento de Handover de Preventa a Operaciones. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, con este formato EXACTO (usa "" o [] cuando un dato no aparezca en los documentos — no inventes):

{
  "clienteNombre": "",
  "tipoProyecto": "",
  "solucionSAP": "",
  "modalidadEntrega": "",
  "inversionTotal": "",
  "moneda": "",
  "plazoEstimado": "",
  "problemaCliente": "",
  "objetivoProyecto": "",
  "contextoRelevante": "",
  "alcance": { "modulosFuncionalidades":"", "desarrollosRicefw":"", "integracionesAlcance":"", "migracionDatos":"", "usuariosLicencias":"", "localizacionMX":"", "gestionCambio":"", "entornos":"", "amsSoporte":"" },
  "exclusiones": "",
  "supuestos": ["", "", ""],
  "fechaInicioKickoff": "",
  "fechaGoLive": "",
  "hitosFacturacion": [{"mes":"", "fase":"", "entregable":"", "monto":"", "porcentaje":"", "condicion":""}],
  "condicionesPago": { "dias":"", "forma":"", "requiereOC":"" },
  "tecnico": { "erpActual":"", "versionActual":"", "versionObjetivo":"", "deploymentModel":"", "landscape":"", "middleware":"", "pac":"", "solucionesAdicionales":"", "notasTecnicas":"" },
  "integracionesDetectadas": [{"sistema":"", "descripcion":""}],
  "datosMigrar": { "cuentasContables":"", "clientes":"", "proveedores":"", "materiales":"", "activosFijos":"", "centrosCosto":"" },
  "valorVentaMXN": "",
  "costoInternoMXN": "",
  "margenBruto": "",
  "tipoCambio": ""
}

"tipoProyecto" debe ser algo como "Implementación", "AMS", "Upgrade", etc. "modalidadEntrega": "Remoto", "Híbrido" o "Presencial" si el documento lo indica. Los campos "valorVentaMXN", "costoInternoMXN", "margenBruto" solo se pueden extraer de una Estimación/propuesta económica interna, NO de un SOW comercial — si no se adjuntó ese documento, deja esos tres en "".`;

      try {
        const fileRefs = [];
        fileRefs.push(await delfosUploadFile(token, sessionId, username, sowFile));
        if (estimacionFile && typeof estimacionFile !== 'string') fileRefs.push(await delfosUploadFile(token, sessionId, username, estimacionFile));

        const raw = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs, useOnlineSearch: false });
        const match = raw.match(/\{[\s\S]*\}/);
        const extraido = match ? JSON.parse(match[0]) : null;
        if (!extraido) throw new Error('No se pudo interpretar la respuesta');
        return new Response(JSON.stringify({ ok: true, extraido }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/revisor-cronograma' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { proyecto, tareas, hallazgosDuros, rutaCritica } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const listaTareas = (tareas || []).map(t => `- ${t.nombre}${t.fase ? ' (' + t.fase + ')' : ''}: ${t.inicio || '?'} → ${t.fin || '?'}${t.hito ? ' [HITO]' : ''}`).join('\n');
      const prompt = `Eres un Project Manager senior de proyectos de implementación SAP revisando el cronograma del proyecto "${proyecto}". Aquí está la lista de tareas (nombre, fase, fechas):\n\n${listaTareas}\n\nHallazgos técnicos ya detectados automáticamente (fechas, traslapes):\n${(hallazgosDuros||[]).join('\n') || 'Ninguno'}\n\nTareas en la ruta crítica (sin holgura): ${(rutaCritica||[]).join(', ') || 'Ninguna detectada'}\n\nEscribe un resumen ejecutivo breve (máximo 120 palabras, en español, tono directo) para el Gerente de Proyecto, que incluya: 1) si faltan hitos típicos de un proyecto SAP (Fit-to-Standard, UAT, Cutover, Hypercare, Go-Live) que no aparecen en la lista, 2) si alguna duración se ve claramente fuera de rango para el tipo de tarea, 3) un comentario sobre los hallazgos técnicos ya detectados. No repitas la lista de tareas. Responde solo con el texto del resumen, sin markdown ni encabezados.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/metricas-sap' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      const form = await request.formData();
      const texto = form.get('texto');
      const imagen = form.get('imagen');
      if ((!texto || !String(texto).trim()) && (!imagen || typeof imagen === 'string')) {
        return new Response(JSON.stringify({ ok: false, error: 'Falta el texto o la captura de pantalla' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const promptBase = `Eres un experto en licenciamiento y métricas de consumo de SAP Cloud (SAP Cloud ALM, S/4HANA Cloud, BTP, y demás soluciones de nube pública de SAP). Te voy a dar una lista de métricas de consumo tal como aparecen en un tablero de SAP Cloud ALM (nombre y/o código, por ejemplo "C415", "CP228 - Transactions - SAP Integration Suite"). Para CADA métrica, busca en documentación pública de SAP (SAP Help Portal, SAP Notes, documentación de licenciamiento) y responde ÚNICAMENTE con un arreglo JSON válido, sin texto adicional, sin markdown, con este formato exacto:

[{"codigo":"", "nombre":"", "queMide":"", "comoInterpretar":"", "producto":"", "confianza":"alta|media|baja"}]

"queMide": explicación clara para alguien no técnico, 1-2 oraciones. "comoInterpretar": qué significan columnas como Suscrito/Medido/Delta para ESTA métrica en particular. "producto": el producto o componente SAP al que pertenece (ej. "S/4HANA Cloud Public Edition", "SAP Integration Suite"). "confianza": "alta" si encontraste documentación pública clara y específica sobre ese código/métrica, "media" si es una inferencia razonable basada en el nombre y tu conocimiento general, "baja" si no encontraste nada confiable y estás adivinando por el nombre — en ese caso sé honesto, no inventes detalles específicos que no puedas sustentar.

${texto && String(texto).trim() ? 'MÉTRICAS A EXPLICAR (una por línea o separadas por coma):\n' + texto : 'Las métricas a explicar están en la captura de pantalla adjunta, de un tablero de consumo de SAP Cloud ALM. Lee los nombres y códigos visibles en la imagen y explica cada fila que encuentres.'}`;

      const fileRefs = [];
      if (imagen && typeof imagen !== 'string') {
        try {
          fileRefs.push(await delfosUploadFile(token, sessionId, username, imagen));
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: 'No se pudo subir la imagen: ' + String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
        }
      }

      const stream = ndjsonStream();
      ctx.waitUntil(delfosStreamToClient(token, { sessionId, username, text: promptBase, fileRefs, useOnlineSearch: true }, stream).catch(async e => {
        await stream.write({ type: 'error', text: String(e.message || e) });
      }).finally(() => stream.close()));
      return new Response(stream.readable, { headers: { 'Content-Type': 'application/x-ndjson' } });
    }

    if (url.pathname === '/api/wbs' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbs_log');
      return new Response(raw || '{"proyectos":{}}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbs' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try {
        body = await request.json();
        if (!body || typeof body.proyecto !== 'string' || !Array.isArray(body.tareas)) throw new Error('shape inválido');
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      const raw = await env.PM_KV.get('wbs_log');
      const store = raw ? JSON.parse(raw) : { proyectos: {} };
      store.proyectos[body.proyecto] = { tareas: body.tareas, guardadoPor: email, guardadoAt: new Date().toISOString() };
      await env.PM_KV.put('wbs_log', JSON.stringify(store));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbs-generar' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { proyecto, alcanceResumen, fases, integraciones, presupuestoHoras } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un Project Manager experto en implementaciones SAP bajo la metodología SAP Activate (Prepare, Explore, Realize, Deploy, Run). Con base en el alcance, fases e integraciones de este proyecto, genera un desglose de tareas (WBS) razonable y concreto. Responde ÚNICAMENTE con un arreglo JSON válido, sin texto adicional, sin markdown, con este formato exacto:

[{"fase":"Prepare","tarea":"","entregable":"","rolResponsable":"","duracionEstimada":""}]

Usa como fases: Prepare, Explore, Realize, Deploy, Cutover, Run. Genera entre 3 y 6 tareas por fase, concretas y accionables (no genéricas), considerando el alcance e integraciones dados. "duracionEstimada" debe ser texto corto como "3 días" o "1 semana". "rolResponsable" debe ser un rol típico de un proyecto SAP (ej. "PM", "Consultor Funcional FI", "Consultor Técnico BASIS", "Arquitecto de Integración"). No inventes texto genérico tipo "Tarea 1" — basa cada tarea en el alcance real dado.

ALCANCE:
${alcanceResumen || 'No especificado'}

FASES DEL SOW:
${JSON.stringify(fases || [])}

INTEGRACIONES:
${JSON.stringify(integraciones || [])}

PRESUPUESTO DE HORAS POR ROL:
${JSON.stringify(presupuestoHoras || [])}`;

      try {
        const raw = await delfosGetCompletion(token, { sessionId, username, text: prompt, useOnlineSearch: false });
        const match = raw.match(/\[[\s\S]*\]/);
        const tareas = match ? JSON.parse(match[0]) : [];
        return new Response(JSON.stringify({ ok: true, tareas }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/consumo-horas' && request.method === 'GET') {
      const raw = await env.PM_KV.get('consumo_horas');
      return new Response(raw || '{"proyectos":{}}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/consumo-horas' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try {
        body = await request.json();
        if (!body || typeof body.proyecto !== 'string' || typeof body.datos !== 'object') throw new Error('shape inválido');
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      const raw = await env.PM_KV.get('consumo_horas');
      const store = raw ? JSON.parse(raw) : { proyectos: {} };
      store.proyectos[body.proyecto] = { ...body.datos, guardadoPor: email, guardadoAt: new Date().toISOString() };
      await env.PM_KV.put('consumo_horas', JSON.stringify(store));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/linea-base' && request.method === 'GET') {
      const raw = await env.PM_KV.get('lineas_base');
      return new Response(raw || '{"proyectos":{}}', { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/linea-base' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try {
        body = await request.json();
        if (!body || typeof body.proyecto !== 'string' || typeof body.datos !== 'object') throw new Error('shape inválido');
      } catch (e) {
        return new Response('JSON inválido', { status: 400 });
      }
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      const raw = await env.PM_KV.get('lineas_base');
      const store = raw ? JSON.parse(raw) : { proyectos: {} };
      store.proyectos[body.proyecto] = { ...body.datos, guardadoPor: email, guardadoAt: new Date().toISOString() };
      await env.PM_KV.put('lineas_base', JSON.stringify(store));
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/resumen-general' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { proyecto, lineaBase, raid, dependencias, compromisos, changeRequests, checklist } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un asistente de Project Management para SEIDOR México. Con base en TODO el estado del proyecto "${proyecto}" (línea base contractual, RAID, dependencias críticas, compromisos, change requests, y avance del checklist de Quality Gates), escribe un resumen ejecutivo de 4 a 6 oraciones, en español, en prosa corrida (sin encabezados ni viñetas), para presentar a un Steering Committee o dirección. Cubre: salud general del proyecto, el riesgo o bloqueo más importante si existe, estado de change requests pendientes, y qué tan listo está para su siguiente fase o para cutover según el checklist. No inventes información que no esté en los datos.

LÍNEA BASE:
${JSON.stringify(lineaBase || {})}

RAID:
${JSON.stringify(raid || [])}

DEPENDENCIAS CRÍTICAS:
${JSON.stringify(dependencias || [])}

COMPROMISOS:
${JSON.stringify(compromisos || [])}

CHANGE REQUESTS:
${JSON.stringify(changeRequests || [])}

AVANCE DE CHECKLIST (Quality Gates):
${JSON.stringify(checklist || [])}`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/backup-completo' && request.method === 'GET') {
      const keys = ['projects', 'documentos', 'proyecto_dashboard', 'checklist_log', 'lineas_base', 'consumo_horas', 'audit_log'];
      const backup = { generadoEn: new Date().toISOString(), generadoPor: request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido' };
      for (const key of keys) {
        const raw = await env.PM_KV.get(key);
        backup[key] = raw ? JSON.parse(raw) : null;
      }
      const fecha = new Date().toISOString().slice(0,10);
      const rawAudit = await env.PM_KV.get('audit_log');
      const auditStore = rawAudit ? JSON.parse(rawAudit) : { entries: [] };
      auditStore.entries.push({ at: new Date().toISOString(), by: backup.generadoPor, page: 'Auditoría', action: 'Descargó respaldo completo de KV', detail: '' });
      if (auditStore.entries.length > 1000) auditStore.entries = auditStore.entries.slice(-1000);
      await env.PM_KV.put('audit_log', JSON.stringify(auditStore));

      return new Response(JSON.stringify(backup, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="Respaldo KV - ${fecha}.json"`
        }
      });
    }

    if (url.pathname === '/api/contactos-sap' && request.method === 'GET') {
      const raw = await env.PM_KV.get('contactos_sap');
      const data = raw ? JSON.parse(raw) : { personas: [] };
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/contactos-sap' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      let personas = Array.isArray(body.personas) ? body.personas : [];

      // Solo un Admin puede borrar contactos. Si quien guarda no lo es, cualquier
      // contacto que existía antes y ya no viene en la lista nueva se restaura,
      // sin bloquear el resto de los cambios (ediciones/altas sí se guardan).
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
      const cfgRoles = await getRolesConfig(env);
      let restaurados = [];
      if (!esAdmin(email, cfgRoles)) {
        const rawAnterior = await env.PM_KV.get('contactos_sap');
        const anteriores = rawAnterior ? (JSON.parse(rawAnterior).personas || []) : [];
        const idsNuevos = new Set(personas.map(p => p.id));
        const borrados = anteriores.filter(p => !idsNuevos.has(p.id));
        restaurados = borrados.map(p => p.nombre);
        personas = personas.concat(borrados);
      }

      await env.PM_KV.put('contactos_sap', JSON.stringify({ personas }));
      return new Response(JSON.stringify({ ok: true, restaurados }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-finanzas' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_finanzas_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-finanzas' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_finanzas_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();

      // Si ya existe un snapshot con la misma fecha de revisión, se reemplaza (re-subieron el mismo corte)
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52); // ~1 año de historial semanal

      await env.PM_KV.put('wbr_finanzas_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-finanzas-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista financiero senior presentando el Weekly Business Review de Finanzas de SEIDOR México a la dirección. Aquí está el corte de facturación, cobranza y aging de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Y el corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados) que compare el corte actual contra el anterior, destaque riesgos de cartera vencida, y dé una recomendación accionable. Sé específico con números, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/wbr-ventas' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_ventas_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-ventas' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_ventas_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52);

      await env.PM_KV.put('wbr_ventas_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-ventas-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista comercial senior presentando el Weekly Business Review de SEIDOR México a la dirección. Aquí está el corte de Ventas & Pipeline de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Y el corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados) que cubra: 1) qué cambió respecto a la semana anterior (deals que se movieron de etapa, se ganaron, se perdieron o cambiaron de trimestre, si hay corte anterior), 2) qué tan cerca están de la meta de ventas y pipeline del trimestre, 3) qué oportunidades necesitan atención esta semana (por fecha de cierre próxima o por llevar mucho tiempo estancadas), 4) una recomendación accionable. Sé específico con nombres de clientes y montos, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }


    if (url.pathname === '/api/wbr-operaciones' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_operaciones_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-operaciones' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_operaciones_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52);

      await env.PM_KV.put('wbr_operaciones_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-operaciones-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista de operaciones senior presentando el Weekly Business Review de SEIDOR México a la dirección. Aquí está el detalle de proyectos por LOB (línea de negocio).\n\nCorte de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados), específico con números y nombres, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/wbr-productos' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_productos_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-productos' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_productos_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52);

      await env.PM_KV.put('wbr_productos_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-productos-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista comercial senior presentando el Weekly Business Review de Target de Clientes por LOB de SEIDOR México a la dirección.\n\nCorte de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados), específico con números y nombres, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/wbr-ccflex' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_ccflex_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-ccflex' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_ccflex_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52);

      await env.PM_KV.put('wbr_ccflex_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-ccflex-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista financiero senior presentando el Weekly Business Review del programa CCFlex (ventas y cobranza, C&S vs A&O) de SEIDOR México a la dirección. El "monto vendido" es el TCV, el resto son comisiones.\n\nCorte de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados), específico con números y nombres, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/wbr-bx' && request.method === 'GET') {
      const raw = await env.PM_KV.get('wbr_bx_historial');
      const historial = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ ok: true, historial }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-bx' && request.method === 'POST') {
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const snapshot = body.snapshot;
      if (!snapshot) return new Response(JSON.stringify({ ok:false, error:'Falta el snapshot' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

      const raw = await env.PM_KV.get('wbr_bx_historial');
      let historial = raw ? JSON.parse(raw) : [];
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || 'desconocido';
      snapshot.guardadoPor = email;
      snapshot.guardadoEn = new Date().toISOString();
      historial = historial.filter(h => h.fechaRevision !== snapshot.fechaRevision);
      historial.push(snapshot);
      historial.sort((a,b) => new Date(a.fechaRevision) - new Date(b.fechaRevision));
      if (historial.length > 52) historial = historial.slice(historial.length - 52);

      await env.PM_KV.put('wbr_bx_historial', JSON.stringify(historial));
      return new Response(JSON.stringify({ ok: true, totalSnapshots: historial.length }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/wbr-bx-insight' && request.method === 'POST') {
      const token = await getDelfosToken(env);
      if (!token) return new Response(JSON.stringify({ ok: false, error: 'Falta configurar DELFOS_API_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      let body;
      try { body = await request.json(); } catch (e) { return new Response('JSON inválido', { status: 400 }); }
      const { actual, anterior } = body;
      const username = request.headers.get('Cf-Access-Authenticated-User-Email') || 'usuario-crm';
      const sessionId = crypto.randomUUID();

      const prompt = `Eres un analista de Business Experience senior presentando el Weekly Business Review de renovaciones, CCFlex, oportunidades y riesgo de churn de SEIDOR México a la dirección.\n\nCorte de esta semana (${actual.fechaRevision}):\n\n${JSON.stringify(actual, null, 2)}\n\n${anterior ? `Corte de la semana anterior (${anterior.fechaRevision}) para comparar:\n\n${JSON.stringify(anterior, null, 2)}` : 'No hay un corte anterior todavía para comparar — es el primer registro.'}\n\nEscribe un resumen ejecutivo en español (máximo 180 palabras, tono directo, sin markdown ni encabezados), específico con números y nombres, no genérico.`;

      try {
        const resumen = await delfosGetCompletion(token, { sessionId, username, text: prompt, fileRefs: [], useOnlineSearch: false });
        return new Response(JSON.stringify({ ok: true, resumen: resumen.trim() }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }
    }

    if (url.pathname === '/api/mi-permiso' && request.method === 'GET') {
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
      const pageId = url.searchParams.get('page');
      if (!pageId) return new Response(JSON.stringify({ ok:false, error:'Falta el parámetro page' }), { status:400, headers:{'Content-Type':'application/json'} });
      const cfg = await getRolesConfig(env);
      const permiso = await getPermiso(env, email, pageId);
      return new Response(JSON.stringify({ ok:true, permiso, esAdmin: esAdmin(email, cfg), email }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/roles-config' && request.method === 'GET') {
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
      const cfg = await getRolesConfig(env);
      if (!esAdmin(email, cfg)) return new Response(JSON.stringify({ ok:false, error:'Solo un Administrador puede ver esto.' }), { status:403, headers:{'Content-Type':'application/json'} });
      return new Response(JSON.stringify({ ok:true, ...cfg, paginas: PAGINAS_REGISTRO, bootstrapAdmin: BOOTSTRAP_ADMIN }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/roles-config' && request.method === 'POST') {
      const email = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
      const cfgActual = await getRolesConfig(env);
      if (!esAdmin(email, cfgActual)) return new Response(JSON.stringify({ ok:false, error:'Solo un Administrador puede guardar esto.' }), { status:403, headers:{'Content-Type':'application/json'} });
      let body;
      try { body = await request.json(); } catch(e){ return new Response('JSON inválido', { status:400 }); }
      const nuevaCfg = {
        admins: Array.isArray(body.admins) ? body.admins : [],
        roles: body.roles && typeof body.roles === 'object' ? body.roles : {},
        asignaciones: body.asignaciones && typeof body.asignaciones === 'object' ? body.asignaciones : {},
      };
      await env.PM_KV.put('roles_config', JSON.stringify(nuevaCfg));
      return new Response(JSON.stringify({ ok:true }), { headers: { 'Content-Type': 'application/json' } });
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
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
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
      { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
      const emailBorra = request.headers.get('Cf-Access-Authenticated-User-Email') || null;
      const cfgRolesDocs = await getRolesConfig(env);
      if (!esAdmin(emailBorra, cfgRolesDocs)) {
        return new Response(JSON.stringify({ ok:false, error:'Solo un Administrador puede borrar documentos. Pídele a uno que lo haga, o revisa Roles y Permisos.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
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
        { const _bloqueo = await requierePermiso(request, env, 'completo'); if (_bloqueo) return _bloqueo; }
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
