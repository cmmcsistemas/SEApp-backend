import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta

const Ciiu = sequelize.define('Ciiu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  data: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  tableName: 'ciiu', 
});

export default Ciiu;