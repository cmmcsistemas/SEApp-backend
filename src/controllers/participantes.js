import Participante from "../models/participantes.js";
//import Follow from "../models/follows.js";
//import Publication from "../models/publications.js";
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.js";
//import { followThisUser, followUserIds } from "../services/followServices.js";

export const testParticipante = (req, res) => {
  let params = req.body;
  let participant_to_save =  new Participante(params);
  
  return res.status(200).send({
      message: "Mensaje enviado desde el controlador de Usuarios",
      params,
      participant_to_save
    });
  };

// Registrar un unico usuario en la tabla participantes
  export const register = async (req, res) => {
    try {
      //Obtener datos
      let params = req.body;
  
      //Validar datos los que son obligatorios y existan
      if(!params.nombre || !params.apellido || !params.documento || !params.email || !params.telefono || !params.fecha_nacimiento || !params.genero){
        return res.status(400).json({
          status: "error",
          message: "faltan datos por enviar"
        });
        
      }
        
        // crear un objeto con los usuarios que validamos
        let participant_to_save =  new Participante(params);
  
        //Control de usuarios duplicados
  
        const existingParticipant = await Participante.findOne({
          $or: [
            { email: participant_to_save.email.toLowerCase() },
            { documento: participant_to_save.documento.toLowerCase() }
          ]
        });
  
        if (existingParticipant) {
          return res.status(409).send({
            status: "Unsuccess",
            message: "El usuario ya existe"
  
          })
        }
  
  
        //Guardar datos en la base de datos
        await participant_to_save.save();
  
         // Devolver usuario
        return res.status(200).json({
          status: "success",  
          message: "Registro de usuario exitoso",
          params,
          participant_to_save
        });
  
    
  
    } catch (error) {
      console.log("Error en el registro de usuario", error);
        return res.status(500).send({
          status: "Error",
          message: "Registro de usuario",
          error: error.message
    })
  };
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
  
      let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 4;

      if (isNaN(page) || page <= 0) {
        page = 1;
    }
    if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
        itemsPerPage = 4;
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