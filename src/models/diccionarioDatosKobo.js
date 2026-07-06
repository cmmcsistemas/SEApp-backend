import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js'; // ajusta la ruta a tu conexión
 
const DiccionarioDatosKoboParticipantes = sequelize.define(
  'DiccionarioDatosKoboParticipantes',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    list_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING, // código de la opción tal como llega en el JSON
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING, // texto legible que se mostrará
      allowNull: false,
    },
    question: {
      type: DataTypes.STRING, // name de la pregunta a la que pertenece la opción
      allowNull: false,
    },
  },
  {
    tableName: 'diccionario_datos_kobo_participantes',
    timestamps: false,
  }
);
 
export default DiccionarioDatosKoboParticipantes;