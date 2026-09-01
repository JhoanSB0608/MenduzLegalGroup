const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  PageBreak,
  ImageRun,
  Header,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  TextWrappingType,
  TextWrappingSide,
} = require('docx');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { Unidades, numeroALetras } = require('./numeroALetras');
const { fetchImageAsBase64 } = require('./imageHelper');

// --- Helper Functions ---

const formatCurrency = (num) => {
  if (num == null || Number.isNaN(Number(num))) return '$0,00';
  return `$${Number(num).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (d) => {
  if (!d) return 'Se desconoce esta información';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(d);
  }
};

const safe = (v, fallback = 'No reporta') => (v === undefined || v === null || v === '' ? fallback : v);

// --- Styling and Components ---

const FONT_FAMILY = 'Calibri';
const FONT_FAMILY_ADMISION = 'Helvetica Neue';
const FONT_SIZE = 20; // 10pt
const FONT_SIZE_ADMISION = 22; // 11pt
const FONT_SIZE_SMALL = 16; // 8pt
const FONT_SIZE_VERY_SMALL = 14; // 7pt

const createTextRun = (text, options = {}) => new TextRun({ text: String(text), font: FONT_FAMILY, size: options.size || FONT_SIZE, ...options });
const createTextRunAdmision = (text, options = {}) => new TextRun({ text: String(text), font: FONT_FAMILY_ADMISION, size: options.size || FONT_SIZE_ADMISION, ...options });
const createParagraph = (children, options = {}) => new Paragraph({ children, spacing: { after: 100, line: 276, lineRule: "auto" }, ...options });
const createHeading = (text, bold = true) => createParagraph([createTextRun(text, { bold })], { spacing: { before: 240, after: 120 } });

const createCell = (children, options = {}) => new TableCell({
  children,
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 20, bottom: 20, left: 40, right: 40 },
  ...options
});

const createHeaderCell = (text, size = FONT_SIZE) => createCell([createParagraph([createTextRun(text, { bold: true, size })], { alignment: AlignmentType.CENTER })]);

const createBorderedTable = (rows, columnWidths) => {
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: columnWidths.map(w => w * 100), // Simplified percentage based widths
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    },
  });
};


// --- Document Builder ---

async function generateSolicitudDocx(solicitud = {}) {
  // ========== DATA PREPARATION ========== 
  const deudor = solicitud.deudor || {};
  const sede = solicitud.sede || {};
  const acreencias = Array.isArray(solicitud.acreencias) ? solicitud.acreencias : [];
  const bienesMuebles = Array.isArray(solicitud.bienesMuebles) ? solicitud.bienesMuebles : [];
  const bienesInmuebles = Array.isArray(solicitud.bienesInmuebles) ? solicitud.bienesInmuebles : [];
  const infoFin = solicitud.informacionFinanciera || {};
  const procesosJudiciales = Array.isArray(infoFin.procesosJudiciales) ? infoFin.procesosJudiciales : [];
  const obligacionesAlimentarias = Array.isArray(infoFin.obligacionesAlimentarias) ? infoFin.obligacionesAlimentarias : [];
  const propuestaPago = solicitud.propuestaPago;
  const nombreCompleto = `${(deudor.primerNombre || '')} ${(deudor.segundoNombre || '')} ${(deudor.primerApellido || '')} ${(deudor.segundoApellido || '')}`.replace(/\s+/g, ' ').trim();
  const totalCapital = acreencias.reduce((s, a) => s + (Number(a.capital) || 0), 0);
  const acreenciasEnMora = acreencias.filter(a => a.creditoEnMora).length;
  const capitalEnMora = acreencias.filter(a => a.creditoEnMora).reduce((s, a) => s + (Number(a.capital) || 0), 0);

  const children = [];

  // ========== ENCABEZADO ========== 
  children.push(createParagraph([createTextRun('Señores')]));
  children.push(createParagraph([createTextRun(safe(sede.entidadPromotora?.toUpperCase()), { bold: true })]));
  children.push(createParagraph([createTextRun(safe(sede.sedeCentro))]));
  children.push(createParagraph([createTextRun(`${safe(sede.ciudad)} - ${safe(sede.departamento)}`)]));
  children.push(createParagraph([createTextRun('')]));

  // ========== REFERENCIA Y DEUDOR ========== 
  children.push(createParagraph([
    createTextRun('REFERENCIA:', { bold: true }),
    createTextRun(' Solicitud de Insolvencia Económica de Persona Natural No Comerciante.'),
  ]));
  children.push(createParagraph([
    createTextRun('DEUDOR(A):', { bold: true }),
    createTextRun(` ${nombreCompleto.toUpperCase()} - C.C. ${safe(deudor.cedula)}`),
  ]));
  children.push(createParagraph([createTextRun('')]));

  // ========== PÁRRAFOS INTRODUCTORIOS ========== 
  children.push(createParagraph([
    createTextRun(nombreCompleto, { bold: true }),
    createTextRun(`, mayor de edad, con domicilio en la ciudad de ${safe(deudor.ciudad)} - ${safe(deudor.departamento)}, identificado(a) con cédula de ciudadanía número ${safe(deudor.cedula)}, expedida en la ciudad de ${safe(deudor.ciudadExpedicion)} - ${safe(deudor.departamentoExpedicion)} actuando en mi propio nombre y en mi condición de `),
    createTextRun('PERSONA NATURAL NO COMERCIANTE', { bold: true }),
    createTextRun(', con fundamento en la Ley 1564 de 2012, modificada en su título IV por la ley 2445 de 2025, especialmente en el Artículo 531 y siguientes y en Decreto Reglamentario 1069 de 2015, mediante el presente escrito solicito que se inicie y tramite el correspondiente proceso de negociación de deudas con los acreedores declarados en la presente solicitud, de quienes se suministrará información completa en el capitulo correspondiente.'),
  ], { alignment: AlignmentType.JUSTIFIED }));

  children.push(createParagraph([
    createTextRun(`En adición a lo antes expuesto, declaro que soy una persona natural no comerciante, identifico y relaciono a ${acreencias.length} (${Unidades(acreencias.length)}) acreencias, de las cuales con ${acreenciasEnMora} (${Unidades(acreenciasEnMora)}) acreencias me encuentro en mora por más de noventa (90) días y el valor porcentual de mis obligaciones incumplidas representan no menos de treinta por ciento (30%) del pasivo total a mi cargo, cumpliendo de esta forma con los supuestos de insolvencia establecidos en el Artículo 538 del Código General del Proceso, modificado por el articulo Noveno (9) de la ley 2445 de 2025, razón por la cual, es procedente este trámite.`),
  ], { alignment: AlignmentType.JUSTIFIED }));

  children.push(createParagraph([
    createTextRun('De manera expresa, declaro en mi calidad de deudor(a), bajo la gravedad del juramento, que toda la información que se suministra y adjunta en esta solicitud es verdadera, no se ha incurrido en omisiones, imprecisiones o errores que impidan conocer mi verdadera situación económica y capacidad de pago.'),
  ], { alignment: AlignmentType.JUSTIFIED }));
  
  children.push(createParagraph([
    createTextRun('De conformidad al Artículo 539 de la Ley 1564 de 2012, la presente solicitud se fundamenta: La solicitud de trámite de negociación de deudas deberá ser presentada directamente por el deudor, quien podrá comparecer al trámite acompañado o representado por apoderado judicial. Será obligatoria su asistencia con o a través de apoderado judicial en los casos en que sea superada la minima cuantía. La solicitud deberá contener:'),
  ], { alignment: AlignmentType.JUSTIFIED }));
  children.push(createParagraph([createTextRun('')]));

  // ========== 1. CAUSAS DE INSOLVENCIA ========== 
  children.push(createHeading('1. LAS SIGUIENTES SON LAS CAUSAS QUE CONLLEVARON A LA SITUACIÓN DE INSOLVENCIA ECONÓMICA:'));
  const causasTexto = solicitud.causasInsolvencia || `TOME LA DECISIÓN DE ADQUIRIR LOS DISTINTOS CRÉDITOS CON EL OBJETIVO DE MEJORAR MI CALIDAD DE VIDA Y LA MI FAMILIA, ADEMÁS DE QUERER GENERAR INGRESOS EXTRAS POR ELLO DECIDÍ INVERTIR EN UNA MONEDA DIGITAL QUE OFRECÍA GRAN RENTABILIDAD DE GANANCIAS, SIN EMBARGO, CON EL TIEMPO DESAFORTUNADAMENTE LA PLATAFORMA DE DICHA MONEDA DESAPARECIÓ SIN GENERAR ALGÚN TIPO DE GANANCIA, POR LO QUE EL DINERO ALLÍ INVERTIDO SE PERDIÓ Y ACTUALMENTE NO CUENTO CON LA CAPACIDAD DE PAGO PARA CUMPLIR EN DEBIDA FORMA CON MIS OBLIGACIONES CREDITICIAS, YA QUE LO DEVENGADO SOLO ES SUFICIENTE PARA MIS GASTOS PERSONALES Y FAMILIARES, POR ELLO, ME ENCUENTRO EN MORA EN LA MAYORÍA DE ELLAS E INICIO EL PRESENTE PROCESO`;
  children.push(createParagraph([createTextRun(causasTexto.toUpperCase())], { alignment: AlignmentType.JUSTIFIED, indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun('')]));

  // ========== 2. RESUMEN DE ACREENCIAS ========== 
  children.push(createParagraph([new PageBreak()]));
  children.push(createHeading('2. RESUMEN DE LAS ACREENCIAS:'));
  const resumenHeader = new TableRow({
    children: [
      createHeaderCell('ACREEDORES'),
      createHeaderCell('CAPITAL'),
      createHeaderCell('QUÓRUM'),
      createHeaderCell('INTERÉS\n CORRIENTE'),
      createHeaderCell('INTERÉS DE\n MORA'),
      createHeaderCell('OTROS\n CONCEPTOS\n CAUSADOS'),
      createHeaderCell('DÍAS EN\n MORA'),
    ],
    tableHeader: true,
  });

  const resumenRows = [resumenHeader];
  
  const getClassFromNaturaleza = (naturaleza) => {
    if (!naturaleza) return 'QUINTA CLASE';
    if (naturaleza.toUpperCase().includes('PRIMERA CLASE')) return 'PRIMERA CLASE';
    if (naturaleza.toUpperCase().includes('SEGUNDA CLASE')) return 'SEGUNDA CLASE';
    if (naturaleza.toUpperCase().includes('TERCERA CLASE')) return 'TERCERA CLASE';
    if (naturaleza.toUpperCase().includes('CUARTA CLASE')) return 'CUARTA CLASE';
    return 'QUINTA CLASE';
  };

  const groupedAcreencias = acreencias.reduce((acc, a) => {
    const aClass = getClassFromNaturaleza(a.naturalezaCredito);
    if (!acc[aClass]) acc[aClass] = [];
    acc[aClass].push(a);
    return acc;
  }, {});

  const classOrder = ['PRIMERA CLASE', 'SEGUNDA CLASE', 'TERCERA CLASE', 'CUARTA CLASE', 'QUINTA CLASE'];
  let grandTotalCapital = 0;
  let grandTotalInteresCorriente = 0;
  let grandTotalInteresMoratorio = 0;

  classOrder.forEach(className => {
    if (groupedAcreencias[className]) {
      resumenRows.push(new TableRow({
        children: [createCell([createParagraph([createTextRun(className, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 7 })],
      }));

      let classTotalCapital = 0;
      let classTotalInteresCorriente = 0;
      let classTotalInteresMoratorio = 0;

      groupedAcreencias[className].forEach(a => {
        const nombre = (a.acreedor && (typeof a.acreedor === 'object' ? (a.acreedor.nombre || '') : a.acreedor)) || 'No reporta';
        const capital = Number(a.capital) || 0;
        const interesCorriente = Number(a.valorTotalInteresCorriente) || 0;
        const interesMoratorio = Number(a.valorTotalInteresMoratorio) || 0;

        classTotalCapital += capital;
        classTotalInteresCorriente += interesCorriente;
        classTotalInteresMoratorio += interesMoratorio;

        const porcentaje = totalCapital > 0 ? `${(Math.floor((capital / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
        const diasMora = a.creditoEnMora ? 'Más de 90\ndías.' : '';

        resumenRows.push(new TableRow({
          children: [
            createCell([createParagraph([createTextRun(nombre)])]),
            createCell([createParagraph([createTextRun(formatCurrency(capital))], { alignment: AlignmentType.RIGHT })]),
            createCell([createParagraph([createTextRun(porcentaje)], { alignment: AlignmentType.CENTER })]),
            createCell([createParagraph([createTextRun(formatCurrency(interesCorriente))], { alignment: AlignmentType.RIGHT })]),
            createCell([createParagraph([createTextRun(formatCurrency(interesMoratorio))], { alignment: AlignmentType.RIGHT })]),
            createCell([createParagraph([createTextRun('No Reporta')], { alignment: AlignmentType.CENTER })]),
            createCell([createParagraph([createTextRun(diasMora)], { alignment: AlignmentType.CENTER })]),
          ],
        }));
      });

      grandTotalCapital += classTotalCapital;
      grandTotalInteresCorriente += classTotalInteresCorriente;
      grandTotalInteresMoratorio += classTotalInteresMoratorio;

      const classPorcentaje = totalCapital > 0 ? `${(Math.floor((classTotalCapital / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
      resumenRows.push(new TableRow({
        children: [
          createCell([createParagraph([createTextRun(`TOTAL ACREENCIAS ${className}`, { bold: true })])]),
          createCell([createParagraph([createTextRun(formatCurrency(classTotalCapital), { bold: true })], { alignment: AlignmentType.RIGHT })]),
          createCell([createParagraph([createTextRun(classPorcentaje, { bold: true })], { alignment: AlignmentType.CENTER })]),
          createCell([createParagraph([createTextRun(formatCurrency(classTotalInteresCorriente), { bold: true })], { alignment: AlignmentType.RIGHT })]),
          createCell([createParagraph([createTextRun(formatCurrency(classTotalInteresMoratorio), { bold: true })], { alignment: AlignmentType.RIGHT })]),
          createCell([createParagraph([createTextRun('$0,00', { bold: true })], { alignment: AlignmentType.CENTER })]),
          createCell([createParagraph([createTextRun('')])]),
        ],
      }));
    }
  });

  resumenRows.push(new TableRow({
    children: [
      createCell([createParagraph([createTextRun('TOTAL ACREENCIAS', { bold: true })])]),
      createCell([createParagraph([createTextRun(formatCurrency(grandTotalCapital), { bold: true })], { alignment: AlignmentType.RIGHT })]),
      createCell([createParagraph([createTextRun('100.00%', { bold: true })], { alignment: AlignmentType.CENTER })]),
      createCell([createParagraph([createTextRun(formatCurrency(grandTotalInteresCorriente), { bold: true })], { alignment: AlignmentType.RIGHT })]),
      createCell([createParagraph([createTextRun(formatCurrency(grandTotalInteresMoratorio), { bold: true })], { alignment: AlignmentType.RIGHT })]),
      createCell([createParagraph([createTextRun('$0,00', { bold: true })], { alignment: AlignmentType.CENTER })]),
      createCell([createParagraph([createTextRun('')])]),
    ],
  }));

  const moraPorcentaje = totalCapital > 0 ? `${(Math.floor((capitalEnMora / totalCapital) * 10000) / 100).toFixed(2)}%` : '0.00%';
  resumenRows.push(new TableRow({
    children: [
      createCell([createParagraph([createTextRun('TOTAL DEL CAPITAL EN MORA POR MÁS DE 90 DÍAS\n(No aplica a créditos cuyo pago se esté realizando mediante libranza o descuento por nómina)', { bold: true })])]),
      createCell([createParagraph([createTextRun(formatCurrency(capitalEnMora), { bold: true })], { alignment: AlignmentType.RIGHT })]),
      createCell([createParagraph([createTextRun(moraPorcentaje, { bold: true })], { alignment: AlignmentType.CENTER })]),
      createCell([createParagraph([])], { columnSpan: 4 }),
    ],
  }));

  children.push(createBorderedTable(resumenRows, [25, 15, 10, 15, 15, 10, 10]));
  children.push(createParagraph([createTextRun('')]));

  // ========== 3. DETALLE DE ACREENCIAS ========== 
  children.push(createHeading('3. DETALLE DE LAS ACREENCIAS:'));
  children.push(createParagraph([createTextRun('Se presenta una relación completa y actualizada de todos los acreedores, en el orden de prelación de créditos que señalan los Artículos 2488 y siguientes del Código Civil y con corte al último día calendario del mes inmediatamente anterior a aquel en que se presenta la solicitud:')], { alignment: AlignmentType.JUSTIFIED }));
  
  children.push(createParagraph([new PageBreak()]));

  acreencias.forEach((a, idx) => {
    const nombreAcreedor = (a.acreedor && (typeof a.acreedor === 'object' ? (a.acreedor.nombre || '') : a.acreedor)) || 'No reporta';
    const detalleData = [
        ['Nombre', nombreAcreedor],
        ['Tipo de Documento', a.acreedor.tipoDoc],
        ['No. de Documento', safe((a.acreedor && (a.acreedor.nit || a.acreedor.nitCc || a.acreedor.documento)) || a.documento || '')],
        ['Dirección de notificación judicial', (a.acreedor && a.acreedor.direccion) || safe(a.direccion)],
        ['País', 'Colombia'],
        ['Departamento', (a.acreedor && a.acreedor.departamento) || safe(a.departamento,)],
        ['Ciudad', (a.acreedor && a.acreedor.ciudad) || safe(a.ciudad,)],
        ['Dirección de notificación electrónica', (a.acreedor && a.acreedor.email) || safe(a.email)],
        ['Teléfono', (a.acreedor && a.acreedor.telefono) || safe(a.telefono)],
        ['Tipo de Acreencia', safe(a.tipoAcreencia)],
        ['Naturaleza del crédito', safe(a.naturalezaCredito)],
        ['Crédito en condición de legalmente postergado (Artículo 572A,\nCausal 1)', a.creditoPostergado ? 'SI' : 'NO'],
        ['Descripción del crédito', safe(a.descripcionCredito)],
        ['Valor en capital', formatCurrency(a.capital)],
        ['Valor en interés corriente', a.valorTotalInteresCorriente > 0 ? formatCurrency(a.valorTotalInteresCorriente) : 'Se desconoce esta información'],
        ['Tasa de interés corriente', safe(a.tasaInteresCorriente)],
        ['Tipo de interés corriente', safe(a.tipoInteresCorriente)],
        ['Cuantía total de la obligación', formatCurrency((Number(a.capital||0) + Number(a.valorTotalInteresCorriente||0) + Number(a.valorTotalInteresMoratorio||0)))],
        ['¿El pago del crédito se está realizando mediante libranza o\ncualquier otro tipo de descuento por nómina?', a.pagoPorLibranza ? 'SI' : 'NO'],
        ['Número de días en mora', a.creditoEnMora ? 'Más de 90 días' : ''],
        ['Más de 90 días en mora', a.creditoEnMora ? 'SI' : 'No'],
        ['Valor en interes moratorio', a.valorTotalInteresMoratorio > 0 ? formatCurrency(a.valorTotalInteresMoratorio) : 'Se desconoce esta información'],
        ['Tasa de interés moratorio', safe(a.tasaInteresMoratorio)],
        ['Tipo de interés moratorio', safe(a.tipoInteresMoratorio)],
        ['Fecha de otorgamiento', formatDate(a.fechaOtorgamiento) + '.'],
        ['Fecha de vencimiento', formatDate(a.fechaVencimiento) + '.']
    ];
const tableRows = detalleData.map(
  ([label, value]) =>
    new TableRow({
      cantSplit: true,
      children: [
        createCell([
          createParagraph([createTextRun(label)], {
            keepLines: true,
            keepNext: true,
          }),
        ]),
        createCell([
          createParagraph([createTextRun(value)], {
            keepLines: true,
            keepNext: true,
          }),
        ]),
      ],
    })
);    tableRows.unshift(new TableRow({ cantSplit: true, children: [createCell([createParagraph([createTextRun(`Acreencia No. ${idx + 1}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
    children.push(createBorderedTable(tableRows, [50, 50]));
    children.push(createParagraph([createTextRun('')]));
  });

  // ========== 4. BIENES ========== 
  children.push(createParagraph([new PageBreak()]));
  children.push(createHeading('4. RELACIÓN E INVENTARIO DE LOS BIENES MUEBLES E INMUEBLES:'));
  children.push(createParagraph([createTextRun('Se presenta una relación completa y detallada de los bienes muebles e inmuebles:')], { alignment: AlignmentType.JUSTIFIED, indentation: { left: 720 } }));
  children.push(createHeading('4.1 Bienes Muebles', true));
  if (!bienesMuebles.length) {
    children.push(createParagraph([createTextRun('Se manifiesta bajo la gravedad de juramento que no se poseen Bienes Muebles.')], { indentation: { left: 720 } }));
  } else {
    bienesMuebles.forEach((b, i) => {
        const bienData = [
            ['Descripción', safe(b.descripcion)],
            ['Clasificación', safe(b.clasificacion)],
            ['Marca', safe(b.marca)],
        ];

        if (b.clasificacion === 'Vehiculo') {
            bienData.push(['Modelo', safe(b.modelo)]);
            bienData.push(['Placa', safe(b.placa)]);
            bienData.push(['Tarjeta de Propiedad', safe(b.tarjetaPropiedad)]);
            bienData.push(['Oficina de Tránsito', safe(b.oficinaTransito)]);
        }

        bienData.push(['Avalúo Comercial Estimado', formatCurrency(b.avaluoComercial)]);
        const tableRows = bienData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label)])]), createCell([createParagraph([createTextRun(value)])])] }));
        tableRows.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun(`Bien Mueble No. ${i + 1}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
        children.push(createBorderedTable(tableRows, [50, 50]));
        children.push(createParagraph([createTextRun('')]));
    });
  }
  
  children.push(createHeading('4.2 Bienes Inmuebles', true));
  if (!bienesInmuebles.length) {
    children.push(createParagraph([createTextRun('Se manifiesta bajo la gravedad de juramento que no se poseen Bienes Inmuebles.')], { indentation: { left: 720 } }));
  } else {
     bienesInmuebles.forEach((b, i) => {
        const bienData = [
            ['Descripción', safe(b.descripcion)],
            ['Matrícula Inmobiliaria', safe(b.matricula)],
            ['Dirección', safe(b.direccion)],
            ['Ciudad', safe(b.ciudad)],
            ['Avalúo Comercial', formatCurrency(b.avaluoComercial)],
            ['Afectado a Vivienda Familiar', b.afectadoVivienda ? 'SI' : 'NO']
        ];
        const tableRows = bienData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label)])]), createCell([createParagraph([createTextRun(value)])])] }));
        tableRows.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun(`Bien Inmueble No. ${i + 1}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
        children.push(createBorderedTable(tableRows, [50, 50]));
        children.push(createParagraph([createTextRun('')]));
    });
  }

  // ========== 5. PROCESOS JUDICIALES ========== 
  children.push(createHeading('5. PROCESOS JUDICIALES, ADMINISTRATIVOS O PRIVADOS'));
  if (!procesosJudiciales.length) {
      children.push(createParagraph([createTextRun('Se manifiesta bajo la gravedad de juramento que no se tienen procesos en contra.')], { indentation: { left: 720 } }));
  } else {
      procesosJudiciales.forEach((p, idx) => {
          const procesoData = [
              ['Proceso Judicial', safe(p.tipoProceso), 'En Contra'],
              ['Tipo de Proceso', safe(p.tipoProceso)],
              ['Tipo Juzgado', safe(p.juzgado)],
              ['Número de Radicación', safe(p.radicado)],
              ['Estado del Proceso', safe(p.estadoProceso)],
              ['Demandante', safe(p.demandante)],
              ['Demandado', safe(p.demandado)],
              ['Valor', formatCurrency(p.valor)],
              ['Departamento', safe(p.departamento)],
              ['Ciudad', safe(p.ciudad)],
              ['Dirección Juzgado', safe(p.direccionJuzgado)]
          ];
          const tableRows = procesoData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label, {size: FONT_SIZE_SMALL})])]), createCell([createParagraph([createTextRun(value, {size: FONT_SIZE_SMALL})])])] }));
          tableRows.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun(`Proceso Judicial No. ${safe(p.radicado)}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
          children.push(createBorderedTable(tableRows, [50, 50]));
          children.push(createParagraph([createTextRun('')]));
      });
  }

  // ========== 6. OBLIGACIONES ALIMENTARIAS ========== 
  children.push(createHeading('6. OBLIGACIONES ALIMENTARIAS'));
  if (!obligacionesAlimentarias.length) {
      children.push(createParagraph([createTextRun('No se reportan obligaciones alimentarias.')], { indentation: { left: 720 } }));
  } else {
      obligacionesAlimentarias.forEach((o, idx) => {
          const obligacionData = [
              ['Beneficiario', safe(o.beneficiario)],
              ['Tipo de Identificación', safe(o.tipoIdentificacion)],
              ['Número de Identificación', safe(o.numeroIdentificacion)],
              ['Parentesco', safe(o.parentesco)],
              ['Cuantía Mensual', formatCurrency(o.cuantia)],
              ['Periodo de Pago', safe(o.periodoPago)],
              ['Estado de la Obligación', safe(o.estadoObligacion)],
              ['¿La obligación se encuentra demandada?', o.obligacionDemandada ? 'SI' : 'NO'],
              ['País de Residencia', safe(o.paisResidencia)],
              ['Departamento', safe(o.departamento)],
              ['Ciudad', safe(o.ciudad)],
              ['Dirección', safe(o.direccion)],
              ['Correo Electrónico del Beneficiario', safe(o.emailBeneficiario)]
          ];
          const tableRows = obligacionData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label, {size: FONT_SIZE_SMALL})])]), createCell([createParagraph([createTextRun(value, {size: FONT_SIZE_SMALL})])])] }));
          tableRows.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun(`Obligación Alimentaria No. ${idx + 1}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
          children.push(createBorderedTable(tableRows, [50, 50]));
          children.push(createParagraph([createTextRun('')]));
      });
  }

  // ========== 7. RELACIÓN DE GASTOS ========== 
  children.push(createHeading('7. RELACIÓN DE GASTOS DE SUBSISTENCIA DEL DEUDOR Y DE PERSONAS A SU CARGO:'));
  const gastosLabels = { alimentacion: 'Alimentación', salud: 'Salud', arriendo: 'Arriendo o Cuota Vivienda', serviciosPublicos: 'Servicios Públicos', educacion: 'Educación', transporte: 'Transporte', conservacionBienes: 'Conservación de Bienes', cuotaLeasingHabitacional: 'Cuota De Leasing Habitacional', arriendoOficina: 'Arriendo Oficina/Consultorio', cuotaSeguridadSocial: 'Cuota De Seguridad Social', cuotaAdminPropiedadHorizontal: 'Cuota De Administración Propiedad Horizontal', cuotaLeasingVehiculo: 'Cuota De Leasing Vehículo', cuotaLeasingOficina: 'Cuota De Leasing Oficina/Consultorio', seguros: 'Seguros', vestuario: 'Vestuario', recreacion: 'Recreación', gastosPersonasCargo: 'Gastos Personas a Cargo', otros: 'Otros Gastos' };
  const gastosPersonales = infoFin.gastosPersonales || {};
  let totalGastos = 0;
  const gastosRows = [];
  for (const key in gastosPersonales) {
      if (key === 'gastosAdicionales') continue;
      const value = parseFloat(gastosPersonales[key]);
      if (value > 0 && gastosLabels[key]) {
          gastosRows.push(new TableRow({ children: [createCell([createParagraph([createTextRun(gastosLabels[key], {size: FONT_SIZE_SMALL})])]), createCell([createParagraph([createTextRun(formatCurrency(value), {size: FONT_SIZE_SMALL})])])] }));
          totalGastos += value;
      }
  }
  const gastosAdicionales = Array.isArray(gastosPersonales.gastosAdicionales) ? gastosPersonales.gastosAdicionales : [];
  gastosAdicionales.forEach((g) => {
      const nombre = (g && g.nombre) ? String(g.nombre) : 'Gasto adicional';
      const value = parseFloat(g && g.valor);
      if (value > 0) {
          gastosRows.push(new TableRow({ children: [createCell([createParagraph([createTextRun(`Otro gasto (${nombre})`, {size: FONT_SIZE_SMALL})])]), createCell([createParagraph([createTextRun(formatCurrency(value), {size: FONT_SIZE_SMALL})])])] }));
          totalGastos += value;
      }
  });
  if (gastosRows.length === 0) {
      gastosRows.push(new TableRow({ children: [createCell([createParagraph([createTextRun('No se reportan gastos.', {size: FONT_SIZE_SMALL})], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
  } else {
      gastosRows.push(new TableRow({ children: [createCell([createParagraph([createTextRun('TOTAL GASTOS', { bold: true, size: FONT_SIZE_SMALL })])]), createCell([createParagraph([createTextRun(formatCurrency(totalGastos), { bold: true, size: FONT_SIZE_SMALL })])])] }));
  }
  gastosRows.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun('Gastos de Subsistencia', { bold: true })])]), createCell([createParagraph([createTextRun('')])])] }));
  children.push(createBorderedTable(gastosRows, [50, 50]));
  children.push(createParagraph([createTextRun('')]));

  // ========== 8. RELACIÓN DE INGRESOS ========== 
  children.push(createHeading('8. RELACIÓN DE INGRESOS:'));
  const actPrincipal = Number(infoFin.ingresosActividadPrincipal);
  const otrasActividades = isNaN(Number(infoFin.ingresosOtrasActividades)) ? infoFin.ingresosOtrasActividades : Number(infoFin.ingresosOtrasActividades);
  const ingresosMensuales = typeof otrasActividades === 'number' ? actPrincipal + otrasActividades : actPrincipal;
  const ingresosData = [
      ['Ingresos mensuales por actividad económica', formatCurrency(actPrincipal)],
      ['Empleo', infoFin.tieneEmpleo ? 'SI' : 'NO'],
      ['Tipo de empleo', safe(infoFin.tipoEmpleo)],
      ['Descripción de la actividad económica', safe(infoFin.descripcionActividadEconomica)],
      ['Ingresos mensuales por otras actividades', safe(infoFin.ingresosOtrasActividades)]
  ];
  const ingresosRowsTable = ingresosData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label, {size: FONT_SIZE_SMALL})])]), createCell([createParagraph([createTextRun(value, {size: FONT_SIZE_SMALL})])])] }));
  ingresosRowsTable.push(new TableRow({ children: [createCell([createParagraph([createTextRun('TOTAL DE INGRESOS MENSUALES', { bold: true, size: FONT_SIZE_SMALL })])]), createCell([createParagraph([createTextRun(typeof otrasActividades === 'number' ? formatCurrency(ingresosMensuales) : formatCurrency(actPrincipal), { bold: true, size: FONT_SIZE_SMALL })])])] }));
  ingresosRowsTable.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun('Ingresos', { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
  children.push(createBorderedTable(ingresosRowsTable, [50, 50]));
  children.push(createParagraph([createTextRun('')]));

  // ========== 9. SOCIEDAD CONYUGAL ========== 
  children.push(createHeading('9. INFORMACIÓN SOBRE SOCIEDAD CONYUGAL O PATRIMONIAL:'));
  const sociedadConyugal = solicitud.sociedadConyugal || {};
  const conyugalData = [];
  if (sociedadConyugal.activa) {
      conyugalData.push(['Tengo o he tenido sociedad conyugal o patrimonial vigente', 'Sí']);
      conyugalData.push(['La sociedad conyugal o patrimonial está disuelta pero no liquidada', sociedadConyugal.disuelta ? 'Sí' : 'No']);
      conyugalData.push(['Nombres y Apellidos del Cónyuge', safe(sociedadConyugal.nombreConyuge)]);
      conyugalData.push(['Tipo de Documento', safe(sociedadConyugal.tipoDocConyuge)]);
      conyugalData.push(['Número de Documento', safe(sociedadConyugal.numDocConyuge)]);
  } else {
      conyugalData.push(['Tengo o he tenido sociedad conyugal o patrimonial vigente', 'No']);
  }
  const conyugalRowsTable = conyugalData.map(([label, value]) => new TableRow({ children: [createCell([createParagraph([createTextRun(label)])]), createCell([createParagraph([createTextRun(value)])])] }));
  conyugalRowsTable.unshift(new TableRow({ children: [createCell([createParagraph([createTextRun('Sociedad Conyugal o Patrimonial', { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }));
  children.push(createBorderedTable(conyugalRowsTable, [50, 50]));
  children.push(createParagraph([createTextRun('')]));

  // ========== 10. PROPUESTA DE PAGO ========== 
  children.push(createParagraph([new PageBreak()]));
  children.push(createHeading('10. PROPUESTA DE PAGO:'));
  if (!propuestaPago || propuestaPago.tipoNegociacion !== 'proyeccion') {
      children.push(createParagraph([createTextRun('No se presenta una propuesta de pago proyectada.')], { indentation: { left: 720 } }));
  } else {
      classOrder.forEach(className => {
          if (groupedAcreencias[className]) {
              const classAcreencias = groupedAcreencias[className];
              const classTotalCapital = classAcreencias.reduce((s, a) => s + (Number(a.capital) || 0), 0);

              children.push(createParagraph([createTextRun('CRÉDITOS PRINCIPALES', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER }));
              children.push(createParagraph([createTextRun(className, { bold: true })], { alignment: AlignmentType.CENTER }));

              const capital = classTotalCapital;
              const plazo = parseInt(propuestaPago.plazo, 10);
              const interesEA = parseFloat(propuestaPago.interesEA);
              const interesMensual = (Math.pow(1 + interesEA / 100, 1 / 12) - 1) * 100;
              const monthlyRate = interesMensual / 100;
              const startDate = new Date(propuestaPago.fechaInicioPago.$date || propuestaPago.fechaInicioPago);
              const diaPago = parseInt(propuestaPago.diaPago, 10) || 1;
              const formaPago = propuestaPago.formaPago;

              const detalleBody = [
                  new TableRow({ children: [createCell([createParagraph([createTextRun(`Tabla de Detalle de Proyección - ${className}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 2 })] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Capital Adeudado', { bold: true })])]), createCell([createParagraph([createTextRun(formatCurrency(capital))], { alignment: AlignmentType.RIGHT })])] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Fecha de Inicio', { bold: true })])]), createCell([createParagraph([createTextRun(formatDate(startDate))], { alignment: AlignmentType.RIGHT })])] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Forma de Pago', { bold: true })])]), createCell([createParagraph([createTextRun(formaPago || 'Cuota Fija')], { alignment: AlignmentType.RIGHT })])] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Plazo de Pago (Meses)', { bold: true })])]), createCell([createParagraph([createTextRun(`${plazo}`)], { alignment: AlignmentType.RIGHT })])] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Interés Efectivo Anual (EA)', { bold: true })])]), createCell([createParagraph([createTextRun(`${interesEA.toFixed(2)} %`)], { alignment: AlignmentType.RIGHT })])] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Interés Nominal Mensual', { bold: true })])]), createCell([createParagraph([createTextRun(`${interesMensual.toFixed(4)} %`)], { alignment: AlignmentType.RIGHT })])] }),
              ];
              children.push(createBorderedTable(detalleBody, [50, 50]));
              children.push(createParagraph([createTextRun('')]));

              let cuotaFija = 0;
              if (monthlyRate > 0) {
                  cuotaFija = capital * (monthlyRate * Math.pow(1 + monthlyRate, plazo)) / (Math.pow(1 + monthlyRate, plazo) - 1);
              } else {
                  cuotaFija = capital / plazo;
              }

              const distribBody = [
                  new TableRow({ children: [createCell([createParagraph([createTextRun(`Distribución de la cuota fija - ${className}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 5 })] }),
                  new TableRow({ children: [createCell([createParagraph([createTextRun('Cuota fija de pago:', { bold: true })])]), createCell([createParagraph([createTextRun(formatCurrency(cuotaFija), { bold: true })])], { columnSpan: 4 })] }),
                  new TableRow({ children: [createHeaderCell('Acreedor', FONT_SIZE_SMALL), createHeaderCell('Descripción', FONT_SIZE_SMALL), createHeaderCell('Capital Actualizado', FONT_SIZE_SMALL), createHeaderCell('Porcentaje', FONT_SIZE_SMALL), createHeaderCell('Distribución', FONT_SIZE_SMALL)] }),
              ];
              classAcreencias.forEach(a => {
                  const cap = Number(a.capital);
                  const porcentaje = capital > 0 ? (cap / capital) * 100 : 0;
                  const distrib = cuotaFija * (porcentaje / 100);
                  const nombreAcreedor = (a.acreedor && (typeof a.acreedor === 'object' ? a.acreedor.nombre : a.acreedor)) || 'No reporta';
                  const descripcion = safe(a.descripcionCredito, 'No reporta');
                  distribBody.push(new TableRow({ children: [
                      createCell([createParagraph([createTextRun(nombreAcreedor, {size: FONT_SIZE_SMALL})])]),
                      createCell([createParagraph([createTextRun(descripcion, {size: FONT_SIZE_SMALL})])]),
                      createCell([createParagraph([createTextRun(formatCurrency(cap), {size: FONT_SIZE_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun(`${porcentaje.toFixed(2)}%`, {size: FONT_SIZE_SMALL})], { alignment: AlignmentType.CENTER })]),
                      createCell([createParagraph([createTextRun(formatCurrency(distrib), {size: FONT_SIZE_SMALL})], { alignment: AlignmentType.RIGHT })]),
                  ]}));
              });
              children.push(createBorderedTable(distribBody, [20, 25, 20, 15, 20]));
              children.push(createParagraph([createTextRun('')]));

              const proyeccionBody = [
                  new TableRow({ children: [createCell([createParagraph([createTextRun(`Tabla de Proyección de Pagos - ${className}`, { bold: true })], { alignment: AlignmentType.CENTER })], { columnSpan: 8 })] }),
                  new TableRow({ children: [createHeaderCell('Pago No.', FONT_SIZE_VERY_SMALL), createHeaderCell('Saldo Capital', FONT_SIZE_VERY_SMALL), createHeaderCell('Pago Capital', FONT_SIZE_VERY_SMALL), createHeaderCell('Pago Interés', FONT_SIZE_VERY_SMALL), createHeaderCell('Monto de Pago', FONT_SIZE_VERY_SMALL), createHeaderCell('Saldo Final Capital', FONT_SIZE_VERY_SMALL), createHeaderCell('Plazo en días', FONT_SIZE_VERY_SMALL), createHeaderCell('Fecha', FONT_SIZE_VERY_SMALL)] }),
              ];
              let saldo = capital;
              for (let i = 1; i <= plazo; i++) {
                  const pagoInteres = saldo * monthlyRate;
                  const pagoCapital = cuotaFija - pagoInteres;
                  const saldoFinal = saldo - pagoCapital;
                  const fechaPago = new Date(startDate);
                  fechaPago.setMonth(startDate.getMonth() + i - 1);
                  fechaPago.setDate(diaPago);
                  proyeccionBody.push(new TableRow({ children: [
                      createCell([createParagraph([createTextRun(i.toString(), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.CENTER })]),
                      createCell([createParagraph([createTextRun(formatCurrency(saldo), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun(formatCurrency(pagoCapital), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun(formatCurrency(pagoInteres), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun(formatCurrency(cuotaFija), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun(formatCurrency(Math.max(saldoFinal, 0)), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.RIGHT })]),
                      createCell([createParagraph([createTextRun('30', {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.CENTER })]),
                      createCell([createParagraph([createTextRun(fechaPago.toLocaleDateString('es-CO'), {size: FONT_SIZE_VERY_SMALL})], { alignment: AlignmentType.CENTER })]),
                  ]}));
                  saldo = saldoFinal;
              }
              children.push(createBorderedTable(proyeccionBody, [5, 15, 15, 15, 15, 15, 10, 10]));
              children.push(createParagraph([createTextRun('')]));
          }
      });
  }

  // ========== 11. SOLICITUD SOBRE LA TARIFA ========== 
  children.push(createParagraph([new PageBreak()]));
  children.push(createHeading('11. SOLICITUD SOBRE LA TARIFA:'));
  children.push(createParagraph([createTextRun('Atendiendo las tarifas contenidas en el Decreto 2677 de 2012, por las condiciones de insolvencia económica en que me encuentro, con el debido respeto y con fundamento en el Articulo 536 de la Ley 1564 de 2012, le solicito fijar una tarifa que me permita tener acceso a este procedimiento de insolvencia económica de la persona natural no comerciante')], { alignment: AlignmentType.JUSTIFIED, indentation: { left: 720 } }));

  // ========== 12. FUNDAMENTOS DE DERECHO ========== 
  children.push(createHeading('12. FUNDAMENTOS DE DERECHO:'));
  children.push(createParagraph([createTextRun('La presente solicitud de Insolvencia Económica de la Persona Natural No Comerciante se encuentra fundamentada conforme al Titulo IV de la Ley 1564 de 2012, Decreto Reglamentario 1069 de 2015 y demás disposiciones complementarias y conducentes.')], { alignment: AlignmentType.JUSTIFIED, indentation: { left: 720 } }));

  // ========== 13. ANEXOS ========== 
  children.push(createHeading('13. ANEXOS:'));
  children.push(createParagraph([createTextRun('Para efectos del cumplimiento de los requisitos exigidos, se anexan los siguientes documentos:')], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun('13.1 Otros anexos')], { indentation: { left: 720 } }));
  const anexos = solicitud.anexos || [];
  anexos.forEach(anexo => {
      children.push(createParagraph([createTextRun(`     • ${anexo.filename}`)], { indentation: { left: 1080 } }));
  });

  // ========== 14. NOTIFICACIONES ========== 
  children.push(createHeading('14. NOTIFICACIONES'));
  children.push(createParagraph([createTextRun('Deudor', { bold: true })], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(nombreCompleto)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`País: Colombia`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`Departamento: ${safe(deudor.departamento)}`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`Ciudad: ${safe(deudor.ciudad)}`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`Dirección: ${safe(deudor.domicilio)}`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`Teléfono / Celular: ${safe(deudor.telefono)}`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun(`Correo electrónico: ${safe(deudor.email)}`)], { indentation: { left: 720 } }));
  children.push(createParagraph([createTextRun('Acreedores: Mis acreedores recibirán las notificaciones según las indicaciones que he suministrado para cada uno.')], { indentation: { left: 720 } }));

  // ========== FIRMA ========== 
  children.push(createParagraph([createTextRun('')], { spacing: { before: 480 } }));
  children.push(createParagraph([createTextRun('Atentamente,')]));
  children.push(createParagraph([createTextRun('')], { spacing: { before: 960 } }));
  children.push(createParagraph([createTextRun(nombreCompleto, { bold: true })], { alignment: AlignmentType.CENTER }));
  children.push(createParagraph([createTextRun(safe(deudor.email))], { alignment: AlignmentType.CENTER }));
  children.push(createParagraph([createTextRun(`Fecha: ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'numeric', year: 'numeric' })} - ${new Date().toLocaleTimeString('es-CO')}`)], { alignment: AlignmentType.CENTER }));
  children.push(createParagraph([createTextRun('C.C. ' + safe(deudor.cedula))], { alignment: AlignmentType.CENTER }));
  children.push(createParagraph([createTextRun('Deudor(a)')], { alignment: AlignmentType.CENTER }));

  const docInstance = new Document({
    creator: 'MenduzLegalGroup',
    title: `Solicitud de Insolvencia - ${nombreCompleto}`,
    styles: {
      paragraph: {
        run: { font: FONT_FAMILY, size: FONT_SIZE },
      },
    },
    sections: [{
      properties: {
        pageSize: {
          width: 12240,
          height: 20160,
        },
        page: {
          margin: {
            top: 1900, 
            right: 800,
            bottom: 3000,
            left: 800,
          },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(docInstance);
  return buffer;
}

const generateConciliacionDocx = async (solicitud = {}) => {

  const {
    infoGeneral = {},
    convocantes = [],
    convocados = [],
    hechos = [],
    pretensiones = [],
    firma = {},
    sede = {},
    anexos
  } = solicitud;

  const FONT_SIZE_12PT = 24;

  const createConciliacionTextRun = (text, options = {}) => new TextRun({
    text: String(text),
    font: FONT_FAMILY,
    size: FONT_SIZE_12PT,
    ...options
  });

  const createConciliacionParagraph = (children, options = {}) => new Paragraph({
    children,
    spacing: { after: 100, line: 300, lineRule: "auto" }, // 1.25 line height for 12pt font
    ...options
  });

  const children = [];

  // --- ENCABEZADO ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('Señores')]));
  children.push(createConciliacionParagraph([createConciliacionTextRun(safe(sede.entidadPromotora).toUpperCase(), { bold: true })]));
  children.push(createConciliacionParagraph([createConciliacionTextRun(`${safe(sede.sedeCentro).toUpperCase()} - ${safe(sede.ciudad).toUpperCase()}`)]));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- REFERENCIA ---
  children.push(createConciliacionParagraph([
    createConciliacionTextRun('REF. ', { bold: true }),
    createConciliacionTextRun('SOLICITUD CONCILIACIÓN EXTRAJUDICIAL EN DERECHO ', { bold: true }),
  ]));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- IDENTIFICACIÓN ---
  const convocante = convocantes[0] || {};
  const nombreConvocante = convocante.tipoInvolucrado === 'Persona Jurídica'
    ? safe(convocante.razonSocial)
    : `${safe(convocante.primerNombre)} ${safe(convocante.segundoNombre)} ${safe(convocante.primerApellido)} ${safe(convocante.segundoApellido)}`.trim().toUpperCase();
  const idConvocante = `${safe(convocante.tipoIdentificacion)} No. ${safe(convocante.numeroIdentificacion)} de ${safe(convocante.ciudadExpedicion)}`;

  const convocado = convocados[0] || {};
  const nombreConvocado = convocado.tipoInvolucrado === 'Persona Jurídica'
    ? safe(convocado.razonSocial)
    : `${safe(convocado.primerNombre)} ${safe(convocado.segundoNombre)} ${safe(convocado.primerApellido)} ${safe(convocado.segundoApellido)}`.trim().toUpperCase();
  const idConvocado = `${safe(convocado.tipoIdentificacion)} No. ${safe(convocado.numeroIdentificacion)} de ${safe(convocado.ciudadExpedicion)}`;

  children.push(createConciliacionParagraph([
    createConciliacionTextRun(nombreConvocante, { bold: true }),
    createConciliacionTextRun(`, identificado(a) con ${idConvocante}; mayor de edad y domiciliado en la ciudad de ${safe(convocante.ciudad)}, solicitamos respetuosamente a usted se sirva de celebrar `),
    createConciliacionTextRun('AUDIENCIA DE CONCILIACIÓN EXTRAJUDICIAL EN DERECHO – ', { bold: true }),
    createConciliacionTextRun(safe(infoGeneral.tema).toUpperCase(), { bold: true }),
    createConciliacionTextRun(' - ', { bold: true }),
    createConciliacionTextRun('en contra de '),
    createConciliacionTextRun(nombreConvocado, { bold: true }),
    createConciliacionTextRun(` identificado(a) con ${idConvocado}; de acuerdo con lo siguiente:`)
  ], { alignment: AlignmentType.JUSTIFIED }));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- HECHOS ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('HECHOS', { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 300, after: 100 } }));

  hechos.forEach((h, idx) => {
    const numero = ['PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO'][idx] || `${idx + 1}`;
    const descripcion = (h.descripcion || '').replace(/<[^>]+>/g, '');
    children.push(createConciliacionParagraph([
      createConciliacionTextRun(`${numero} – `, { bold: true }),
      createConciliacionTextRun(descripcion)
    ], { alignment: AlignmentType.JUSTIFIED, spacing: { before: 100, after: 100 } }));
  });
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- PETICIONES ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('PETICIONES', { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 } }));

  pretensiones.forEach((p, idx) => {
    const numero = ['PRIMERA', 'SEGUNDA', 'TERCERA', 'CUARTA'][idx] || `${idx + 1}`;
    const descripcion = (p.descripcion || '').replace(/<[^>]+>/g, '');
    children.push(createConciliacionParagraph([
      createConciliacionTextRun(`${numero}: `, { bold: true }),
      createConciliacionTextRun(descripcion)
    ], { alignment: AlignmentType.JUSTIFIED, spacing: { before: 100, after: 100 } }));
  });
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- FUNDAMENTOS DE DERECHO ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('FUNDAMENTOS DE DERECHO', { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 } }));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun('El artículo 44 de la Constitución Política de Colombia; Títulos XII y XXI del Código Civil; Ley 27 de 1977; Ley 1098 del 2006; artículo 133 a 159 del decreto 2737 de 1989; Ley 75 del 1968; artículo 390 y siguientes del Código General del Proceso y demás normas concordantes.')
  ], { alignment: AlignmentType.JUSTIFIED }));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- ANEXOS ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('ANEXOS', { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 } }));
  children.push(createConciliacionParagraph([createConciliacionTextRun('Anexo los siguientes documentos')]));

  const anexosList = anexos && anexos.length > 0
    ? anexos.map(anexo => `${anexo.descripcion} - ${anexo.filename}`)
    : [
        `Copia de cédula de ciudadanía de ${nombreConvocante}`,
        `Copia de cédula de ciudadanía de ${nombreConvocado}`,
        `Registro civil de ${nombreConvocado}`,
        'Certificado de Cuenta Bancaria',
        'Poder otorgado'
      ];
  
  anexosList.forEach(item => {
      children.push(createConciliacionParagraph([createConciliacionTextRun(item)], { bullet: { level: 0 }}));
  });
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));

  // --- NOTIFICACIONES ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('NOTIFICACIONES', { bold: true })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 100 } }));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun('La Accionante:', { bold: true }),
  ]));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun(`Email: ${safe(convocante.email)}`),
  ]));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')]));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun('El accionado:', { bold: true }),
  ]));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun(`Email: ${safe(convocado.email)}`),
  ]));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')], { spacing: { after: 600 } }));

  // --- FIRMA ---
  children.push(createConciliacionParagraph([createConciliacionTextRun('Atentamente;')]));
  children.push(createConciliacionParagraph([createConciliacionTextRun('')], { spacing: { after: 200 } }));

  if (firma && firma.data) {
    const base64Data = firma.data.split('base64,').pop();
    if (base64Data) {
        try {
            children.push(createConciliacionParagraph([new ImageRun({
                data: Buffer.from(base64Data, 'base64'),
                transformation: {
                    width: 200,
                    height: 100,
                },
            })]));
        } catch (e) {
            console.error("Error processing signature image for DOCX:", e);
        }
    }
  }

  children.push(createConciliacionParagraph([createConciliacionTextRun('')])); 
  
  children.push(createConciliacionParagraph([
      createConciliacionTextRun(nombreConvocante, { bold: true }),
  ]));
  children.push(createConciliacionParagraph([
    createConciliacionTextRun(`Cédula de Ciudadanía No. ${safe(convocante.numeroIdentificacion)} de ${safe(convocante.ciudadExpedicion)}.`)
  ]));

  if (solicitud.firma?.source === 'upload' && solicitud.firma?.url && !solicitud.firma?.data) {
    try {
      console.log('[DOCX] Fetching signature image from URL:', solicitud.firma.url);
      const dataUrl = await fetchImageAsBase64(solicitud.firma.url);
      solicitud.firma.data = dataUrl;
    } catch (err) {
      console.error('[DOCX] Error fetching signature image:', err.message);
    }
  }

  const doc = new Document({
    creator: 'MenduzLegalGroup',
    title: `Conciliacion - ${nombreConvocante}`,
    sections: [{
      properties: {
        pageSize: {
          width: 12240, // LETTER width in dxa (8.5in * 1440)
          height: 15840, // LETTER height in dxa (11in * 1440)
        },
        page: {
          margin: {
            top: 1900, 
            right: 800,
            bottom: 1900,
            left: 800,
          },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
};

async function generateAdmisionDocx(solicitud = {}) {
  const deudor = solicitud.deudor || {};
  const sede = solicitud.sede || {};
  const acreencias = Array.isArray(solicitud.acreencias) ? solicitud.acreencias : [];
  const bienesMuebles = Array.isArray(solicitud.bienesMuebles) ? solicitud.bienesMuebles : [];
  const bienesInmuebles = Array.isArray(solicitud.bienesInmuebles) ? solicitud.bienesInmuebles : [];
  const infoFin = solicitud.informacionFinanciera || {};
  const procesosJudiciales = Array.isArray(infoFin.procesosJudiciales) ? infoFin.procesosJudiciales : [];
  const obligacionesAlimentarias = Array.isArray(infoFin.obligacionesAlimentarias) ? infoFin.obligacionesAlimentarias : [];
  const propuestaPago = solicitud.propuestaPago || {};

  const nombreCompleto = `${(deudor.primerNombre || "")} ${(deudor.segundoNombre || "")} ${(deudor.primerApellido || "")} ${(deudor.segundoApellido || "")}`.replace(/\s+/g, " ").trim();
  const totalCapital = acreencias.reduce((s, a) => s + (Number(a.capital) || 0), 0);
  const acreenciasEnMora90 = acreencias.filter(a => a.creditoEnMora && !a.esLibranza);
  const capitalEnMora90 = acreenciasEnMora90.reduce((s, a) => s + (Number(a.capital) || 0), 0);

  const admissionDate = solicitud.fechaAdmision ? new Date(solicitud.fechaAdmision) : new Date();
  const audienceDate = solicitud.fechaAudiencia ? new Date(solicitud.fechaAudiencia) : new Date(admissionDate.getTime() + 15 * 24 * 60 * 60 * 1000);

  const esFemenino = (deudor.genero || '').toLowerCase() === 'femenino';
  const senoraOsenor = esFemenino ? 'señora' : 'señor';
  const SeñoraOSeñor = esFemenino ? 'Señora' : 'Señor';
  const identificadxA = esFemenino ? 'identificada' : 'identificado';
  const insolventx = esFemenino ? 'la insolvente' : 'el insolvente';
  const deudorax = esFemenino ? 'deudora' : 'deudor';
  const laDeudoraAlDeudor = esFemenino ? 'a la deudora' : 'al deudor';
  const solteraSoltero = esFemenino ? 'SOLTERA' : 'SOLTERO';

  const children = [];

  // ========== ENCABEZADO AUTO (Centrado y Negrita) ========== 
  children.push(createParagraph([createTextRunAdmision("AUTONo.1", { bold: true, underline: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
  children.push(createParagraph([createTextRunAdmision("ADMISIÓN", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
  children.push(createParagraph([createTextRunAdmision("PROCESO DE NEGOCIACIÓN DE DEUDAS DE PERSONA NATURAL NO COMERCIANTE", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
  children.push(createParagraph([createTextRunAdmision("Deudor", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
  children.push(createParagraph([createTextRunAdmision(nombreCompleto.toUpperCase(), { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } }));
  children.push(createParagraph([
    createTextRunAdmision("C.C. número ", { bold: true }),
    createTextRunAdmision(`${safe(deudor.cedula)}, expedida en ${safe(deudor.ciudadExpedicion)}, ${safe(deudor.departamentoExpedicion)}.`, { bold: true }),
  ], { alignment: AlignmentType.CENTER, spacing: { after: 0 } }));
  children.push(createParagraph([
    createTextRunAdmision("Radicado: ", { bold: true }),
    createTextRunAdmision(solicitud.radicado || solicitud._id?.toString().substring(0, 7).toUpperCase() || "0001413/2025", { bold: true }),
  ], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));

  // ========== FECHA Y LUGAR ========== 
  const currentMonthLong = admissionDate.toLocaleDateString("es-CO", { month: "long" });
  children.push(createParagraph([
    createTextRunAdmision(`${safe(sede.ciudad || "San José de Cúcuta")}, A los Veinticinco (25) días del mes de ${currentMonthLong} del año dos mil veinticinco (${admissionDate.getFullYear()}). Revisada la solicitud en el proceso de Negociación de Pasivos correspondiente al trámite de Insolvencia Económica de Persona Natural No Comerciante del proceso arriba citado, se procede a admitir de conformidad a las siguientes:`)
  ], { spacing: { after: 240 } }));

  // ========== I. CONSIDERACIONES ========== 
  children.push(createParagraph([createTextRunAdmision("I. CONSIDERACIONES:", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
  
  children.push(createParagraph([
    createTextRunAdmision(`La ${senoraOsenor} `),
    createTextRunAdmision(nombreCompleto.toUpperCase(), { bold: true }),
    createTextRunAdmision(`, mayor de edad, con domicilio en esta ciudad, ${identificadxA} con cédula de ciudadanía número `),
    createTextRunAdmision(safe(deudor.cedula), { bold: true }),
    createTextRunAdmision(`, en su calidad de deudor, A los Diecinueve (19) días del mes de noviembre del año dos mil veinticinco (2025), presentó solicitud de negociación de sus deudas con sus acreedores, con el objeto de normalizar sus relaciones crediticias (Artículo 531 C.G.P, modificado por el Articulo 3 de la Ley 2445 del 2025).`),
  ], { spacing: { after: 240 } }));

  children.push(createParagraph([
    createTextRunAdmision(`A los Diecinueve (19) días del mes de noviembre del año dos mil veinticinco (2025), la directora del centro de Conciliación Manos Amigas, me designó como Operadora de Insolvencia del proceso en referencia, cargo que acepté, A los Veinte (20) días del mes de noviembre del año dos mil veinticinco (2025), (Artículo 541 C.G.P, modificado por el Articulo 12 de la Ley 2445 del 2025), Mediante el uso de tecnologías de la comunicación y la información,`),
  ], { spacing: { after: 240 } }));

  children.push(createParagraph([
    createTextRunAdmision("Aceptado el encargo, se procedió a analizar la información y los soportes suministrados con la solicitud y, con estos elementos, se realizó el correspondiente Control de Legalidad según lo dispuesto en el Artículo 132 del C.G.P, en este orden se verificó el cumplimiento de los supuestos de insolvencia (Artículo 538 CGP, modificado por el Articulo 9 de la Ley 2445 del 2025) y se estableció que:"),
  ], { spacing: { after: 240 } }));

  const verifications = [
    "El deudor es persona natural no comerciante, tal cual se observa en la documentación que aporta.",
    "Se encuentra en cesación de pagos con dos (2) o más obligaciones a favor de dos (2) o más acreedores y por más de noventa (90) días.",
    "El valor porcentual de sus obligaciones representa más del treinta por ciento (30%) del pasivo total a su cargo.",
    "La relación completa de todos los acreedores en el orden de prelación de créditos que señalan los artículos 2488 y siguientes del Código Civil."
  ];

  verifications.forEach((v, idx) => {
    children.push(createParagraph([
        createTextRunAdmision(`${idx + 1}.\t`, { bold: true }),
        createTextRunAdmision(v)
    ], { indentation: { left: 720, hanging: 360 }, spacing: { after: 120 } }));
  });

  // ========== RAZONES POR LAS CUALES ESTA EN INSOLVENCIA ========== 
  children.push(createParagraph([createTextRunAdmision("RAZONES POR LAS CUALES ESTA EN INSOLVENCIA:", { bold: true })], { spacing: { before: 120, after: 120 } }));
  children.push(createParagraph([
    createTextRunAdmision(`En cumplimiento de lo consagrado en el Art. 539 numeral 1 C.G.P, modificado por el articulo Decimo (10) de la ley 2445 de 2025, menciona la ${insolventx} textualmente en su solicitud lo siguiente:`),
  ], { spacing: { after: 120 } }));
  
  const causasTexto = solicitud.causasInsolvencia || "ANTE LA CRISIS ECONOMICA Y LA ESCASEZ DE ALTERNATIVAS, BUSQUE NUEVAS FUENTES DE LIQUIDEZ ECONOMICA EN BANCOS Y TARJETAS DE CREDITO...";
  children.push(createParagraph([createTextRunAdmision(causasTexto.toUpperCase())], { indentation: { left: 720 }, alignment: AlignmentType.JUSTIFIED, spacing: { after: 240 } }));

  // ========== RESUMEN DE ACREENCIAS ========== 
  children.push(createParagraph([createTextRunAdmision("RESUMEN DE ACREENCIAS", { bold: true })], { spacing: { after: 120 } }));

  const resumoRows = [];
  const classOrder = [
    { key: "PRIMERA CLASE", label: "PRIMERA CLASE: Créditos del fisco o impuestos" },
    { key: "SEGUNDA CLASE", label: "SEGUNDA CLASE: Prendarios" },
    { key: "TERCERA CLASE", label: "TERCERA CLASE: Hipotecarios" },
    { key: "CUARTA CLASE", label: "CUARTA CLASE: Proveedores y otros" },
    { key: "QUINTA CLASE", label: "QUINTA CLASE: Quirografarios" }
  ];

  const getClassFromNaturaleza = (naturaleza) => {
    if (!naturaleza) return "QUINTA CLASE";
    const natUpper = naturaleza.toUpperCase();
    if (natUpper.includes("PRIMERA")) return "PRIMERA CLASE";
    if (natUpper.includes("SEGUNDA")) return "SEGUNDA CLASE";
    if (natUpper.includes("TERCERA")) return "TERCERA CLASE";
    if (natUpper.includes("CUARTA")) return "CUARTA CLASE";
    return "QUINTA CLASE";
  };

  const groupedAcreencias = acreencias.reduce((acc, a) => {
    const aClass = getClassFromNaturaleza(a.naturalezaCredito);
    if (!acc[aClass]) acc[aClass] = [];
    acc[aClass].push(a);
    return acc;
  }, {});

  classOrder.forEach(claseDef => {
    if (groupedAcreencias[claseDef.key] && groupedAcreencias[claseDef.key].length > 0) {
      // Cabecera de la Clase
      resumoRows.push(new TableRow({
        children: [createCell([createParagraph([createTextRunAdmision(claseDef.label, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 4 })],
      }));
      // Títulos de columnas
      resumoRows.push(new TableRow({
        children: [
          createCell([createParagraph([createTextRunAdmision("ACREEDORES", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })]),
          createCell([createParagraph([createTextRunAdmision("VALOR DE DEUDA", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })]),
          createCell([createParagraph([createTextRunAdmision("PARTICIPACION", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })]),
          createCell([createParagraph([createTextRunAdmision("DIAS DE MORA", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })]),
        ],
      }));

      let classTotal = 0;
      groupedAcreencias[claseDef.key].forEach(a => {
        const nombre = (typeof a.acreedor === "object" ? a.acreedor.nombre : a.acreedor) || "No reporta";
        const capital = Number(a.capital) || 0;
        classTotal += capital;
        const porcentaje = totalCapital > 0 ? `${((capital / totalCapital) * 100).toFixed(2)}%` : "0.00%";
        let moraText = a.creditoEnMora ? "Mas de 90 dias" : "Al dia";
        if (a.esLibranza) moraText = "Se encuentra al\ndía. (Pago\nmediante libranza\nu otro tipo de\ndescuento por\nnómina)";

        resumoRows.push(new TableRow({
          children: [
            createCell([createParagraph([createTextRunAdmision(nombre.toUpperCase())], { spacing: { after: 0 } })]),
            createCell([createParagraph([createTextRunAdmision(formatCurrency(capital))], { spacing: { after: 0 } })]),
            createCell([createParagraph([createTextRunAdmision(porcentaje)], { spacing: { after: 0 } })]),
            createCell([createParagraph([createTextRunAdmision(moraText)], { spacing: { after: 0 } })]),
          ],
        }));
      });

      // Total de la clase
      const classPorcentaje = totalCapital > 0 ? `${((classTotal / totalCapital) * 100).toFixed(2)}%` : "0.00%";
      resumoRows.push(new TableRow({
        children: [
          createCell([createParagraph([createTextRunAdmision(`TOTAL, ${claseDef.key}`, { bold: true })], { spacing: { after: 0 } })]),
          createCell([createParagraph([createTextRunAdmision(formatCurrency(classTotal), { bold: true })], { spacing: { after: 0 } })]),
          createCell([createParagraph([createTextRunAdmision(classPorcentaje, { bold: true })], { spacing: { after: 0 } })]),
          createCell([createParagraph([], { spacing: { after: 0 } })]),
        ],
      }));
    }
  });

  // Totales Finales
  const moraPorcentaje = totalCapital > 0 ? `${((capitalEnMora90 / totalCapital) * 100).toFixed(2)}%` : "0.00%";
  resumoRows.push(new TableRow({
    children: [
      createCell([createParagraph([createTextRunAdmision("TOTAL, CAPITAL EN MORA MÁS DE 90 DÍAS\n(No aplica a créditos cuyo pago se esté realizando mediante libranza o descuento por nómina)", { bold: true })], { spacing: { after: 0 } })]),
      createCell([createParagraph([createTextRunAdmision(`${formatCurrency(capitalEnMora90)}\nDe\n${formatCurrency(totalCapital)}`, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })]),
      createCell([createParagraph([createTextRunAdmision(moraPorcentaje, { bold: true })], { spacing: { after: 0 } })]),
      createCell([createParagraph([], { spacing: { after: 0 } })]),
    ],
  }));

  resumoRows.push(new TableRow({
    children: [
      createCell([createParagraph([createTextRunAdmision("TOTAL, OBLIGACIÓN", { bold: true })], { spacing: { after: 0 } })]),
      createCell([createParagraph([createTextRunAdmision(formatCurrency(totalCapital), { bold: true })], { spacing: { after: 0 } })]),
      createCell([createParagraph([], { spacing: { after: 0 } })], { columnSpan: 2 }),
    ],
  }));

  children.push(new Table({
    rows: resumoRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  }));
  children.push(createParagraph([], { spacing: { after: 240 } }));

  // ========== 5. RELACIÓN E INVENTARIO DE BIENES ========== 
  children.push(createParagraph([createTextRunAdmision("5. RELACIÓN E INVENTARIO DE LOS BIENES MUEBLES E INMUEBLES", { bold: true })], { spacing: { after: 120 } }));
  children.push(createParagraph([createTextRunAdmision("En cumplimiento de lo consagrado en el Art. 539 numeral 4 C.G.P, modificado por el Articulo 10 de la Ley 2445 del 2025, el deudor manifiesta relación completa y detallada de los bienes muebles e inmuebles:")], { spacing: { after: 240 } }));

  // Bienes Muebles
  children.push(createParagraph([createTextRunAdmision("5.1. Bienes muebles:", { bold: true })], { spacing: { after: 120 } }));
  
  const mueblesRows = [];
  if (!bienesMuebles.length) {
    children.push(createParagraph([createTextRunAdmision("Se manifiesta bajo la gravedad de juramento que no se poseen Bienes Muebles.")], { indentation: { left: 360 } }));
  } else {
    let totalMuebles = 0;
    bienesMuebles.forEach((b, i) => {
        totalMuebles += Number(b.avaluoComercial || b.valor || 0);
        const isVehiculo = (b.clasificacion || "").toLowerCase().includes("vehiculo") || b.placa;
        const title = isVehiculo ? `Vehículo No. ${i + 1}` : `Bien mueble No. ${i + 1}`;
        
        mueblesRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(title, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
        
        const data = isVehiculo ? [
          ["Placa", safe(b.placa)], ["Descripción", safe(b.descripcion)], ["Línea y modelo", safe(b.modelo)], ["Marca", safe(b.marca)], ["Departamento de transito", safe(b.transito)], ["Licencia de transito", safe(b.licencia)], ["avalúo comercial estimado", formatCurrency(b.avaluoComercial)]
        ] : [
          ["Descripción", safe(b.descripcion)], ["clasificación", safe(b.clasificacion)], ["Marca", safe(b.marca)], ["avalúo comercial estimado", formatCurrency(b.avaluoComercial)]
        ];

        data.forEach(([lbl, val]) => {
          mueblesRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(lbl)], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(val.toUpperCase())], { spacing: { after: 0 } })])] }));
        });
    });
    mueblesRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision("Total, avaluó comercial estimado de bienes muebles", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
    mueblesRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision("Total", { bold: true })], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(formatCurrency(totalMuebles), { bold: true })], { spacing: { after: 0 } })])] }));
    children.push(new Table({ rows: mueblesRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }
  children.push(createParagraph([], { spacing: { after: 240 } }));

  // Bienes Inmuebles
  children.push(createParagraph([createTextRunAdmision("Bienes inmuebles:", { bold: true })], { spacing: { after: 120 } }));
  if (!bienesInmuebles.length) {
    children.push(createParagraph([createTextRunAdmision("Manifiesto bajo la gravedad de juramento que no cuento con bienes inmuebles a mi nombre, tal como se puede constatar mediante la consulta a la base de datos del índice de propietarios Nacional.")], { spacing: { after: 240 } }));
  } else {
     bienesInmuebles.forEach((b, i) => {
        const inmuRows = [];
        inmuRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(`Bien Inmueble No. ${i + 1}`, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
        const data = [
            ["Descripción", safe(b.descripcion)], ["Dirección", safe(b.direccion)], ["País", safe(b.pais || "COLOMBIA")], ["Ciudad", safe(b.ciudad)], ["Departamento", safe(b.departamento)], ["Matrícula inmobiliaria", safe(b.matricula)], ["Avalúo Comercial Estimado", formatCurrency(b.avaluoComercial)], ["Porcentaje de participación", safe(b.participacion)], ["Limitaciones al dominio", safe(b.limitaciones)]
        ];
        data.forEach(([lbl, val]) => {
          inmuRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(lbl, { bold: true })], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(val)], { spacing: { after: 0 } })])] }));
        });
        children.push(new Table({ rows: inmuRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
        children.push(createParagraph([], { spacing: { after: 240 } }));
    });
  }

  // ========== 6. PROCESOS JUDICIALES ========== 
  children.push(createParagraph([createTextRunAdmision("6.RELACIÓN DE PROCESOS JUDICIALES Y DE CUALQUIER PROCEDIMIENTO O ACTUACIÓN ADMINISTRATIVA DE CARÁCTER PATRIMONIAL:", { bold: true })], { spacing: { after: 120 } }));
  if (procesosJudiciales.length > 0) {
      procesosJudiciales.forEach((p) => {
          const pRows = [];
          pRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(`Proceso Judicial No.\n${safe(p.radicado)}`, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
          const pData = [
              ["Proceso Judicial", safe(p.posicion || "En contra")], ["Tipo de Proceso", safe(p.tipoProceso)], ["Tipo de Juzgado", safe(p.juzgado)], ["Numero de Radicación", safe(p.radicado)], ["Estado del Proceso", safe(p.estado)], ["Demandante", safe(p.demandante)], ["Demandado", safe(p.demandado)], ["Valor", formatCurrency(p.valor)], ["Departamento", safe(p.departamento)], ["Ciudad", safe(p.ciudad)], ["Correo electrónico", safe(p.correo)]
          ];
          pData.forEach(([lbl, val]) => {
              pRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(lbl)], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(val)], { spacing: { after: 0 } })])] }));
          });
          children.push(new Table({ rows: pRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          children.push(createParagraph([], { spacing: { after: 240 } }));
      });
  }

  // ========== 7. OBLIGACIONES ALIMENTARIAS ========== 
  children.push(createParagraph([createTextRunAdmision("7.INFORMACIÓN SOBRE OBLIGACIONES ALIMENTARIAS Y PERSONAS A CARGO:", { bold: true })], { spacing: { after: 120 } }));
  children.push(createParagraph([createTextRunAdmision("En cumplimiento de lo consagrado en el Art. 539 numeral 9 C.G.P, modificado por el Articulo 10 de la Ley 2445 del 2025, el deudor manifiesta:")], { spacing: { after: 120 } }));
  
  if (obligacionesAlimentarias.length > 0) {
      obligacionesAlimentarias.forEach((o, idx) => {
          const oRows = [];
          oRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(`Persona a cargo No ${idx + 1}`, { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
          const oData = [
              ["Beneficiario", safe(o.beneficiario)], ["Tipo de identificación", safe(o.tipoIdentificacion)], ["Número de identificación", safe(o.identificacion)], ["País de residencia", safe(o.pais || "COLOMBIA")], ["Departamento", safe(o.departamento)], ["Ciudad", safe(o.ciudad)], ["Descripción", safe(o.descripcion)], ["Periodo de pago", safe(o.periodoPago || "No")], ["Parentesco", safe(o.parentesco)]
          ];
          oData.forEach(([lbl, val]) => {
              oRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(lbl)], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(val.toUpperCase())], { spacing: { after: 0 } })])] }));
          });
          children.push(new Table({ rows: oRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
          children.push(createParagraph([], { spacing: { after: 240 } }));
      });
  }

  // ========== 8. GASTOS DE SUBSISTENCIA ========== 
  children.push(createParagraph([createTextRunAdmision("8.RELACIÓN DE GASTOS DE SUBSISTENCIA DEL DEUDOR Y DE PERSONAS A CARGO:", { bold: true })], { spacing: { after: 120 } }));
  children.push(createParagraph([createTextRunAdmision("En cumplimiento de lo consagrado en el Art. 539 numeral 7 C.G.P, modificado por el Articulo 10 de la Ley 2445 del 2025, el deudor manifiesta:")], { spacing: { after: 120 } }));

  const gRows = [];
  gRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision("Gastos De Subsistencia", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
  
  const gastosPersonales = infoFin.gastosPersonales || {};
  let totalGastos = 0;
  const listGastos = [
    { label: "Alimentación", key: "alimentacion" }, { label: "Servicios Públicos", key: "serviciosPublicos" }, { label: "vestuario", key: "vestuario" }, { label: "Recreación", key: "recreacion" }, { label: "Transporte", key: "transporte" }, { label: "Descuentos de ley (Salud, pensiones, aportes)", key: "descuentosLey" }, { label: "Descuentos por libranza", key: "libranzas" }
  ];

  listGastos.forEach(item => {
      const val = Number(gastosPersonales[item.key]) || 0;
      totalGastos += val;
      gRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(item.label, { bold: true })], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(formatCurrency(val))], { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })])] }));
  });
  gRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision("TOTAL, GASTOS", { bold: true })], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(formatCurrency(totalGastos), { bold: true })], { alignment: AlignmentType.RIGHT, spacing: { after: 0 } })])] }));
  children.push(new Table({ rows: gRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  children.push(createParagraph([], { spacing: { after: 240 } }));

  // ========== 9. INGRESOS ========== 
  children.push(createParagraph([createTextRunAdmision("9. RELACIÓN DE INGRESOS:", { bold: true })], { spacing: { after: 120 } }));
  const iRows = [];
  iRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision("Ingresos", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 0 } })], { columnSpan: 2 })] }));
  
  const totalIngresos = Number(infoFin.ingresosActividadPrincipal || 0) + Number(infoFin.ingresosOtrasActividades || 0);
  const iData = [
      ["Ingresos mensuales por actividad laboral", formatCurrency(Number(infoFin.ingresosActividadPrincipal) || 0)], ["Empleo", infoFin.tieneEmpleo ? "SI" : "NO"], ["Descripción", safe(infoFin.descripcionActividadEconomica)], ["Tipo de actividad", safe(infoFin.tipoActividad)], ["Ingresos mensuales por otras actividades", formatCurrency(Number(infoFin.ingresosOtrasActividades) || 0)], ["TOTAL, DE INGRESOS MENSUALES", formatCurrency(totalIngresos)]
  ];
  iData.forEach(([lbl, val]) => {
      iRows.push(new TableRow({ children: [createCell([createParagraph([createTextRunAdmision(lbl, { bold: true })], { spacing: { after: 0 } })]), createCell([createParagraph([createTextRunAdmision(val)], { spacing: { after: 0 } })])] }));
  });
  children.push(new Table({ rows: iRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  children.push(createParagraph([], { spacing: { after: 240 } }));

  // ========== 10. SOCIEDAD CONYUGAL ========== 
  children.push(createParagraph([createTextRunAdmision("10.INFORMACIÓN SOBRE SOCIEDAD CONYUGAL Y PATRIMONIAL:", { bold: true })], { spacing: { after: 120 } }));
  children.push(createParagraph([createTextRunAdmision("En cumplimiento de lo consagrado en el art. 539 numeral 8 C.G.P, modificado por el Articulo 10 de la Ley 2445 del 2025, el deudor manifiesta:")], { spacing: { after: 120 } }));
  const conyugalTexto = solicitud.sociedadConyugal?.activa ? `ESTADO CIVIL CASADO(A) O EN UNIÓN LIBRE CON LA SOCIEDAD VIGENTE CON EL SEÑOR(A) ${safe(solicitud.sociedadConyugal.nombreConyuge).toUpperCase()}.` : `MANIFIESTO BAJO LA GRAVEDAD DE JURAMENTO QUE MI ESTADO CIVIL ES EL DE ${solteraSoltero} SIN UNIÓN MARITAL DE HECHO VIGENTE, PUES NO HE CONTRAÍDO MATRIMONIO CON PERSONA ALGUNA, NI HE DECLARADO LA UNIÓN MARITAL DE HECHO.`;
  children.push(createParagraph([createTextRunAdmision(conyugalTexto)], { spacing: { after: 240 } }));

  // ========== PROPUESTA DE PAGO ========== 
  children.push(createParagraph([createTextRunAdmision("PROPUESTA DE PAGO:", { bold: true })], { spacing: { after: 120 } }));
  children.push(createParagraph([createTextRunAdmision("En cumplimiento de lo consagrado en el art. 539 numeral 2 C.G.P, modificado por el Articulo 10 de la Ley 2445 del 2025, el deudor manifiesta:")], { spacing: { after: 120 } }));
  const propuestaTextoDoc = propuestaPago.descripcion || "CUENTO CON LA POSIBILIDAD ECONÓMICA DE CANCELAR MENSUALMENTE A MIS ACREEDORES...";
  children.push(createParagraph([createTextRunAdmision(propuestaTextoDoc.toUpperCase())], { spacing: { after: 240 } }));

  // ========== II. RESUELVE ========== 
  children.push(createParagraph([createTextRunAdmision(`En virtud de lo dispuesto en el Artículo 543 del C.G.P, modificado por el Articulo 14 de la Ley 2445 del 2025 y verificados los requisitos de la Solicitud de Negociación de Deudas de Persona Natural No Comerciante:`)], { spacing: { after: 240 } }));

  children.push(createParagraph([createTextRunAdmision("II. RESUELVE", { bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));

  const resolveItems = [
    { verb: "ACEPTAR", text: ` e iniciar el proceso de negociación de deudas solicitado por La ${SeñoraOSeñor} ${nombreCompleto.toUpperCase()}, ${identificadxA} con cedula de ciudadanía Numero C.C. ${safe(deudor.cedula)}, expedida en ${safe(deudor.ciudadExpedicion)}.` },
    { verb: "FIJAR", text: ` como fecha para la audiencia de negociación de pasivos el DIEZ (10) de DICIEMBRE del año (2025), a las 05:00 PM, que se llevará a cabo de manera virtual a través del link que se comparta en cada una de las notificaciones judiciales, junto con sus anexos correspondientes.` },
    { verb: "ORDENAR", text: ` ${laDeudoraAlDeudor}, ${senoraOsenor} ${nombreCompleto.toUpperCase()}, que dentro de los cinco (5) días siguientes a la aceptación del trámite de negociación de deudas, presente una relación actualizada de cada una de sus obligaciones, bienes y procesos judiciales, incluyendo todas las acreencias causadas al día inmediatamente anterior a la aceptación, conforme a la prelación de créditos tal cual se establece en el Código Civil, normas concordantes y Jurisprudencia Constitucional.` },
    { verb: "NOTIFICAR", text: ` al deudor y a los acreedores, según el reporte de direcciones que indica en la solicitud.` },
    { verb: "COMUNICAR", text: ` a la DIAN, Secretaría de Hacienda, Secretaría de Hacienda Departamental, a la Unidad de Gestión Pensional y Parafiscales y a Centrales de Riesgo.` },
    { verb: "ADVERTIR", text: ` a los acreedores, de conformidad a lo ordenado en el Artículo 545 del C.G.P, modificado por el Articulo 16 de la Ley 2445 del 2025; lo siguiente:` }
  ];

  resolveItems.forEach((item, idx) => {
    children.push(createParagraph([
        createTextRunAdmision(`${idx + 1}. `, { bold: true }),
        createTextRunAdmision(item.verb, { bold: true }),
        createTextRunAdmision(item.text)
    ], { indentation: { left: 360, hanging: 360 }, spacing: { after: 120 } }));
  });

  // Sub-ítems del numeral 6 en cursiva
  const subItems6 = [
    "6.1 Numeral 1. Los previstos en el numeral 1 del artículo 565. En consecuencia, no podrán iniciarse contra el deudor nuevos procesos o trámites públicos o privados de ejecución, de jurisdicción coactiva, de cobro de obligaciones dinerarias, de ejecución especial, ni de restitución de bienes por mora en el pago de los cánones, y se suspenderán los que estuvieren en curso al momento de la aceptación. La suspensión incluirá la ejecución aún no totalmente practicada de medidas cautelares ya decretadas respecto de bienes o derechos pertenecientes al deudor y emolumentos que este tenga por recibir por cualquier causa, personalmente o en cuentas bancarias o por medio de cualquier producto financiero, y los actos preparatorios del perfeccionamiento de tales medidas. No se podrá suspender la prestación de los servicios públicos domiciliarios en la casa de habitación del deudor por mora en el pago de las obligaciones anteriores a la aceptación de la solicitud.",
    "6.2 Numeral 2. Se suspenderán los descuentos de nómina o de productos financieros, pagos por libranza o cualquier otra forma de prerrogativa relacionada con el pago o abono automático o directo del acreedor o de mandatario suyo que se haya pactado contractualmente o que disponga la ley, excepto los relacionados con las obligaciones alimentarias del deudor.",
    "6.3 Numeral 3. No podrá suspenderse la prestación de los servicios públicos domiciliarios en la casa de habitación ni en el lugar de trabajo del deudor por mora en el pago de las obligaciones anteriores a la aceptación de la solicitud. Si hubiere operado la suspensión de los servicios públicos domiciliarios, estos deberán restablecerse y las obligaciones causadas con posterioridad por este concepto serán pagadas como gastos de administración, y como tales serán registrados en la contabilidad del acreedor; la desatención a deber estando el acreedor debidamente informado de la existencia del procedimiento insolvencia, ¡dará lugar a los trámites y sanciones previstas en el numera! 1 de artículo para casos de acreedores concursales que adelanten diligencias judiciales o extrajudiciales de cobranza, La misma regla aplicará a casos cualquier tipo de contratos tracto sucesivo, como arrendamiento, educación, salud, administración propiedad horizontal, y cualquier otro de similares características."
  ];

  subItems6.forEach(sub => {
    children.push(createParagraph([createTextRunAdmision(sub, { italic: true })], { indentation: { left: 720 }, spacing: { after: 120 } }));
  });

  const resolveItemsPart2 = [
    { num: 7, verb: "ORDENAR", text: " la suspensión de todo tipo de pagos a los acreedores, incluyendo libranzas y toda clase de descuentos a favor de los acreedores." },
    { num: 8, verb: "ORDENAR", text: " a los acreedores, a partir de la fecha de este Auto, la suspensión de todo tipo de cobros al deudor." },
    { num: 9, verb: "ADVERTIR", text: " al deudor que no podrá solicitar el inicio de otro procedimiento de insolvencia, hasta que se cumpla el término previsto en el artículo 574 del C.G.P, modificado por el Articulo 72 de la Ley 2445 del 2025." },
    { num: 10, verb: "NOTIFICAR", text: " a las partes que a partir de la fecha se interrumpe el término de prescripción y no operará la caducidad de las acciones respecto de los créditos que, contra el deudor, se hubieren hecho exigibles antes de la iniciación de este trámite." },
    { num: 11, verb: "ADVERTIR", text: " que el pago de impuestos prediales, cuotas de administración, servicios públicos y cualquier otra tasa o contribución necesarios para obtener el paz y salvo en la enajenación de inmuebles o cualquier otro bien sujeto a registro, sólo podrá exigirse respecto de aquellas acreencias causadas con posterioridad a la aceptación de la solicitud. Las restantes quedarán sujetas a los términos del acuerdo o a las resultas del procedimiento de liquidación patrimonial. Este tratamiento se aplicará a toda obligación propter rem que afecte los bienes del deudor." },
    { num: 12, verb: "INFORMAR", text: " a las entidades que administran bases de datos de carácter financiero, crediticio, comercial y de servicios, sobre esta aceptación de solicitud de negociación de deudas, según lo dispuesto del artículo 573 del Código General del Proceso." },
    { num: 13, verb: "ORDENAR", text: " la inscripción de este Auto en el correspondiente folio de los bienes sujetos a registro público de propiedad del deudor." }
  ];

  resolveItemsPart2.forEach(item => {
    children.push(createParagraph([
        createTextRunAdmision(`${item.num}. `, { bold: true }),
        createTextRunAdmision(item.verb, { bold: true }),
        createTextRunAdmision(item.text)
    ], { indentation: { left: 360, hanging: 360 }, spacing: { after: 120 } }));
  });

  // ========== FIRMA ==========
  children.push(createParagraph([createTextRunAdmision("NOTIFÍQUESE,", { bold: true })], { spacing: { before: 240, after: 600 } }));
  children.push(createParagraph([createTextRunAdmision("_________________________________")], { alignment: AlignmentType.LEFT }));
  children.push(createParagraph([createTextRunAdmision(safe(solicitud.operadorNombre || "MARIA JOSE DE LA CRUZ BECERRA").toUpperCase(), { bold: true })], { alignment: AlignmentType.LEFT }));
  children.push(createParagraph([createTextRunAdmision(`C.C ${safe(solicitud.operadorCedula || "1.093.788.325")}`)], { alignment: AlignmentType.LEFT }));
  children.push(createParagraph([createTextRunAdmision(`T.P ${safe(solicitud.operadorTP || "371580")} Del C.S.J`)], { alignment: AlignmentType.LEFT }));
  children.push(createParagraph([createTextRunAdmision("Operadora de Insolvencia", { bold: true })], { alignment: AlignmentType.LEFT }));

  // ========== MEMBRETE IMAGE ==========
let headerImage = null;

try {
  const imagePath = path.join(__dirname, "../assets/membrete_ma.jpg");

  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);

    headerImage = new ImageRun({
      data: imageBuffer,
      transformation: {
        width: 740,
        height: 1152,
      },
      floating: {
        horizontalPosition: {
          relativeFrom: HorizontalPositionRelativeFrom.PAGE,
          offset: 360000,
        },
        verticalPosition: {
          relativeFrom: VerticalPositionRelativeFrom.PAGE,
          offset: 360000,
        },
        behindDocument: true,
        allowOverlap: true,
        wrap: {
          type: TextWrappingType.NONE,
          side: TextWrappingSide.BOTH_SIDES,
        },
      },
    });
  }
} catch (error) {
  console.error("Error reading membrete image:", error);
}

// ========== DOCUMENT ==========
const docInstance = new Document({
  creator: "MenduzLegalGroup",
  title: `Admisión de Insolvencia - ${nombreCompleto}`,

  styles: {
    // 1. Configuramos el estilo por defecto del documento (docx v7+)
    default: {
      document: {
        paragraph: {
          alignment: AlignmentType.JUSTIFIED,
        },
      },
    },
    // 2. Mantenemos tu configuración actual y añadimos el justificado (compatibilidad docx antiguos)
    paragraph: {
      run: {
        font: FONT_FAMILY_ADMISION,
        size: FONT_SIZE_ADMISION,
      },
      alignment: AlignmentType.JUSTIFIED,
    },
  },

  sections: [
    {
      headers: {
        default: new Header({
          children: headerImage
            ? [
                new Paragraph({
                  children: [headerImage],
                }),
              ]
            : [],
        }),
      },

      properties: {
        page: {
          size: {
            width: 12240,  // 8.5"
            height: 18720, // 13.0"
          },
          margin: {
            top: 2880,
            right: 1440,
            bottom: 2160,
            left: 1440,
          },
        },
      },

      children,
    },
  ],
});

  return await Packer.toBuffer(docInstance);
}

module.exports = { generateSolicitudDocx, generateConciliacionDocx, generateAdmisionDocx };
