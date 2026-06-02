const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Pool de conexiones MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { telefono } = req.body;
  
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE telefono = ?',
      [telefono]
    );
    connection.release();
    
    if (users.length > 0) {
      res.json({ 
        success: true, 
        user: users[0] 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { telefono, nombre, apellido, rol } = req.body;
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO users (telefono, nombre, apellido, rol) VALUES (?, ?, ?, ?)',
      [telefono, nombre, apellido, rol || 'comprador']
    );
    connection.release();
    
    res.json({ 
      success: true, 
      userId: result.insertId,
      telefono,
      nombre,
      apellido,
      rol: rol || 'comprador'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==========================================
// RUTAS DE PRODUCTOS
// ==========================================

// GET todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [productos] = await connection.query(
      'SELECT * FROM productos'
    );
    connection.release();
    
    res.json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET producto por ID
app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    const [productos] = await connection.query(
      'SELECT * FROM productos WHERE id = ?',
      [id]
    );
    connection.release();
    
    if (productos.length > 0) {
      res.json({ success: true, data: productos[0] });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear producto
app.post('/api/productos', async (req, res) => {
  const { nombre, categoria, precio, stock, descripcion, user_id } = req.body;
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO productos (nombre, categoria, precio, stock, descripcion, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, categoria, precio, stock, descripcion, user_id]
    );
    connection.release();
    
    res.json({ 
      success: true, 
      id: result.insertId,
      message: 'Producto creado'
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// RUTAS DE CARRITO
// ==========================================

// GET carrito del usuario
app.get('/api/carrito/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT c.*, p.nombre, p.precio 
       FROM carrito c 
       JOIN productos p ON c.producto_id = p.id 
       WHERE c.user_id = ?`,
      [userId]
    );
    connection.release();
    
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST agregar al carrito
app.post('/api/carrito', async (req, res) => {
  const { user_id, producto_id, cantidad } = req.body;
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO carrito (user_id, producto_id, cantidad) VALUES (?, ?, ?)',
      [user_id, producto_id, cantidad]
    );
    connection.release();
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==========================================
// RUTAS DE USUARIOS
// ==========================================

// GET todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users');
    connection.release();
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET usuario por ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    connection.release();
    
    if (users.length > 0) {
      res.json({ success: true, data: users[0] });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/health', (req, res) => {
  res.json({ status: 'Backend OK', timestamp: new Date() });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Base de datos: ${process.env.DB_NAME}`);
});