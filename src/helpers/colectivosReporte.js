// helpers/colectivosReporte.helper.js
//
// Configuración del motor genérico para el reporte de COLECTIVOS.
// Toda la lógica pesada (aplanado, repeat groups, traducción de choices,
// códigos DANE, consolidación) vive en reporteKobo.core.js.
import { Op } from 'sequelize';
import { crearObtenerDatosReporte } from '../core/reporteKobo.js';
import VistaDatosColectivosCompleta from '../models/vistaDatosColectivosCompleta.js';
import EncabezadoDashboardKoboColectivo from '../models/encabezadoDashboardKoboColectivo.js';
import DiccionarioDatosKoboParticipantes from '../models/diccionarioDatosKobo.js';


// Columnas fijas de la cabecera del colectivo, en el orden que se mostrarán
const CAMPOS_BASE = [
  'id_colectivo', 'id_respuesta', 'nit',
  'nombre_colectivo', 'email', 'nombre_modulo',
];
 
export const ETIQUETAS_BASE = {
  id_colectivo: 'ID Colectivo',
  id_respuesta: 'ID Respuesta',
  nit: 'NIT',
  nombre_colectivo: 'Nombre del colectivo',
  email: 'Correo electrónico',
  nombre_modulo: 'Módulo',
};
 
// Filtros sobre columnas de la vista.
//   colectivo         -> busca en nombre_colectivo, NIT o id_colectivo
//   nombre_colectivo  -> LIKE sobre el nombre
//   nit               -> LIKE sobre el NIT
//   modulo            -> coincidencia exacta de nombre_modulo
function construirWhere({ colectivo, nombre_colectivo, nit, modulo }) {
  const where = {};
  const and = [];
 
  if (modulo) where.nombre_modulo = modulo;
  if (nombre_colectivo) {
    and.push({ nombre_colectivo: { [Op.like]: `%${nombre_colectivo}%` } });
  }
  if (nit) {
    and.push({ nit: { [Op.like]: `%${nit}%` } });
  }
 
  if (colectivo) {
    const texto = String(colectivo).trim();
    const ors = [
      { nombre_colectivo: { [Op.like]: `%${texto}%` } },
      { nit: { [Op.like]: `%${texto}%` } },
    ];
    // id_colectivo es numérico: solo se compara si el texto es un número
    if (/^\d+$/.test(texto)) ors.push({ id_colectivo: Number(texto) });
    and.push({ [Op.or]: ors });
  }
 
  if (and.length) where[Op.and] = and;
  return where;
}
 
// GET ...?agrupar=colectivo -> una fila por id_colectivo, combinando sus módulos.
// Se agrupa por id_colectivo (no por NIT) porque el NIT puede venir nulo y
// fusionaría en un solo registro a todos los colectivos sin NIT.
export const obtenerDatosReporteColectivos = crearObtenerDatosReporte({
  modelo: VistaDatosColectivosCompleta,
  modeloChoices: DiccionarioDatosKoboColectivos,
  camposBase: CAMPOS_BASE,
  etiquetasBase: ETIQUETAS_BASE,
  claveAgrupacion: 'id_colectivo',
  valorAgrupar: 'colectivo',
  construirWhere,
});