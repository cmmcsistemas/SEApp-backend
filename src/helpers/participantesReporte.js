// helpers/participantesReporte.helper.js
//
// Lógica compartida entre el endpoint de listado (JSON) y el de exportación (Excel).
import { Op, fn, col } from 'sequelize';
import VistaDatosParticipantesCompleta from '../models/vistaDatosParticipantesCompleta.js';
import EncabezadoDashboardKobo from '../models/encabezadoDashboardKobo.js';
import DiccionarioDatosKoboParticipantes from '../models/diccionarioDatosKobo.js';
// Claves técnicas de Kobo que no van en el reporte
const CLAVES_EXCLUIDAS = new Set([
  '_id', 'formhub/uuid', 'start', 'end', 'username', 'deviceid',
  '__version__', 'meta/instanceID', '_xform_id_string', '_uuid',
  'meta/rootUuid', '_attachments', '_status', '_geolocation',
  '_tags', '_notes', '_validation_status', '_submitted_by',
  // '_submission_time',
]);

// Etiquetas legibles de las columnas fijas del participante
export const ETIQUETAS_BASE = {
  id_respuesta: 'ID Respuesta',
  documento: 'Documento',
  nombre_participante: 'Nombre participante',
  apellido_participante: 'Apellido participante',
  email: 'Correo electrónico',
  nombre_modulo: 'Módulo',
};

const CAMPOS_BASE = [
  'id_respuesta', 'documento', 'nombre_participante',
  'apellido_participante', 'email', 'nombre_modulo',
];


const SEP_MODULO = '::';
 
// --------------------------- utilidades de Kobo ---------------------------
function limpiarClave(clave) {
  const partes = clave.split('/');
  return partes[partes.length - 1];
}

function parsearValor(valor) {
  if (valor == null) return null;
  if (typeof valor === 'object') return valor;
  try {
    return JSON.parse(valor);
  } catch (e) {
    return null;
  }
}

// Un valor es "grupo repetible" si es un array no vacío cuyos elementos son objetos
// (no arrays, no null). Así se representan en Kobo los repeat groups.
function esGrupoRepetible(valor) {
  return (
    Array.isArray(valor) &&
    valor.length > 0 &&
    valor.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v))
  );
}


function aplanarFormulario(json) {
  const campos = [];
  if (!json) return campos;
 
  function procesar(obj, sufijo) {
    for (const [clave, valor] of Object.entries(obj)) {
      if (CLAVES_EXCLUIDAS.has(clave)) continue;
      if (clave.startsWith('_') || clave.startsWith('meta/')) continue;
 
      const baseName = limpiarClave(clave);
 
      if (esGrupoRepetible(valor)) {
        // Repeat group: procesamos cada repetición por separado
        valor.forEach((item, idx) => {
          procesar(item, `${sufijo}__rep${idx + 1}`);
        });
      } else if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
        // Objeto anidado no repetible (grupo normal de Kobo): se aplana igual, sin sufijo extra
        procesar(valor, sufijo);
      } else {
        // Escalar, o array simple (select_multiple, etc.) -> se deja crudo,
        // la traducción/join se hace más adelante en traducirCampo().
        campos.push({ key: `${baseName}${sufijo}`, baseName, valor });
      }
    }
  }
    procesar(json, '');
  return campos;
}

  function baseNameYRepeticion(clave) {
  const m = clave.match(/^(.+)__rep(\d+)$/);
  if (m) return { base: m[1], rep: Number(m[2]) };
  return { base: clave, rep: null };
}

// --------------------------- mapeo name -> label ---------------------------
async function cargarMapasDeEtiquetas() {
  const filas = await EncabezadoDashboardKobo.findAll({ raw: true });
  const porModulo = new Map();
  const porName = new Map();
  for (const f of filas) {
    const label = (f.label && f.label.trim()) ? f.label.trim() : f.name;
    if (f.nombre_modulo) porModulo.set(`${f.nombre_modulo}||${f.name}`, label);
    if (!porName.has(f.name)) porName.set(f.name, label);
  }
  return { porModulo, porName };
}

function resolverLabel(name, modulo, mapas) {
  if (modulo) {
    const conModulo = mapas.porModulo.get(`${modulo}||${name}`);
    if (conModulo) return conModulo;
  }
  return mapas.porName.get(name) ?? name;
}

// ---------------------- Diccionario y respuestas ------------------ //

