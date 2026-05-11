import axios from 'axios';
import sequelize from '../database/database.js';
import Participante from '../models/participantes.js';
import DatoRespuesta from '../models/datosRespuesta.js';
import RespuestasFormulario from '../models/respuestasFormulario.js';
import VistaDatosParticipantesCompleta from '../models/vistaDatosParticipantesCompleta.js';

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