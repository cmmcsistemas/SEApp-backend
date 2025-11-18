import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const ProgramaParticipante = sequelize.define('ProgramaParticipante', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que 'id' es autoincremental
    allowNull: false
  },
  id_participante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'Participante'
    // references: {
    //   model: 'Participante', // Nombre del modelo al que hace referencia
    //   key: 'id_participante' // Columna de la clave primaria en el modelo 'Participante'
    // }
  },
  id_detalle: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Aquí puedes añadir la referencia a tu modelo 'ProgramaDetalle'
    // references: {
    //   model: 'ProgramaDetalle', // Nombre del modelo al que hace referencia
    //   key: 'id_detalle' // Columna de la clave primaria en el modelo 'ProgramaDetalle'
    // }
  },
  fecha_propuesta: {
    type: DataTypes.DATEONLY, // Solo la fecha, sin la hora
    allowNull: true // Puede ser nula si la fecha propuesta no está definida inicialmente
  },
  fecha_realizado: {
    type: DataTypes.DATEONLY, // Solo la fecha, sin la hora
    allowNull: true // Puede ser nula hasta que el programa sea realizado por el participante
  }
}, {
  tableName: 'programas_participante', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default ProgramaParticipante;