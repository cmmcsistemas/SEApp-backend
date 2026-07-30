import { fn, col } from 'sequelize';
import EncabezadoDashboardKoboColectivo from '../models/encabezadoDashboardKoboColectivo.js';
import Departamento from '../models/departamento.js';
import Municipio from '../models/municipio.js';
 
// Claves técnicas de Kobo que no van en el reporte
export const CLAVES_EXCLUIDAS = new Set([
  '_id', 'formhub/uuid', 'start', 'end', 'username', 'deviceid',
  '__version__', 'meta/instanceID', '_xform_id_string', '_uuid',
  'meta/rootUuid', '_attachments', '_status', '_geolocation',
  '_tags', '_notes', '_validation_status', '_submitted_by',
  // '_submission_time',
]);
 
// Separador para prefijar columnas con el módulo al consolidar.
// Son dos caracteres porque los nombres de módulo ya usan un ":" simple.
export const SEP_MODULO = '::';
 
// Campos geográficos: se resuelven contra las tablas propias `departamentos` /
// `municipios` en lugar del diccionario de choices. La clave es el nombre BASE
// del campo (sin el path de grupos de Kobo).
// Nota: estos nombres aparecen tanto en los formularios de participantes como
// en los de colectivos, por eso viven aquí y no en cada helper.
export const CAMPOS_GEOGRAFICOS = {
  depto_exp: 'departamento',
  Municipio_de_expedici_n: 'municipio',
  Departamento_de_residencia: 'departamento',
  Ciudad_o_municipio_de_residenc: 'municipio',
};
 
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
 
// Un valor es "grupo repetible" si es un array no vacío cuyos elementos son
// objetos. Así representa Kobo los repeat groups.
function esGrupoRepetible(valor) {
  return (
    Array.isArray(valor) &&
    valor.length > 0 &&
    valor.every((v) => typeof v === 'object' && v !== null && !Array.isArray(v))
  );
}
 