async function cargarDiccionarioChoices() {
  const filas = await DiccionarioDatosKoboParticipantes.findAll({ raw: true });
  const porModuloPregunta = new Map(); // `${modulo}||${question}` -> Map(name -> label)
  const porPregunta = new Map();       // `question`             -> Map(name -> label) (respaldo)
 
  for (const f of filas) {
    const claveMP = `${f.modulo}||${f.question}`;
    if (!porModuloPregunta.has(claveMP)) porModuloPregunta.set(claveMP, new Map());
    porModuloPregunta.get(claveMP).set(f.name, f.label);
 
    if (!porPregunta.has(f.question)) porPregunta.set(f.question, new Map());
    const mp = porPregunta.get(f.question);
    if (!mp.has(f.name)) mp.set(f.name, f.label);
  }
  return { porModuloPregunta, porPregunta };
}
 
// Devuelve el Map(name -> label) de opciones para una pregunta, o null si no es de selección.
function obtenerChoicesDePregunta(question, modulo, choices) {
  if (modulo) {
    const m = choices.porModuloPregunta.get(`${modulo}||${question}`);
    if (m) return m;
  }
  return choices.porPregunta.get(question) ?? null;
}
 
// Traduce el valor de un campo:
//  - Si la pregunta NO está en el diccionario -> texto libre/número/fecha: se deja igual.
//  - Si SÍ está -> selección: separa por espacios (select_multiple) y traduce cada opción.

// Traduce el valor de un campo usando su nombre BASE (sin sufijo de repetición)
// contra el diccionario de choices.
function traducirCampo(valor, baseName, modulo, choices) {
  const mapa = obtenerChoicesDePregunta(baseName, modulo, choices);

 
  if (!mapa) {
    return Array.isArray(valor) ? valor.join(', ') : valor;
  }
  if (valor == null || valor === '') return valor;
 
  const tokens = Array.isArray(valor)
    ? valor.map(String)
    : String(valor).split(/\s+/).filter(Boolean);
 
  return tokens.map((t) => mapa.get(t) ?? t).join(', ');
}

// --------------------------- construcción del WHERE ---------------------------
// Filtros que viven en columnas de la vista (nombre, apellido, documento, módulo).
function construirWhere({ participante, nombres, apellidos, modulo }) {
  const where = {};
  const and = [];

  if (modulo) where.nombre_modulo = modulo;
  if (nombres) and.push({ nombre_participante: { [Op.like]: `%${nombres}%` } });
  if (apellidos) and.push({ apellido_participante: { [Op.like]: `%${apellidos}%` } });

  if (participante) {
    const texto = String(participante).trim();
    const ors = [
      { nombre_participante: { [Op.like]: `%${texto}%` } },
      { apellido_participante: { [Op.like]: `%${texto}%` } },
    ];
    // documento es numérico: solo comparamos por igualdad cuando el texto es numérico
    if (/^\d+$/.test(texto)) ors.push({ documento: Number(texto) });
    and.push({ [Op.or]: ors });
  }

  if (and.length) where[Op.and] = and;
  return where;
}

// --------------------------- consolidación por participante ---------------------------
// Agrupa varias respuestas (una por módulo) del MISMO documento en un solo registro.
// Cada campo de módulo se prefija con "<modulo>::<clave>" para que nunca choque
// con un campo de mismo nombre en otro módulo.
function consolidarPorParticipante(registros) {
  const porDocumento = new Map();
 
  for (const r of registros) {
    const doc = r.base.documento;
    if (!porDocumento.has(doc)) {
      porDocumento.set(doc, {
        documento: doc,
        nombre_participante: r.base.nombre_participante,
        apellido_participante: r.base.apellido_participante,
        email: r.base.email,
        idsRespuesta: [],
        modulos: new Set(),
        form: {},
      });
    }
    const grupo = porDocumento.get(doc);
    grupo.idsRespuesta.push(r.base.id_respuesta);
    grupo.modulos.add(r.modulo);
 
    for (const [clave, valor] of Object.entries(r.form)) {
      grupo.form[`${r.modulo}${SEP_MODULO}${clave}`] = valor;
    }
  }
 
  const consolidados = [];
  for (const g of porDocumento.values()) {
    consolidados.push({
      base: {
        id_respuesta: g.idsRespuesta.join(', '),
        documento: g.documento,
        nombre_participante: g.nombre_participante,
        apellido_participante: g.apellido_participante,
        email: g.email,
        nombre_modulo: [...g.modulos].sort().join(', '),
      },
      modulo: null, // ya no hay un único módulo por fila
      form: g.form,
    });
  }
  return consolidados;
}
 
