import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const UbicacionParticipante = sequelize.define('UbicacionParticipante', {
  id_participante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: true,
  },
  id_pais: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_municipio: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_departamento: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  id_localidad: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
}, {
  tableName: 'ubicacion_participante', // Asegúrate de que este es el nombre de tu tabla
  timestamps: false,
});

export default UbicacionParticipante;