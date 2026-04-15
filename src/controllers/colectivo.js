import User from "../models/usuarios.js";
import Colectivo from "../models/colectivos.js";
import Login from "../models/login.js";
import Participante from "../models/participantes.js";
//import Follow from "../models/follows.js";
//import Publication from "../models/publications.js";
import DatoRespuesta from "../models/datosRespuesta.js";
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.js";
import RespuestasFormulario from "../models/respuestasFormulario.js";



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
                    colectivo: {
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
        const colectivos = await Colectivo.findAll({
            where: searchCondition,
            attributes: ['id_colectivo', 'colectivo',  'nit', 'email', 'telefono']
            // Puedes añadir 'order' si necesitas ordenar los resultados
            // order: [['nombre', 'ASC']]
        });

        // 4. Verificar resultados
        if (!colectivos || colectivos.length === 0) {
            return res.status(404).send({
                status: "error",
                message: `No se encontraron colectivos para el término: "${searchQuery}"`
            });
        }

        // 5. Devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Colectivos encontrados",
            total: colectivos.length,
            colectivos: colectivos
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
  
      const colectivo = payload['group_nb18u42/Nombre_del_colectivo']; // o payload['group_xxx/Nombres']
      const nit = payload['group_nb18u42/NIT_del_colectivo'];
      const email = payload['group_nb18u42/group_cf2vy19/Correo_electr_nico'] || null; 
      const telefono = payload['group_nb18u42/group_cf2vy19/N_mero_de_tel_fono'] || null;
  
      const idUsuarioApp = payload['Id_usuario'];
  
      // Validación básica de presencia
      if (!colectivo ) {
          return res.status(400).json({ status: "error", message: "Faltan datos clave del participante desde Kobo" });
      }
  
      // Iniciamos la transacción para afectar las 2 tablas de forma segura
      const t = await sequelize.transaction();
  
      try {
        // 2. Control de duplicados o Búsqueda del Participante
          let colectivo = await Colectivo.findOne({
              where: { nit: nit },
              transaction: t
          });
  
          // Si NO existe, lo creamos (Como en tu basicRegister)
          if (!colectivo) {
              colectivo = await Colectivo.create({
                  colectivo,
                  nit,
                  email,
                  telefono
              }, { transaction: t });
          } else {
              // Opcional: Si ya existe, puedes decidir actualizar sus datos aquí
              // await participante.update({ nombre, apellido... }, { transaction: t });
          }
  
          const pId = colectivo.id_colectivo;
  
          // 3. Crear la Cabecera del Formulario (respuestas_formulario)
          const cabeceraForm = await RespuestasFormulario.create({
              id_colectivo: pId,
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
              id_campo: 1244, 
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