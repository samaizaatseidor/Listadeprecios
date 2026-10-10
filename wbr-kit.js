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
'.wk-bullets{display:grid;gap:22px;}',
'.wk-bullet-row{margin-bottom:26px;} .wk-bullet-row:last-child{margin-bottom:4px;}',
'.wk-bullet-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:24px;font-size:13px;color:var(--wk-ink);flex-wrap:wrap;}',
'.wk-bullet-head b{font-variant-numeric:tabular-nums;color:var(--wk-navy2);}',
'.wk-bullet-head span{font-weight:600;}',
'.wk-bullet-track{position:relative;height:16px;border-radius:99px;background:#E6EDF6;}',
'.wk-bullet-fill{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:linear-gradient(90deg,var(--wk-blue),var(--wk-cyan));}',
'.wk-bullet-fill.green{background:linear-gradient(90deg,#1F8A4C,#4CC27F);} .wk-bullet-fill.amber{background:linear-gradient(90deg,#C8921F,#EBC260);} .wk-bullet-fill.red{background:linear-gradient(90deg,#B23A3A,#E27676);}',
'.wk-bullet-mark{position:absolute;top:-4px;bottom:-4px;width:3px;border-radius:2px;background:var(--wk-navy2);}',
'.wk-bullet-mark:after{content:attr(data-l);position:absolute;top:-17px;right:-2px;font-size:10px;font-weight:700;color:var(--wk-navy2);white-space:nowrap;}',
'.wk-bullet-foot{display:flex;justify-content:space-between;margin-top:6px;font-size:11.5px;color:var(--wk-grey);gap:10px;}',
'.wk-legend{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--wk-grey);margin-top:14px;}',
'.wk-legend i{display:inline-block;width:12px;height:8px;border-radius:3px;margin-right:6px;vertical-align:middle;}',

/* banner histórico */
'.wk-banner{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:#FBF1DE;border:1px solid #E9D9AE;border-radius:14px;padding:12px 18px;margin-bottom:18px;font-size:13px;color:#8A6414;}',
'.wk-btn{background:#8A6414;color:#fff;border:none;border-radius:8px;padding:7px 14px;font:600 12.5px Poppins,"Segoe UI",sans-serif;cursor:pointer;}',
'.wk-foot{font-size:11.5px;color:var(--wk-greyl);margin-top:22px;padding-top:12px;border-top:1px solid var(--wk-line);}',

/* ---------- estilo "tablero de pared": tiles oscuros, números grandes ---------- */
'.wk-hero-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:18px;}',
'.wk-hero{position:relative;background:linear-gradient(160deg,#0E1E3F 0%,#0A1226 100%);border-radius:18px;padding:18px 20px 14px;color:#fff;box-shadow:0 10px 28px rgba(10,18,38,.22);overflow:hidden;display:flex;flex-direction:column;min-height:210px;}',
'.wk-hero:after{content:"";position:absolute;right:-60px;top:-80px;width:220px;height:180px;background:radial-gradient(ellipse,rgba(51,180,221,.28),transparent 70%);pointer-events:none;}',
'.wk-hero-top{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#9DB4D6;position:relative;z-index:1;}',
'.wk-hero-val{font-size:48px;line-height:1.05;font-weight:800;letter-spacing:-1.5px;margin:10px 0 2px;position:relative;z-index:1;font-variant-numeric:tabular-nums;}',
'.wk-hero-val small{font-size:20px;font-weight:600;color:#9DB4D6;margin-left:4px;letter-spacing:0;}',
'.wk-hero-sub{font-size:13px;color:#B8C9E3;position:relative;z-index:1;display:flex;gap:10px;align-items:center;flex-wrap:wrap;}',
'.wk-hero .wk-delta{background:rgba(255,255,255,.08);}',
'.wk-hero .wk-delta.up{color:#4CE08A;} .wk-hero .wk-delta.down{color:#FF8A8A;} .wk-hero .wk-delta.flat{color:#B8C9E3;}',
'.wk-hero-chart{margin-top:auto;padding-top:10px;position:relative;z-index:1;}',
'.wk-hero.wk-t-green{box-shadow:inset 0 -4px 0 #2FCB73,0 10px 28px rgba(10,18,38,.22);} .wk-hero.wk-t-amber{box-shadow:inset 0 -4px 0 #EBC260,0 10px 28px rgba(10,18,38,.22);} .wk-hero.wk-t-red{box-shadow:inset 0 -4px 0 #FF6B6B,0 10px 28px rgba(10,18,38,.22);}',
'.wk-area{width:100%;height:auto;display:block;} .wk-area text{font:600 10px Poppins,"Segoe UI",sans-serif;fill:#8FA6C8;}',
'.wk-gauge{display:block;margin:0 auto;max-width:260px;width:100%;height:auto;} .wk-gauge .v{font:800 34px Poppins,"Segoe UI",sans-serif;fill:var(--wk-navy2);} .wk-gauge .l{font:600 11px Poppins,"Segoe UI",sans-serif;fill:var(--wk-greyl);}',
'.wk-hero .wk-gauge .v{fill:#fff;} .wk-hero .wk-gauge .l{fill:#9DB4D6;}',
'.wk-donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap;} .wk-donut{flex:0 0 auto;} .wk-donut .v{font:800 26px Poppins,"Segoe UI",sans-serif;fill:var(--wk-navy2);} .wk-donut .l{font:600 10.5px Poppins,"Segoe UI",sans-serif;fill:var(--wk-greyl);}',
'.wk-legend{flex:1;min-width:180px;display:grid;gap:8px;} .wk-legend div{display:flex;align-items:center;gap:9px;font-size:13px;} .wk-legend i{width:11px;height:11px;border-radius:3px;flex:0 0 auto;} .wk-legend span{flex:1;color:var(--wk-ink);font-weight:600;} .wk-legend b{font-variant-numeric:tabular-nums;color:var(--wk-navy2);}',
'.wk-rank{display:grid;gap:12px;} .wk-rank-row{display:grid;grid-template-columns:minmax(90px,170px) 1fr auto;gap:12px;align-items:center;font-size:13px;} .wk-rank-row .n{font-weight:600;color:var(--wk-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;} .wk-rank-row .t{height:12px;border-radius:99px;background:#E6EDF6;overflow:hidden;} .wk-rank-row .t i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--wk-blue),var(--wk-cyan));} .wk-rank-row b{font-variant-numeric:tabular-nums;color:var(--wk-navy2);min-width:64px;text-align:right;}',
'.wk-rank-row .t i.green{background:linear-gradient(90deg,#1F8A4C,#4CC27F);} .wk-rank-row .t i.amber{background:linear-gradient(90deg,#C8921F,#EBC260);} .wk-rank-row .t i.red{background:linear-gradient(90deg,#B23A3A,#E27676);}',
'.wk-stat-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;} .wk-stat{padding:12px 14px;border:1px solid var(--wk-line);border-radius:14px;background:#FAFCFE;} .wk-stat b{display:block;font-size:24px;font-weight:800;color:var(--wk-navy2);letter-spacing:-.5px;} .wk-stat span{font-size:11.5px;font-weight:600;color:var(--wk-grey);}',

