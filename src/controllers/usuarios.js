
import User from "../models/usuarios.js";
import Login from "../models/login.js";

//import Follow from "../models/follows.js";
//import Publication from "../models/publications.js";
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.js";
//import { followThisUser, followUserIds } from "../services/followServices.js";

export const testUser = (req, res) => {
  let params = req.body;
  let user_to_save =  new User(params);
  
  return res.status(200).send({
      message: "Mensaje enviado desde el controlador de Usuarios",
      user_to_save
    });
  };


export const register = async (req, res) => {
  try {
    //Obtener datos
    let params = req.body;

    //Validar datos los que son obligatorios y existan
    if(!params.nombre || !params.apellido || !params.email || !params.contrasena){
      return res.status(400).json({
        status: "error",
        message: "faltan datos por enviar"
      });
      
    }
      
      // crear un objeto con los usuarios que validamos
      let user_to_save =  new User(params);

      //Control de usuarios duplicados

      const existingUser = await User.findOne({
        $or: [
          { email: user_to_save.email.toLowerCase() },
          { nick: user_to_save.nick.toLowerCase() }
        ]
      });

      if (existingUser) {
        return res.status(409).send({
          status: "success",
          message: "El usuario ya existe"

        })
      }

      //Cifrar contraseña
      const hop = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(user_to_save.password, hop );

      user_to_save.password = hashedPassword;

      //Guardar datos en la base de datos
      await user_to_save.save();

       // Devolver usuario
      return res.status(200).json({
        message: "Registro de usuario exitoso",
        params,
        user_to_save
      });

  

  } catch (error) {
    console.log("Error en el registro de usuario", error);
      return res.status(500).send({
        status: "Error",
        message: "Registro de usuario"
  })
};
};

// Método de Login (usar JWT)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validaciones iniciales
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email y password son obligatorios"
            });
        }

        // 2. Buscar usuario en la tabla 'usuarios'
        const userBD = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });

        if (!userBD) {
            return res.status(404).json({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // 3. Comprobar contraseña (usando el campo 'contrasena' de tu modelo User)
        const validPassword = await bcrypt.compare(password, userBD.contrasena);

        if (!validPassword) {
            return res.status(401).json({
                status: "error",
                message: "Contraseña incorrecta"
            });
        }

        // 4. Generar el Token JWT
        const token = createToken(userBD);

        // 5. REGISTRO DE INGRESO: Insertar en la tabla 'login'
        // Esto poblará tu tabla vacía con el historial de accesos
        await Login.create({
            id_usuario: userBD.id_usuario,
            password_hash: userBD.contrasena, // Guardamos el hash actual
            token: token,                // Guardamos el token generado
            fecha_ingreso: new Date()    // Fecha y hora actual
        });

        // 6. Respuesta al cliente
        return res.status(200).json({
            status: "success",
            message: "Autenticación exitosa y registro de ingreso guardado",
            token,
            user: {
                id: userBD.id_usuario,
                nombre: userBD.nombre,
                email: userBD.email
            }
        });

    } catch (error) {
        console.error("Error en el proceso de login/registro:", error);
        return res.status(500).json({
            status: "error",
            message: "Hubo un error al procesar el ingreso",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Obtenemos el ID del usuario desde el token (vía middleware auth)
        // Asegúrate de que tu middleware guarde el id como 'id_usuario'
        const id_usuario = req.user.userId; 

        // Actualizar el registro de la tabla 'login'
        // Buscamos el registro de este usuario donde la fecha_salida aún sea NULL
        const [updatedRows] = await Login.update(
            { fecha_salida: new Date() },
            { 
                where: { 
                    id_usuario: id_usuario,
                    fecha_salida: null 
                },
                // Ordenamos por ingreso descendente para cerrar la sesión más reciente
                order: [['fecha_ingreso', 'DESC']],
                limit: 1
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró una sesión activa para cerrar"
            });
        }

        return res.status(200).json({ 
            status: "success", 
            message: "Salida registrada correctamente" 
        });

    } catch (error) {
        console.error("Error en logout:", error);
        return res.status(500).json({ 
            status: "error", 
            message: "Error al cerrar sesión",
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


export const listUsers = async (req,res) => {
  try {

    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 4;

    const options = {
      page: page,
      limit: itemsPerPage,
      select: '-password -email -role -__v'
    }

    const users = await User.paginate({}, options);

    if(!users || users.docs.lenght === 0){
      return res.status(404).send({
        status: "error",
        message: "No existen usuarios disponibles"
      })
    }

    //listar los seguidores de un usuario, obtener un array
    let followUsers = await followUserIds(req);

    //Devolver

    return res.status(200).json({
      status: "success",
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      totalPages: users.page,
      users_following: followUsers.following,
      user_follow_me: followUsers.followers
    });
    
  } catch (error) {
    console.log("Error listar usuarios: ", error);
      return res.status(500).send({
        status: "Error",
        message: "Error al lista r usuarios"
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