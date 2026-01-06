import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const ProgramasParticipante = sequelize.define('ProgramasParticipante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_detalle es autoincremental
    allowNull: false
  },
  id_participante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Programa' si ya lo tienes
    // references: {
    //   model: 'Programa', // Nombre del modelo al que hace referencia
    //   key: 'id_programa' // Columna de la clave primaria en el modelo 'Programa'
    // }
  },
  id_detalle: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Linea'
    // references: {
    //   model: 'Linea',
    //   key: 'id_linea'
    // }
  },
  fecha_propuesta: {
    type: DataTypes.DATE,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Nivel'
    // references: {
    //   model: 'Nivel',
    //   key: 'id_nivel'
    // }
  },
  fecha_realizado: {
    type: DataTypes.DATE,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Nivel'
    // references: {
    //   model: 'Nivel',
    //   key: 'id_nivel'
    // }
  },
   created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW 
    // Aquí puedes añadir la referencia a tu modelo 'Nivel'
    // references: {
    //   model: 'Nivel',
    //   key: 'id_nivel'
    // }
  },
}, {
  tableName: 'programas_detalles', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default ProgramasParticipante;