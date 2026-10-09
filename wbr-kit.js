/* ============================================================================
   WBR Kit — componentes visuales compartidos de los tableros WBR
   Un solo archivo: inyecta sus estilos y expone window.WK (formatos, tablas
   ordenables, KPIs, barras, tendencias, cascada). Sin dependencias.
   ========================================================================== */
(function(){
'use strict';

var CSS = [
':root{--wk-navy:#0A1226;--wk-navy2:#0E1E3F;--wk-blue:#1E5BB8;--wk-cyan:#33B4DD;--wk-cyan-l:#6FD3F0;--wk-ink:#16223A;--wk-grey:#5E6B82;--wk-greyl:#8A97AC;--wk-line:#E3EAF3;--wk-bg:#F4F8FC;--wk-green:#1F8A4C;--wk-amber:#D8A63A;--wk-red:#B23A3A;--wk-shadow:0 1px 2px rgba(14,30,63,.06),0 8px 24px rgba(14,30,63,.07);}',
'.wk-main{max-width:none!important;margin:0!important;padding:20px 24px 64px!important;}',

/* barra de navegación por secciones */
'.wk-nav{position:sticky;top:0;z-index:30;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px 24px;margin:0 -24px 18px;background:rgba(244,248,252,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--wk-line);}',
'.wk-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;border:1px solid var(--wk-line);background:#fff;color:var(--wk-navy2);font:600 12.5px Poppins,"Segoe UI",sans-serif;text-decoration:none;cursor:pointer;transition:all .15s;}',
'.wk-chip:hover{border-color:var(--wk-cyan);color:var(--wk-blue);transform:translateY(-1px);}',
'.wk-chip.on{background:var(--wk-navy2);border-color:var(--wk-navy2);color:#fff;}',
'.wk-chip small{opacity:.7;font-weight:600;}',

/* KPIs */
'.wk-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:18px;}',
'.wk-kpi{position:relative;background:#fff;border-radius:16px;padding:18px 20px 16px;box-shadow:var(--wk-shadow);overflow:hidden;border:1px solid var(--wk-line);}',
'.wk-kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--wk-blue);}',
'.wk-kpi.wk-t-green:before{background:var(--wk-green);} .wk-kpi.wk-t-amber:before{background:var(--wk-amber);} .wk-kpi.wk-t-red:before{background:var(--wk-red);} .wk-kpi.wk-t-cyan:before{background:var(--wk-cyan);}',
'.wk-kpi-top{display:flex;justify-content:space-between;align-items:center;gap:8px;}',
'.wk-kpi-label{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--wk-greyl);}',
'.wk-kpi-ico{font-size:18px;opacity:.9;}',
'.wk-kpi-val{font-size:34px;line-height:1.1;font-weight:800;color:var(--wk-navy2);margin:8px 0 2px;letter-spacing:-.5px;}',
'.wk-kpi-val small{font-size:15px;font-weight:600;color:var(--wk-grey);margin-left:4px;letter-spacing:0;}',
'.wk-kpi-sub{font-size:12.5px;color:var(--wk-grey);min-height:18px;}',
'.wk-kpi-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;min-height:30px;}',
'.wk-bar{height:8px;border-radius:99px;background:#E6EDF6;overflow:hidden;margin-top:12px;}',
'.wk-bar>i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--wk-blue),var(--wk-cyan));}',
'.wk-bar.wk-t-green>i{background:linear-gradient(90deg,#1F8A4C,#4CC27F);} .wk-bar.wk-t-amber>i{background:linear-gradient(90deg,#C8921F,#EBC260);} .wk-bar.wk-t-red>i{background:linear-gradient(90deg,#B23A3A,#E27676);}',
'.wk-delta{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:11.5px;font-weight:700;background:#EEF2F8;color:var(--wk-grey);white-space:nowrap;}',
'.wk-delta.up{background:#E1F4E9;color:#17703E;} .wk-delta.down{background:#FBE7E7;color:#9A2E2E;} .wk-delta.flat{background:#EEF2F8;color:var(--wk-grey);}',
'.wk-spark{display:block;}',

/* tarjetas y secciones */
'.wk-card{background:#fff;border-radius:16px;padding:20px 22px;margin-bottom:18px;box-shadow:var(--wk-shadow);border:1px solid var(--wk-line);scroll-margin-top:70px;}',
'.wk-card-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:14px;}',
'.wk-card-head h2,.wk-card-head h3{margin:0;font-size:17px;font-weight:700;color:var(--wk-navy2);display:flex;align-items:center;gap:8px;}',
'.wk-card-head p{margin:2px 0 0;font-size:12.5px;color:var(--wk-grey);}',
'.wk-count{font-size:11.5px;font-weight:700;color:var(--wk-blue);background:#E8F0FB;border-radius:99px;padding:3px 10px;}',
'.wk-band{display:flex;align-items:center;gap:12px;margin:26px 0 12px;scroll-margin-top:70px;}',
'.wk-band h2{margin:0;font-size:20px;font-weight:800;color:var(--wk-navy2);}',
'.wk-band span{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--wk-greyl);font-weight:700;}',
'.wk-band:after{content:"";flex:1;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--wk-cyan),transparent);}',
'.wk-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:18px;}',
'.wk-grid2>.wk-card{margin-bottom:0;}',

/* lectura ejecutiva */
'.wk-callout{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(135deg,#EAF3FF,#F4F9FF);border:1px solid #CFE2F8;border-left:5px solid var(--wk-cyan);border-radius:14px;padding:16px 18px;}',
'.wk-callout .ico{font-size:22px;line-height:1;}',
'.wk-callout h3{margin:0 0 4px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:var(--wk-blue);}',
'.wk-callout .txt{font-size:14px;line-height:1.55;color:var(--wk-ink);white-space:pre-wrap;}',

/* badges */
'.wk-b{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:700;white-space:nowrap;background:#EEF2F8;color:var(--wk-grey);}',
'.wk-b:before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.85;}',
'.wk-b.green{background:#E1F4E9;color:#17703E;} .wk-b.amber{background:#FDF1D3;color:#8A6414;} .wk-b.red{background:#FBE7E7;color:#9A2E2E;} .wk-b.blue{background:#E4EEFB;color:#1B4F9E;}',
'.wk-tag{display:inline-block;padding:2px 9px;border-radius:6px;font-size:11.5px;font-weight:600;background:#EEF3FA;color:var(--wk-navy2);}',

/* tablas */
'.wk-tablewrap{overflow:auto;max-height:560px;border:1px solid var(--wk-line);border-radius:12px;}',
'.wk-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;}',
'.wk-table th{position:sticky;top:0;z-index:2;background:#F1F5FA;color:var(--wk-grey);text-align:left;font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:11px 12px;border-bottom:1px solid var(--wk-line);white-space:nowrap;user-select:none;}',
'.wk-table th.wk-sortable{cursor:pointer;} .wk-table th.wk-sortable:hover{color:var(--wk-blue);background:#E9F0F9;}',
'.wk-table th .wk-arrow{display:inline-block;width:12px;margin-left:5px;opacity:.35;font-size:10px;}',
'.wk-table th .wk-arrow:before{content:"\\2195";}',
'.wk-table th.asc .wk-arrow,.wk-table th.desc .wk-arrow{opacity:1;color:var(--wk-blue);}',
'.wk-table th.asc .wk-arrow:before{content:"\\25B2";} .wk-table th.desc .wk-arrow:before{content:"\\25BC";}',
'.wk-table td{padding:10px 12px;border-bottom:1px solid #EDF2F8;vertical-align:top;color:var(--wk-ink);}',
'.wk-table tbody tr:nth-child(even) td{background:#FAFCFE;}',
'.wk-table tbody tr:hover td{background:#EEF5FD;}',
'.wk-table tbody tr[onclick]{cursor:pointer;}',
'.wk-table tbody tr.wk-on td{background:#E4EEFB!important;font-weight:600;}',
'.wk-table td.wk-num,.wk-table th.wk-num{text-align:right;font-variant-numeric:tabular-nums;}',
'.wk-table td.wk-strong{font-weight:600;color:var(--wk-navy2);}',
'.wk-table td.wk-note{color:var(--wk-grey);max-width:380px;}',
'.wk-table tfoot td{position:sticky;bottom:0;background:#F1F5FA;font-weight:700;border-top:1px solid var(--wk-line);}',
'.wk-inbar{position:relative;min-width:120px;}',
'.wk-inbar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#DCEAFB,#BFD9F6);z-index:0;}',
'.wk-inbar span{position:relative;z-index:1;display:block;padding:2px 8px;text-align:right;font-weight:700;color:var(--wk-navy2);font-variant-numeric:tabular-nums;}',
'.wk-tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px;}',
'.wk-search{flex:1;min-width:200px;max-width:340px;border:1px solid var(--wk-line);border-radius:10px;padding:8px 12px;font:500 13px Poppins,"Segoe UI",sans-serif;color:var(--wk-ink);background:#fff;outline:none;}',
'.wk-search:focus{border-color:var(--wk-cyan);box-shadow:0 0 0 3px rgba(51,180,221,.18);}',
'.wk-hint{font-size:11.5px;color:var(--wk-greyl);}',
'.wk-empty{padding:28px;text-align:center;color:var(--wk-grey);font-size:13.5px;}',

/* bullet charts */
'.wk-bullets{display:grid;gap:16px;}',
'.wk-bullet-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px;font-size:13px;color:var(--wk-ink);}',
'.wk-bullet-head b{font-variant-numeric:tabular-nums;color:var(--wk-navy2);}',
'.wk-bullet-head span{font-weight:600;}',
'.wk-bullet-track{position:relative;height:16px;border-radius:99px;background:#E6EDF6;}',
'.wk-bullet-fill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,var(--wk-blue),var(--wk-cyan));}',
'.wk-bullet-fill.green{background:linear-gradient(90deg,#1F8A4C,#4CC27F);} .wk-bullet-fill.amber{background:linear-gradient(90deg,#C8921F,#EBC260);} .wk-bullet-fill.red{background:linear-gradient(90deg,#B23A3A,#E27676);}',
'.wk-bullet-mark{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:var(--wk-navy2);}',
'.wk-bullet-mark:after{content:attr(data-l);position:absolute;top:-17px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:700;color:var(--wk-navy2);white-space:nowrap;}',
'.wk-bullet-foot{display:flex;justify-content:space-between;margin-top:5px;font-size:11.5px;color:var(--wk-grey);}',
'.wk-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--wk-grey);margin-top:14px;}',
'.wk-legend i{display:inline-block;width:12px;height:8px;border-radius:3px;margin-right:6px;vertical-align:middle;}',

/* banner histórico */
'.wk-banner{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:#FBF1DE;border:1px solid #E9D9AE;border-radius:14px;padding:12px 18px;margin-bottom:18px;font-size:13px;color:#8A6414;}',
'.wk-btn{background:#8A6414;color:#fff;border:none;border-radius:8px;padding:7px 14px;font:600 12.5px Poppins,"Segoe UI",sans-serif;cursor:pointer;}',
'.wk-foot{font-size:11.5px;color:var(--wk-greyl);margin-top:22px;padding-top:12px;border-top:1px solid var(--wk-line);}',

'@media(max-width:700px){.wk-grid2{grid-template-columns:1fr;}.wk-kpi-val{font-size:28px;}.wk-nav{padding:8px 14px;margin:0 -14px 14px;}}',
'@media(prefers-reduced-motion:reduce){.wk-chip{transition:none;}}'
].join('\n');

var st = document.createElement('style'); st.id = 'wk-style'; st.textContent = CSS; document.head.appendChild(st);

var WK = {};

/* ---------- utilidades ---------- */
WK.esc = function(s){ return (s==null?'':String(s)).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
function p2(n){ return String(n).padStart(2,'0'); }
function sinAcentos(s){ return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }
WK.norm = sinAcentos;

/* ---------- formatos ---------- */
WK.usd = function(n){ return (n==null||n==='') ? '—' : (n<0?'-':'') + '$' + Math.abs(Math.round(n)).toLocaleString('es-MX'); };
WK.usdK = function(n){ return (n==null||n==='') ? '—' : (n<0?'-':'') + '$' + Math.abs(Math.round(n)).toLocaleString('es-MX') + 'K'; };
WK.pct = function(n){ return (n==null||isNaN(n)) ? '—' : Math.round(n*100) + '%'; };
WK.num = function(n){ return (n==null||n==='') ? '—' : Number(n).toLocaleString('es-MX'); };

/* Fecha SIEMPRE como DD/MM/AA, sin importar cómo venga en el Excel.
   - Date real de Excel: se usa su día calendario.
   - Texto "d/m/a" (también con - o .): se interpreta SIEMPRE como día/mes/año.
   - Número serial de Excel (30000–80000): se convierte a fecha.
   - ISO con hora (cortes guardados): se convierte a la fecha local.
   Devuelve null si el valor no es una fecha (así se puede conservar como texto). */
WK.fecha = function(v){
  if(v==null || v==='') return null;
  if(Object.prototype.toString.call(v)==='[object Date]'){ return isNaN(v) ? null : p2(v.getDate())+'/'+p2(v.getMonth()+1)+'/'+p2(v.getFullYear()%100); }
  if(typeof v === 'number'){
    if(v>20000 && v<80000 && window.XLSX && XLSX.SSF){ var c = XLSX.SSF.parse_date_code(v); if(c) return p2(c.d)+'/'+p2(c.m)+'/'+p2(c.y%100); }
    return null;
  }
  var s = String(v).trim();
  var m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/);
  if(m){ var d=+m[1], mo=+m[2]; if(d>=1&&d<=31&&mo>=1&&mo<=12) return p2(d)+'/'+p2(mo)+'/'+p2(+m[3]%100); return null; }
  if(/^\d{4}-\d{2}-\d{2}T/.test(s)){ var dt = new Date(s); return isNaN(dt) ? null : WK.fecha(dt); }
  var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(iso) return p2(+iso[3])+'/'+p2(+iso[2])+'/'+p2(+iso[1]%100);
  return null;
};
WK.fechaTs = function(txt){ var m = String(txt||'').match(/^(\d{2})\/(\d{2})\/(\d{2})$/); return m ? Date.UTC(2000+(+m[3]), (+m[2])-1, +m[1]) : null; };
WK.hora = function(iso){
  if(!iso) return '—'; var d = new Date(iso); if(isNaN(d)) return '—';
  return WK.fecha(d) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
};

/* Color automático para etiquetas de semáforo / riesgo / probabilidad / estatus */
WK.tono = function(texto){
  var t = sinAcentos(texto);
  if(!t) return 'grey';
  if(/(rojo|alto|alta|critic|negativ|escalad)/.test(t)) return 'red';
  if(/(amarillo|medio|media|neutral|seguimiento|pendiente|proceso|tbd)/.test(t)) return 'amber';
  if(/(verde|positiv|bajo|baja|ok\b|complet|cerrad|ganad|listo|si\b)/.test(t)) return 'green';
  return 'grey';
};
WK.badge = function(texto, tono){
  if(texto==null || texto==='') return '<span class="wk-tag" style="opacity:.5">—</span>';
  return '<span class="wk-b ' + (tono || WK.tono(texto)) + '">' + WK.esc(texto) + '</span>';
};

/* ---------- tendencia (sparkline) ---------- */
WK.spark = function(vals, opt){
  opt = opt || {}; var w = opt.w || 96, h = opt.h || 30, pad = 3;
  vals = (vals||[]).filter(function(v){ return v!=null && !isNaN(v); });
  if(vals.length < 2) return '';
  var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), rango = (max-min) || 1;
  var pts = vals.map(function(v,i){ return [pad + i*(w-2*pad)/(vals.length-1), h-pad - (v-min)/rango*(h-2*pad)]; });
  var linea = pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
  var area = pad+','+(h-pad)+' '+linea+' '+(w-pad)+','+(h-pad);
  var u = pts[pts.length-1], color = opt.color || '#1E5BB8';
  return '<svg class="wk-spark" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Tendencia">'+
    '<polygon points="'+area+'" fill="'+color+'" opacity=".10"/>'+
    '<polyline points="'+linea+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+u[0].toFixed(1)+'" cy="'+u[1].toFixed(1)+'" r="3" fill="'+color+'"/></svg>';
};

/* chip de cambio vs. semana anterior. bueno: 'up' si subir es bueno, 'down' si bajar es bueno, null si es neutral */
WK.delta = function(actual, previo, o){
  o = o || {};
  if(actual==null || previo==null || isNaN(actual) || isNaN(previo)) return '';
  var d = actual - previo, tipo = o.tipo || 'abs';
  var dir = Math.abs(d) < 1e-9 ? 'flat' : (d>0 ? 'up' : 'down');
  var texto = tipo === 'pts' ? Math.abs(d*100).toFixed(1).replace(/\.0$/,'') + ' pts'
            : (o.fmt ? o.fmt(Math.abs(d)) : Math.abs(Math.round(d*10)/10).toLocaleString('es-MX'));
  var clase = dir;
  if(dir !== 'flat' && o.bueno === 'down') clase = dir === 'up' ? 'down' : 'up';
  if(dir !== 'flat' && o.bueno === null) clase = 'flat';
  var flecha = dir === 'flat' ? '■' : (dir === 'up' ? '▲' : '▼');
  return '<span class="wk-delta '+clase+'" title="Contra el corte anterior">'+flecha+' '+(dir==='flat' ? 'Sin cambio' : texto)+'</span>';
};

/* ---------- componentes ---------- */
WK.bar = function(p, tono){
  var w = Math.max(0, Math.min(100, (p||0)*100));
  return '<div class="wk-bar ' + (tono ? 'wk-t-'+tono : '') + '"><i style="width:'+w.toFixed(1)+'%"></i></div>';
};

WK.kpi = function(o){
  return '<div class="wk-kpi' + (o.tono ? ' wk-t-'+o.tono : '') + '">' +
    '<div class="wk-kpi-top"><span class="wk-kpi-label">'+WK.esc(o.label)+'</span>' + (o.ico ? '<span class="wk-kpi-ico">'+o.ico+'</span>' : '') + '</div>' +
    '<div class="wk-kpi-val">'+o.value+(o.unit ? '<small>'+WK.esc(o.unit)+'</small>' : '')+'</div>' +
    '<div class="wk-kpi-sub">'+(o.sub||'')+'</div>' +
    (o.pct != null ? WK.bar(o.pct, o.tono) : '') +
    ((o.delta || o.spark) ? '<div class="wk-kpi-foot"><div>'+(o.delta||'')+'</div><div>'+(o.spark||'')+'</div></div>' : '') +
  '</div>';
};

WK.band = function(id, titulo, sub){
  return '<div class="wk-band" id="'+id+'"><h2>'+WK.esc(titulo)+'</h2>'+(sub?'<span>'+WK.esc(sub)+'</span>':'')+'</div>';
};

WK.card = function(o){
  return '<section class="wk-card"'+(o.id?' id="'+o.id+'"':'')+'>' +
    '<div class="wk-card-head"><div><h3>'+(o.ico?o.ico+' ':'')+WK.esc(o.titulo)+'</h3>'+(o.sub?'<p>'+WK.esc(o.sub)+'</p>':'')+'</div>' +
    (o.count!=null ? '<span class="wk-count">'+o.count+'</span>' : '') + (o.extra||'') + '</div>' + o.body + '</section>';
};

WK.callout = function(titulo, cuerpoHtml, idCuerpo){
  return '<div class="wk-callout"><div class="ico">🤖</div><div style="flex:1"><h3>'+WK.esc(titulo)+'</h3><div class="txt"'+(idCuerpo?' id="'+idCuerpo+'"':'')+'>'+cuerpoHtml+'</div></div></div>';
};

WK.chips = function(items){
  return '<nav class="wk-nav">' + items.map(function(i){
    return '<a class="wk-chip" href="#'+i.id+'" data-wk-chip="'+i.id+'">'+WK.esc(i.label)+(i.n!=null?' <small>'+i.n+'</small>':'')+'</a>';
  }).join('') + '</nav>';
};

WK.empty = function(t){ return '<div class="wk-empty">'+WK.esc(t||'Sin registros.')+'</div>'; };

/* Barra de progreso hacia meta con marcas. o = {label, valor, meta, marca, marcaLabel, fmt, tono, nota} */
WK.bullet = function(o){
  var fmt = o.fmt || WK.usdK;
  var max = Math.max(o.meta||0, o.valor||0, o.marca||0) || 1;
  var wFill = Math.min(100, (o.valor||0)/max*100);
  var marcas = '';
  if(o.marca != null) marcas += '<div class="wk-bullet-mark" style="left:calc('+Math.min(100,(o.marca/max*100)).toFixed(1)+'% - 1px)" data-l="'+WK.esc(o.marcaLabel||'')+'"></div>';
  var pct = o.meta ? (o.valor||0)/o.meta : null;
  return '<div class="wk-bullet-row"><div class="wk-bullet-head"><span>'+WK.esc(o.label)+'</span><b>'+fmt(o.valor)+(o.meta!=null?' <span style="font-weight:500;color:var(--wk-greyl)">de '+fmt(o.meta)+'</span>':'')+'</b></div>' +
    '<div class="wk-bullet-track"><div class="wk-bullet-fill '+(o.tono||'')+'" style="width:'+wFill.toFixed(1)+'%"></div>'+marcas+'</div>' +
    '<div class="wk-bullet-foot"><span>'+(pct!=null?WK.pct(pct)+' de la meta':'')+'</span><span>'+(o.nota||'')+'</span></div></div>';
};

/* Cascada (waterfall) en SVG. items=[{label,value,tipo:'delta'|'total'}] */
WK.waterfall = function(items, o){
  o = o || {}; var fmt = o.fmt || WK.usdK;
  var W = 640, H = 260, mL = 16, mR = 16, mT = 30, mB = 46;
  var acum = 0, barras = [];
  items.forEach(function(it){
    if(it.tipo === 'total'){ barras.push({ it: it, ini: 0, fin: it.value, total: true }); acum = it.value; }
    else { var ini = acum; acum += it.value; barras.push({ it: it, ini: ini, fin: acum }); }
  });
  var vmax = Math.max.apply(null, barras.map(function(b){ return Math.max(b.ini, b.fin, 0); })) || 1;
  var vmin = Math.min.apply(null, barras.map(function(b){ return Math.min(b.ini, b.fin, 0); }));
  var rango = (vmax - vmin) || 1, plotH = H - mT - mB;
  var y = function(v){ return mT + (vmax - v) / rango * plotH; };
  var bw = Math.min(86, (W - mL - mR) / barras.length * 0.62), paso = (W - mL - mR) / barras.length;
  var s = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+WK.esc(o.aria||'Cascada')+'" style="width:100%;height:auto;display:block">';
  s += '<line x1="'+mL+'" x2="'+(W-mR)+'" y1="'+y(0).toFixed(1)+'" y2="'+y(0).toFixed(1)+'" stroke="#CBD7E6" stroke-width="1"/>';
  barras.forEach(function(b, i){
    var x = mL + i*paso + (paso-bw)/2, y1 = y(Math.max(b.ini,b.fin)), y2 = y(Math.min(b.ini,b.fin)), alto = Math.max(2, y2-y1);
    var color = b.total ? '#1E5BB8' : (b.it.value >= 0 ? '#1F8A4C' : '#B23A3A');
    s += '<rect x="'+x.toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+alto.toFixed(1)+'" rx="6" fill="'+color+'" opacity=".92"/>';
    if(i < barras.length-1){ var nx = mL + (i+1)*paso + (paso-bw)/2; s += '<line x1="'+(x+bw).toFixed(1)+'" x2="'+nx.toFixed(1)+'" y1="'+y(b.fin).toFixed(1)+'" y2="'+y(b.fin).toFixed(1)+'" stroke="#9FB3CC" stroke-dasharray="3 3"/>'; }
    var val = (b.total ? '' : (b.it.value >= 0 ? '+' : '')) + fmt(b.it.value);
    s += '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(y1-8).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#0E1E3F">'+WK.esc(val)+'</text>';
    var lineas = String(b.it.label).split('|');
    lineas.forEach(function(t, k){ s += '<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-mB+18+k*14)+'" text-anchor="middle" font-size="11.5" fill="#5E6B82">'+WK.esc(t)+'</text>'; });
  });
  return s + '</svg>';
};

/* ---------- tablas ordenables ---------- */
var MESES = { enero:1, febrero:2, marzo:3, abril:4, mayo:5, junio:6, julio:7, agosto:8, septiembre:9, octubre:10, noviembre:11, diciembre:12,
              ene:1, feb:2, mar:3, abr:4, may:5, jun:6, jul:7, ago:8, sep:9, oct:10, nov:11, dic:12 };
function valorOrden(td){
  if(!td) return null;
  var dv = td.getAttribute('data-v');
  if(dv !== null && dv !== ''){ var n = Number(dv); return isNaN(n) ? sinAcentos(dv) : n; }
  var t = td.textContent.trim();
  if(!t || t === '—' || t === '-') return null;
  var f = WK.fechaTs(t); if(f !== null) return f;
  var sn = t.replace(/[$,\s]/g,'').replace(/(K|M|x|%)$/i,'');
  if(/^-?\d+(\.\d+)?$/.test(sn)) return Number(sn);
  var mes = MESES[sinAcentos(t)]; if(mes) return mes;
  return sinAcentos(t);
}
function comparar(a, b, dir){
  if(a === null && b === null) return 0;
  if(a === null) return 1;      // vacíos siempre al final
  if(b === null) return -1;
  var r = (typeof a === 'number' && typeof b === 'number') ? a - b : String(a).localeCompare(String(b), 'es', { numeric:true, sensitivity:'base' });
  return dir * r;
}
WK.sortable = function(root){
  (root || document).querySelectorAll('table.wk-table[data-sortable]').forEach(function(tabla){
    if(tabla._wkListo) return; tabla._wkListo = true;
    var ths = tabla.querySelectorAll('thead th');
    ths.forEach(function(th, idx){
      if(th.getAttribute('data-sort') === 'off') return;
      th.classList.add('wk-sortable'); th.setAttribute('tabindex', '0'); th.setAttribute('role', 'columnheader');
      var ir = function(){
        var dir = th.classList.contains('asc') ? -1 : 1;
        ths.forEach(function(o){ o.classList.remove('asc','desc'); o.removeAttribute('aria-sort'); });
        th.classList.add(dir === 1 ? 'asc' : 'desc'); th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
        var tbody = tabla.tBodies[0]; if(!tbody) return;
        var filas = Array.prototype.slice.call(tbody.rows).map(function(tr, pos){ return { tr: tr, pos: pos, v: valorOrden(tr.cells[idx]) }; });
        filas.sort(function(x, y){ return comparar(x.v, y.v, dir) || (x.pos - y.pos); });
        filas.forEach(function(f){ tbody.appendChild(f.tr); });
      };
      th.addEventListener('click', ir);
      th.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); ir(); } });
    });
  });
};

