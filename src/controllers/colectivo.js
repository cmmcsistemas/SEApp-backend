import User from "../models/usuarios.js";
import Colectivo from "../models/colectivos.js";
import Login from "../models/login.js";
import Participante from "../models/participantes.js";
//import Follow from "../models/follows.js";
//import Publication from "../models/publications.js";
import DatoRespuesta from "../models/datosRespuesta.js";
import sequelize from '../database/database.js';
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.js";
import { Op } from "sequelize";
import RespuestasFormulario from "../models/respuestasFormulario.js";
import VistaDatosColectivosCompleta from "../models/vistaDatosColectivosCompleta.js";



  export const searchColectivo = async (req, res) => {
    try {
        // 1. Obtener el término de búsqueda de los parámetros de la consulta (query string)
        const searchQuery = req.query.query;

        // Validar que el término de búsqueda exista
        if (!searchQuery) {
            return res.status(400).send({
                status: "error",
                message: "Debe proporcionar un término de búsqueda (query)."
            });
        }

        // 2. Definir la condición de búsqueda
        // Se utiliza Op.or para buscar coincidencias en el campo 'documento' O en el campo 'nombre'.
        // Usamos Op.like y el comodín '%' para hacer una búsqueda parcial (case-insensitive si la DB lo soporta).
        const searchCondition = {
            [Op.or]: [
                // Búsqueda por documento (asumiendo que es un número y queremos una coincidencia exacta o parcial)
                {
                    nit: {
                        [Op.like]: `%${searchQuery}%`
                    }
                },
                // Búsqueda por nombre (coincidencia parcial)
                {
                    nombre_colectivo: {
                        [Op.like]: `%${searchQuery}%`
                    }
                },
                {
                    id_colectivo: {
                        [Op.like]: `%${searchQuery}%`
                    }
                }
            ]
        };
        
        // 3. Ejecutar la consulta
        const registrosVista = await VistaDatosColectivosCompleta.findAll({
            where: searchCondition,
            attributes: ['id_colectivo', 'nombre_colectivo', 'nit', 'email', 'nombre_modulo']
            // Puedes añadir 'order' si necesitas ordenar los resultados
            // order: [['nombre', 'ASC']]
        });

        // 4. Verificar resultados
        if (!registrosVista || registrosVista.length === 0) {
            return res.status(404).send({
                status: "error",
                message: `No se encontraron colectivos para el término: "${searchQuery}"`
            });
        }

        const colectivosAgrupados = {};

        registrosVista.forEach(row => {
        const id = row.id_colectivo;
            if (!colectivosAgrupados[id]) {
                colectivosAgrupados[id] = {
                    id_colectivo: id,
                    nombre_colectivo: row.nombre_colectivo,
                    nit: row.nit,
                    email: row.email,
                    modulos: new Set() // Usamos Set para que no se repitan los nombres de los módulos
                };
            }
            
            // Si la fila tiene un nombre de módulo, lo añadimos al Set
            if (row.nombre_modulo) {
                colectivosAgrupados[id].modulos.add(row.nombre_modulo);
            }
        });
            // Convertimos el objeto agrupador en un arreglo limpio para el JSON final
        const resultadoFinal = Object.values(colectivosAgrupados).map(colectivo => ({
            ...colectivo,
            modulos: Array.from(colectivo.modulos) // Convertimos el Set de vuelta a un Array normal
        }));

        // 6. Devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Colectivos encontrados",
            total: resultadoFinal.length,
            colectivos: resultadoFinal
        });

    } catch (error) {
        console.log("Error al buscar colectivos: ", error);
        return res.status(500).send({
            status: "Error",
            message: "Error interno del servidor al buscar colectivos",
            error: error.message
        });
    }
};

