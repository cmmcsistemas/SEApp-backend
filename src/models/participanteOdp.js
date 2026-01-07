import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const ParticipanteOdp = sequelize.define('ParticipanteOdp', {
  id_participante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_odp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
    created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'participantes_odp', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default ParticipanteOdp;