// Aplana el JSON a una lista de campos { key, baseName, valor }.
//   key      -> identificador único de columna (con sufijo __repN si viene de un repeat group)
//   baseName -> nombre limpio del campo, usado para buscar en los diccionarios
//   valor    -> valor crudo, sin traducir
function aplanarFormulario(json) {
  const campos = [];
  if (!json) return campos;
 
  function procesar(obj, sufijo) {
    for (const [clave, valor] of Object.entries(obj)) {
      if (CLAVES_EXCLUIDAS.has(clave)) continue;
      if (clave.startsWith('_') || clave.startsWith('meta/')) continue;
 
      const baseName = limpiarClave(clave);
 
      if (esGrupoRepetible(valor)) {
        valor.forEach((item, idx) => procesar(item, `${sufijo}__rep${idx + 1}`));
      } else if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
        procesar(valor, sufijo);
      } else {
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
 
// --------------------------- diccionario 1: labels de PREGUNTAS ---------------------------
async function cargarMapasDeEtiquetas() {
  const filas = await EncabezadoDashboardKoboColectivo.findAll({ raw: true });
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
 
// --------------------------- diccionario 2: labels de OPCIONES (choices) ---------------------------
async function cargarDiccionarioChoices(ModeloChoices) {
  if (!ModeloChoices) return { porModuloPregunta: new Map(), porPregunta: new Map() };
 
  const filas = await ModeloChoices.findAll({ raw: true });
  const porModuloPregunta = new Map();
  const porPregunta = new Map();
 
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
 
function obtenerChoicesDePregunta(question, modulo, choices) {
  if (modulo) {
    const m = choices.porModuloPregunta.get(`${modulo}||${question}`);
    if (m) return m;
  }
  return choices.porPregunta.get(question) ?? null;
}
 
// --------------------------- diccionario 3: geografía (tablas propias) ---------------------------
async function cargarMapaGeografico() {
  const [deps, munis] = await Promise.all([
    Departamento.findAll({ raw: true }),
    Municipio.findAll({ raw: true }),
  ]);
 
  const departamentos = new Map();
  for (const d of deps) departamentos.set(String(d.id_departamento), d.nombre_departamento);
 
  const municipios = new Map();
  for (const m of munis) municipios.set(String(m.id_municipio), m.nombre_municipio);
 
  return { departamentos, municipios };
}
 
// --------------------------- traducción de un campo ---------------------------
// Prioridad: 1) geográfico -> 2) diccionario de choices -> 3) valor crudo
function traducirCampo(valor, baseName, modulo, choices, geo) {
  const tipoGeo = CAMPOS_GEOGRAFICOS[baseName];
  if (tipoGeo) {
    if (valor == null || valor === '') return valor;
    const mapa = tipoGeo === 'departamento' ? geo.departamentos : geo.municipios;
    const tokens = Array.isArray(valor)
      ? valor.map(String)
      : String(valor).split(/\s+/).filter(Boolean);
    return tokens.map((t) => mapa.get(t) ?? t).join(', ');
  }
 
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
 
// --------------------------- consolidación ---------------------------
// Agrupa varias respuestas (una por módulo) de la MISMA entidad en un registro.
// Cada campo se prefija con "<modulo>::<clave>" para que no choquen entre módulos.
function consolidarRegistros(registros, { claveAgrupacion, camposBase }) {
  // Campos que se recalculan al consolidar y no se copian tal cual
  const camposCalculados = new Set(['id_respuesta', 'nombre_modulo']);
  const camposCopiables = camposBase.filter((c) => !camposCalculados.has(c));
 
  const porClave = new Map();
 
  for (const r of registros) {
    const clave = r.base[claveAgrupacion];
 
    if (!porClave.has(clave)) {
      porClave.set(clave, {
        base: {},
        idsRespuesta: [],
        modulos: new Set(),
        form: {},
      });
    }
    const grupo = porClave.get(clave);
 
    // Se conserva el primer valor no vacío de cada campo base: en algunos
    // módulos campos como email o NIT pueden venir nulos.
    for (const campo of camposCopiables) {
      const actual = grupo.base[campo];
      if (actual === undefined || actual === null || actual === '') {
        grupo.base[campo] = r.base[campo];
      }
    }
 
    grupo.idsRespuesta.push(r.base.id_respuesta);
    if (r.modulo) grupo.modulos.add(r.modulo);
 
    for (const [k, v] of Object.entries(r.form)) {
      grupo.form[`${r.modulo}${SEP_MODULO}${k}`] = v;
    }
  }
 
  const consolidados = [];
  for (const g of porClave.values()) {
    consolidados.push({
      base: {
        ...g.base,
        id_respuesta: g.idsRespuesta.join(', '),
        nombre_modulo: [...g.modulos].sort().join(', '),
      },
      modulo: null, // ya no hay un único módulo por fila
      form: g.form,
    });
  }
  return consolidados;
}
 
function resolverLabelColumna(clave, moduloPorColumna, mapas) {
  const idx = clave.indexOf(SEP_MODULO);
 
  if (idx !== -1) {
    const modulo = clave.slice(0, idx);
    const claveOriginal = clave.slice(idx + SEP_MODULO.length);
    const { base, rep } = baseNameYRepeticion(claveOriginal);
    let label = resolverLabel(base, modulo, mapas);
    if (rep) label += ` (Sesión ${rep})`;
    return `${label} — ${modulo}`;
  }
 
  const { base, rep } = baseNameYRepeticion(clave);
  let label = resolverLabel(base, moduloPorColumna.get(clave), mapas);
  if (rep) label += ` (Sesión ${rep})`;
  return label;
}
 
// --------------------------- factory ---------------------------
// config = {
//   modelo:            modelo Sequelize de la vista (con campo `valor` y `nombre_modulo`)
//   modeloChoices:     modelo del diccionario de opciones (o null)
//   camposBase:        nombres de las columnas fijas, en el orden deseado
//   etiquetasBase:     { campo: 'Etiqueta legible' }
//   claveAgrupacion:   campo por el que se consolida (ej. 'documento', 'id_colectivo')
//   valorAgrupar:      valor esperado en ?agrupar= (ej. 'participante', 'colectivo')
//   construirWhere:    (query) => where de Sequelize
// }
export function crearObtenerDatosReporte(config) {
  const {
    modelo,
    modeloChoices,
    camposBase,
    etiquetasBase,
    claveAgrupacion,
    valorAgrupar,
    construirWhere,
  } = config;
 
  return async function obtenerDatosReporte(query = {}) {
    const { proyecto, agrupar } = query;
    const where = construirWhere(query);
 
    const [filas, mapas, choices, geo, modulosRaw] = await Promise.all([
      modelo.findAll({ where, raw: true }),
      cargarMapasDeEtiquetas(),
      cargarDiccionarioChoices(modeloChoices),
      cargarMapaGeografico(),
      modelo.findAll({
        attributes: [[fn('DISTINCT', col('nombre_modulo')), 'nombre_modulo']],
        raw: true,
      }),
    ]);
 
    // Una respuesta por id_respuesta (el JSON completo está en `valor`)
    const respuestasPorId = new Map();
    for (const fila of filas) {
      if (!respuestasPorId.has(fila.id_respuesta)) {
        respuestasPorId.set(fila.id_respuesta, fila);
      }
    }
 
    let registros = [];
    const proyectosSet = new Set();
 
    for (const fila of respuestasPorId.values()) {
      const camposPlanos = aplanarFormulario(parsearValor(fila.valor));
 
      const form = {};
      for (const campo of camposPlanos) {
        form[campo.key] = traducirCampo(
          campo.valor, campo.baseName, fila.nombre_modulo, choices, geo
        );
      }
 
      if (form.Proyecto) proyectosSet.add(form.Proyecto);
 
      const base = {};
      for (const campo of camposBase) base[campo] = fila[campo];
 
      registros.push({ base, modulo: fila.nombre_modulo, form });
    }
 
    // Filtro por proyecto (vive dentro del JSON, ya traducido)
    if (proyecto) {
      const objetivo = String(proyecto).toLowerCase();
      registros = registros.filter(
        (r) => String(r.form.Proyecto ?? '').toLowerCase() === objetivo
      );
    }
 
    // Consolidación opcional
    if (String(agrupar).toLowerCase() === valorAgrupar) {
      registros = consolidarRegistros(registros, { claveAgrupacion, camposBase });
    }
 
    // Columnas dinámicas en orden de aparición
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
      ...camposBase.map((c) => ({ key: c, label: etiquetasBase[c] ?? c, fija: true })),
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
  };
}
 