export const basicRegisterColectivo = async (req, res) => {

  // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!
      const payload = req.body; 
  
      const nombre_colectivo = payload['group_nb18u42/Nombre_del_colectivo']; // o payload['group_xxx/Nombres']
      const nitKobo = payload['group_nb18u42/NIT_del_colectivo'] || null;
      const email = payload['group_nb18u42/group_cf2vy19/Correo_electr_nico'] || null; 
      const telefono = payload['group_nb18u42/group_cf2vy19/N_mero_de_tel_fono'] || null;
  
      const idUsuarioApp = payload['Id_usuario'];
  
      // const nombre_colectivo = nombreKobo ? nombreKobo.toUpperCase().trim() : null;
      const nit = nitKobo ? nitKobo.toString().split('-')[0].trim() : null;
      // Validación básica de presencia
      if (!nombre_colectivo ) {
          return res.status(400).json({ status: "error", message: "Faltan datos clave del participante desde Kobo" });
      }
  
      // Iniciamos la transacción para afectar las 2 tablas de forma segura
      const t = await sequelize.transaction();
  

      try {
        // 2. Control de duplicados o Búsqueda del Participante
          let colectivoRecord = await Colectivo.findOne({
              where: { colectivo: nombre_colectivo },
              transaction: t
          });
  
          // Si NO existe, lo creamos (Como en tu basicRegister)
          if (!colectivoRecord) {
              colectivoRecord = await Colectivo.create({
                  colectivo: nombre_colectivo,
                  nit,
                  email,
                  telefono
              }, { transaction: t });
          } 
  
          const pId = colectivoRecord.id_colectivo;
  
          // 3. Crear la Cabecera del Formulario (respuestas_formulario)
          const cabeceraForm = await RespuestasFormulario.create({
              id_participante: pId,
              id_formulario: 3, // ID para Caracterización Básica
              // Si le agregas una columna 'id_usuario_entrevistador' a esta tabla, la guardas aquí:
              // id_usuario: idUsuarioApp, 
              fecha_respuesta: new Date()
          }, { transaction: t });
  
          const rId = cabeceraForm.id_respuesta;
  
          // 4. Guardar TODO el JSON de Kobo en datos_respuesta
          // Usamos el id_campo 1241 como definimos antes
          await DatoRespuesta.create({
              id_respuesta: rId,
              id_campo: 1243, 
              valor: JSON.stringify(payload), // Recuerda tener esta columna como TEXT o JSON en BD
              created_at: new Date()
          }, { transaction: t });
  
          // 5. Commit final
          await t.commit();
  
          return res.status(201).json({
              status: "success",
              message: "Colectivo y respuestas de Kobo registrados con éxito",
              colectivo: colectivoRecord,
              formulario: cabeceraForm
          });
  
      } catch (error) {
          if (t && !t.finished) {
              await t.rollback();
          }
          console.error("Error procesando Webhook de Kobo:", error);
          return res.status(500).json({
              status: "error",
              message: "Error interno del servidor al procesar Kobo",
              error: error.message
          });
      }
};

export const extendRegisterColectivo = async (req, res) => {

  // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!
      const payload = req.body; 
  
      const nombre_colectivo = payload['group_nb18u42/_Nombre_del_colectivo']; // o payload['group_xxx/Nombres']
      const nitKobo = payload['group_nb18u42/_NIT_del_colectivo'] || null;
      const email = payload['group_nb18u42/group_cf2vy19/Correo_electr_nico'] || null; 
      const telefono = payload['group_nb18u42/group_cf2vy19/N_mero_de_tel_fono'] || null;
  
      const idUsuarioApp = payload['Id_usuario'];
  
      //const nombre_colectivo = nombreKobo ? nombreKobo.toUpperCase().trim() : null;
      const nit = nitKobo ? nitKobo.toString().split('-')[0].trim() : null;
         // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!

    // Validación básica de información
    if (!nombre_colectivo) {
        return res.status(400).json({ status: "error", message: "Faltan datos clave del colecitvo desde Kobo" });
    }

    // Iniciamos la transacción para afectar las 2 tablas de forma segura
    const t = await sequelize.transaction();

    try {
      // 2. Control de duplicados o Búsqueda del Participante
        let colectivoRecord = await Colectivo.findOne({
            where: { colectivo: nombre_colectivo },
            transaction: t
        });

        if (!colectivoRecord) {
            colectivoRecord = await Colectivo.create({
                colectivo,
                nit,
                email,
                telefono
            }, { transaction: t });
        } 

        const pId = colectivoRecord.id_colectivo;
            // await participante.update({ nombre, apellido... }, { transaction: t });

        const cabeceraForm = await RespuestasFormulario.create({
            id_participante: pId,
            id_formulario: 3, // ID para Caracterización Básica
            // Si le agregas una columna 'id_usuario_entrevistador' a esta tabla, la guardas aquí:
            // id_usuario: idUsuarioApp, 
            fecha_respuesta: new Date()
        }, { transaction: t });

        const rId = cabeceraForm.id_respuesta;

        await DatoRespuesta.create({
            id_respuesta: rId,
            id_campo: 1244, 
            valor: JSON.stringify(payload), // Recuerda tener esta columna como TEXT o JSON en BD
            created_at: new Date()
        }, { transaction: t });
         await t.commit();


    return res.status(201).json({
            status: "success",
            message: "Colectivo y respuestas de Kobo registrados con éSxito",
            colectivoRecord: colectivoRecord,
            formulario: cabeceraForm
        });

    } catch (error) {
        if (t && !t.finished) {
            await t.rollback();
        }
        console.error("Error procesando Webhook de Kobo:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor al procesar Kobo",
            error: error.message
        });
    }
};

