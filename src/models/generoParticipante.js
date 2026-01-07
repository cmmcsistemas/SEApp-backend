import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const GeneroParticipante = sequelize.define('GeneroParticipante', {
  id_genero: {
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
  tableName: 'genero_participantes', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize
});

export default GeneroParticipante;