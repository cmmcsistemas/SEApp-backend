import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Localidad = sequelize.define('Localidad', {
  id_localidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id_municipio: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_localidad: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'localidades', // Asegúrate de que este es el nombre de tu tabla en la base de datos
  timestamps: false, // Deshabilita la gestión automática de `createdAt` y `updatedAt`
});

export default Localidad;