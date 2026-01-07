import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const EtniaParticipante = sequelize.define('EtniaParticipante', {
  id_etnia: {
    type: DataTypes.INTEGER,
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
  tableName: 'etnia_participante', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default EtniaParticipante;