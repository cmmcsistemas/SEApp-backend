import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Direcciones = sequelize.define('Direcciones', {
  id_direccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  id_participante: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipo_via: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  numero_principal: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  prefijo: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
    numero_via: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
prefijo_dos: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  complemento: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'direcciones', // Asegúrate de que este es el nombre de tu tabla
});

export default Direcciones;