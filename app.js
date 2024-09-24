const express = require('express');
const handlebars = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurar Handlebars como motor de plantillas SIN layouts
app.engine('handlebars', handlebars.engine({
  layoutsDir: false // Deshabilitar la búsqueda de layouts
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Productos en memoria
let productos = [];

// Ruta para la vista 'home'
app.get('/', (req, res) => {
  res.render('home', { productos });
});

// Ruta para la vista de tiempo real 'realTimeProducts'
app.get('/realtimeProducts', (req, res) => {
  res.render('realTimeProducts');
});

// Ruta para agregar un nuevo producto vía HTTP
app.post('/productos', (req, res) => {
  const { producto } = req.body;
  if (producto) {
    productos.push(producto);
    io.emit('productosActualizados', productos);  // Emitir productos actualizados a través de sockets
    res.status(201).send('Producto agregado');
  } else {
    res.status(400).send('Producto no válido');
  }
});

// Websockets: conexión inicial
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Enviar productos actuales al cliente cuando se conecta
  socket.emit('productosActuales', productos);

  // Escuchar cuando se agregue un producto nuevo
  socket.on('nuevoProducto', (producto) => {
    productos.push(producto);
    io.emit('productosActualizados', productos);  // Emitir productos actualizados a todos
  });

  // Escuchar cuando se elimine un producto
  socket.on('eliminarProducto', (index) => {
    productos.splice(index, 1);
    io.emit('productosActualizados', productos);  // Emitir productos actualizados a todos
  });
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