/* =====================  KIT v2 — tema oscuro "dashboard"  ===================== */
'body.wk-dark{--wk-navy:#050A18;--wk-navy2:#F2F7FF;--wk-blue:#5BC8FF;--wk-cyan:#3DD6FF;--wk-cyan-l:#8FE6FF;--wk-ink:#E3ECFA;--wk-grey:#A5B4CE;--wk-greyl:#7D8FAE;--wk-line:rgba(255,255,255,.10);--wk-bg:#060C1B;--wk-green:#2FE29B;--wk-amber:#FFC857;--wk-red:#FF5C7A;--wk-violet:#8B7CFF;--wk-shadow:0 18px 50px rgba(0,0,0,.45);}',
'body.wk-dark{background:radial-gradient(900px 520px at 8% -8%,rgba(61,214,255,.14),transparent 60%),radial-gradient(800px 520px at 100% 4%,rgba(139,124,255,.15),transparent 60%),radial-gradient(900px 600px at 50% 120%,rgba(47,226,155,.07),transparent 60%),#060C1B!important;background-attachment:fixed!important;color:var(--wk-ink);}',
'body.wk-dark .topnav{background:rgba(6,12,27,.92)!important;border-bottom:1px solid rgba(255,255,255,.08)!important;} body.wk-dark .topnav .nav-link,body.wk-dark .topnav .nav-dropdown-btn{color:#C8D8F2!important;} body.wk-dark .topnav .nav-link:hover,body.wk-dark .topnav .nav-dropdown-btn:hover{color:#5BC8FF!important;}',
'',
'body.wk-dark header{background:linear-gradient(120deg,rgba(30,91,184,.55),rgba(14,30,63,.2) 55%,transparent),#070E20!important;border-bottom:1px solid rgba(255,255,255,.08);}',
'body.wk-dark .wk-nav{background:rgba(6,12,27,.78);border-bottom:1px solid var(--wk-line);}',
'body.wk-dark .wk-chip{background:rgba(255,255,255,.05);border-color:var(--wk-line);color:#CFE0FA;}',
'body.wk-dark .wk-chip:hover{border-color:var(--wk-cyan);color:#fff;box-shadow:0 0 18px rgba(61,214,255,.25);} body.wk-dark .wk-chip.on{background:linear-gradient(135deg,#1E5BB8,#3DD6FF);border-color:transparent;color:#04101F;box-shadow:0 6px 22px rgba(61,214,255,.35);}',
'body.wk-dark .wk-card{background:linear-gradient(150deg,rgba(255,255,255,.075),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 22px 60px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.09);border-radius:22px;padding:24px 26px;}',
'body.wk-dark .wk-card-head h2,body.wk-dark .wk-card-head h3{font-size:19px;color:#F2F7FF;} body.wk-dark .wk-card-head p{color:var(--wk-grey);font-size:13.5px;}',
'body.wk-dark .wk-count{background:rgba(61,214,255,.14);color:#8FE6FF;}',
'body.wk-dark .wk-band h2{font-size:26px;color:#fff;text-shadow:0 0 28px rgba(61,214,255,.35);} body.wk-dark .wk-band span{color:var(--wk-greyl);font-size:12px;}',
'body.wk-dark .wk-band:after{background:linear-gradient(90deg,rgba(61,214,255,.8),rgba(139,124,255,.4),transparent);height:2px;}',
'body.wk-dark .wk-callout{background:linear-gradient(135deg,rgba(61,214,255,.14),rgba(139,124,255,.10));border:1px solid rgba(61,214,255,.28);border-left:5px solid var(--wk-cyan);box-shadow:0 0 40px rgba(61,214,255,.10);} body.wk-dark .wk-callout h3{color:#8FE6FF;} body.wk-dark .wk-callout .txt{color:#E3ECFA;font-size:15.5px;line-height:1.65;}',
'body.wk-dark .wk-kpi{background:linear-gradient(150deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.09);box-shadow:0 18px 44px rgba(0,0,0,.4);} body.wk-dark .wk-kpi-val{color:#fff;font-size:40px;} body.wk-dark .wk-kpi-sub{color:var(--wk-grey);font-size:13.5px;} body.wk-dark .wk-kpi-label{color:var(--wk-greyl);}',
'body.wk-dark .wk-bar,body.wk-dark .wk-bullet-track,body.wk-dark .wk-rank-row .t{background:rgba(255,255,255,.08);}',
'body.wk-dark .wk-bullet-head{font-size:15px;color:#E3ECFA;} body.wk-dark .wk-bullet-head b{color:#fff;font-size:16px;} body.wk-dark .wk-bullet-foot{font-size:13px;color:var(--wk-grey);} body.wk-dark .wk-bullet-track{height:20px;} body.wk-dark .wk-bullet-mark{background:#fff;box-shadow:0 0 10px rgba(255,255,255,.7);} body.wk-dark .wk-bullet-mark:after{color:#fff;font-size:11px;}',
'body.wk-dark .wk-bullet-fill{box-shadow:0 0 18px rgba(61,214,255,.35);}',
'body.wk-dark .wk-delta.up{background:rgba(47,226,155,.14);color:#4CE8AB;} body.wk-dark .wk-delta.down{background:rgba(255,92,122,.15);color:#FF8CA2;} body.wk-dark .wk-delta.flat{background:rgba(255,255,255,.08);color:var(--wk-grey);}',
'body.wk-dark .wk-b{background:rgba(255,255,255,.08);color:var(--wk-grey);} body.wk-dark .wk-b.green{background:rgba(47,226,155,.14);color:#4CE8AB;} body.wk-dark .wk-b.amber{background:rgba(255,200,87,.15);color:#FFD479;} body.wk-dark .wk-b.red{background:rgba(255,92,122,.15);color:#FF8CA2;} body.wk-dark .wk-b.blue{background:rgba(91,200,255,.15);color:#8FD8FF;}',
'body.wk-dark .wk-tag{background:rgba(255,255,255,.08);color:#CFE0FA;}',
'body.wk-dark .wk-tablewrap{border:1px solid var(--wk-line);background:rgba(4,9,22,.35);border-radius:16px;}',
'body.wk-dark .wk-table{font-size:14.5px;} body.wk-dark .wk-table th{background:rgba(14,26,52,.96);color:#9FB2D3;font-size:11.5px;border-bottom:1px solid var(--wk-line);} body.wk-dark .wk-table th.wk-sortable:hover{background:rgba(30,50,92,.98);color:#8FE6FF;}',
'body.wk-dark .wk-table td{color:#DDE8F8;border-bottom:1px solid rgba(255,255,255,.06);padding:12px 14px;} body.wk-dark .wk-table th{padding:13px 14px;}',
'body.wk-dark .wk-table tbody tr:nth-child(even) td{background:rgba(255,255,255,.02);} body.wk-dark .wk-table tbody tr:hover td{background:rgba(61,214,255,.09);}',
'body.wk-dark .wk-table tbody tr.wk-on td{background:rgba(61,214,255,.16)!important;} body.wk-dark .wk-table td.wk-strong{color:#fff;} body.wk-dark .wk-table td.wk-note{color:var(--wk-grey);} body.wk-dark .wk-table tfoot td{background:rgba(14,26,52,.96);color:#fff;border-top:1px solid var(--wk-line);}',
'body.wk-dark .wk-inbar i{background:linear-gradient(90deg,rgba(61,214,255,.15),rgba(61,214,255,.5));} body.wk-dark .wk-inbar span{color:#fff;}',
'body.wk-dark .wk-search{background:rgba(255,255,255,.06);border:1px solid var(--wk-line);color:#fff;} body.wk-dark .wk-search::placeholder{color:var(--wk-greyl);}',
'body.wk-dark .wk-banner{background:rgba(255,200,87,.12);border:1px solid rgba(255,200,87,.35);color:#FFD479;} body.wk-dark .wk-btn{background:linear-gradient(135deg,#FFC857,#F59E0B);color:#2A1A00;}',
'body.wk-dark .wk-empty{color:var(--wk-greyl);} body.wk-dark .wk-foot{border-top:1px solid var(--wk-line);color:var(--wk-greyl);}',
'body.wk-dark .wk-stat{background:rgba(255,255,255,.05);border:1px solid var(--wk-line);} body.wk-dark .wk-stat b{color:#fff;font-size:28px;} body.wk-dark .wk-stat span{color:var(--wk-grey);}',
'body.wk-dark .wk-legend span{color:#E3ECFA;} body.wk-dark .wk-legend b{color:#fff;} body.wk-dark .wk-legend div{font-size:14.5px;}',
'body.wk-dark .wk-rank{gap:15px;} body.wk-dark .wk-rank-row{font-size:15px;grid-template-columns:minmax(70px,32%) minmax(40px,1fr) auto;} body.wk-dark .wk-rank-row .n{color:#E3ECFA;} body.wk-dark .wk-rank-row b{color:#fff;font-size:15.5px;} body.wk-dark .wk-rank-row .t{height:16px;}',
'body.wk-dark .wk-donut .v{fill:#fff;font-size:24px;} body.wk-dark .wk-donut .l{fill:var(--wk-grey);} body.wk-dark .wk-gauge .v{fill:#fff;} body.wk-dark .wk-gauge .l{fill:var(--wk-grey);}',
'body.wk-dark .wk-spark polyline{filter:drop-shadow(0 0 4px currentColor);}',
'body.wk-dark .loading{color:var(--wk-grey);} body.wk-dark .fecha-revision{background:rgba(61,214,255,.12)!important;border-color:rgba(61,214,255,.35)!important;color:#CFF3FF!important;}',
/* tiles de color con brillo (estilo widgets) */
'.wk-hero{--hc1:#3D5BFF;--hc2:#101A52;border-radius:26px;padding:22px 24px 16px;min-height:250px;background:radial-gradient(130% 100% at 88% -8%,var(--hc1) 0%,transparent 58%),linear-gradient(165deg,var(--hc2),#050A18 96%)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 24px 60px rgba(0,0,0,.5),0 0 0 0 transparent!important;transition:transform .25s ease,box-shadow .25s ease;transform-style:preserve-3d;will-change:transform;}',
'.wk-hero:hover{box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 32px 80px rgba(0,0,0,.6),0 0 60px -10px var(--hc1)!important;}',
'.wk-hero.wk-t-green{--hc1:#16C784;--hc2:#073B2B;} .wk-hero.wk-t-amber{--hc1:#F5A623;--hc2:#4A2F05;} .wk-hero.wk-t-red{--hc1:#FF4D6A;--hc2:#4A0F1E;} .wk-hero.wk-t-cyan{--hc1:#22C7F0;--hc2:#07344A;} .wk-hero.wk-t-violet{--hc1:#8B5CF6;--hc2:#241450;}',
'.wk-hero .wk-gauge{max-width:340px;} .wk-hero .wk-area{max-height:130px;}',
'.wk-hero:after{display:none;} .wk-hero:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.14),transparent 38%);pointer-events:none;}',
'.wk-hero-top{font-size:13px;color:rgba(255,255,255,.72);} .wk-hero-val{font-size:60px;letter-spacing:-2px;margin:12px 0 4px;text-shadow:0 4px 30px rgba(0,0,0,.35);} .wk-hero-val small{font-size:24px;color:rgba(255,255,255,.7);} .wk-hero-sub{font-size:15px;color:rgba(255,255,255,.82);}',
'.wk-hero-grid{gap:22px;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));margin-bottom:24px;}',
/* animaciones */
'.wk-rv{opacity:0;transform:translateY(22px) scale(.985);transition:opacity .75s ease,transform .75s cubic-bezier(.2,.8,.2,1);transition-delay:calc(var(--wki,0)*80ms);} .wk-rv.wk-vis{opacity:1;transform:none;}',
'.wk-hero.wk-rv.wk-vis{transition:transform .25s ease,box-shadow .25s ease,opacity .75s ease;transition-delay:0s;}',
'@keyframes wkdraw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}} @keyframes wkfade{from{opacity:0}to{opacity:1}} @keyframes wkgrowx{from{clip-path:inset(0 100% 0 0 round 99px)}to{clip-path:inset(0 0 0 0 round 99px)}} @keyframes wkgrowy{from{transform:scaleY(0)}to{transform:scaleY(1)}} @keyframes wkdon{from{stroke-dasharray:0 var(--c)}} @keyframes wkpop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}',
'.wk-anim *{animation-play-state:paused;} .wk-vis .wk-anim *,.wk-vis.wk-anim *,.wk-vis .wk-anim,.wk-vis.wk-anim{animation-play-state:running;}',
'.wk-arc{stroke-dasharray:100;animation:wkdraw 1.5s cubic-bezier(.2,.8,.2,1) both;animation-play-state:paused;} .wk-vis .wk-arc{animation-play-state:running;}',
'.wk-line{stroke-dasharray:100;animation:wkdraw 1.8s cubic-bezier(.3,.7,.2,1) both;animation-play-state:paused;} .wk-vis .wk-line{animation-play-state:running;}',
'.wk-areafill{animation:wkfade 1.6s ease .4s both;animation-play-state:paused;} .wk-vis .wk-areafill{animation-play-state:running;}',
'.wk-seg{animation:wkdon 1.4s cubic-bezier(.2,.8,.2,1) both;animation-play-state:paused;} .wk-vis .wk-seg{animation-play-state:running;}',
'.wk-colbar{transform-box:fill-box;transform-origin:50% 100%;animation:wkgrowy 1s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--bi,0)*60ms);animation-play-state:paused;} .wk-vis .wk-colbar{animation-play-state:running;}',
'.wk-pt{animation:wkpop .5s ease both;animation-delay:calc(1.2s + var(--bi,0)*60ms);animation-play-state:paused;transform-box:fill-box;transform-origin:center;} .wk-vis .wk-pt{animation-play-state:running;}',
'.wk-bullet-fill,.wk-rank-row .t i,.wk-bar>i{animation:wkgrowx 1.3s cubic-bezier(.2,.8,.2,1) both;animation-play-state:paused;} .wk-vis .wk-bullet-fill,.wk-vis .wk-rank-row .t i,.wk-vis .wk-bar>i{animation-play-state:running;}',
'.wk-colbar:hover,.wk-hit:hover{filter:brightness(1.35) drop-shadow(0 0 8px rgba(255,255,255,.35));} .wk-seg:hover{filter:brightness(1.25) drop-shadow(0 0 10px rgba(255,255,255,.4));cursor:pointer;} [data-tip]{cursor:default;}',
'.wk-hit{fill:transparent;cursor:pointer;} .wk-hit:hover{fill:rgba(255,255,255,.08);}',
'@media(prefers-reduced-motion:reduce){.wk-rv{opacity:1;transform:none;transition:none;} .wk-arc,.wk-line,.wk-areafill,.wk-seg,.wk-colbar,.wk-pt,.wk-bullet-fill,.wk-rank-row .t i,.wk-bar>i{animation:none!important;}}',
/* tooltip */
'.wk-tip{position:fixed;z-index:9999;pointer-events:none;max-width:320px;padding:11px 14px;border-radius:12px;background:rgba(8,16,36,.96);border:1px solid rgba(61,214,255,.45);box-shadow:0 14px 40px rgba(0,0,0,.55),0 0 24px rgba(61,214,255,.18);color:#E8F1FF;font:500 13.5px/1.45 Poppins,"Segoe UI",sans-serif;opacity:0;transform:translateY(6px);transition:opacity .12s ease,transform .12s ease;backdrop-filter:blur(8px);} .wk-tip.on{opacity:1;transform:none;} .wk-tip b{display:block;color:#fff;font-size:14px;margin-bottom:2px;} .wk-tip span{display:block;color:#B8C9E3;} .wk-tip i{font-style:normal;color:#8FE6FF;font-weight:700;}',
/* columnas */
'.wk-cols{width:100%;height:auto;display:block;} .wk-cols text{font:600 11px Poppins,"Segoe UI",sans-serif;fill:#8FA3C6;} .wk-cols .val{fill:#E8F1FF;font-weight:700;font-size:11px;} .wk-cols .grid{stroke:rgba(255,255,255,.08);stroke-dasharray:3 4;} .wk-cols .meta{stroke:#FFC857;stroke-width:1.6;stroke-dasharray:6 5;}',
'.wk-cols-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:8px;font-size:13.5px;color:var(--wk-grey);} .wk-cols-legend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:7px;vertical-align:-1px;}',
/* what-if */
'.wk-wi{display:grid;grid-template-columns:minmax(260px,1fr) minmax(260px,1fr);gap:28px;align-items:center;} .wk-wi-sl{display:grid;gap:22px;} .wk-wi-row label{display:flex;justify-content:space-between;gap:10px;font-size:14.5px;font-weight:600;color:#E3ECFA;margin-bottom:10px;} .wk-wi-row label b{color:#8FE6FF;font-variant-numeric:tabular-nums;}',
'.wk-wi input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:99px;background:linear-gradient(90deg,var(--wk-cyan) var(--p,50%),rgba(255,255,255,.12) var(--p,50%));outline:none;cursor:pointer;} .wk-wi input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:4px solid var(--wk-cyan);box-shadow:0 0 18px rgba(61,214,255,.7);cursor:grab;} .wk-wi input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:4px solid var(--wk-cyan);}',
'.wk-wi-out{display:grid;gap:16px;justify-items:center;} .wk-wi-note{font-size:14px;color:var(--wk-grey);text-align:center;max-width:420px;line-height:1.5;} .wk-wi-reset{background:rgba(255,255,255,.08);border:1px solid var(--wk-line);color:#CFE0FA;border-radius:99px;padding:7px 16px;font:600 12.5px Poppins,sans-serif;cursor:pointer;} .wk-wi-reset:hover{border-color:var(--wk-cyan);color:#fff;}',
'@media(max-width:800px){.wk-wi{grid-template-columns:1fr;}}',
/* dueño del tablero */
'body.wk-dark .topnav-logo img{height:34px!important;}',
'body.wk-dark header{flex-wrap:nowrap!important;align-items:center!important;gap:24px;} body.wk-dark header>div:first-child{flex:1 1 auto;min-width:0;} body.wk-dark header .upload-label{flex:none;white-space:nowrap;} body.wk-dark header h1{font-size:clamp(20px,2vw,30px)!important;}',
'@media(max-width:1500px){body.wk-dark header{flex-wrap:wrap!important;}}',
'.wk-owner-row{display:flex;align-items:center;gap:26px;} .wk-owner-txt{min-width:0;} .wk-owner-txt>div{margin-top:6px;}',
'.wk-owner{display:flex;align-items:center;gap:18px;flex:none;} .wk-owner-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}',
'.wk-avatar{position:relative;width:92px;height:92px;flex:0 0 auto;border-radius:50%;padding:4px;background:conic-gradient(from 0deg,#3DD6FF,#8B7CFF,#2FE29B,#3DD6FF);animation:wkspin 9s linear infinite;box-shadow:0 0 36px rgba(61,214,255,.45),0 10px 30px rgba(0,0,0,.5);} .wk-avatar>div{width:100%;height:100%;border-radius:50%;background:#0A1226;overflow:hidden;display:flex;align-items:center;justify-content:center;animation:wkspin 9s linear infinite reverse;} .wk-avatar img{width:100%;height:100%;object-fit:cover;display:block;} .wk-avatar span{font:800 26px Poppins,sans-serif;color:#8FE6FF;letter-spacing:1px;}',
'@keyframes wkspin{to{transform:rotate(360deg);}}',
'.wk-pop{zoom:1.15;position:relative;width:150px;height:188px;flex:0 0 auto;transform-style:preserve-3d;transform:perspective(700px) rotateY(calc(var(--px,0)*10deg)) rotateX(calc(var(--py,0)*-6deg));transition:transform .15s ease-out;margin:-6px 0 -6px;}',
'.wk-pop .ring{position:absolute;left:-6px;bottom:-6px;width:162px;height:162px;border-radius:50%;background:conic-gradient(from 0deg,#3DD6FF,#8B7CFF,#2FE29B,#3DD6FF);animation:wkspin 9s linear infinite;filter:blur(.3px);box-shadow:0 0 46px rgba(61,214,255,.55);}',
'.wk-pop .disc{position:absolute;left:0;bottom:0;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 50% 28%,#6FD3F0 0%,#1E5BB8 42%,#0A1A44 100%);box-shadow:inset 0 0 0 3px rgba(255,255,255,.18),inset 0 -18px 30px rgba(0,0,0,.35);transform:translate(calc(var(--px,0)*-7px),calc(var(--py,0)*-4px));transition:transform .15s ease-out;}',
'.wk-pop .ph{position:absolute;left:0;bottom:0;width:150px;height:188px;border-radius:0 0 75px 75px;overflow:hidden;transform:translate(calc(var(--px,0)*6px),calc(var(--py,0)*3px));transition:transform .15s ease-out;}',
'.wk-pop .ph img{position:absolute;bottom:0;left:50%;height:100%;width:auto;max-width:none;transform:translateX(-50%);filter:drop-shadow(0 10px 16px rgba(0,0,0,.5)) contrast(1.04) saturate(1.05);}',
'.wk-pop .ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(5,10,24,.5));pointer-events:none;}',
'.wk-owner-cap em{font-style:normal;font-size:13px;color:var(--wk-grey);font-weight:500;}',

