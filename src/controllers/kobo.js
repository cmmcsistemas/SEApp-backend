import axios from 'axios';
import sequelize from '../database/database.js';
import Participante from '../models/participantes.js';
import DatoRespuesta from '../models/datosRespuesta.js';
import RespuestasFormulario from '../models/respuestasFormulario.js';
import VistaDatosParticipantesCompleta from '../models/vistaDatosParticipantesCompleta.js';
import ExcelJS from 'exceljs';
import EncabezadoDashboardKobo from '../models/encabezadoDashboardKobo.js';

export const getEnketoPreview = async (req, res) => {
    try {
        const { asset_uid } = req.params;
        const KOBO_TOKEN = process.env.KOBO_TOKEN; // Tu token guardado en .env

        const response = await axios.get(`https://kf.kobotoolbox.org/api/v2/assets/${asset_uid}`, {
           headers: {                 'Authorization': `Token ${KOBO_TOKEN}`             }
        });

        return res.status(200).json({
            status: "success",
            url: response.data.preview_url // La URL que Angular usará en un iframe
        });

    } catch (error) {
        console.error("Error al obtener preview de Enketo:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            status: "error",
            message: "No se pudo obtener la vista previa del formulario"
        });
    }
};

export const getFormKobo = async (req, res) => {
    const koboData = req.body;
    
    // Extraemos los datos calculados en el XLSForm
    const { id_participante, promedio_trayectoria, trayectoria_final } = koboData;

    try {
        await Seguimiento.create({
            participanteId: id_participante,
            puntaje: promedio_trayectoria,
            trayectoriaAsignada: trayectoria_final,
            fechaRegistro: new Date()
        });
        res.status(200).send("Datos procesados");
    } catch (error) {
        res.status(500).send("Error al guardar");
    }
};

