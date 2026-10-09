/* ============================================================
   TARIFARIO SEIDOR — DATOS
   Edita este archivo para actualizar precios. No necesitas
   tocar el HTML ni el CSS. Guarda y vuelve a publicar.

   - Precios en USD.
   - "rate" en servicios individuales = tarifa según "unit".
   - "unit" = "hora" o "día". AMS se cotiza por hora; Implementación
     y Especializado se cotizan por día.
   - "price" en paquetes = precio baseline total (referencia).
   ============================================================ */

const LAST_UPDATED = "Septiembre 2026";

/* --- Servicios individuales (tarifa por hora) --- */
const INDIVIDUAL_SERVICES = [
  {
    category: "AMS",
    role: "Consultor Funcional AMS — Public",
    level: "Semi-Senior",
    rate: 68,
    unit: "hora",
    notes: "Soporte funcional nivel 2-3, mejoras menores",
  },
  {
    category: "AMS",
    role: "Consultor Funcional AMS — Private",
    level: "Senior",
    rate: 100,
    unit: "hora",
    notes: "Soporte funcional nivel 2-3, mejoras menores",
  },
  {
    category: "AMS",
    role: "Consultor Técnico AMS (ABAP / BTP)",
    level: "Senior",
    rate: 84,
    unit: "hora",
    notes: "Desarrollos correctivos y evolutivos",
  },
  {
    category: "AMS",
    role: "Basis / Infraestructura",
    level: "Senior",
    rate: 111,
    unit: "hora",
    notes: "Administración de sistemas, monitoreo",
  },
  {
    category: "AMS",
    role: "Consultor Funcional, Especialista (PM,QM,PP,EWM,TM)",
    level: "Especialista",
    rate: 128,
    unit: "hora",
    notes: "Soporte funcional nivel 2-3, mejoras menores",
  },
  {
    category: "T&M",
    role: "Consultor Funcional Back Office (FI-MM-SD)",
    level: "Senior",
    rate: 72,
    unit: "hora",
    notes: "Servicio paquetizado Time & Material, 80 HH/mes mín., remoto",
  },
  {
    category: "T&M",
    role: "Consultor Técnico Basis",
    level: "Senior",
    rate: 74,
    unit: "hora",
    notes: "Servicio paquetizado Time & Material, 80 HH/mes mín., remoto",
  },
  {
    category: "T&M",
    role: "Consultor Técnico Seguridad & Roles y Perfiles",
    level: "Senior",
    rate: 62,
    unit: "hora",
    notes: "Servicio paquetizado Time & Material, 80 HH/mes mín., remoto",
  },
  {
    category: "T&M",
    role: "Consultor Técnico ABAP",
    level: "Senior",
    rate: 65,
    unit: "hora",
    notes: "Servicio paquetizado Time & Material, 80 HH/mes mín., remoto",
  },
  {
    category: "Implementación",
    role: "Consultor Funcional — Public",
    level: "Semi-Senior",
    rate: 393,
    unit: "día",
    notes: "Diseño de procesos, configuración, workshops",
  },
  {
    category: "Implementación",
    role: "Consultor Funcional — Private",
    level: "Senior",
    rate: 578,
    unit: "día",
    notes: "Diseño de procesos, configuración, workshops",
  },
  {
    category: "Implementación",
    role: "Project Manager",
    level: "Senior",
    rate: 688,
    unit: "día",
    notes: "Gestión de proyecto, gobierno, reporting",
  },
  {
    category: "Especializado",
    role: "Arquitecto de Soluciones SAP",
    level: "Expert",
    rate: 752,
    unit: "día",
    notes: "Diseño de arquitectura, roadmap, clean core",
  },
  {
    category: "Especializado",
    role: "Especialista Integraciones (SAP BTP / CPI)",
    level: "Senior",
    rate: 487,
    unit: "día",
    notes: "Integraciones, APIs, middleware",
  },
];

