const socket = io();

// Capturar el envío del formulario
const productForm = document.getElementById('productForm');
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const product = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value
    };

    // Emitir evento para agregar producto
    socket.emit('newProduct', product);

    // Limpiar formulario
    productForm.reset();
});

// Escuchar lista de productos actualizada
socket.on('products', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';  // Limpiar lista

    products.forEach((product, index) => {
        const li = document.createElement('li');
        li.textContent = `${product.name} - ${product.price} USD`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => {
            socket.emit('deleteProduct', index);
        };

        li.appendChild(deleteButton);
        productList.appendChild(li);
    });
});
