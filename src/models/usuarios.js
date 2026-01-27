import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; 

const User = sequelize.define('User', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_odp: {
      type: DataTypes.INTEGER,
      allowNull: false // Asumo que estos campos pueden ser nulos si no siempre están presentes
    },
    id_director: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_coordinador: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_supervisor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cedula: {
        type: DataTypes.INTEGER,
        allowNull: false // Asumo que estos campos pueden ser nulos si no siempre están presentes
      },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // El email debería ser único para cada usuario
      validate: {
        isEmail: true // Validación básica para formato de email
      }
    },
    telefono: {
      type: DataTypes.INTEGER,
      allowNull: true // Puede ser nulo
    },
    contrasena: {
      type: DataTypes.STRING(255), // Asumo que es el hash de la contraseña, no la contraseña en texto plano
      allowNull: false
    }
  }, {
    tableName: 'usuarios', // Nombre real de tu tabla en la base de datos
    timestamps: false // Si no tienes columnas `createdAt` y `updatedAt` en tu tabla
  });
  
  //module.exports = User;

  //export default model ("User", UserSchema, "users");

  export default User;