/* Asistente Delfos del portal — botón flotante + chat. Ve lo que el usuario ve en pantalla y el conocimiento del sitio (lo arma el Worker). */
(function(){
  if(window.top !== window || window.__dlAsistente) return; window.__dlAsistente = true;
  var PAGINA = (location.pathname.replace(/\/+$/,'').split('/').pop() || 'index').replace(/\.html$/i,'').toLowerCase() || 'index';
  var KEY = 'dl_chat_v1', MAX_HIST = 20, ocupado = false, abierto = false, msgs = [];
  try{ msgs = JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; }catch(e){ msgs = []; }
  function guardar(){ try{ sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-MAX_HIST))); }catch(e){} }

  var CSS = '.dl-fab{position:fixed;left:20px;bottom:20px;z-index:95;display:inline-flex;align-items:center;gap:9px;border:0;border-radius:999px;padding:11px 18px 11px 14px;background:linear-gradient(135deg,#1E5BB8,#3DD6FF);color:#fff;font:700 13px Poppins,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 10px 28px rgba(10,18,38,.45),0 0 0 1px rgba(255,255,255,.18) inset;transition:transform .15s ease,box-shadow .15s ease}.dl-fab:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(10,18,38,.55),0 0 22px rgba(61,214,255,.45)}.dl-fab svg{width:20px;height:20px;flex:none}'+
  '.dl-fab.dl-on{display:none}'+
  '.dl-panel{position:fixed;left:20px;bottom:20px;z-index:96;width:min(410px,calc(100vw - 24px));height:min(620px,calc(100vh - 40px));display:none;flex-direction:column;border-radius:20px;overflow:hidden;background:linear-gradient(170deg,#0E1E3F,#060C1B 70%);color:#E3ECFA;font:400 13.5px/1.5 Poppins,"Segoe UI",sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(143,230,255,.28)}.dl-panel.dl-on{display:flex;animation:dlIn .22s ease}.dl-panel *{box-sizing:border-box}@keyframes dlIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}'+
  '.dl-h{display:flex;align-items:center;gap:11px;padding:14px 14px 12px 16px;background:linear-gradient(120deg,rgba(30,91,184,.6),rgba(14,30,63,.2) 70%);border-bottom:1px solid rgba(255,255,255,.1)}.dl-h .dl-lg{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#1E5BB8,#3DD6FF);box-shadow:0 0 18px rgba(61,214,255,.4);flex:none}.dl-h .dl-lg svg{width:19px;height:19px;color:#fff}.dl-h b{display:block;font-size:14.5px;color:#fff;font-weight:700}.dl-h small{display:block;font-size:11px;color:#8FE6FF}.dl-h .dl-sp{flex:1;min-width:0}'+
  '.dl-ib{border:0;background:rgba(255,255,255,.08);color:#C4D2EA;width:30px;height:30px;border-radius:9px;cursor:pointer;font-size:14px;line-height:1}.dl-ib:hover{background:rgba(61,214,255,.2);color:#fff}'+
  '.dl-ctx{display:flex;align-items:center;gap:8px;padding:8px 16px;font-size:11.5px;color:#A5B4CE;border-bottom:1px solid rgba(255,255,255,.07);cursor:pointer;user-select:none}.dl-ctx input{accent-color:#3DD6FF;margin:0}'+
  '.dl-m{flex:1;overflow:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}'+
  '.dl-b{max-width:92%;padding:10px 13px;border-radius:15px;word-wrap:break-word;overflow-wrap:anywhere}.dl-b.u{align-self:flex-end;background:linear-gradient(135deg,#1E5BB8,#2F7FE0);color:#fff;border-bottom-right-radius:5px;white-space:pre-wrap}.dl-b.a{align-self:flex-start;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.09);border-bottom-left-radius:5px}.dl-b.a p{margin:0 0 7px}.dl-b.a p:last-child{margin:0}.dl-b.a ul{margin:4px 0 7px;padding-left:18px}.dl-b.a li{margin:2px 0}.dl-b.a a{color:#8FE6FF;text-decoration:underline}.dl-b.a code{background:rgba(255,255,255,.12);padding:1px 5px;border-radius:5px;font-size:12px}.dl-b.a b{color:#fff}.dl-b.err{background:rgba(255,92,122,.14);box-shadow:inset 0 0 0 1px rgba(255,92,122,.45);color:#FFD3DB}'+
  '.dl-dots{display:inline-flex;gap:4px;padding:4px 0}.dl-dots i{width:7px;height:7px;border-radius:50%;background:#8FE6FF;opacity:.4;animation:dlD 1s infinite}.dl-dots i:nth-child(2){animation-delay:.15s}.dl-dots i:nth-child(3){animation-delay:.3s}@keyframes dlD{50%{opacity:1;transform:translateY(-3px)}}'+
  '.dl-sg{display:flex;flex-wrap:wrap;gap:7px;padding:4px 14px 8px}.dl-sg button{border:1px solid rgba(143,230,255,.35);background:rgba(61,214,255,.08);color:#CFEFFF;border-radius:999px;padding:6px 12px;font:600 12px Poppins,"Segoe UI",sans-serif;cursor:pointer}.dl-sg button:hover{background:rgba(61,214,255,.22)}'+
  '.dl-f{display:flex;gap:8px;align-items:flex-end;padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.1);background:rgba(5,10,24,.5)}.dl-f textarea{flex:1;resize:none;max-height:110px;min-height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;padding:10px 12px;font:400 13.5px/1.4 Poppins,"Segoe UI",sans-serif}.dl-f textarea::placeholder{color:#8A97AC}.dl-f textarea:focus{outline:2px solid #3DD6FF;border-color:transparent}.dl-f button{border:0;border-radius:12px;width:42px;height:40px;background:linear-gradient(135deg,#1E5BB8,#3DD6FF);color:#fff;cursor:pointer;font-size:16px}.dl-f button:disabled{opacity:.5;cursor:wait}'+
  '.dl-n{padding:0 16px 10px;font-size:10.5px;color:#7D8FAE;background:rgba(5,10,24,.5)}'+
  '@media(max-width:520px){.dl-panel{left:8px;right:8px;bottom:8px;width:auto;height:calc(100vh - 16px)}.dl-fab span{display:none}.dl-fab{padding:12px}}@media print{.dl-fab,.dl-panel{display:none!important}}@media(prefers-reduced-motion:reduce){.dl-panel.dl-on,.dl-dots i{animation:none}}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'dl-fab'; fab.setAttribute('aria-label', 'Abrir el asistente Delfos'); fab.innerHTML = ICO + '<span>Pregúntale a Delfos</span>';
  var panel = document.createElement('div'); panel.className = 'dl-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Asistente Delfos');
  panel.innerHTML = '<div class="dl-h"><div class="dl-lg">' + ICO + '</div><div class="dl-sp"><b>Delfos · Asistente del portal</b><small>Responde con la información del sitio y de tu pantalla</small></div><button type="button" class="dl-ib" data-a="nuevo" title="Nueva conversación" aria-label="Nueva conversación">↺</button><button type="button" class="dl-ib" data-a="cerrar" title="Cerrar" aria-label="Cerrar">✕</button></div>' +
    '<label class="dl-ctx"><input type="checkbox" id="dlCtx" checked> Usar lo que veo en esta pantalla como contexto</label>' +
    '<div class="dl-m" id="dlM" aria-live="polite"></div><div class="dl-sg" id="dlSg"></div>' +
    '<form class="dl-f" id="dlF"><textarea id="dlT" rows="1" maxlength="1500" placeholder="Pregunta algo del portal o de esta pantalla…" aria-label="Tu pregunta"></textarea><button type="submit" id="dlS" aria-label="Enviar">➤</button></form>' +
    '<div class="dl-n">Delfos puede equivocarse: verifica las cifras importantes en el tablero.</div>';
  document.body.appendChild(fab); document.body.appendChild(panel);
  var M = panel.querySelector('#dlM'), T = panel.querySelector('#dlT'), F = panel.querySelector('#dlF'), S = panel.querySelector('#dlS'), SG = panel.querySelector('#dlSg'), CX = panel.querySelector('#dlCtx');

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* Markdown mínimo y seguro: negritas, código, listas con viñetas y enlaces internos del portal */
  function md(txt){
    var lines = esc(txt).split('\n'), out = [], lst = false, par = [];
    function inline(s){ return s.replace(/\[([^\]]+)\]\((\/[A-Za-z0-9_\-\/.#?=&]*)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
    function cierra(){ if(par.length){ out.push('<p>' + par.join('<br>') + '</p>'); par = []; } if(lst){ out.push('</ul>'); lst = false; } }
    lines.forEach(function(l){
      var m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if(m){ if(par.length){ out.push('<p>' + par.join('<br>') + '</p>'); par = []; } if(!lst){ out.push('<ul>'); lst = true; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else if(!l.trim()){ cierra(); }
      else { if(lst){ out.push('</ul>'); lst = false; } par.push(inline(l)); }
    });
    cierra(); return out.join('');
  }
  function burbuja(r, t, extra){ var d = document.createElement('div'); d.className = 'dl-b ' + r + (extra ? ' ' + extra : ''); if(r === 'u') d.textContent = t; else d.innerHTML = md(t); M.appendChild(d); M.scrollTop = M.scrollHeight; return d; }
  function render(){
    M.innerHTML = '';
    if(!msgs.length) burbuja('a', 'Hola, soy **Delfos**. Puedo explicarte cómo usar el portal, dónde está cada herramienta y lo que ves en esta pantalla.\n\nPregúntame, por ejemplo, por dónde empezar.');
    msgs.forEach(function(m){ burbuja(m.r, m.t, m.err ? 'err' : ''); });
    sugerencias();
  }
  function sugerencias(){
    var s = [];
    if(/^wbr-ejecutivo$/.test(PAGINA)) s = ['¿Qué requiere mi atención?', '¿Qué tableros están desactualizados?', 'Resume el pulso de la empresa'];
    else if(/^wbr-/.test(PAGINA)) s = ['Resume esta pantalla', '¿Qué debo atender primero?', '¿Cómo cargo el corte de la semana?', '¿Cómo envío esta vista por correo?'];
    else if(PAGINA === 'wbr') s = ['¿Qué tablero debo revisar primero?', '¿Qué es el Centro de Mando?', '¿Quién es dueño de cada tablero?'];
    else s = ['¿Qué hace esta página?', '¿Dónde encuentro la lista de precios?', '¿Cómo pido acceso a una página?'];
    SG.innerHTML = msgs.length > 2 ? '' : s.map(function(x){ return '<button type="button">' + esc(x) + '</button>'; }).join('');
  }
  SG.addEventListener('click', function(e){ var b = e.target.closest('button'); if(b) enviar(b.textContent); });

  function contexto(){
    if(!CX.checked) return '';
    try{
      var h = document.querySelector('header'), m = document.querySelector('main') || document.body, t = '';
      if(h) t += h.innerText + '\n';
      t += m.innerText;
      return t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').slice(0, 9000);
    }catch(e){ return ''; }
  }
  async function enviar(texto){
    texto = String(texto || '').trim(); if(!texto || ocupado) return;
    ocupado = true; S.disabled = true; T.value = ''; T.style.height = 'auto'; SG.innerHTML = '';
    var hist = msgs.filter(function(m){ return !m.err; }).slice(-6).map(function(m){ return { r:m.r, t:m.t }; });
    msgs.push({ r:'u', t:texto }); burbuja('u', texto);
    var b = burbuja('a', ''); b.innerHTML = '<span class="dl-dots"><i></i><i></i><i></i></span>';
    var acum = '', fallo = null;
    try{
      var r = await fetch('/api/asistente', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ pregunta:texto, pagina:PAGINA, titulo:(document.title || '').split('·')[0].trim(), contexto:contexto(), historial:hist }) });
      if(!r.ok){ var j = null; try{ j = await r.json(); }catch(e){} throw new Error((j && j.error) || (r.status === 403 ? 'No tienes acceso al asistente en esta página.' : 'El asistente no está disponible por ahora.')); }
      var rd = r.body.getReader(), dec = new TextDecoder(), buf = '';
      while(true){
        var x = await rd.read(); if(x.done) break; buf += dec.decode(x.value, { stream:true });
        var ls = buf.split('\n'); buf = ls.pop();
        ls.forEach(function(l){ if(!l.trim()) return; var o; try{ o = JSON.parse(l); }catch(e){ return; }
          if(o.type === 'delta'){ acum += o.text; b.innerHTML = md(acum); M.scrollTop = M.scrollHeight; }
          else if(o.type === 'error'){ fallo = o.text; } });
      }
      if(fallo && !acum) throw new Error('Delfos no pudo responder ahora. Intenta de nuevo en un momento.');
      if(!acum) throw new Error('No recibí respuesta. Intenta reformular la pregunta.');
      msgs.push({ r:'a', t:acum });
    }catch(e){
      b.className = 'dl-b a err'; b.textContent = e.message || 'Algo salió mal. Intenta de nuevo.'; msgs.push({ r:'a', t:b.textContent, err:true });
    }
    guardar(); ocupado = false; S.disabled = false; T.focus();
  }
  F.addEventListener('submit', function(e){ e.preventDefault(); enviar(T.value); });
  T.addEventListener('keydown', function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); enviar(T.value); } });
  T.addEventListener('input', function(){ T.style.height = 'auto'; T.style.height = Math.min(110, T.scrollHeight) + 'px'; });
  function abrir(){ abierto = true; panel.classList.add('dl-on'); fab.classList.add('dl-on'); render(); setTimeout(function(){ T.focus(); }, 60); }
  function cerrar(){ abierto = false; panel.classList.remove('dl-on'); fab.classList.remove('dl-on'); fab.focus(); }
  fab.addEventListener('click', abrir);
  panel.addEventListener('click', function(e){ var a = e.target.closest('[data-a]'); if(!a) return; if(a.getAttribute('data-a') === 'cerrar') cerrar(); else if(!ocupado){ msgs = []; guardar(); render(); } });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && abierto) cerrar(); });
})();