export const recibirDatosKobo = async (req, res) => {
    // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!
    const payload = req.body; 

    const nombre = payload['group_ml81f78/group_ww5li62/Nombres']; // o payload['group_xxx/Nombres']
    const apellido = payload['group_ml81f78/group_ww5li62/Apellidos'];
    const documento = payload['group_ml81f78/group_ww5li62/N_mero_de_identificaci_n'];
    const email = payload['group_ml81f78/group_nk7cl41/Correo_electr_nico'] || null; 
    const telefono = payload['group_ml81f78/group_nk7cl41/Celular'] || null;
    const fecha_nacimiento = payload['group_ml81f78/group_ww5li62/Fecha_de_nacimiento'] || null;

    const idUsuarioApp = payload['Id_usuario'];

    // Validación básica de presencia
    if (!nombre || !apellido || !documento) {
        return res.status(400).json({ status: "error", message: "Faltan datos clave del participante desde Kobo" });
    }

    // Iniciamos la transacción para afectar las 2 tablas de forma segura
    const t = await sequelize.transaction();

    try {
      // 2. Control de duplicados o Búsqueda del Participante
        let participante = await Participante.findOne({
            where: { documento: documento },
            transaction: t
        });

        // Si NO existe, lo creamos (Como en tu basicRegister)
        if (!participante) {
            participante = await Participante.create({
                nombre,
                apellido,
                documento,
                email,
                telefono,
                fecha_nacimiento
            }, { transaction: t });
        } else {
            // Opcional: Si ya existe, puedes decidir actualizar sus datos aquí
            // await participante.update({ nombre, apellido... }, { transaction: t });
        }

        const pId = participante.id_participante;

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
            id_campo: 1241, 
            valor: JSON.stringify(payload), // Recuerda tener esta columna como TEXT o JSON en BD
            created_at: new Date()
        }, { transaction: t });

        // 5. Commit final
        await t.commit();

        return res.status(201).json({
            status: "success",
            message: "Participante y respuestas de Kobo registrados con éxito",
            participante: participante,
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


export const recibirDatosKoboAmpliada = async (req, res) => {
    // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!
    const payload = req.body; 

    const nombre = payload['group_hu8kh88/Nombres']; // o payload['group_xxx/Nombres']
    const apellido = payload['group_hu8kh88/Apellidos'];
    const documento = payload['group_hu8kh88/N_mero_de_identificaci_n'];
    const proyecto = payload['group_hu8kh88/Proyecto']; 

    const idUsuarioApp = payload['Id_usuario'];

    // Validación básica de presencia
    if (!nombre || !apellido || !documento) {
        return res.status(400).json({ status: "error", message: "Faltan datos clave del participante desde Kobo" });
    }

    // Iniciamos la transacción para afectar las 2 tablas de forma segura
    const t = await sequelize.transaction();

    try {
      // 2. Control de duplicados o Búsqueda del Participante
        let participante = await Participante.findOne({
            where: { documento: documento },
            transaction: t
        });

        if (!participante) {
            participante = await Participante.create({
                nombre,
                apellido,
                documento,
                email,
                telefono,
                fecha_nacimiento
            }, { transaction: t });
        } 

        const pId = participante.id_participante;
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
            id_campo: 1242, 
            valor: JSON.stringify(payload), // Recuerda tener esta columna como TEXT o JSON en BD
            created_at: new Date()
        }, { transaction: t });
         await t.commit();


    return res.status(201).json({
            status: "success",
            message: "Participante y respuestas de Kobo registrados con éxito",
            participante: participante,
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

export const recibirDatosKoboDiagnostico = async (req, res) => {
    // 1. Kobo envía todo en el body. ¡Ojo con las mayúsculas!
    const payload = req.body; 

    const documento = payload['N_mero_de_identificaci_n'];

    const idUsuarioApp = payload['Id_usuario'];

    // Validación básica de presencia
    if ( !documento) {
        return res.status(400).json({ status: "error", message: "Faltan datos clave del participante desde Kobo" });
    }

    // Iniciamos la transacción para afectar las 2 tablas de forma segura
    const t = await sequelize.transaction();

    try {
      // 2. Control de duplicados o Búsqueda del Participante
        let participante = await Participante.findOne({
            where: { documento: documento },
            transaction: t
        });

        if (!participante) {
            participante = await Participante.create({
                nombre,
                apellido,
                documento,
                email,
                telefono,
                fecha_nacimiento
            }, { transaction: t });
        } 

        const pId = participante.id_participante;
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
            id_campo: 1245, 
            valor: JSON.stringify(payload), // Recuerda tener esta columna como TEXT o JSON en BD
            created_at: new Date()
        }, { transaction: t });
         await t.commit();


    return res.status(201).json({
            status: "success",
            message: "Participante y respuestas de Kobo registrados con éxito",
            participante: participante,
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

export const recibirDatosParticipantesKobo = async (req, res) =>{
try {
        // 1. Extraemos el documento de los query params de la URL
        // Ejemplo de URL: /api/kobo/buscar-participante?documento=10203040
        const { documento } = req.query;

        if (!documento) {
            return res.status(400).json({
                status: "error",
                message: "Debe proporcionar un número de documento para buscar."
            });
        }

        // 2. Realizamos la consulta a la Vista en la base de datos
        // Usamos findOne asumiendo que el documento trae un solo registro consolidado.
        // Si la vista trae varios registros por documento (ej. varias respuestas), usa findAll()
        const participanteData = await VistaDatosParticipantesCompleta.findAll({
            where: {
                documento: documento
            }
        });

        // 3. Validamos si encontró algo
        if (!participanteData || participanteData.length === 0) {
            return res.status(404).json({
                status: "error",
                message: `No se encontraron datos en Kobo para el documento: ${documento}`
            });
        }

        // 4. Retornamos la información estructurada para el frontend
        return res.status(200).json({
            status: "success",
            message: "Datos del participante encontrados con éxito",
            data: participanteData
        });

    } catch (error) {
        console.error("Error al consultar la vista de participantes Kobo:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor al buscar participante",
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
 

// Etiquetas legibles para las columnas fijas del participante
const ETIQUETAS_BASE = {
  id_respuesta: 'ID Respuesta',
  documento: 'Documento',
  nombre_participante: 'Nombre',
  apellido_participante: 'Apellido',
  email: 'Correo electrónico',
  nombre_modulo: 'Módulo',
};

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
 
async function cargarMapasDeEtiquetas() {
  const filas = await EncabezadoCampo.findAll({ raw: true });
 
  const porModulo = new Map(); // `${nombre_modulo}||${name}` -> label
  const porName = new Map();   // name -> label (respaldo)
 
  for (const f of filas) {
    const label = (f.label && f.label.trim()) ? f.label.trim() : f.name;
    if (f.nombre_modulo) {
      porModulo.set(`${f.nombre_modulo}||${f.name}`, label);
    }
    if (!porName.has(f.name)) porName.set(f.name, label);
  }
  return { porModulo, porName };
}
 
// Resuelve el label de una columna: primero por módulo, luego solo por name,
// y si no existe en la tabla, deja el name original.
function resolverLabel(name, modulo, mapas) {
  if (modulo) {
    const conModulo = mapas.porModulo.get(`${modulo}||${name}`);
    if (conModulo) return conModulo;
  }
  return mapas.porName.get(name) ?? name;
}

// ---------------------------------------------------------------------------
// 5) Controlador del endpoint
// ---------------------------------------------------------------------------
export const exportarParticipantesExcel = async (req, res) => {
  try {
    const { modulo } = req.query;
 
    const where = {};
    if (modulo) where.nombre_modulo = modulo;
 
    // Cargamos datos y mapas de etiquetas en paralelo
    const [filas, mapas] = await Promise.all([
      VistaDatosParticipantesCompleta.findAll({ where, raw: true }),
      cargarMapasDeEtiquetas(),
    ]);
 
    // Una respuesta por id_respuesta (el JSON completo está en "valor")
    const respuestasPorId = new Map();
    for (const fila of filas) {
      if (!respuestasPorId.has(fila.id_respuesta)) {
        respuestasPorId.set(fila.id_respuesta, fila);
      }
    }
 
    const camposBase = [
      'id_respuesta', 'documento', 'nombre_participante',
      'apellido_participante', 'email', 'nombre_modulo',
    ];
 
    const columnasDinamicas = [];          // name (clave limpia), en orden
    const setColumnas = new Set();
    const moduloPorColumna = new Map();    // name -> módulo que la introdujo
    const registros = [];
 
    for (const fila of respuestasPorId.values()) {
      const form = aplanarFormulario(parsearValor(fila.valor));
 
      for (const clave of Object.keys(form)) {
        if (!setColumnas.has(clave)) {
          setColumnas.add(clave);
          columnasDinamicas.push(clave);
          moduloPorColumna.set(clave, fila.nombre_modulo);
        }
      }
 
      registros.push({
        id_respuesta: fila.id_respuesta,
        documento: fila.documento,
        nombre_participante: fila.nombre_participante,
        apellido_participante: fila.apellido_participante,
        email: fila.email,
        nombre_modulo: fila.nombre_modulo,
        ...form,
      });
    }
 
    // ----- Construcción del Excel -----
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Reporte Participantes';
    workbook.created = new Date();
    const hoja = workbook.addWorksheet('Participantes');
 
    // Columnas base (header legible) + columnas dinámicas con su label
    const columnasBaseDef = camposBase.map((c) => ({
      header: ETIQUETAS_BASE[c] ?? c,
      key: c,
      width: 22,
    }));
 
    const columnasDinDef = columnasDinamicas.map((name) => ({
      header: resolverLabel(name, moduloPorColumna.get(name), mapas),
      key: name, // la clave sigue siendo el "name" para mapear los datos
      width: 28,
    }));
 
    hoja.columns = [...columnasBaseDef, ...columnasDinDef];
 
    // Estilo del encabezado
    const filaEncabezado = hoja.getRow(1);
    filaEncabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    filaEncabezado.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    filaEncabezado.fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' },
    };
    filaEncabezado.height = 32;
 
    for (const registro of registros) {
      hoja.addRow(registro);
    }
 
    hoja.views = [{ state: 'frozen', ySplit: 1 }];
 
    // ----- Enviar como descarga -----
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_participantes.xlsx"'
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