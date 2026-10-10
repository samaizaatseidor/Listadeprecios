/* Saludo de bienvenida: animación a pantalla completa, una vez al día por persona y página WBR (la configura un administrador en Administración → Saludos). */
(function(){
  if(window.DL_SALUDO) return;
  var CSS = '.dls-ov{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(900px 560px at 50% 40%,rgba(30,91,184,.55),transparent 65%),radial-gradient(700px 500px at 85% 100%,rgba(139,124,255,.35),transparent 60%),#050A18;color:#fff;font-family:Poppins,"Segoe UI",sans-serif;cursor:pointer;opacity:0;animation:dlsIn .5s ease forwards;overflow:hidden}'+
  '.dls-ov.dls-out{animation:dlsOut .55s ease forwards}@keyframes dlsIn{to{opacity:1}}@keyframes dlsOut{from{opacity:1}to{opacity:0;transform:scale(1.03)}}'+
  '.dls-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(61,214,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(61,214,255,.07) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse at center,#000 0%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse at center,#000 0%,transparent 70%)}'+
  '.dls-ring{position:absolute;left:50%;top:50%;border-radius:50%;border:1px solid rgba(143,230,255,.35);transform:translate(-50%,-50%);pointer-events:none}'+
  '.dls-r1{width:min(78vmin,640px);height:min(78vmin,640px);border-style:dashed;animation:dlsSp 40s linear infinite}.dls-r2{width:min(58vmin,480px);height:min(58vmin,480px);border-color:rgba(61,214,255,.5);border-top-color:transparent;animation:dlsSp 9s linear infinite reverse}.dls-r3{width:min(40vmin,330px);height:min(40vmin,330px);border-color:rgba(139,124,255,.45);border-bottom-color:transparent;animation:dlsSp 6s linear infinite}'+
  '@keyframes dlsSp{to{transform:translate(-50%,-50%) rotate(360deg)}}'+
  '.dls-in{position:relative;text-align:center;max-width:min(900px,92vw)}'+
  '.dls-k{font-weight:700;font-size:clamp(12px,1.4vw,15px);letter-spacing:.42em;text-transform:uppercase;color:#8FE6FF;opacity:0;animation:dlsUp .7s .15s ease forwards}'+
  '.dls-k:after{content:"";display:block;width:0;height:2px;margin:14px auto 0;background:linear-gradient(90deg,transparent,#3DD6FF,transparent);animation:dlsLine 1s .5s ease forwards}'+
  '@keyframes dlsLine{to{width:min(320px,60vw)}}'+
  '.dls-m{margin:26px 0 0;font-weight:800;font-size:clamp(28px,5.2vw,64px);line-height:1.12;letter-spacing:-.01em}.dls-m span{display:inline-block;opacity:0;filter:blur(12px);transform:translateY(22px) scale(.96);animation:dlsW .75s cubic-bezier(.2,.8,.2,1) forwards;margin:0 .13em;background:linear-gradient(180deg,#fff 30%,#BFEFFF);-webkit-background-clip:text;background-clip:text;color:transparent}'+
  '@keyframes dlsW{to{opacity:1;filter:blur(0);transform:none}}@keyframes dlsUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'+
  '.dls-h{position:absolute;left:0;right:0;bottom:28px;text-align:center;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7D8FAE;opacity:0;animation:dlsUp .6s 1.8s ease forwards}'+
  '.dls-bar{position:absolute;left:0;bottom:0;height:3px;background:linear-gradient(90deg,#1E5BB8,#3DD6FF);width:0}'+
  '@media(prefers-reduced-motion:reduce){.dls-ring,.dls-m span,.dls-k,.dls-k:after,.dls-h{animation:none!important;opacity:1!important;filter:none!important;transform:none!important}.dls-k:after{width:200px}.dls-ov{animation-duration:.01s}}'+
  '@media print{.dls-ov{display:none!important}}';
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function mostrar(s, opt){
    opt = opt || {};
    return new Promise(function(fin){
      if(document.querySelector('.dls-ov')){ fin(); return; }
      if(!document.getElementById('dlsCss')){ var st = document.createElement('style'); st.id = 'dlsCss'; st.textContent = CSS; document.head.appendChild(st); }
      var palabras = String(s.mensaje || '').trim().split(/\s+/).filter(Boolean);
      var dur = Math.min(7000, Math.max(3600, 2200 + palabras.length * 260));
      var ov = document.createElement('div'); ov.className = 'dls-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Saludo de bienvenida'); ov.tabIndex = -1;
      ov.innerHTML = '<div class="dls-grid"></div><div class="dls-ring dls-r1"></div><div class="dls-ring dls-r2"></div><div class="dls-ring dls-r3"></div>' +
        '<div class="dls-in"><div class="dls-k">' + (function(){ var t = s.trato === 'a' ? 'Bienvenida' : s.trato === 'n' ? 'Hola' : 'Bienvenido'; return s.nombre ? t + ', ' + esc(s.nombre) : t; })() + '</div>' +
        '<p class="dls-m" aria-live="polite">' + palabras.map(function(w, i){ return '<span style="animation-delay:' + (700 + i * 150) + 'ms">' + esc(w) + '</span>'; }).join(' ') + '</p></div>' +
        '<div class="dls-h">Clic para continuar</div><div class="dls-bar"></div>';
      var prev = document.activeElement; document.body.appendChild(ov); ov.focus();
      var bar = ov.querySelector('.dls-bar'); bar.style.transition = 'width ' + dur + 'ms linear'; requestAnimationFrame(function(){ requestAnimationFrame(function(){ bar.style.width = '100%'; }); });
      var cerrado = false, t = setTimeout(cerrar, dur);
      function cerrar(){
        if(cerrado) return; cerrado = true; clearTimeout(t); document.removeEventListener('keydown', tecla, true);
        ov.classList.add('dls-out');
        setTimeout(function(){ ov.remove(); try{ if(prev && prev.focus) prev.focus(); }catch(e){} fin(); }, 560);
      }
      function tecla(e){ if(e.key === 'Escape' || e.key === 'Enter' || e.key === ' '){ e.preventDefault(); cerrar(); } }
      ov.addEventListener('click', cerrar); document.addEventListener('keydown', tecla, true);
    });
  }
  window.DL_SALUDO = { mostrar: mostrar };
  /* Automático: solo en páginas WBR y salvo que la página pida control manual (la pantalla de administración) */
  var m = location.pathname.replace(/\/+$/, '').match(/\/(wbr(?:-[a-z0-9-]+)?)(?:\.html)?$/i);
  if(!m || window.DL_SALUDO_MANUAL) return;
  var pagina = m[1].toLowerCase();
  fetch('/api/saludo?pagina=' + encodeURIComponent(pagina), { cache:'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
    if(!d || !d.saludo) return;
    var sa = d.saludo;
    mostrar(sa);
    fetch('/api/saludo', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ id:sa.id }) }).catch(function(){});
  }).catch(function(){});
})();