'.wk-pop .ph .ini{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);font:800 44px Poppins,sans-serif;color:#fff;text-shadow:0 4px 14px rgba(0,0,0,.5);letter-spacing:1px;} .wk-pops{display:flex;} .wk-pops .wk-pop{zoom:.78;margin-right:-4px;} .wk-pops .wk-pop+.wk-pop{margin-left:14px;} .wk-owner-multi .wk-owner-cap b{font-size:16px;} .wk-owner-multi .wk-owner-cap b em{margin-left:6px;} .wk-owner-cap{display:grid;gap:3px;} .wk-owner-cap small{font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#8FE6FF;font-weight:700;} .wk-owner-cap b{font-size:20px;color:#fff;font-weight:700;}',
'@media(prefers-reduced-motion:reduce){.wk-avatar,.wk-avatar>div{animation:none;}}',

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
WK.sym = '$';
WK.setMoneda = function(sym){ WK.sym = sym; };
WK.usd = function(n){ return (n==null||n==='') ? '—' : (n<0?'-':'') + WK.sym + Math.abs(Math.round(n)).toLocaleString('es-MX'); };
WK.usdK = function(n){ return (n==null||n==='') ? '—' : (n<0?'-':'') + WK.sym + Math.abs(Math.round(n)).toLocaleString('es-MX') + 'K'; };
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

/* ---------- componentes "tablero de pared" ---------- */
var TONO_COL = { green:'#2FCB73', amber:'#EBC260', red:'#FF6B6B', cyan:'#33B4DD', blue:'#1E5BB8' };

/* Línea/área grande con etiquetas. vals:[n], opt:{labels:[], fmt, color, dark, h} */
WK.area = function(vals, opt){
  opt = opt || {};
  var datos = []; (vals||[]).forEach(function(v,i){ if(v!=null && !isNaN(v)) datos.push({ v:Number(v), l:(opt.labels||[])[i] }); });
  if(datos.length < 2) return '';
  var W = 300, H = opt.h || 86, mL = 4, mR = 4, mT = 8, mB = opt.labels ? 18 : 6, fmt = opt.fmt || WK.num;
  var min = Math.min.apply(null, datos.map(function(d){return d.v;})), max = Math.max.apply(null, datos.map(function(d){return d.v;}));
  if(opt.cero){ min = Math.min(0, min); } var rango = (max-min) || 1;
  var color = opt.color || '#33B4DD', n = datos.length;
  var pts = datos.map(function(d,i){ return [mL + i*(W-mL-mR)/(n-1), mT + (H-mT-mB) - (d.v-min)/rango*(H-mT-mB)]; });
  var linea = pts.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
  var gid = 'g' + Math.random().toString(36).slice(2,8);
  var s = '<svg class="wk-area" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Tendencia"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+color+'" stop-opacity=".45"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>' +
    '<polygon points="'+mL+','+(H-mB)+' '+linea+' '+(W-mR)+','+(H-mB)+'" fill="url(#'+gid+')"/>' +
    '<polyline points="'+linea+'" fill="none" stroke="'+color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  var u = pts[n-1];
  s += '<circle cx="'+u[0].toFixed(1)+'" cy="'+u[1].toFixed(1)+'" r="3.6" fill="'+color+'" stroke="#fff" stroke-width="1.2"/>';
  if(opt.labels){
    var paso = Math.max(1, Math.ceil(n/6));
    datos.forEach(function(d,i){ if(d.l!=null && (i%paso===0 || i===n-1)){ var anc = i===0 ? 'start' : (i===n-1 ? 'end' : 'middle'); s += '<text x="'+pts[i][0].toFixed(1)+'" y="'+(H-4)+'" text-anchor="'+anc+'">'+WK.esc(d.l)+'</text>'; } });
  }
  return s + '</svg>';
};

