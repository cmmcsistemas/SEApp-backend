import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

// NOTA IMPORTANTE:
// Para un sistema de autenticación real, NUNCA debes almacenar contraseñas en texto plano.
// Deberías usar una librería como bcrypt para hashear las contraseñas antes de guardarlas.
// El 'password' en este modelo representa el campo donde iría la contraseña HASHEADA.

const Login = sequelize.define('Login', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Asumiendo que id_usuario es la clave primaria aquí
    allowNull: false,
    // Si 'id_usuario' es una clave foránea a una tabla de 'Usuarios'
    // references: {
    //   model: 'Usuario', // Nombre del modelo de Usuarios
    //   key: 'id_usuario' // Clave primaria en el modelo de Usuarios
    // }
  },
  password: {
    type: DataTypes.STRING, // Almacenará la contraseña HASHEADA
    allowNull: false
  },
  token: {
    type: DataTypes.STRING, // Para tokens de sesión o restablecimiento de contraseña, por ejemplo
    allowNull: true // Puede ser nulo si no hay un token activo
  },
  fecha_ingreso: {
    type: DataTypes.DATE, // Incluye fecha y hora
    allowNull: true // Podría ser nulo si el usuario aún no ha iniciado sesión
  },
  fecha_salida: {
    type: DataTypes.DATE, // Incluye fecha y hora
    allowNull: true // Puede ser nulo hasta que el usuario cierre sesión
  }
}, {
  tableName: 'login', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default Login;