/* --- Servicios empaquetados --- */
const PACKAGES = [
  {
    id: "ams",
    badge: "AMS Tier 2 — Baseline",
    title: "Paquete baseline de soporte AMS",
    subtitle: "40 horas/mes · 3 meses · Metodología ITIL",
    price: 4076,
    priceUnit: "mes",
    duration: "3 meses (renovable)",
    team: "40 h/mes: 25 h Funcional (FI · CO · MM · SD) · 5 h ABAP · 5 h Basis · 5 h Gestión",
    pptFile: "decks/SEIDOR_Alcance_AMS_Baseline.pptx",
    includes: [
      "Soporte funcional multi-módulo (FI, CO, MM, SD)",
      "Soporte técnico ABAP (desarrollos Z y workflows)",
      "Soporte Basis (roles, transportes, monitoreo)",
      "Gestión y gobierno del servicio (SLA, reporting)",
      "Gestión de incidentes bajo metodología ITIL (S1–S4)",
    ],
    excludes: [
      "Requerimientos que excedan 40 h u 5 días calendario",
      "Proyectos, reingenierías, upgrades o rollouts",
      "Licenciamiento SAP, VPN u otro software del cliente",
      "Calidad e integridad de datos maestros",
    ],
  },
  {
    id: "ams-basis",
    badge: "AMS Basis — Servicio gestionado",
    title: "Paquete AMS Basis (Administración SAP Basis)",
    subtitle: "Precio fijo mensual · 129 actividades · Disponibilidad 99.7% · Monitoreo 7×24",
    price: 4308,
    priceUnit: "mes",
    priceNote: "+ IVA",
    duration: "12 o 24 meses (la tarifa mensual mejora a 24 meses) · 1 mes de toma de control",
    team: "Gerente de Consultoría Basis · Líder de Administración · Líder de Proyectos · Consultores Senior, Semi Senior y Junior",
    pptFile: "decks/SEIDOR_AMS_Basis_Presentacion_Ejecutiva.pptx",
    pptLabel: "Descargar Presentación Ejecutiva",
    includes: [
      "Administración SAP Basis remota sobre SAP S/4HANA: catálogo cerrado de 129 actividades (53 diarias, 4 semanales/mensuales, 3 trimestrales, 4 semestrales, 65 a solicitud)",
      "Monitoreo preventivo 7×24 y turno de guardia para incidentes críticos (Alta / Muy alta en productivo)",
      "SLA: Muy alta ≤ 15 min atención / ≤ 4 h restauración · Media ≤ 60 min / ≤ 16 h · informe de incidente en ≤ 72 h",
      "Reportería: informe ejecutivo diario, reporte mensual, EWA, Daily Health Check y minuta de seguimiento",
      "Atención por portal de tickets, e-mail y app móvil, con líder de servicio asignado",
      "Capacitación incluida: 2 workshops Basis (10 participantes, 4 h c/u) durante la vigencia",
    ],
    excludes: [
      "Instalación de nuevos productos, Enhancement Packages, upgrades y migraciones (se cotizan por proyecto)",
      "Copia heterogénea adicional, archiving de datos, SAP SSO y activaciones en SAP BTP",
      "Ambientes DEV, QA o PRD adicionales (cargo mensual aparte)",
      "Hardware, licencias SAP, garantías de fabricantes y cambios de arquitectura",
    ],
  },
  {
    id: "tm",
    badge: "Time & Material — Baseline",
    title: "Paquete baseline Time & Material",
    subtitle: "Bloques de horas por perfil · 80 HH/mes mínimo · Consultoría remota",
    price: 4960,
    priceUnit: "mes por perfil, desde",
    duration: "Servicio abierto, renovable mes a mes (sin plazo fijo)",
    team: "Tarifa por perfil (80 HH/mes mín. c/u): FI-MM-SD USD 72/h · Basis USD 74/h · Seguridad & Roles y Perfiles USD 62/h · ABAP USD 65/h",
    pptFile: "decks/SEIDOR_Alcance_Time_and_Material.pptx",
    includes: [
      "Consultores SAP certificados por bloques de horas mensuales, sin incorporar personal ni levantar un proyecto",
      "Perfiles disponibles: Funcional Back Office (FI-MM-SD), Basis, Seguridad & Roles y Perfiles, ABAP",
      "Atención de incidencias, requerimientos del día a día y mejoras/evolutivos de procesos ya implementados",
      "Reporte de horas consumidas por perfil y gestión del reemplazo del consultor",
      "Facturación mensual según el bloque contratado",
    ],
    excludes: [
      "Proyectos con alcance cerrado, entregables o plazos comprometidos",
      "Perfiles no incluidos en la tabla (requieren solicitar cotización)",
      "Trabajo fuera de horario hábil, fines de semana o festivos (recargo del 50% si se solicita)",
      "Licenciamiento SAP u otro software del cliente",
    ],
  },
  {
    id: "public",
    badge: "SAP Cloud ERP — Public Edition",
    title: "Baseline de implementación Public",
    subtitle: "Procesos estándar, clean core, ritmo acelerado",
    price: 156000,
    duration: "16–20 semanas",
    pptFile: "decks/SEIDOR_Alcance_SAP_Cloud_ERP_Public.pptx",
    team: "1 PM · 3 Consultores funcionales · 1 Basis/CPI (part-time)",
    includes: [
      "Finanzas (FI) y Controlling básico 1 sociedad",
      "Compras y gestión de proveedores",
      "Ventas y distribución",
      "Gestión de inventario",
      "Configuración basada en procesos estándar SAP (best practices)",
    ],
    excludes: [
      "Desarrollos a medida (custom code)",
      "Integraciones complejas con terceros",
      "Migración de datos",
      "Licenciamiento SAP",
    ],
  },
  {
    id: "private",
    badge: "SAP Cloud ERP — Private Edition",
    title: "Baseline de implementación Private",
    subtitle: "Mayor flexibilidad, extensiones, procesos más complejos",
    price: 378000,
    duration: "16–24 semanas",
    pptFile: "decks/SEIDOR_Alcance_SAP_Cloud_ERP_Private.pptx",
    team: "1 PM · 4 Consultores funcionales · 1 Técnico(ABAP) · 1 Basis",
    includes: [
      "Finanzas (FI) y Controlling básico 1 sociedad",
      "Compras y gestión de proveedores",
      "Ventas y distribución",
      "Gestión de inventario y almacenes",
    ],
    excludes: [
      "Desarrollos custom más allá del alcance baseline",
      "Integraciones a sistemas de terceros más allá de PAC Certificado",
      "Migración de datos históricos (> 2 años)",
      "Licenciamiento SAP",
    ],
  },
];
