import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE, // Nombre de la base de datos
  process.env.DB_USER,     // Usuario
  process.env.DB_PASSWORD, // Contraseña
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Especifica el dialecto de la base de datos
    logging: false, // Desactiva el log de Sequelize en consola (opcional)
    pool: { // Configuración del pool de conexiones (opcional pero recomendado)
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to MySQL database has been established successfully with Sequelize.');
  } catch (error) {
    console.error('Unable to connect to the database with Sequelize:', error);
  }
}

testConnection(); // Llama a la función para probar la conexión

//module.exports = sequelize; // Exporta la instancia de Sequelize

export default sequelize;