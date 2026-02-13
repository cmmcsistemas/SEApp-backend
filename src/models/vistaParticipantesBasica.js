import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';  // Asegúrate de que esta ruta sea correcta a tu archivo de conexión
import paginate from 'sequelize-paginate';


const VistaParticipanteDetalles = sequelize.define('VistaParticipanteDetalles', {
  id_participante: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Asumiendo que id_participante es autoincremental
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documento: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true // Asumiendo que el documento debe ser único
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true // Validación para asegurar que sea un formato de correo electrónico válido
    }
  },
  telefono: {
    type: DataTypes.INTEGER, // O DataTypes.STRING si los números pueden tener formatos variados (ej. "+57 3xx xxxxxxx")
    allowNull: false // Puede ser nulo o false según tus requisitos
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY, // Usamos DATEONLY para solo almacenar la fecha sin la hora
    allowNull: false // Puede ser nulo o false según tus requisitos
  },

  nombre_subproyecto: {
    type: DataTypes.STRING,
    allowNull: true,

  },
  tipo_genero:{
    type: DataTypes.STRING,
    allowNull: true,

  },
  tipo_entorno:{
    type: DataTypes.STRING,
    allowNull: true,

  },
  tipo_discapacidad:{
    type: DataTypes.STRING,
    allowNull: true,

  },
  tipo_etnia:{
    type: DataTypes.STRING,
    allowNull: true,

  },
  tipo_grupo:{
    type: DataTypes.STRING,
    allowNull: true,

  },
  nombre_grupo:{
    type: DataTypes.STRING,
    allowNull: true,

  }
}, {
  tableName: 'vista_datos_principales_participante', // Nombre de la tabla en la base de datos
  timestamps: false // Deshabilita los timestamps automáticos de Sequelize (createdAt y updatedAt), ya que tienes created_at manual
});



export default VistaParticipanteDetalles;