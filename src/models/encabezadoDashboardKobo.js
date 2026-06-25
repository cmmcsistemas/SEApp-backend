import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; // ajusta la ruta a tu conexión
 
const EncabezadoDashboardKobo = sequelize.define('EncabezadoDashboardKobo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_modulo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'encabezado_dashboard_kobo', // <- cambia por el nombre real de tu tabla
  timestamps: false,
});
 
export default EncabezadoDashboardKobo;
 