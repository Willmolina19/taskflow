const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const tareasRouter = require('./routes/tareas');

// Toda la configuración llega por variables de entorno (nada escrito en el código)
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173';

if (!MONGO_URI) {
  console.error('[taskflow-api] Falta la variable de entorno MONGO_URI');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CORS_ORIGIN.split(',').map((o) => o.trim()) }));
app.use(express.json());

// Log sencillo de cada petición (se ve con: docker logs -f api)
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`);
  });
  next();
});

app.get('/health', (req, res) => {
  const estados = ['desconectado', 'conectado', 'conectando', 'desconectando'];
  res.json({ status: 'ok', db: estados[mongoose.connection.readyState] || 'desconocido' });
});

app.use('/api/tareas', tareasRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Reintenta la conexión: en Compose, Mongo puede tardar unos segundos en estar listo,
// y en la nube no existe depends_on (la base de datos puede reiniciarse en cualquier momento).
const INTENTOS = Number(process.env.MONGO_RETRIES || 5);
const ESPERA_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 3000);

async function conectarConReintentos() {
  for (let intento = 1; intento <= INTENTOS; intento++) {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('[taskflow-api] Conectado a MongoDB');
      return;
    } catch (err) {
      console.error(`[taskflow-api] Intento ${intento}/${INTENTOS} falló: ${err.message}`);
      if (intento === INTENTOS) throw err;
      await new Promise((r) => setTimeout(r, ESPERA_MS));
    }
  }
}

conectarConReintentos()
  .then(() => {
    app.listen(PORT, () => console.log(`[taskflow-api] Escuchando en el puerto ${PORT}`));
  })
  .catch(() => {
    console.error('[taskflow-api] No se pudo conectar a MongoDB. Saliendo.');
    process.exit(1);
  });

// Apagado limpio cuando Docker envía SIGTERM (docker stop)
process.on('SIGTERM', async () => {
  console.log('[taskflow-api] SIGTERM recibido, cerrando...');
  await mongoose.connection.close();
  process.exit(0);
});
