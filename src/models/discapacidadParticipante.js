import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const DiscapacidadParticipante = sequelize.define('DiscapacidadParticipante', {
  id_discapacidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_participante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
    created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'discapacidad_participante', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default DiscapacidadParticipante;