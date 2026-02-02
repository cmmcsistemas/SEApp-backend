import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; // Asegúrate de que esta ruta sea correcta

const RespuestasFormulario = sequelize.define('RespuestasFormulario', {
  id_respuesta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_campo es autoincremental
    allowNull: false
  },
    id_participante: {
    type: DataTypes.INTEGER,
    allowNull: false, // Asumiendo que id_tipo podría ser opcional o manejado de otra forma
    // Si 'id_tipo' se refiere a una tabla de tipos de campo predefinidos,
    // podrías añadir una referencia aquí:
    // references: {
    //   model: 'TipoCampo', // Por ejemplo, si tienes un modelo para Tipos de Campo
    //   key: 'id_tipo'
    // }
  },
  id_formulario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Formulario' (si lo tienes)
    // references: {
    //   model: 'Formulario', // Nombre del modelo al que hace referencia
    //   key: 'id_formulario' // Columna de la clave primaria en el modelo 'Formulario'
    // }
  },
    fecha_respuesta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'respuestas_formulario', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default RespuestasFormulario;