import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  

const GrupoVulnerableParticipante = sequelize.define('GrupoVulnerableParticipante', {
  id_grupo: {
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
  tableName: 'grupo_vulnerable_participante', 
  timestamps: false 
});

export default GrupoVulnerableParticipante;