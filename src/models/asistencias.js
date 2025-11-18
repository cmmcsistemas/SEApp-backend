import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Asistencia = sequelize.define('Asistencia', {
  id_proyecto: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo si la asistencia no está ligada a un proyecto específico
    // Referencia a tu modelo 'Proyecto'
    // references: {
    //   model: 'Proyecto',
    //   key: 'id_proyecto'
    // }
  },
  id_modulo: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo
    // Referencia a un posible modelo 'Modulo'
    // references: {
    //   model: 'Modulo',
    //   key: 'id_modulo'
    // }
  },
  id_participante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Referencia a tu modelo 'Participante'
    // references: {
    //   model: 'Participante',
    //   key: 'id_participante'
    // }
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: true, // Puede ser nulo si no es un servicio específico
    // Referencia a un posible modelo 'Servicio'
    // references: {
    //   model: 'Servicio',
    //   key: 'id_servicio'
    // }
  },
  link_asistencia: {
    type: DataTypes.STRING,
    primaryKey: true, // Define este campo como la clave primaria
    allowNull: false,
    unique: true, // Asegura que cada link sea único
    validate: {
      isUrl: true // Opcional: valida que sea un formato de URL válido
    }
  },
  nombre_taller: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATEONLY, // Solo la fecha
    allowNull: false,
    defaultValue: DataTypes.NOW // Establece la fecha actual por defecto
  }
}, {
  tableName: 'asistencias', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default Asistencia;