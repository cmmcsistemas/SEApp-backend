import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; // Asegúrate de que esta ruta sea correcta

const DatoRespuesta = sequelize.define('DatoRespuesta', {
  id_dato: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_dato es autoincremental
    allowNull: false
  },
  id_respuesta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'RespuestaFormulario'
    // references: {
    //   model: 'RespuestaFormulario', // Nombre del modelo al que hace referencia
    //   key: 'id_respuesta' // Columna de la clave primaria en el modelo 'RespuestaFormulario'
    // }
  },
  id_campo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'CampoFormulario' (si lo tienes)
    // references: {
    //   model: 'CampoFormulario', // Nombre del modelo al que hace referencia
    //   key: 'id_campo' // Columna de la clave primaria en el modelo 'CampoFormulario'
    // }
  },
  valor: {
    type: DataTypes.TEXT, // Usamos TEXT para almacenar diversos tipos de valores (texto largo, JSON, etc.)
    allowNull: true // Puede ser nulo si un campo no fue respondido o es opcional
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'datos_respuesta', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default DatoRespuesta;