// Datos de ejemplo para TaskFlow (Clase 3).
// Mongo ejecuta los scripts de /docker-entrypoint-initdb.d SOLO la primera vez,
// cuando el volumen está vacío. Igual que MONGO_INITDB_ROOT_*: si el volumen ya
// existe, no se vuelve a ejecutar (para repetirlo: docker compose down -v).

db = db.getSiblingDB('taskflow');

db.tareas.insertMany([
  { titulo: 'Escribir el servicio mongo con healthcheck', completada: false, prioridad: 'alta', origen: 'seed-clase3', creadaEn: new Date() },
  { titulo: 'Conectar la API por el nombre del servicio (mongo:27017)', completada: false, prioridad: 'alta', origen: 'seed-clase3', creadaEn: new Date() },
  { titulo: 'Pasar VITE_API_URL como build arg desde Compose', completada: false, prioridad: 'media', origen: 'seed-clase3', creadaEn: new Date() },
  { titulo: 'Comprobar que las tareas sobreviven a down y up', completada: false, prioridad: 'media', origen: 'seed-clase3', creadaEn: new Date() },
]);

print('[seed] Tareas en taskflow.tareas: ' + db.tareas.countDocuments());