export const getColectivosXML = async (req, res) => {
    try {
        // Traemos todos los colectivos ordenados alfabéticamente
        const colectivos = await Colectivo.findAll({
            attributes: ['id_colectivo', 'colectivo'], // Traemos solo lo necesario
            order: [['colectivo', 'ASC']]
        });

        // Función auxiliar para escapar caracteres prohibidos en XML
        const escapeXml = (unsafe) => {
            if (!unsafe) return '';
            return unsafe.toString().replace(/[<>&'"]/g, (c) => {
                switch (c) {
                    case '<': return '&lt;';
                    case '>': return '&gt;';
                    case '&': return '&amp;';
                    case '\'': return '&apos;';
                    case '"': return '&quot;';
                    default: return c;
                }
            });
        };

        // Construcción del XML en formato String
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<root>\n';

        colectivos.forEach(c => {
            
            const id = c.id_colectivo;
            const nombre = escapeXml(c.colectivo);

            xml += '  <item>\n';
            xml += `    <name>colectivo_${id}</name>\n`;
            xml += `    <label>${nombre}</label>\n`;
            xml += '  </item>\n';
        });

        xml += '</root>';

        // Cambiamos el Content-Type para que la respuesta sea un archivo XML real, no JSON
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Agrega OPTIONS por si acaso
        res.setHeader('Content-Type', 'application/xml; charset=utf-8'); // Especifica el charset
        res.setHeader('ngrok-skip-browser-warning', 'true');
        // Este encabezado le dice a Kobo que esto es un archivo real llamado colectivos.xml
        res.setHeader('Content-Disposition', 'attachment; filename="colectivos.xml"');
        return res.send(xml);

    } catch (error) {
        console.error("Error al generar XML de colectivos:", error);
        
        // En caso de error, es buena práctica devolver un XML válido con un mensaje de error
        // para que Kobo no reciba un HTML o JSON que haga colapsar su sistema de listas.
        res.setHeader('Content-Type', 'application/xml');
        return res.status(500).send('<root><item><name>error</name><label>Error al cargar listado</label></item></root>');
    }
};

export const getKoboDataByColectivo = async (req, res) => {
    try {
        const { id_colectivo } = req.params;

        // 1. Buscamos la cabecera del formulario y su detalle asociado
        const formulario = await RespuestasFormulario.findOne({
            where: { 
                id_respuesta: id_colectivo, 
                id_formulario: 3 // Tu ID para Caracterización Básica
            },
            include: [{
                model: DatoRespuesta,
                as: 'detalles',
                // Filtramos específicamente por el campo donde guardaste el JSON
                where: { id_campo: 1244 } 
            }]
        });

        if (!formulario || !formulario.detalles || formulario.detalles.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontraron datos de Kobo para este colectivo"
            });
        }

        // 2. Extraemos el string y lo convertimos a objeto JavaScript
        const stringData = formulario.detalles[0].valor;
        const rawKoboData = JSON.parse(stringData);

        // 3. Limpiamos las llaves horribles de Kobo
        const cleanData = {};
        for (const [key, value] of Object.entries(rawKoboData)) {
            // Si la llave tiene un '/', la cortamos y nos quedamos solo con la parte final
            // Ejemplo: "group_nb18u42/Nombre_del_colectivo" -> "Nombre_del_colectivo"
            const cleanKey = key.includes('/') ? key.split('/').pop() : key;
            
            // Asignamos el valor a la llave limpia
            cleanData[cleanKey] = value;
        }

        // 4. Enviamos la respuesta estructurada
        return res.status(200).json({
            status: "success",
            message: "Datos de Kobo recuperados correctamente",
            data: cleanData
        });

    } catch (error) {
        console.error("Error al obtener datos de Kobo:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno al procesar los datos de caracterización",
            error: error.message
        });
    }
};



const CLAVES_EXCLUIDAS = new Set([
  '_id', 'formhub/uuid', 'start', 'end', 'username', 'deviceid',
  '__version__', 'meta/instanceID', '_xform_id_string', '_uuid',
  'meta/rootUuid', '_attachments', '_status', '_geolocation',
  '_tags', '_notes', '_validation_status', '_submitted_by',
  // '_submission_time',  // <- descomenta si NO quieres la fecha de envío
]);
 