/* Filtro de texto para una tabla (por todas sus columnas) */
WK.filtrar = function(tabla, texto){
  var q = sinAcentos(texto);
  Array.prototype.forEach.call(tabla.tBodies[0].rows, function(tr){ tr.style.display = (!q || sinAcentos(tr.textContent).indexOf(q) >= 0) ? '' : 'none'; });
};

/* WK.table(cols, filas, opts)
   cols: [{k,label,tipo,cls}]  tipo: text | strong | note | num | usd | usdK | usdKbar | pct | date | badge | tag | html
   filas: arreglo de objetos. opts: {rowAttrs:(fila,i)=>string, footer:html, vacio:texto, id, sinOrden:bool} */
WK.table = function(cols, filas, opts){
  opts = opts || {};
  if(!filas || !filas.length) return WK.empty(opts.vacio);
  var maxBar = {};
  cols.forEach(function(c){ if(c.tipo === 'usdKbar') maxBar[c.k] = Math.max.apply(null, filas.map(function(f){ return Math.abs(Number(f[c.k])||0); })) || 1; });
  var cabecera = cols.map(function(c){
    var num = (c.tipo==='num'||c.tipo==='usd'||c.tipo==='usdK'||c.tipo==='usdKbar'||c.tipo==='pct');
    return '<th class="'+(num?'wk-num':'')+'"><span>'+WK.esc(c.label)+'</span>'+(opts.sinOrden?'':'<span class="wk-arrow"></span>')+'</th>';
  }).join('');
  var cuerpo = filas.map(function(f, i){
    var tds = cols.map(function(c){
      var v = f[c.k], vis = '', dv = '', cls = c.cls || '';
      switch(c.tipo){
        case 'num':  vis = WK.num(v); dv = v==null?'':v; cls += ' wk-num'; break;
        case 'usd':  vis = typeof v === 'number' ? WK.usd(v) : WK.esc(v==null?'—':v); dv = typeof v === 'number' ? v : ''; cls += ' wk-num'; break;
        case 'usdK': vis = WK.usdK(v); dv = v==null?'':v; cls += ' wk-num'; break;
        case 'usdKbar': vis = '<div class="wk-inbar"><i style="width:'+Math.min(100,Math.abs(Number(v)||0)/maxBar[c.k]*100).toFixed(1)+'%"></i><span>'+WK.usdK(v)+'</span></div>'; dv = v==null?'':v; cls += ' wk-num'; break;
        case 'pct':  vis = WK.pct(v); dv = v==null?'':v; cls += ' wk-num'; break;
        case 'date': vis = WK.esc(v==null||v===''?'—':v); dv = WK.fechaTs(v) || ''; break;
        case 'badge': vis = WK.badge(v); break;
        case 'tag':  vis = v ? '<span class="wk-tag">'+WK.esc(v)+'</span>' : '—'; dv = v||''; break;
        case 'strong': vis = WK.esc(v==null||v===''?'—':v); cls += ' wk-strong'; break;
        case 'note': vis = WK.esc(v==null||v===''?'—':v); cls += ' wk-note'; break;
        case 'html': vis = v==null?'':v; break;
        default:     vis = WK.esc(v==null||v===''?'—':v);
      }
      return '<td class="'+cls.trim()+'"'+(dv!==''?' data-v="'+WK.esc(dv)+'"':'')+'>'+vis+'</td>';
    }).join('');
    return '<tr'+(opts.rowAttrs ? ' '+opts.rowAttrs(f, i) : '')+'>'+tds+'</tr>';
  }).join('');
  return '<div class="wk-tablewrap"><table class="wk-table"'+(opts.sinOrden?'':' data-sortable')+(opts.id?' id="'+opts.id+'"':'')+'><thead><tr>'+cabecera+'</tr></thead><tbody>'+cuerpo+'</tbody>'+(opts.footer?'<tfoot>'+opts.footer+'</tfoot>':'')+'</table></div>';
};

/* Resalta en la barra de chips la sección visible */
WK.observarSecciones = function(){
  if(!('IntersectionObserver' in window)) return;
  var chips = document.querySelectorAll('[data-wk-chip]'); if(!chips.length) return;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ chips.forEach(function(c){ c.classList.toggle('on', c.getAttribute('data-wk-chip') === e.target.id); }); } });
  }, { rootMargin: '-35% 0px -60% 0px' });
  chips.forEach(function(c){ var el = document.getElementById(c.getAttribute('data-wk-chip')); if(el) obs.observe(el); });
};

window.WK = WK;
})();
