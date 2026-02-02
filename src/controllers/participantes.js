import Participante from "../models/participantes.js";
//import Follow from "../models/follows.js";
//import Publication from "../models/publications.js";
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.js";
import { Op } from "sequelize";
import sequelize from "../database/database.js";
import Direcciones from "../models/direcciones.js";
import DiscapacidadParticipante from "../models/discapacidadParticipante.js";
import EntornoParticipante from "../models/entornoParticipante.js";
import EtniaParticipante from "../models/etniaParticipante.js";
import GeneroParticipante from "../models/generoParticipante.js";
import GrupoParticipante from "../models/grupoParticipante.js";
import GrupoVulnerableParticipante from "../models/grupoVulnerableParticipante.js";
import UbicacionParticipante from "../models/ubicacionParticipante.js";
import ProyectosAsignados from "../models/proyectosAsignados.js";
import RespuestasFormulario from "../models/respuestasFormulario.js";
import DatoRespuesta from "../models/datosRespuesta.js";
import SubProyectoParticipante from "../models/subProyectoParticipante.js";


//import { followThisUser, followUserIds } from "../services/followServices.js";

// Registrar un unico usuario en la tabla participantes
export const register = async (req, res) => {

  const { nombre, apellido, documento, email, telefono, fecha_nacimiento, id_direccion_info, id_discapacidad, id_entorno, id_etnia, id_genero, id_grupo, id_grupo_vulnerable, id_subproyecto, ubicacion_info, formulario_data} = req.body;

        // 1. Validación de presencia
        if (!nombre || !apellido || !documento || !email || !telefono || !fecha_nacimiento) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos obligatorios"
            });
        }

        const t = await sequelize.transaction();
  
  try {
        // 2. Control de duplicados (Usando params específicos para evitar errores)
        const existingParticipant = await Participante.findOne({
            where: { documento: documento }
        });

        if (existingParticipant) {
            await t.rollback();
            return res.status(409).json({
                status: "error",
                message: "El participante con este documento ya existe"
            });
        }

        // 3. Guardar (Solo los campos permitidos)
        const participantSaved = await Participante.create({
            nombre,
            apellido,
            documento,
            email,
            telefono,
            fecha_nacimiento
        }, {transaction: t});

        const pId = participantSaved.id_participante;

        //respuestas_formulario
        const cabeceraForm = await RespuestasFormulario.create({
          id_participante: pId,
          id_formulario: 1, // Valor fijo según tu requerimiento
          fecha_respuesta: new Date()
        }, { transaction: t});

        const rId = cabeceraForm.id_respuesta;
        
        const promesas = [
            // Direcciones
            Direcciones.create({
                id_participante: pId,
                ...id_direccion_info // Esparcimos los datos: tipo_via, numero_principal, etc.
            }, { transaction: t }),

            // Discapacidad
            DiscapacidadParticipante.create({ id_participante: pId, id_discapacidad }, { transaction: t }),

            // Entorno
            EntornoParticipante.create({ id_participante: pId, id_entorno }, { transaction: t }),

            // Etnia
            EtniaParticipante.create({ id_participante: pId, id_etnia }, { transaction: t }),

            // Género
            GeneroParticipante.create({ id_participante: pId, id_genero }, { transaction: t }),

            // Grupo
            GrupoParticipante.create({ id_participante: pId, id_grupo }, { transaction: t }),

            // Grupo Vulnerable
            GrupoVulnerableParticipante.create({ id_participante: pId, id_grupo: id_grupo_vulnerable }, { transaction: t }),

            // Proyecto Asignado
            SubProyectoParticipante.create({ id_subproyecto: id_subproyecto, id_participante: pId}, { transaction: t }),

            // Ubicación
            UbicacionParticipante.create({
                id_participante: pId,
                ...ubicacion_info // id_pais, id_municipio, id_departamento, id_localidad
            }, { transaction: t })
          ];

        if (formulario_data && formulario_data.length > 0) {
        const mapeoRespuestas = formulario_data.map(item => ({
          id_respuesta: rId, // Vinculamos al ID autoincremental que acabamos de crear
          id_campo: item.id_campo,
          valor: item.valor,
          created_at: new Date()
        }));
        
          promesas.push(DatoRespuesta.bulkCreate(mapeoRespuestas, { transaction: t }));
         }
        await Promise.all(promesas);


        await t.commit();

        // 4. Respuesta limpia
        return res.status(201).json({
            status: "success",
            message: "Participante registrado con éxito en todos los módulosRegistro exitoso",
            participante: participantSaved
        });

    } catch (error) {
      if (t && !t.finished) {
            await t.rollback();
        }
        console.error("Error en registro:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
  
  export const profile = async (req,res) => {
    try {
      
      const userId = req.params.id;
  
      if(!req.user || !req.user.userId){
        return res.status(401).send({
          status: "error",
          message: "Usuario no autenticado"
        });
      }
  
      const userProfile = await User.findById(userId).select('-password -role -email -__v');
      
      if(!userProfile){
        return res.status(401).send({
          status: "error",
          message: "Usuario no encontrado" 
        }); 
      }
  
      //Informacion de seguimiento
      const followInfo = await followThisUser(req.user.userId, userId);
  
      return res.status(200).json({
        status:"sucess",
        user: userProfile,
        followInfo
      })
  
    } catch (error) {
      console.log("Error al obtener el perfil del usuario: ", error);
  
      return res.status(500).send({
        status: "error",
        message: "Error al obtener el perfil del usuario"
      })
      
    }
  }
   
  export const listParticipant = async (req,res) => {
    try {
  
      let page = req.params.page ? parseInt(req.params.page, 10) : 1;
  
      let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 100;

      if (isNaN(page) || page <= 0) {
        page = 1;
    }
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
        itemsPerPage = 100;
    }

      const options = {
        page: page,
        paginate: itemsPerPage, // 'paginate' es el nombre de la opción en sequelize-paginate para el límite
        // Para Sequelize, la selección/exclusión de columnas se hace con 'attributes'
       // attributes: { exclude: ['created_at'] } // Excluye campos de timestamps y __v si existen
        attributes: ['id_participante', 'nombre', 'apellido', 'documento',  'email', 'telefono', 'fecha_nacimiento']
 
      }
  
      const participantsData = await Participante.paginate(options);
  
      if(!participantsData || participantsData.docs.length === 0){
        return res.status(404).send({
          status: "error",
          message: "No existen usuarios disponibles"
        })
      }
  
      //listar los seguidores de un usuario, obtener un array
  
      //Devolver
  
      return res.status(200).json({
        status: "success",
        message: "Listado de participantes",
        participants: participantsData.docs, // Los documentos reales
        total: participantsData.totalDocs, // Total de documentos
        page: participantsData.page, // Página actual
        pages: participantsData.totalPages, // Total de páginas
        limit: participantsData.limit // Límite de ítems por página
        // nextPage: participants.nextPage, // Puedes incluir esto si lo necesitas en el frontend
        // prevPage: participants.prevPage // Puedes incluir esto si lo necesitas en el frontend
      });
      
    } catch (error) {
      console.log("Error listar usuarios: ", error);
        return res.status(500).send({
          status: "Error",
          message: "Error al listar usuarios"
    });
  }
  }
  
  // Método para actualizar los datos del usuario
  export const updateUser = async (req, res) => {
    try {
  
      let userIdentity = req.user;
      let userToUpdate = req.body;
  
      delete userToUpdate.iat;
      delete userToUpdate.exp;
      delete userToUpdate.role;
  
      const users = await User.find({
        $or: [
          { email: userToUpdate.email},
          { nick: userToUpdate.nick }
        ]
      }).exec();
      
      const isDuplicateUser = users.some(user => {
        return user && user._id.toString() !== userIdentity.userId;
      });
  
      if(isDuplicateUser){
        return res.status(400).send({
          status: "Error",
          message: "Solo se puede actualizar el usuario logeado "
        });
      }
  
      if(userToUpdate.password){
        try {
          let pwd = await bcrypt.hash(userToUpdate.password, 10);
          userToUpdate.password = pwd;
        } catch (error) {
          return res.status(500).send({
            status: "error",
            message: "Error al cifrar contraseña"
        });
      }
      } else {
        delete userToUpdate.password;
      }
  
      let userUpdated = await User.findByIdAndUpdate(userIdentity.userId, userToUpdate, {new: true});
  
      if(!userUpdated){
        return res.status(400).send({
          status:"Error",
          message: "Error al actualizar el usuario"
        })
      }
  
      return res.status(200).json({
        status: "success",
        message: "Método para actualizar usuario",
        user: userUpdated
      });
    } catch (error) {
      console.log("Error al actualizar los datos del usuario: ", error);
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar los datos del usuario"
      });
    }
  }

  export const counters = async (req, res) => {
    try {
      // Obtener el Id del usuario autenticado (token)
      let userId = req.user.userId;
  
  
      // Si llega el id a través de los parámetros en la URL tiene prioridad
      if(req.params.id){
        userId = req.params.id;
      }
  
      // Obtener el nombre y apellido del usuario
      const user = await User.findById(userId, { name: 1, last_name: 1});
  
  
  
      // Vericar el user
      if(!user){
        return res.status(404).send({
          status: "error",
          message: "Usuario no encontrado"
        });
      }
  
      // Contador de usuarios que yo sigo (o que sigue el usuario autenticado)
      const followingCount = await Follow.countDocuments({ "following_user": userId });
  
      // Contador de usuarios que me siguen a mi (que siguen al usuario autenticado)
      const followedCount = await Follow.countDocuments({ "followed_user": userId });
  
      // Contador de publicaciones del usuario autenticado
      const publicationsCount = await Publication.countDocuments({ "user_id": userId });
  
      // Devolver los contadores
      return res.status(200).json({
        status: "success",
        userId,
        name: user.name,
        last_name: user.last_name,
        followingCount: followingCount,
        followedCount: followedCount,
        publicationsCount: publicationsCount
      });
  
    } catch (error) {
      console.log("Error en los contadores", error)
      return res.status(500).send({
        status: "error",
        message: "Error en los contadores"
      });
    }
  }

  export const searchParticipant = async (req, res) => {
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
                    documento: {
                        [Op.like]: `%${searchQuery}%`
                    }
                },
                // Búsqueda por nombre (coincidencia parcial)
                {
                    nombre: {
                        [Op.like]: `%${searchQuery}%`
                    }
                }
            ]
        };
        
        // 3. Ejecutar la consulta
        const participants = await Participante.findAll({
            where: searchCondition,
            attributes: ['id_participante', 'nombre', 'apellido', 'documento', 'email', 'telefono', 'fecha_nacimiento']
            // Puedes añadir 'order' si necesitas ordenar los resultados
            // order: [['nombre', 'ASC']]
        });

        // 4. Verificar resultados
        if (!participants || participants.length === 0) {
            return res.status(404).send({
                status: "error",
                message: `No se encontraron participantes para el término: "${searchQuery}"`
            });
        }

        // 5. Devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Participantes encontrados",
            total: participants.length,
            participants: participants
        });

    } catch (error) {
        console.log("Error al buscar participantes: ", error);
        return res.status(500).send({
            status: "Error",
            message: "Error interno del servidor al buscar participantes",
            error: error.message
        });
    }
};