// ---------------------------------------------------------------------------
// 2) Quita el prefijo de grupo aleatorio de Kobo.
//    "group_nb18u42/group_ye37m21/Correo_electr_nico_principal"
//      -> "Correo_electr_nico_principal"
// ---------------------------------------------------------------------------
function limpiarClave(clave) {
  const partes = clave.split('/');
  return partes[partes.length - 1];
}
 
// ---------------------------------------------------------------------------
// 3) Parsea el contenido del campo "valor".
//    Maneja el caso de que Sequelize ya lo devuelva como objeto.
// ---------------------------------------------------------------------------
function parsearValor(valor) {
  if (valor == null) return null;
  if (typeof valor === 'object') return valor;
  try {
    return JSON.parse(valor);
  } catch (e) {
    return null; // si algún registro viene mal formado, lo ignoramos
  }
}
 
// ---------------------------------------------------------------------------
// 4) Aplana el formulario: deja solo las preguntas reales con clave limpia.
// ---------------------------------------------------------------------------
function aplanarFormulario(json) {
  const salida = {};
  if (!json) return salida;
 
  for (const [clave, valor] of Object.entries(json)) {
    if (CLAVES_EXCLUIDAS.has(clave)) continue;
    if (clave.startsWith('_') || clave.startsWith('meta/')) continue;
 
    const claveLimpia = limpiarClave(clave);
 
    if (Array.isArray(valor)) {
      salida[claveLimpia] = valor.join(', ');
    } else {
      // Las preguntas de selección múltiple vienen como "2 3" o
      // "mujeres j_venes". Si quieres separarlas por comas, descomenta:
      // salida[claveLimpia] = String(valor).split(' ').join(', ');
      salida[claveLimpia] = valor;
    }
  }
  return salida;
}
 
// ---------------------------------------------------------------------------
// 5) Controlador del endpoint
// ---------------------------------------------------------------------------
export const exportarParticipantesExcel = async (req, res) => {
  try {
    // raw: true -> objetos planos, más fáciles de procesar
    const filas = await VistaDatosColectivosCompleta.findAll({ raw: true });
 
    // Agrupamos por id_respuesta para quedarnos con un JSON por respuesta
    const respuestasPorId = new Map();
    for (const fila of filas) {
      if (!respuestasPorId.has(fila.id_respuesta)) {
        respuestasPorId.set(fila.id_respuesta, fila);
      }
    }
 
    // Columnas fijas de la cabecera del colectivo
    const camposBase = [
      'id_respuesta', 'nit', 'nombre_colectivo',
      'email', 'nombre_modulo',
    ];
 
    // Columnas dinámicas (preguntas del formulario), en orden de aparición
    const columnasDinamicas = [];
    const setColumnas = new Set();
    const registros = [];
 
    for (const fila of respuestasPorId.values()) {
      const form = aplanarFormulario(parsearValor(fila.valor));
 
      for (const clave of Object.keys(form)) {
        if (!setColumnas.has(clave)) {
          setColumnas.add(clave);
          columnasDinamicas.push(clave);
        }
      }
 
      registros.push({
        id_respuesta: fila.id_respuesta,
        nit: fila.nit,
        nombre_colectivo: fila.nombre_colectivo,
        email: fila.email,
        nombre_modulo: fila.nombre_modulo,
        ...form,
      });
    }
 
    // ----- Construcción del Excel -----
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Reporte Colectivo';
    workbook.created = new Date();
 
    const hoja = workbook.addWorksheet('Colectivos');
 
    const columnas = [...camposBase, ...columnasDinamicas];
    hoja.columns = columnas.map((c) => ({ header: c, key: c, width: 25 }));
 
    // Estilo de la fila de encabezado
    const filaEncabezado = hoja.getRow(1);
    filaEncabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    filaEncabezado.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    filaEncabezado.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF305496' },
    };
    filaEncabezado.height = 30;
 
    // Agregar datos
    for (const registro of registros) {
      hoja.addRow(registro);
    }
 
    // Congelar la primera fila
    hoja.views = [{ state: 'frozen', ySplit: 1 }];
 
    // ----- Enviar como descarga -----
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_colectivos.xlsx"'
    );
 
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    res.status(500).json({
      mensaje: 'Error al generar el reporte',
      error: error.message,
    });
  }
};