// Base de conocimiento del asistente Delfos del portal. Es lo ÚNICO que el asistente sabe del sitio (más lo que ve en la pantalla del usuario).
// Mantenerla al día cuando se agreguen o cambien páginas.
export const CONOCIMIENTO_PORTAL = `
PORTAL DE PREVENTAS DE SEIDOR MÉXICO (crmpresalesmx.com)
Sitio interno del equipo comercial, de preventas y de proyectos. Cada página tiene permisos por persona: sin acceso, lectura o completo (se administra en Roles y Permisos). Quien solo tiene lectura puede ver pero no cargar ni editar datos.

== MENÚ Y PÁGINAS ==
Inicio (/index.html): portada con accesos a todo.
WBR (Weekly Business Review, sesión semanal de Management):
- Resumen — Todas las áreas (/wbr.html): lista de todos los tableros WBR con su dueño.
- Centro de Mando (/wbr-ejecutivo.html): vista ejecutiva, dueño Paul Sirrs (CEO). Muestra el pulso de la empresa (semáforo de indicadores), las señales que requieren atención y un panel por tablero con sus 4 indicadores clave, el cambio contra el corte anterior y qué tan reciente es el último corte. Es solo lectura. Arriba trae un resumen ejecutivo redactado por Delfos con los datos de la pantalla (botón Regenerar). Al hacer clic en un panel se abre el detalle (clientes con más cartera vencida, proyectos a vigilar, churn y escalaciones, acciones con responsable) y el cambio contra el corte anterior. También muestra compromisos abiertos por responsable y la cobertura de datos (qué tablero está desactualizado). Se actualiza solo cada 5 minutos.
- Finanzas (/wbr-finanzas.html): facturación YTD, cobranza YTD, cartera vencida y zona crítica (+6 meses). Dueño: Mauricio Reyes (CFO). El Excel viene en EUROS y se muestra en €. Carga el Excel semanal con las pestañas "Finanzas" y "Aging".
- Ventas & Pipeline (/wbr-ventas.html): ventas YTD, trimestre actual, forecast vs. meta y pipeline. Dueño: Omar Dávila (Director Comercial). USD. Excel con la pestaña "Ventas & Pipeline".
- Operaciones (/wbr-operaciones.html): proyectos por LOB, con desvío, con riesgo y Go-Lives. Dueña: Yurima Choco (Directora de Operaciones). Excel con la pestaña "Operaciones".
- Business Experience (/wbr-bx.html): clientes tocados, riesgos de churn, escalaciones y oportunidades en seguimiento. Dueña: María Flores (Gerente de BX). USD. Excel semanal de BX (hoja "BX Dashboard Semanal").
- CCFlex (/wbr-ccflex.html): ventas y cobranza del programa CCFlex, C&S vs. A&O (USD). Dueño por asignar.
- Call to Action (/wbr-cta.html): acciones semanales con responsable, fecha y estatus; marca las vencidas. Dueño: Angel Aiza (Director de Estrategia y Procesos). Excel con la pestaña "Call to Action". Las fechas van en DD/MM/AA.
- Anuncios (/wbr-anuncios.html): comunicados internos de la sesión. Dueño: Paul Sirrs (CEO).
- Marketing (/wbr-marketing.html): Pipeline Evolution (¿crecemos o consumimos pipeline?), cortes semanales, cambios entre cortes y calidad de datos. Dueña: Nasarid Ramirez (Gerente de Marketing). USD. Cada semana se carga el export de HubSpot (MX_PIPE, .xls o .xlsx) con el botón "Cargar / actualizar datos". El Excel "Dashboard Ventas by LOB" (targets de deals por LOB) se carga con el mismo botón solo cuando cambian las metas. El win rate cuenta las canceladas como perdidas.
- MKT Test (/wbr-mkt-test.html): copia de prueba de Marketing con el diseño de los demás WBR; solo lectura, no guarda cortes.
- Tablero VOP (/wbr-vop.html): economía del deal (márgenes, aprobación Deal Desk, flujo de caja y riesgo). Se carga la hoja de estimación (proyecto, T&M, rollout) o la calculadora AMS. Dueños: Omar Dávila, Yurima Choco y Samuel Aiza.
Cómo funcionan los tableros WBR: cada carga de Excel queda guardada en la bitácora de cortes (quién la subió y cuándo); se puede abrir cualquier corte anterior y volver al actual. Muchos traen un insight automático de Delfos sobre el corte. Cargar datos requiere permiso "completo" en ese tablero.
Enviar o descargar una vista: en cada tablero WBR hay dos botones abajo a la derecha. "Descargar PDF" baja la vista como PDF. "Enviar vista" la manda por correo en PDF solo a correos @seidor.com (máximo 10 destinatarios; hay un límite de 10 envíos por hora por persona). Los PDF no incluyen los simuladores.

Comercial:
- Lista de Precios (/precios.html): paquetes y tarifas baseline en USD para armar propuestas; el valor final depende del alcance.
- Ficha del Cliente (/ficha.html): se llena para enganchar a preventas; se agrega directo al CRM PresalesMX.
- Investigación de Prospecto (/prospecto.html): escribes el nombre de una empresa y recibes una investigación para preparar la primera llamada o correo.
- Generador de Formato de Alta (/alta.html): se sube el SOW o estimación firmada y se completa el resto con un formulario.
- Explicador de Métricas SAP (/metricas-sap.html): para BX, explica qué mide cada métrica de un tablero de SAP Cloud ALM.
- Formularios KYC / Diligencia Debida (/kyc.html): identificación de terceros (clientes o proveedores) antes de contratar, Anexos I y II.
- Contactos SAP (/contactos-sap.html): directorio de personas clave de SAP por organigrama.
Presales:
- CRM PresalesMX (/pipeline.html): tablero de seguimiento por etapa, compartido con el equipo.
- Tablero de Control (/kpis.html): KPIs de preventas en vivo desde CRM PresalesMX; se filtra por Solution Engineer (Gustavo Najar, Rocío Anaya, Samuel Aiza).
- Revisión de SOW (/sow-review.html): se sube un Word o Excel y devuelve retroalimentación automática de riesgos y huecos.
- Handover Comercial → Operaciones (/handover.html): lo que Operaciones necesita saber al recibir un proyecto ganado.
- Estimador de Esfuerzo (/estimador.html): para usar en preventas, antes de que exista un SOW o proyecto.
- Técnicas de Presentación (/tecnicas-presentacion.html): material de apoyo.
- Agentes (/agentes.html): herramientas de IA powered by Delfos para los equipos.
- Documentos de Apoyo (/documentos.html): procesos, plantillas y herramientas del equipo de preventas.
Operaciones:
- Días Hábiles México (/dias-habiles.html): calcula fechas de proyecto con festivos oficiales.
- Generador de Minutas (/minutas.html): pegas notas de la llamada y devuelve una minuta estructurada.
- Redactor de Correos a Cliente (/correo-cliente.html): describes la situación y da opciones de correo con el tono adecuado.
- Dashboard de Proyecto (/proyecto.html): RAID, dependencias críticas y compromisos por proyecto.
- Checklist de Quality Gates y Cutover (/checklist.html): basado en SAP Activate.
- Iniciar Proyecto desde SOW/DDA (/iniciar-proyecto.html): con el SOW firmado arranca el proyecto con línea base, riesgos y dependencias.
- Vista General del Proyecto (/vista-general.html): línea base, KPIs, avance del checklist y resumen ejecutivo.
- Reporte de Cuenta (/reporte-cuenta.html): todos los proyectos activos de un cliente en una vista, para QBR.
Finanzas:
- Cartera Vencida (/cartera.html): se sube el Excel que ya maneja Finanzas, sin cambiar su formato, para ver antigüedad de saldos por cliente.
Business Experience:
- Base Instalada — Resumen BX (/bx-base-instalada.html): priorización de cuentas Tier 1, 2 y 3; las "No tocar" se excluyen por defecto. Dueña: Daniela Flores.
Administración:
- Auditoría (/auditoria.html): quién hizo qué (creación, edición y borrado), últimas 1,000 acciones.
- Roles y Permisos (/roles.html): controla quién puede ver o editar cada página. Lo administra Sam; toda página nueva queda sin acceso hasta que él la otorga.
- Saludos de Bienvenida (/saludos.html, solo administradores): Sam configura el mensaje animado que una persona ve una vez al día al abrir una página WBR (correo, página, nombre y mensaje; "*" = todos). Tiene vista previa y "Volver a mostrar hoy" para probar.
Asistente Delfos: el botón "Pregúntale a Delfos" (abajo a la izquierda en todas las páginas) abre este chat; responde con la información del portal y, si está activada la casilla, con lo que se ve en la pantalla actual. Hay un límite de 40 preguntas por hora por persona.
Otras: Cómo instalar la app (/instalar.html) explica cómo instalar el portal como app en el equipo.

== PREGUNTAS FRECUENTES ==
- Para pedir acceso a una página, o si dice que no tienes permiso: escribe a Sam (Presales Manager), que administra Roles y Permisos.
- Los montos de Finanzas están en euros (€, en miles K/M); los demás tableros en dólares (USD) salvo que la pantalla diga otra cosa.
- Cada tablero WBR se actualiza cuando su dueño (o quien tenga permiso completo) carga el Excel de la semana.
- Un indicador en verde/ámbar/rojo es un semáforo: en los avances contra meta, verde ≥85%, ámbar 60–85%, rojo <60%; en los de riesgo (desvío, riesgo, zona crítica), verde ≤15%, ámbar 15–30%, rojo >30%.
`;
