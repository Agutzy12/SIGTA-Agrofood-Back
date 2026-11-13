// Función de Vercel: toda la API (/api/...) la atiende la aplicación Express compilada en dist/.
import { crearApp } from '../dist/app.js';

process.env.TZ ||= 'America/Argentina/Cordoba'; // fechas y turnos en hora argentina

export default crearApp();
