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

const LAST_UPDATED = "Agosto 2026";

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
    id: "public",
    badge: "SAP Cloud ERP — Public Edition",
    title: "Baseline de implementación Public",
    subtitle: "Procesos estándar, clean core, ritmo acelerado",
    price: 105000,
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
    price: 205000,
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
