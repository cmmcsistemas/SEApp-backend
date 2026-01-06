import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Documentos = sequelize.define('Documentos', {
  id_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  id_tipo_documento: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
documento: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  nombre_departamento: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'documentos', // Nombre de la tabla en la base de datos

});

export default Documentos;