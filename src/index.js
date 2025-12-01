import dotenv from "dotenv";
import express from "express";
import sequelize from "./database/database.js";
import cors from "cors";
import bodyParser from "body-parser";
import ParticipanteRoutes from "./routes/participantes.js";
import UsuarioRoutes from "./routes/usuarios.js";
import formulariosRoutes from "./routes/formularios.js";
import basicaRoutes from "./routes/basica.js";
import planesFormacion from "./routes/planesFormacion.js";

import FollowRoutes from "./routes/login.js";

dotenv.config();
console.log("API node en ejecucion");


//sequelize();


const app = express();
const puerto = process.env.PORT || 3900;

const allowedOrigin = 'https://roaring-gnome-b3e4be.netlify.app';

app.use(cors({
    origin: allowedOrigin,
    // Permite todas las cabeceras estándar y personalizadas necesarias
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    // Permite los métodos HTTP utilizados
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // Establece la respuesta de estado para las solicitudes preflight OPTIONS
    optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/user', UsuarioRoutes);
app.use('/api/participantes', ParticipanteRoutes);
app.use('/api/formularios', formulariosRoutes);
app.use('/api/basica', basicaRoutes);
app.use('/api/planes-de-formacion', planesFormacion);
//app.use('/api/follow', FollowRoutes);

app.listen(puerto, () => {
    console.log("Servidor de node ejecutandose en el puerto", puerto);
});


export default app;