/* Tile oscuro: {label, ico, value, unit, sub, delta, tono, chart(html), gauge(html)} */
WK.hero = function(o){
  return '<div class="wk-hero' + (o.tono ? ' wk-t-'+o.tono : '') + '">' +
    '<div class="wk-hero-top"><span>'+WK.esc(o.label)+'</span>'+(o.ico?'<span>'+o.ico+'</span>':'')+'</div>' +
    '<div class="wk-hero-val">'+o.value+(o.unit?'<small>'+WK.esc(o.unit)+'</small>':'')+'</div>' +
    '<div class="wk-hero-sub">'+(o.sub||'')+(o.delta?o.delta:'')+'</div>' +
    (o.chart ? '<div class="wk-hero-chart">'+o.chart+'</div>' : '') + '</div>';
};
WK.heroGrid = function(items){ return '<div class="wk-hero-grid">' + items.join('') + '</div>'; };

/* Medidor semicircular. o:{valor, max, meta, tono, texto, label, dark} (valor/max en la misma unidad) */
WK.gauge = function(o){
  var max = o.max || 1, p = Math.max(0, Math.min(1, (o.valor||0)/max));
  var cx = 130, cy = 120, r = 90, sw = 20;
  function pt(f, rad){ var a = Math.PI*(1-f); return [cx + rad*Math.cos(a), cy - rad*Math.sin(a)]; }
  function arco(f0, f1){ var a = pt(f0, r), b = pt(f1, r); return 'M'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' A'+r+' '+r+' 0 '+0+' 1 '+b[0].toFixed(1)+' '+b[1].toFixed(1); }
  var col = TONO_COL[o.tono] || TONO_COL.cyan;
  var fondo = o.dark ? '#26385F' : '#E6EDF6';
  var svg = '<svg class="wk-gauge" viewBox="0 0 260 150" role="img" aria-label="'+WK.esc(o.label||'Medidor')+'">' +
    '<path d="'+arco(0,1)+'" fill="none" stroke="'+fondo+'" stroke-width="'+sw+'" stroke-linecap="round"/>' +
    (p>0.001 ? '<path d="'+arco(0,p)+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round"/>' : '');
  if(o.meta!=null){ var f = Math.max(0, Math.min(1, o.meta/max)), a = pt(f, r-sw/2-3), b = pt(f, r+sw/2+3); svg += '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="'+(o.dark?'#fff':'#0E1E3F')+'" stroke-width="3" stroke-linecap="round"/>'; }
  svg += '<text class="v" x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle">'+WK.esc(o.texto!=null?o.texto:Math.round(p*100)+'%')+'</text>' +
    (o.label ? '<text class="l" x="'+cx+'" y="'+(cy+18)+'" text-anchor="middle">'+WK.esc(o.label)+'</text>' : '') + '</svg>';
  return svg;
};

/* Dona. items:[{label,value,color?}], o:{centro, sub, fmt} */
var PALETA = ['#1E5BB8','#33B4DD','#2FCB73','#EBC260','#FF6B6B','#8E7CF0','#6B7F9E','#F59E4B'];
WK.donut = function(items, o){
  o = o || {}; var fmt = o.fmt || WK.num;
  items = (items||[]).filter(function(i){ return i.value > 0; });
  var tot = items.reduce(function(a,i){ return a + i.value; }, 0);
  if(!tot) return WK.empty('Sin datos.');
  var cx = 70, cy = 70, r = 52, sw = 22, C = 2*Math.PI*r, off = 0;
  var segs = items.map(function(it,i){ var len = it.value/tot*C, col = it.color || PALETA[i % PALETA.length];
    var s = '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-dasharray="'+Math.max(0,len-1.5).toFixed(2)+' '+(C-Math.max(0,len-1.5)).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"/>'; off += len; return s; }).join('');
  var svg = '<svg class="wk-donut" width="150" height="150" viewBox="0 0 140 140" role="img">'+segs+'<text class="v" x="70" y="'+(o.sub?68:76)+'" text-anchor="middle">'+WK.esc(o.centro!=null?o.centro:fmt(tot))+'</text>'+(o.sub?'<text class="l" x="70" y="85" text-anchor="middle">'+WK.esc(o.sub)+'</text>':'')+'</svg>';
  var leyenda = '<div class="wk-legend">'+items.map(function(it,i){ return '<div><i style="background:'+(it.color||PALETA[i%PALETA.length])+'"></i><span>'+WK.esc(it.label)+'</span><b>'+fmt(it.value)+' · '+Math.round(it.value/tot*100)+'%</b></div>'; }).join('')+'</div>';
  return '<div class="wk-donut-wrap">'+svg+leyenda+'</div>';
};

/* Lista de barras rankeadas. items:[{label,value,tono?}], o:{fmt, max} */
WK.ranked = function(items, o){
  o = o || {}; var fmt = o.fmt || WK.num;
  if(!items || !items.length) return WK.empty('Sin datos.');
  var max = o.max || Math.max.apply(null, items.map(function(i){ return Math.abs(i.value)||0; })) || 1;
  return '<div class="wk-rank">'+items.map(function(it){ return '<div class="wk-rank-row"><span class="n" title="'+WK.esc(it.label)+'">'+WK.esc(it.label)+'</span><div class="t"><i class="'+(it.tono||'')+'" style="width:'+Math.min(100,Math.abs(it.value||0)/max*100).toFixed(1)+'%"></i></div><b>'+fmt(it.value)+'</b></div>'; }).join('')+'</div>';
};

/* Mini estadísticas en fila. items:[{valor, label}] */
WK.stats = function(items){ return '<div class="wk-stat-row">'+items.map(function(i){ return '<div class="wk-stat"><b>'+i.valor+'</b><span>'+WK.esc(i.label)+'</span></div>'; }).join('')+'</div>'; };


/* =====================  KIT v2 — componentes animados e interactivos  ===================== */
function tipAttr(t){ return t ? ' data-tip="'+WK.esc(t)+'"' : ''; }
var CSSVAR_C = 2*Math.PI*52;

/* Línea/área grande con puntos interactivos. vals:[n], opt:{labels, fmt, color, h, cero, nombre} */
WK.area = function(vals, opt){
  opt = opt || {};
  var datos = []; (vals||[]).forEach(function(v,i){ if(v!=null && !isNaN(v)) datos.push({ v:Number(v), l:(opt.labels||[])[i] }); });
  if(datos.length < 2) return '';
  var W = 320, H = opt.h || 96, mL = 6, mR = 6, mT = 10, mB = opt.labels ? 20 : 8, fmt = opt.fmt || WK.num;
  var min = Math.min.apply(null, datos.map(function(d){return d.v;})), max = Math.max.apply(null, datos.map(function(d){return d.v;}));
  if(opt.cero){ min = Math.min(0, min); } var rango = (max-min) || 1;
  var color = opt.color || '#3DD6FF', n = datos.length;
  var pts = datos.map(function(d,i){ return [mL + i*(W-mL-mR)/(n-1), mT + (H-mT-mB) - (d.v-min)/rango*(H-mT-mB)]; });
  // curva suavizada (Catmull-Rom → Bézier)
  var d = 'M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
  for(var i=0;i<n-1;i++){ var p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
    var c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6, c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
    d += ' C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1); }
  var gid = 'g' + Math.random().toString(36).slice(2,8);
  var s = '<svg class="wk-area wk-anim" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Tendencia"><defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+color+'" stop-opacity=".5"/><stop offset="1" stop-color="'+color+'" stop-opacity="0"/></linearGradient></defs>' +
    '<path class="wk-areafill" d="'+d+' L'+(W-mR)+' '+(H-mB)+' L'+mL+' '+(H-mB)+' Z" fill="url(#'+gid+')"/>' +
    '<path class="wk-line" pathLength="100" d="'+d+'" fill="none" stroke="'+color+'" stroke-width="2.8" stroke-linecap="round" style="filter:drop-shadow(0 0 5px '+color+')"/>';
  datos.forEach(function(dt,i){
    var tip = (dt.l!=null ? dt.l : '') + '\n' + (opt.nombre ? opt.nombre+': ' : '') + fmt(dt.v);
    s += '<circle class="wk-pt" style="--bi:'+i+'" cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="'+(i===n-1?4.2:3)+'" fill="'+(i===n-1?'#fff':color)+'" stroke="'+color+'" stroke-width="1.6"/>' +
         '<circle class="wk-hit" cx="'+pts[i][0].toFixed(1)+'" cy="'+pts[i][1].toFixed(1)+'" r="11"'+tipAttr(tip)+'/>';
  });
  if(opt.labels){
    var paso = Math.max(1, Math.ceil(n/6));
    datos.forEach(function(dt,i){ if(dt.l!=null && (i%paso===0 || i===n-1)){ var anc = i===0 ? 'start' : (i===n-1 ? 'end' : 'middle'); s += '<text x="'+pts[i][0].toFixed(1)+'" y="'+(H-4)+'" text-anchor="'+anc+'">'+WK.esc(dt.l)+'</text>'; } });
  }
  return s + '</svg>';
};

/* Tile de color: {label, ico, value, unit, sub, delta, tono(green|amber|red|cyan|violet), chart} */
WK.hero = function(o){
  return '<div class="wk-hero wk-rv' + (o.tono ? ' wk-t-'+o.tono : '') + '">' +
    '<div class="wk-hero-top"><span>'+WK.esc(o.label)+'</span>'+(o.ico?'<span style="font-size:20px">'+o.ico+'</span>':'')+'</div>' +
    '<div class="wk-hero-val">'+o.value+(o.unit?'<small>'+WK.esc(o.unit)+'</small>':'')+'</div>' +
    '<div class="wk-hero-sub">'+(o.sub||'')+(o.delta?o.delta:'')+'</div>' +
    (o.chart ? '<div class="wk-hero-chart wk-anim">'+o.chart+'</div>' : '') + '</div>';
};

/* Medidor semicircular animado con tooltip. o:{valor,max,meta,tono,texto,label,dark,tip} */
WK.gauge = function(o){
  var max = o.max || 1, p = Math.max(0, Math.min(1, (o.valor||0)/max));
  var cx = 130, cy = 122, r = 92, sw = 22;
  function pt(f, rad){ var a = Math.PI*(1-f); return [cx + rad*Math.cos(a), cy - rad*Math.sin(a)]; }
  function arco(f0, f1){ var a = pt(f0, r), b = pt(f1, r); return 'M'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' A'+r+' '+r+' 0 0 1 '+b[0].toFixed(1)+' '+b[1].toFixed(1); }
  var col = TONO_COL[o.tono] || TONO_COL.cyan;
  var tip = o.tip || ((o.label ? o.label + '\n' : '') + (o.texto != null ? o.texto + ' · ' : '') + Math.round(p*100) + '% de la meta');
  var svg = '<svg class="wk-gauge wk-anim" viewBox="0 0 260 150" role="img" aria-label="'+WK.esc(o.label||'Medidor')+'"'+tipAttr(tip)+'>' +
    '<path d="'+arco(0,1)+'" fill="none" stroke="'+(o.dark===false?'#E6EDF6':'rgba(255,255,255,.14)')+'" stroke-width="'+sw+'" stroke-linecap="round"/>' +
    (p>0.001 ? '<path class="wk-arc" pathLength="100" d="'+arco(0,p)+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-linecap="round" style="filter:drop-shadow(0 0 8px '+col+')"/>' : '');
  if(o.meta!=null){ var f = Math.max(0, Math.min(1, o.meta/max)), a = pt(f, r-sw/2-4), b = pt(f, r+sw/2+4); svg += '<line x1="'+a[0].toFixed(1)+'" y1="'+a[1].toFixed(1)+'" x2="'+b[0].toFixed(1)+'" y2="'+b[1].toFixed(1)+'" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'; }
  svg += '<text class="v" x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle" style="font:800 36px Poppins,sans-serif">'+WK.esc(o.texto!=null?o.texto:Math.round(p*100)+'%')+'</text>' +
    (o.label ? '<text class="l" x="'+cx+'" y="'+(cy+20)+'" text-anchor="middle" style="font:600 12px Poppins,sans-serif">'+WK.esc(o.label)+'</text>' : '') + '</svg>';
  return svg;
};

/* Dona grande, animada, con datos SOLO al pasar el mouse. items:[{label,value,color,tip?}], o:{centro, sub, fmt, tamano} */
WK.donut = function(items, o){
  o = o || {}; var fmt = o.fmt || WK.num;
  items = (items||[]).filter(function(i){ return i.value > 0; });
  var tot = items.reduce(function(a,i){ return a + i.value; }, 0);
  if(!tot) return WK.empty('Sin datos.');
  var cx = 100, cy = 100, r = 74, sw = 30, C = 2*Math.PI*r, off = 0;
  var segs = items.map(function(it,i){ var len = it.value/tot*C, col = it.color || PALETA[i % PALETA.length], L = Math.max(0,len-2);
    var tip = it.tip || (it.label + '\n' + fmt(it.value) + ' · ' + Math.round(it.value/tot*100) + '% del total');
    var s = '<circle class="wk-seg" style="--c:'+C.toFixed(2)+'" data-tip="'+WK.esc(tip)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+sw+'" stroke-dasharray="'+L.toFixed(2)+' '+(C-L).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"/>'; off += len; return s; }).join('');
  var svg = '<svg class="wk-donut wk-anim" style="width:'+(o.tamano||'clamp(210px,24vw,340px)')+';height:auto" viewBox="0 0 200 200" role="img">'+segs+'<text class="v" x="100" y="'+(o.sub?100:110)+'" text-anchor="middle" style="font:800 '+(function(t){ return t.length>8 ? 19 : (t.length>6 ? 23 : 30); })(String(o.centro!=null?o.centro:fmt(tot)))+'px Poppins,sans-serif">'+WK.esc(o.centro!=null?o.centro:fmt(tot))+'</text>'+(o.sub?'<text class="l" x="100" y="122" text-anchor="middle" style="font:600 12px Poppins,sans-serif">'+WK.esc(o.sub)+'</text>':'')+'</svg>';
  var leyenda = o.sinLeyenda ? '' : '<div class="wk-legend">'+items.map(function(it,i){ return '<div><i style="background:'+(it.color||PALETA[i%PALETA.length])+'"></i><span>'+WK.esc(it.label)+'</span><b>'+Math.round(it.value/tot*100)+'%</b></div>'; }).join('')+'</div>';
  return '<div class="wk-donut-wrap" style="justify-content:center">'+svg+leyenda+'</div>';
};

/* Ranking de barras con tooltip. items:[{label,value,tono?,tip?}] */
WK.ranked = function(items, o){
  o = o || {}; var fmt = o.fmt || WK.num;
  if(!items || !items.length) return WK.empty('Sin datos.');
  var max = o.max || Math.max.apply(null, items.map(function(i){ return Math.abs(i.value)||0; })) || 1;
  return '<div class="wk-rank wk-anim">'+items.map(function(it){ return '<div class="wk-rank-row"'+tipAttr(it.tip || (it.label+'\n'+fmt(it.value)))+'><span class="n">'+WK.esc(it.label)+'</span><div class="t"><i class="'+(it.tono||'')+'" style="width:'+Math.min(100,Math.abs(it.value||0)/max*100).toFixed(1)+'%"></i></div><b>'+fmt(it.value)+'</b></div>'; }).join('')+'</div>';
};

/* Columnas verticales agrupadas. cats:['Q1',..], series:[{nombre,valores:[..],color}], o:{fmt,meta,h,etiquetas} */
WK.columns = function(cats, series, o){
  o = o || {}; var fmt = o.fmt || WK.usdK;
  var W = 640, H = o.h || 300, mL = 56, mR = 12, mT = 22, mB = 34, n = cats.length, m = series.length;
  var max = 0; series.forEach(function(s){ s.valores.forEach(function(v){ if(v>max) max = v; }); }); if(o.meta && o.meta>max) max = o.meta; if(!max) max = 1;
  var paso = Math.pow(10, Math.floor(Math.log10(max))), top = Math.ceil(max/paso*1.08)*paso; if(top/paso>5) { paso*=2; top = Math.ceil(max/paso*1.08)*paso; }
  var ih = H-mT-mB, iw = W-mL-mR, gw = iw/n, bw = Math.min(46, gw*0.7/m), gap = 5;
  var s = '<svg class="wk-cols wk-anim" viewBox="0 0 '+W+' '+H+'" role="img"><defs>';
  series.forEach(function(se,i){ var c = se.color || PALETA[i%PALETA.length]; s += '<linearGradient id="cg'+i+(o.id||'')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c+'"/><stop offset="1" stop-color="'+c+'" stop-opacity=".35"/></linearGradient>'; });
  s += '</defs>';
  for(var t=0;t<=top+1e-9;t+=paso){ var y = mT+ih-(t/top)*ih; s += '<line class="grid" x1="'+mL+'" x2="'+(W-mR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/><text x="'+(mL-8)+'" y="'+(y+4).toFixed(1)+'" text-anchor="end">'+fmt(t)+'</text>'; }
  cats.forEach(function(c,ci){
    var x0 = mL + ci*gw + (gw - (bw*m + gap*(m-1)))/2;
    series.forEach(function(se,si){
      var v = se.valores[ci]||0, h = (v/top)*ih, x = x0 + si*(bw+gap), y = mT+ih-h;
      var tip = c + ' · ' + se.nombre + '\n' + fmt(v) + (se.extra && se.extra[ci] ? '\n'+se.extra[ci] : '');
      if(h>0.5) s += '<rect class="wk-colbar" style="--bi:'+(ci*m+si)+'" data-tip="'+WK.esc(tip)+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="7" fill="url(#cg'+si+(o.id||'')+')"/>';
      if(o.etiquetas !== false && h>0.5) s += '<text class="val" x="'+(x+bw/2).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" text-anchor="middle">'+fmt(v)+'</text>';
    });
    s += '<text x="'+(mL+ci*gw+gw/2).toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle">'+WK.esc(c)+'</text>';
  });
  if(o.meta){ var ym = mT+ih-(o.meta/top)*ih; s += '<line class="meta" x1="'+mL+'" x2="'+(W-mR)+'" y1="'+ym.toFixed(1)+'" y2="'+ym.toFixed(1)+'"/><text x="'+(W-mR)+'" y="'+(ym-6).toFixed(1)+'" text-anchor="end" style="fill:#FFC857">'+WK.esc(o.metaLabel||'Meta')+' '+fmt(o.meta)+'</text>'; }
  s += '</svg>';
  var leyenda = series.length>1 ? '<div class="wk-cols-legend">'+series.map(function(se,i){ return '<span><i style="background:'+(se.color||PALETA[i%PALETA.length])+'"></i>'+WK.esc(se.nombre)+'</span>'; }).join('')+'</div>' : '';
  return s + leyenda;
};

/* Simulador "what-if". o:{id,titulo,sub,sliders:[{k,label,min,max,step,val,fmt}],calc(vals)->{gauge:{...},stats:[{valor,label}],nota}} */
WK._wi = {};
WK.whatif = function(o){
  WK._wi[o.id] = o;
  var rows = o.sliders.map(function(sl){ return '<div class="wk-wi-row"><label><span>'+WK.esc(sl.label)+'</span><b data-wv="'+sl.k+'"></b></label><input type="range" data-wi="'+o.id+'" data-k="'+sl.k+'" min="'+sl.min+'" max="'+sl.max+'" step="'+(sl.step||1)+'" value="'+sl.val+'"></div>'; }).join('');
  return '<div class="wk-wi" data-wi-root="'+o.id+'"><div class="wk-wi-sl">'+rows+'<div><button type="button" class="wk-wi-reset" data-wi-reset="'+o.id+'">↺ Restablecer</button></div></div><div class="wk-wi-out" data-wo="'+o.id+'"></div></div>';
};
function wiRender(id, root){
  var o = WK._wi[id]; if(!o) return; var vals = {};
  (root||document).querySelectorAll('input[data-wi="'+id+'"]').forEach(function(inp){
    vals[inp.getAttribute('data-k')] = Number(inp.value);
    var sl = o.sliders.filter(function(s){ return s.k === inp.getAttribute('data-k'); })[0];
    var pct = (inp.value-inp.min)/(inp.max-inp.min)*100; inp.style.setProperty('--p', pct+'%');
    var lab = (root||document).querySelector('[data-wi-root="'+id+'"] [data-wv="'+sl.k+'"]'); if(lab) lab.textContent = sl.fmt ? sl.fmt(Number(inp.value)) : inp.value;
  });
  var r = o.calc(vals), out = (root||document).querySelector('[data-wo="'+id+'"]'); if(!out) return;
  out.innerHTML = (r.gauge ? WK.gauge(Object.assign({ dark:true }, r.gauge)) : '') + (r.stats ? WK.stats(r.stats) : '') + (r.nota ? '<div class="wk-wi-note">'+r.nota+'</div>' : '');
  out.querySelectorAll('.wk-arc').forEach(function(a){ a.style.animation = 'wkdraw .5s ease both'; a.style.animationPlayState = 'running'; });
}

/* Dueño del tablero (foto) — se agrega solo en el encabezado de cada WBR */
WK.OWNERS = {
  finanzas:{ nombre:'Mauricio Reyes', cargo:'CFO', rol:'Finanzas' }, ventas:{ nombre:'Omar Dávila', cargo:'Director Comercial', rol:'Ventas & Pipeline', foto:'/assets/owners/omar.png' }, operaciones:{ nombre:'Yurima Choco', cargo:'Directora de Operaciones', rol:'Operaciones', foto:'/assets/owners/yurima.png' },
  productos:{ nombre:'Omar Dávila', cargo:'Director Comercial', rol:'Target clientes', foto:'/assets/owners/omar.png' }, ccflex:{ rol:'CC Flex' }, bx:{ nombre:'María Flores', cargo:'Gerente de BX', rol:'Business Experience', foto:'/assets/owners/maria.png' },
  ejecutivo:{ nombre:'Paul Sirrs', cargo:'CEO', rol:'Centro de Mando', foto:'/assets/owners/paul.png' },
  marketing:{ nombre:'Nasarid Ramirez', cargo:'Gerente de Marketing', rol:'Marketing', foto:'/assets/owners/nasarid.png' },
  anuncios:{ nombre:'Paul Sirrs', cargo:'CEO', rol:'Anuncios', foto:'/assets/owners/paul.png' }, cta:{ nombre:'Angel Aiza', cargo:'Director de Estrategia y Procesos', rol:'Call to Action', foto:'/assets/owners/angel.png' }, vop:{ rol:'VOP', equipo:[ { nombre:'Omar Dávila', cargo:'Director Comercial', foto:'/assets/owners/omar.png' }, { nombre:'Yurima Choco', cargo:'Directora de Operaciones', foto:'/assets/owners/yurima.png' }, { nombre:'Samuel Aiza', cargo:'Presales Manager', foto:'/assets/owners/sam.png' } ] }, presales:{ rol:'Tablero de control', etiqueta:'Solution Engineers', equipo:[ { nombre:'Gustavo Najar', cargo:'Solution Engineer', foto:'/assets/owners/gustavo.png' }, { nombre:'Rocío Anaya', cargo:'Solution Engineer', foto:'/assets/owners/rocio.png' }, { nombre:'Samuel Aiza', cargo:'Presales Manager', foto:'/assets/owners/sam.png' } ] },
  baseinstalada:{ nombre:'Daniela Flores', cargo:'Cultura y Business Experience', rol:'Base Instalada', foto:'/assets/owners/daniela.png' }
};
function iniciales(t){ return String(t||'').split(/\s+/).filter(Boolean).slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase(); }
function ownerSlug(){ var b = document.body && document.body.getAttribute('data-wk-owner'); if(b) return b; var m = (location.pathname||'').match(/wbr-([a-z0-9]+)/i); return m ? m[1].toLowerCase() : null; }
/* Foto del dueño: /assets/owners/<slug>.png (recorte sin fondo → efecto de profundidad) o .jpg (retrato circular) */
WK.owner = function(slug){
  var cfg = WK.OWNERS[slug]; if(!cfg) return null;
  if(cfg.equipo) return ownerEquipo(cfg);
  var ini = iniciales(cfg.nombre) || iniciales(cfg.rol), nombre = cfg.nombre || cfg.rol;
  var box = document.createElement('div'); box.className = 'wk-owner';
  box.innerHTML = '<div class="wk-avatar"><div><span>'+WK.esc(ini)+'</span></div></div>' +
    '<div class="wk-owner-cap"><small>Dueño del tablero</small><b>'+WK.esc(nombre)+'</b>'+(cfg.cargo ? '<em>'+WK.esc(cfg.cargo)+' · '+WK.esc(cfg.rol)+'</em>' : '')+'</div>';
  function probar(url, ok, fallo){ var im = new Image(); im.alt = nombre; im.onload = function(){ ok(im); }; im.onerror = fallo; im.src = url; }
  probar(cfg.foto || ('/assets/owners/'+slug+'.png'), function(im){
    var pop = document.createElement('div'); pop.className = 'wk-pop';
    pop.innerHTML = '<div class="ring"></div><div class="disc"></div><div class="ph"></div>'; pop.querySelector('.ph').appendChild(im);
    box.replaceChild(pop, box.firstChild);
    var h = document.querySelector('header'); if(h) h.addEventListener('mousemove', function(e){ var r = h.getBoundingClientRect(); pop.style.setProperty('--px', (((e.clientX-r.left)/r.width)*2-1).toFixed(3)); pop.style.setProperty('--py', (((e.clientY-r.top)/r.height)*2-1).toFixed(3)); });
    if(h) h.addEventListener('mouseleave', function(){ pop.style.setProperty('--px', 0); pop.style.setProperty('--py', 0); });
  }, function(){
    probar('/assets/owners/'+slug+'.jpg', function(im){ var d = box.querySelector('.wk-avatar>div'); d.innerHTML = ''; d.appendChild(im); }, function(){});
  });
  return box;
};
/* Varios dueños: retratos con efecto de profundidad, uno junto a otro */
function ownerEquipo(cfg){
  var box = document.createElement('div'); box.className = 'wk-owner wk-owner-multi';
  var fotos = document.createElement('div'); fotos.className = 'wk-pops'; box.appendChild(fotos);
  var h = document.querySelector('header');
  cfg.equipo.forEach(function(p){
    var pop = document.createElement('div'); pop.className = 'wk-pop'; pop.setAttribute('data-tip', p.nombre+'\n'+p.cargo);
    pop.innerHTML = '<div class="ring"></div><div class="disc"></div><div class="ph"></div>'; fotos.appendChild(pop);
    var im = new Image(); im.alt = p.nombre; im.onload = function(){ pop.querySelector('.ph').appendChild(im); }; im.onerror = function(){ pop.querySelector('.ph').innerHTML = '<span class="ini">'+WK.esc(iniciales(p.nombre))+'</span>'; }; im.src = p.foto;
    if(h){ h.addEventListener('mousemove', function(e){ var r = h.getBoundingClientRect(); pop.style.setProperty('--px', (((e.clientX-r.left)/r.width)*2-1).toFixed(3)); pop.style.setProperty('--py', (((e.clientY-r.top)/r.height)*2-1).toFixed(3)); });
      h.addEventListener('mouseleave', function(){ pop.style.setProperty('--px', 0); pop.style.setProperty('--py', 0); }); }
  });
  var cap = document.createElement('div'); cap.className = 'wk-owner-cap';
  cap.innerHTML = '<small>'+WK.esc(cfg.etiqueta || ('Dueños del tablero · '+cfg.rol))+'</small>' + cfg.equipo.map(function(p){ return '<b>'+WK.esc(p.nombre)+' <em>'+WK.esc(p.cargo)+'</em></b>'; }).join('');
  box.appendChild(cap);
  return box;
}
/* Cambia el retrato del encabezado (p. ej. al filtrar por una persona): cfg con equipo[] */
WK.ownerSet = function(cfg){
  var h = document.querySelector('header'); if(!h) return;
  var viejo = h.querySelector('.wk-owner'); if(!viejo) return;
  var nuevo = ownerEquipo(cfg); viejo.parentNode.replaceChild(nuevo, viejo);
};
function inyectarOwner(){
  var slug = ownerSlug(); if(!slug) return;
  var h = document.querySelector('header'); if(!h || h.getAttribute('data-wk-owner-ok')) return;
  var left = h.firstElementChild; if(!left) return;
  var box = WK.owner(slug); if(!box) return;
  h.setAttribute('data-wk-owner-ok','1');
  var wrap = document.createElement('div'); wrap.className = 'wk-owner-txt';
  while(left.firstChild) wrap.appendChild(left.firstChild);
  var texto = wrap; var cont = document.createElement('div'); cont.className = 'wk-owner-row';
  cont.appendChild(box); cont.appendChild(texto); left.appendChild(cont);
}

/* Tooltip global (data-tip) */
var tipEl = null;
function mostrarTip(e){
  var t = e.target && e.target.closest ? e.target.closest('[data-tip]') : null;
  if(!t){ if(tipEl) tipEl.classList.remove('on'); return; }
  if(!tipEl){ tipEl = document.createElement('div'); tipEl.className = 'wk-tip'; document.body.appendChild(tipEl); }
  var lineas = String(t.getAttribute('data-tip')).split('\n');
  tipEl.innerHTML = '<b>'+WK.esc(lineas[0])+'</b>' + lineas.slice(1).map(function(l){ return '<span>'+WK.esc(l)+'</span>'; }).join('');
  var x = e.clientX + 16, y = e.clientY + 16, w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  if(x + w > innerWidth - 8) x = e.clientX - w - 16; if(y + h > innerHeight - 8) y = e.clientY - h - 16;
  tipEl.style.left = Math.max(8,x)+'px'; tipEl.style.top = Math.max(8,y)+'px'; tipEl.classList.add('on');
}

/* Conteo animado de cifras */
function contar(el){
  var nodo = el.firstChild; if(!nodo || nodo.nodeType !== 3) return;
  var txt = nodo.nodeValue, m = txt.match(/^([^\d\-]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if(!m || el._wkCont) return; el._wkCont = true;
  var fin = parseFloat(m[2].replace(/,/g,'')), dec = (m[2].split('.')[1]||'').length, coma = m[2].indexOf(',') >= 0, t0 = null, dur = 1300;
  function fmt(v){ var s = v.toFixed(dec); if(coma){ var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = p.join('.'); } return m[1] + s + m[3]; }
  function paso(ts){ if(!t0) t0 = ts; var k = Math.min(1,(ts-t0)/dur), e = 1 - Math.pow(1-k,3); nodo.nodeValue = fmt(fin*e); if(k<1) requestAnimationFrame(paso); else nodo.nodeValue = txt; }
  nodo.nodeValue = fmt(0); requestAnimationFrame(paso);
}
var SEL_NUM = '.wk-hero-val,.wk-kpi-val,.wk-stat b,.wk-gauge .v,.wk-donut .v';
function revelar(el){
  if(el.classList.contains('wk-vis')) return; el.classList.add('wk-vis');
  if(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  el.querySelectorAll(SEL_NUM).forEach(contar);
  if(el.matches && el.matches(SEL_NUM)) contar(el);
}
var io = null;
function observar(root){
  var els = (root||document).querySelectorAll('.wk-card,.wk-hero,.wk-kpi,.wk-band,.wk-callout');
  var i = 0;
  els.forEach(function(el){
    if(el._wkObs) return; el._wkObs = true; if(el.classList.contains('wk-card')||el.classList.contains('wk-band')||el.classList.contains('wk-kpi')||el.classList.contains('wk-callout')) el.classList.add('wk-rv');
    el.style.setProperty('--wki', (i++ % 6));
    if(io) io.observe(el); else revelar(el);
  });
  setTimeout(function(){ (root||document).querySelectorAll('.wk-rv:not(.wk-vis)').forEach(function(el){ var r = el.getBoundingClientRect(); if(r.top < innerHeight*1.2) revelar(el); }); }, 400);
}
/* inclinación 3D de los tiles */
function inclinar(e){
  var h = e.target && e.target.closest ? e.target.closest('.wk-hero') : null;
  document.querySelectorAll('.wk-hero.tilt').forEach(function(x){ if(x !== h){ x.classList.remove('tilt'); x.style.transform = ''; } });
  if(!h) return; var r = h.getBoundingClientRect(), px = (e.clientX-r.left)/r.width-.5, py = (e.clientY-r.top)/r.height-.5;
  h.classList.add('tilt'); h.style.transform = 'perspective(900px) rotateX('+(-py*7).toFixed(2)+'deg) rotateY('+(px*9).toFixed(2)+'deg) translateY(-3px)';
}
WK.escalar = function(){
  var main = document.querySelector('.wk-main'); if(!main) return; if(document.getElementById('pe')){ main.style.zoom=''; return; } /* ECharts desalinea el cursor con CSS zoom */
  var z = Math.max(1, Math.min(1.55, innerWidth/1500));
  main.style.zoom = z > 1.02 ? z.toFixed(3) : '';
};
WK.fx = function(root){
  document.body.classList.add('wk-dark');
  inyectarOwner(); WK.escalar();
  document.querySelectorAll('.topnav-logo img').forEach(function(im){ if(im.src.indexOf('logo_light') >= 0) im.src = im.src.replace('logo_light','logo_dark'); });
  observar(root);
  (root||document).querySelectorAll('[data-wi-root]').forEach(function(r){ var id = r.getAttribute('data-wi-root'); if(r._wkWi) return; r._wkWi = true; wiRender(id, r); });
  if(WK.sortable) WK.sortable(root||document);
};
var fxTimer = null;
function iniciarFx(){
  document.body.classList.add('wk-dark');
  if('IntersectionObserver' in window) io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ revelar(e.target); io.unobserve(e.target); } }); }, { threshold:.12 });
  document.addEventListener('mouseover', mostrarTip); document.addEventListener('mousemove', function(e){ mostrarTip(e); inclinar(e); }, { passive:true });
  document.addEventListener('mouseleave', function(){ if(tipEl) tipEl.classList.remove('on'); });
  document.addEventListener('input', function(e){ var t = e.target; if(t && t.getAttribute && t.getAttribute('data-wi')) wiRender(t.getAttribute('data-wi'), document); });
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-wi-reset]'); if(!b) return; var id = b.getAttribute('data-wi-reset'), o = WK._wi[id]; if(!o) return; o.sliders.forEach(function(sl){ var inp = document.querySelector('input[data-wi="'+id+'"][data-k="'+sl.k+'"]'); if(inp) inp.value = sl.val; }); wiRender(id, document); });
  window.addEventListener('resize', WK.escalar);
  new MutationObserver(function(){ clearTimeout(fxTimer); fxTimer = setTimeout(function(){ WK.fx(document); }, 40); }).observe(document.body, { childList:true, subtree:true });
  WK.fx(document);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarFx); else iniciarFx();

/* ---- Enviar vista por correo (PDF) — todos los tableros WBR ---- */
(function(){
  var m = (location.pathname||'').match(/\/(wbr-[a-z0-9-]+)(?:\.html)?\/?$/i);
  if(!m) return;
  var PAGINA = m[1].toLowerCase(), LIBS = ['https://cdn.jsdelivr.net/npm/html2canvas-pro@2.4.5/dist/html2canvas-pro.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
  var CSS = '.wk-sendbar{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;gap:8px}.wk-send{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:11px 18px;background:#1E5BB8;color:#fff;font:600 13px Poppins,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(10,18,38,.35);transition:transform .12s,background .12s}.wk-send:hover{background:#2F6FD6;transform:translateY(-2px)}'+
  '.wk-sm{position:fixed;inset:0;z-index:300;background:rgba(3,8,22,.7);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Poppins,"Segoe UI",sans-serif}.wk-sm *{box-sizing:border-box}'+
  '.wk-sm-box{background:#fff;color:#16223A;border-radius:14px;width:100%;max-width:520px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden}.wk-sm-h{background:#07153A;color:#fff;padding:16px 20px}.wk-sm-h small{display:block;font-size:10.5px;letter-spacing:.18em;color:#66B6FF;font-weight:600}.wk-sm-h b{font-size:16px;font-weight:600}'+
  '.wk-sm-b{padding:16px 20px;display:grid;gap:12px}.wk-sm-b label{display:grid;gap:4px;font-size:11.5px;font-weight:600;color:#5E6B82}.wk-sm-b input,.wk-sm-b textarea{border:1px solid #D8E2EE;border-radius:8px;padding:9px 11px;font:400 13px Poppins,"Segoe UI",sans-serif;color:#16223A;width:100%}.wk-sm-b textarea{min-height:76px;resize:vertical}.wk-sm-b input:focus,.wk-sm-b textarea:focus{outline:2px solid #1E5BB8;border-color:transparent}'+
  '.wk-sm-n{font-size:11.5px;color:#5E6B82;line-height:1.5}.wk-sm-st{font-size:12.5px;min-height:18px;font-weight:600}.wk-sm-st.err{color:#C2362B}.wk-sm-st.ok{color:#18794E}'+
  '.wk-sm-f{display:flex;gap:8px;justify-content:flex-end;padding:0 20px 18px;flex-wrap:wrap}.wk-sm-f button{border-radius:8px;padding:9px 16px;font:600 13px Poppins,"Segoe UI",sans-serif;cursor:pointer;border:1px solid #D8E2EE;background:#fff;color:#16223A}.wk-sm-f button.pr{background:#1E5BB8;border-color:#1E5BB8;color:#fff}.wk-sm-f button:disabled{opacity:.55;cursor:wait}';
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  var libP = null;
  function cargaScript(u){ return new Promise(function(ok, ko){ var s = document.createElement('script'); s.src = u; s.onload = ok; s.onerror = function(){ ko(new Error('No se pudo cargar el generador de PDF.')); }; document.head.appendChild(s); }); }
  function cargarLib(){ if(window.html2canvas && window.jspdf) return Promise.resolve(); if(libP) return libP; libP = Promise.all(LIBS.map(function(u){ return (u.indexOf('html2canvas')>=0 && window.html2canvas) || (u.indexOf('jspdf')>=0 && window.jspdf) ? null : cargaScript(u); })).catch(function(e){ libP = null; throw e; }); return libP; }
  function hoy(){ var d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function titulo(){ return (document.title||'WBR').split('·')[0].trim(); }
  function archivo(){ return titulo().replace(/[^A-Za-z0-9]+/g,'_').replace(/^_|_$/g,'') + '_' + hoy() + '.pdf'; }
  function esperar(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  // Reparte las capturas en páginas A4 horizontales; cada captura empieza en página nueva y se corta antes de un bloque, no a la mitad.
  function aPdf(partes){
    var J = window.jspdf.jsPDF, pdf = new J({ unit:'mm', format:'a4', orientation:'landscape', compress:true }), primera = true;
    var PW = pdf.internal.pageSize.getWidth(), PH = pdf.internal.pageSize.getHeight(), mg = 6, cw = PW - 2*mg;
    partes.forEach(function(P){
      var trozos = P.trozos || [{ canvas:P.canvas, y0:0 }], W = trozos[0].canvas.width, k = cw / W, hPx = Math.floor((PH - 2*mg) / k), rgb = P.fondo || [10,18,38];
      var cortes = (P.cortes||[]).slice().sort(function(a,b){ return a-b; }), y = 0, H = P.alto || trozos[0].canvas.height;
      while(y < H - 3){
        var fin = Math.min(H, y + hPx);
        if(fin < H){ var c = cortes.filter(function(c){ return c > y + hPx*0.2 && c <= fin; }).pop(); if(c != null) fin = c; }
        var s = document.createElement('canvas'); s.width = W; s.height = fin - y;
        var cx = s.getContext('2d'); cx.fillStyle = 'rgb(' + rgb.join(',') + ')'; cx.fillRect(0, 0, s.width, s.height);
        trozos.forEach(function(t){ if(!t.canvas.width || !t.canvas.height) return; var a0 = Math.max(y, t.y0), a1 = Math.min(fin, t.y0 + t.canvas.height); if(a1 > a0) cx.drawImage(t.canvas, 0, a0 - t.y0, W, a1 - a0, 0, a0 - y, W, a1 - a0); });
        if(!primera) pdf.addPage(); primera = false;
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]); pdf.rect(0, 0, PW, PH, 'F');
        pdf.addImage(s.toDataURL('image/jpeg', .93), 'JPEG', mg, mg, cw, (fin - y) * k);
        y = fin;
      }
    });
    return pdf.output('datauristring');
  }
  function fondoDe(el){ while(el){ var c = getComputedStyle(el).backgroundColor, m = c && c.match(/[\d.]+/g); if(m && m.length >= 3 && !(m.length >= 4 && +m[3] === 0) && c !== 'rgba(0, 0, 0, 0)') return [+m[0], +m[1], +m[2]]; el = el.parentElement; } return [10,18,38]; }
  var SEL_BLOQUES = '.cm-p,.cm-box,.wk-kpis,.wk-hero-grid,.wk-card,.wk-band,.wk-callout,.card,.kpis,.kpi,.verdict,.ins,.g2,.g3,.top,.health,.srcdist,.funnelwrap,.vstates,header,section,article';
  var OCULTOS = '.dl-fab,.dl-panel,.wk-sendbar,.wk-sm,.toast,.wk-tip,.topnav,.wk-nav,#peModal,.pm,nav.topnav,.nav-dropdown-menu';
  // Captura un elemento a lienzo: sin zoom, sin animaciones de entrada, ancho fijo para que todos los PDFs se vean igual.
  async function cap(el, o){
    o = o || {};
    try{ await document.fonts.ready; }catch(e){}
    document.querySelectorAll('.wk-rv:not(.wk-vis)').forEach(function(n){ n.classList.add('wk-vis'); });
    await esperar(o.espera || 900);
    for(var w = 0; w < 50 && /analizando el corte|está analizando/i.test(document.body.innerText || ''); w++) await esperar(500);
    var fondo = fondoDe(el), altoVivo = el.scrollHeight, sc = altoVivo <= 7000 ? 2 : 1, cortes = [], alto = 0, trozos = [], CH = 6000;
    el.setAttribute('data-wk-cap', '1');
    var opts = { scale:sc, backgroundColor:'rgb(' + fondo.join(',') + ')', useCORS:true, logging:false, windowWidth:1400, scrollX:0, scrollY:-window.scrollY,
      ignoreElements:function(n){ return n.matches && n.matches(OCULTOS); },
      onclone:function(doc){
        var st = doc.createElement('style'); st.textContent = '*{animation:none!important;transition:none!important}.cm-al{max-height:none!important;overflow:visible!important}.wk-rv,.cm-a,a.cm-p{opacity:1!important;transform:none!important}[data-wk-cap]{width:1400px!important;max-width:1400px!important}'; doc.head.appendChild(st);
        doc.querySelectorAll('.wk-main').forEach(function(m){ m.style.zoom = ''; });
        doc.querySelectorAll(OCULTOS).forEach(function(n){ n.style.display = 'none'; });
        doc.querySelectorAll('.wk-card,.wk-band,.wk-callout').forEach(function(n){ var t = (n.textContent || '').slice(0, 90); if(/simulador|simular/i.test(t) || (n.matches('.wk-card') && n.querySelector('[data-wi],[data-wi-root],input[type=range]'))) n.style.display = 'none'; });
        doc.querySelectorAll('details:not([open])').forEach(function(d){ Array.prototype.forEach.call(d.children, function(c){ if(c.tagName !== 'SUMMARY') c.style.display = 'none'; }); });
        var c = doc.querySelector('[data-wk-cap]'); if(!c) return; var r0 = c.getBoundingClientRect(), t0 = r0.top; alto = Math.ceil(c.scrollHeight * sc); cortes.length = 0;
        var SEL = o.bloques || SEL_BLOQUES, nodos = [].slice.call(c.querySelectorAll(SEL)).filter(function(n){ return n.getBoundingClientRect().height > 8; });
        var rec = nodos.map(function(n){ var r = n.getBoundingClientRect(); return { n:n, t:r.top - t0, b:r.bottom - t0 }; });
        // hojas = bloques sin otro bloque adentro; un corte es válido solo si ninguna hoja lo atraviesa
        var hojas = rec.filter(function(x){ return !x.n.querySelector(SEL); });
        var bandas = rec.filter(function(x){ return x.n.matches('.wk-band'); }).map(function(x){ return x.t; });
        rec.forEach(function(x){
          var y = x.t; if(y < 4) return;
          if(!x.n.matches('.wk-band') && bandas.some(function(b){ return y > b && y - b < 150; })) return;
          if(hojas.some(function(h){ return h.t < y - 3 && h.b > y + 3; })) return;
          cortes.push(Math.round(y * sc));
        });
      } };
    try{
      // trozos de a lo más CH px (CSS) para no rebasar el límite de lienzo del navegador en tableros muy largos
      var primero = await html2canvas(el, Object.assign({}, opts, altoVivo > CH ? { y:0, height:CH } : {}));
      if(!primero.width || !primero.height) throw new Error('No se pudo capturar la página.');
      trozos.push({ canvas:primero, y0:0 });
      var total = Math.max(alto, primero.height);
      for(var y0 = CH; y0 < total / sc - 2; y0 += CH){
        var cv2 = await html2canvas(el, Object.assign({}, opts, { y:y0, height:Math.max(2, Math.ceil(Math.min(CH, total / sc - y0))) }));
        if(cv2.width && cv2.height) trozos.push({ canvas:cv2, y0:Math.round(y0 * sc) });
      }
    } finally { el.removeAttribute('data-wk-cap'); }
    return { trozos:trozos, alto:Math.max(alto, trozos[trozos.length-1].y0 + trozos[trozos.length-1].canvas.height), cortes:cortes, fondo:fondo };
  }
  async function generarPdf(){
    await cargarLib();
    if(typeof window.WK_SEND_READY === 'function' && !window.WK_SEND_READY()) throw new Error('Primero carga los datos del tablero.');
    if(typeof window.WK_PDF_PLAN === 'function') return aPdf(await window.WK_PDF_PLAN(cap));
    return aPdf([await cap(document.body)]);
  }
  function descargar(uri, nombre){ var a = document.createElement('a'); a.href = uri; a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); }
  var dominios = ['seidor.com'];
  function abrir(){
    if(document.querySelector('.wk-sm')) return;
    var ov = document.createElement('div'); ov.className = 'wk-sm';
    ov.innerHTML = '<div class="wk-sm-box" role="dialog" aria-modal="true"><div class="wk-sm-h"><small>ENVIAR VISTA</small><b></b></div><div class="wk-sm-b">'+
      '<label>Para (separa varios con coma)<input type="text" id="wkTo" placeholder="nombre@seidor.com" autocomplete="off"></label>'+
      '<label>Asunto<input type="text" id="wkSubj"></label>'+
      '<label>Mensaje (opcional)<textarea id="wkMsg" placeholder="Ej. Te comparto el corte de esta semana…"></textarea></label>'+
      '<div class="wk-sm-n" id="wkNote"></div><div class="wk-sm-st" id="wkSt"></div></div>'+
      '<div class="wk-sm-f"><button type="button" id="wkPrev">Descargar PDF</button><button type="button" id="wkCancel">Cancelar</button><button type="button" class="pr" id="wkGo">Enviar</button></div></div>';
    document.body.appendChild(ov);
    var $ = function(id){ return ov.querySelector('#'+id); };
    ov.querySelector('.wk-sm-h b').textContent = titulo();
    $('wkSubj').value = titulo() + ' · corte del ' + hoy();
    $('wkNote').textContent = 'Se envía como PDF adjunto: una foto de lo que ves ahora, sin acceso al portal. Solo a correos ' + dominios.map(function(d){ return '@'+d; }).join(', ') + '. Queda registro de quién lo envió y a quién.';
    var cerrar = function(){ document.removeEventListener('keydown', esc); ov.remove(); };
    var esc = function(e){ if(e.key === 'Escape') cerrar(); };
    document.addEventListener('keydown', esc);
    ov.addEventListener('mousedown', function(e){ if(e.target === ov) cerrar(); });
    $('wkCancel').onclick = cerrar; setTimeout(function(){ $('wkTo').focus(); }, 50);
    var say = function(t, c){ var s = $('wkSt'); s.textContent = t || ''; s.className = 'wk-sm-st' + (c ? ' ' + c : ''); };
    var busy = function(b){ ['wkPrev','wkGo','wkCancel'].forEach(function(i){ $(i).disabled = b; }); };
    $('wkPrev').onclick = async function(){ busy(true); say('Generando PDF…'); try{ var u = await generarPdf(); descargar(u, archivo()); say('PDF descargado.', 'ok'); }catch(e){ say(e.message || 'No se pudo generar el PDF.', 'err'); } busy(false); };
    $('wkGo').onclick = async function(){
      var para = $('wkTo').value.split(/[,;\s]+/).map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean);
      if(!para.length){ say('Agrega al menos un destinatario.', 'err'); return; }
      var malos = para.filter(function(x){ return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) || !dominios.some(function(d){ return x.endsWith('@'+d); }); });
      if(malos.length){ say('Solo se puede enviar a correos ' + dominios.map(function(d){ return '@'+d; }).join(', ') + ': ' + malos.join(', '), 'err'); return; }
      busy(true); say('Generando PDF…');
      try{
        var u = await generarPdf(); say('Enviando…');
        var r = await fetch('/api/wbr-enviar', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ pagina:PAGINA, para:para, asunto:$('wkSubj').value, mensaje:$('wkMsg').value, pdf:u, archivo:archivo() }) });
        var j = {}; try{ j = await r.json(); }catch(e){}
        if(!r.ok || !j.ok) throw new Error(j.error || 'No se pudo enviar (' + r.status + ').');
        say('Enviado a ' + para.join(', ') + '.', 'ok'); $('wkGo').style.display = 'none'; $('wkPrev').style.display = 'none'; $('wkCancel').textContent = 'Cerrar'; $('wkCancel').disabled = false; return;
      }catch(e){ say(e.message || 'No se pudo enviar.', 'err'); }
      busy(false);
    };
  }
  async function descargaDirecta(btn){
    var t = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Generando…';
    try{ var u = await generarPdf(); descargar(u, archivo()); }catch(e){ alert(e.message || 'No se pudo generar el PDF.'); }
    btn.disabled = false; btn.innerHTML = t;
  }
  function boton(){
    if(document.querySelector('.wk-sendbar')) return;
    var bar = document.createElement('div'); bar.className = 'wk-sendbar wk-nosend';
    var d = document.createElement('button'); d.type = 'button'; d.className = 'wk-send wk-nosend'; d.style.background = '#0E1E3F'; d.innerHTML = '<span aria-hidden="true">⬇</span> Descargar PDF'; d.onclick = function(){ descargaDirecta(d); };
    var b = document.createElement('button'); b.type = 'button'; b.className = 'wk-send wk-nosend'; b.innerHTML = '<span aria-hidden="true">✉</span> Enviar vista'; b.onclick = abrir;
    bar.appendChild(d); bar.appendChild(b); document.body.appendChild(bar);
    try{ fetch('/api/wbr-enviar').then(function(r){ return r.ok ? r.json() : null; }).then(function(j){ if(j && j.dominios && j.dominios.length) dominios = j.dominios; }).catch(function(){}); }catch(e){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boton); else boton();
})();

window.WK = WK;
})();
