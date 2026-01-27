import jwt from 'jwt-simple';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config();

// Clave secreta
const secret = process.env.SECRET_KEY;

// Método para generar tokens
// Unix: segundos transcurridos desde el 1 de enero de 1970 hasta hoy.
const createToken = (user) => {
  const payload = {
    userId: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    iat: moment().unix(), // fecha de emisión
    exp: moment().add(7, 'days').unix() // fecha de expiración
  }

  if (!secret) {
    throw new Error("La clave secreta para el JWT no está definida.");
  }
  // Devolver el jwt token codificado
  return jwt.encode(payload, secret);
};

export {
  secret,
  createToken
};