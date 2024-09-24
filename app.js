const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const handlebars = require('express-handlebars');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine({
  defaultLayout: 'main', // Define el layout por defecto
  layoutsDir: path.join(__dirname, 'views/layouts'), // Directorio de layouts
  partialsDir: path.join(__dirname, 'views/layouts'), // Directorio de partials
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simulador de base de datos en memoria
let products = [];

// Rutas
app.get('/', (req, res) => {
    res.render('home', { products });
});

app.get('/realtimeProducts', (req, res) => {
    res.render('realTimeProducts', { products });
});

// Websockets
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Enviar productos actuales al cliente conectado
    socket.emit('products', products);

    // Escuchar creación de nuevo producto
    socket.on('newProduct', (product) => {
        products.push(product);
        io.emit('products', products);  // Enviar lista actualizada a todos los clientes
    });

    // Escuchar eliminación de producto
    socket.on('deleteProduct', (productId) => {
        products = products.filter((product, index) => index !== productId);
        io.emit('products', products);  // Enviar lista actualizada a todos los clientes
    });
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