// Resuelve el label de una columna dinámica, sea normal o consolidada (con prefijo de módulo).
function resolverLabelColumna(clave, moduloPorColumna, mapas) {
  const idx = clave.indexOf(SEP_MODULO);
 
  if (idx !== -1) {
    // Columna consolidada: "<modulo>::<claveOriginal>"
    const modulo = clave.slice(0, idx);
    const claveOriginal = clave.slice(idx + SEP_MODULO.length);
    const { base, rep } = baseNameYRepeticion(claveOriginal);
    let label = resolverLabel(base, modulo, mapas);
    if (rep) label += ` (Sesión ${rep})`;
    label += ` — ${modulo}`;
    return label;
  }
 
  const { base, rep } = baseNameYRepeticion(clave);
  let label = resolverLabel(base, moduloPorColumna.get(clave), mapas);
  if (rep) label += ` (Sesión ${rep})`;
  return label;
}
 
// --------------------------- función principal ---------------------------
// Devuelve { columnas, datos, total, opciones } listo para JSON o para Excel.
export async function obtenerDatosReporte(query = {}) {
  const { proyecto, agrupar } = query;
  const where = construirWhere(query);
 
  const [filas, mapas, choices, modulosRaw] = await Promise.all([
    VistaDatosParticipantesCompleta.findAll({ where, raw: true }),
    cargarMapasDeEtiquetas(),
    cargarDiccionarioChoices(),
    VistaDatosParticipantesCompleta.findAll({
      attributes: [[fn('DISTINCT', col('nombre_modulo')), 'nombre_modulo']],
      raw: true,
    }),
  ]);
 
  // Una respuesta por id_respuesta (el JSON completo está en "valor")
  const respuestasPorId = new Map();
  for (const fila of filas) {
    if (!respuestasPorId.has(fila.id_respuesta)) {
      respuestasPorId.set(fila.id_respuesta, fila);
    }
  }
 
  // Registros con su formulario ya TRADUCIDO (valores legibles)
  let registros = [];
  const proyectosSet = new Set();
  for (const fila of respuestasPorId.values()) {
       const camposPlanos = aplanarFormulario(parsearValor(fila.valor));
 
    const form = {};
    for (const campo of camposPlanos) {
      form[campo.key] = traducirCampo(campo.valor, campo.baseName, fila.nombre_modulo, choices);
    }
 
    if (form.Proyecto) proyectosSet.add(form.Proyecto);
 
    registros.push({
      base: {
        id_respuesta: fila.id_respuesta,
        documento: fila.documento,
        nombre_participante: fila.nombre_participante,
        apellido_participante: fila.apellido_participante,
        email: fila.email,
        nombre_modulo: fila.nombre_modulo,
      },
      modulo: fila.nombre_modulo,
      form,
    });
  }
 
  // Filtro por proyecto (ya traducido, para que coincida con el desplegable)
  if (proyecto) {
    const objetivo = String(proyecto).toLowerCase();
    registros = registros.filter(
      (r) => String(r.form.Proyecto ?? '').toLowerCase() === objetivo
    );
  }

    if (String(agrupar).toLowerCase() === 'participante') {
    registros = consolidarPorParticipante(registros);
  }
 
  // Columnas dinámicas en orden de aparición + módulo que las introdujo
  const columnasDinamicas = [];
  const setColumnas = new Set();
  const moduloPorColumna = new Map();
  for (const r of registros) {
    for (const clave of Object.keys(r.form)) {
      if (!setColumnas.has(clave)) {
        setColumnas.add(clave);
        columnasDinamicas.push(clave);
        moduloPorColumna.set(clave, r.modulo);
      }
    }
  }
 
  const columnas = [
    ...CAMPOS_BASE.map((c) => ({ key: c, label: ETIQUETAS_BASE[c] ?? c, fija: true })),
    ...columnasDinamicas.map((clave) => ({
      key: clave,
      label: resolverLabelColumna(clave, moduloPorColumna, mapas),
      fija: false,
    })),

  ];
 
  const datos = registros.map((r) => ({ ...r.base, ...r.form }));
 
  return {
    columnas,
    datos,
    total: datos.length,
    opciones: {
      modulos: modulosRaw.map((m) => m.nombre_modulo).filter(Boolean).sort(),
      proyectos: [...proyectosSet].sort(),
    },
  };
}