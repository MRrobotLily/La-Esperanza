const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/api/auth/login', async (req, res) => {
  const { telefono } = req.body;
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE telefono = ?', [telefono]);
    connection.release();
    if (users.length > 0) res.json({ success: true, user: users[0] });
    else res.status(401).json({ success: false, message: 'Usuario no encontrado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { telefono, nombre, apellido, rol } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO users (telefono, nombre, apellido, rol) VALUES (?, ?, ?, ?)',
      [telefono, nombre, apellido, rol || 'comprador']
    );
    connection.release();
    res.json({ success: true, userId: result.insertId, telefono, nombre, apellido, rol: rol || 'comprador' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/productos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [productos] = await connection.query('SELECT * FROM productos');
    connection.release();
    res.json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    const [productos] = await connection.query('SELECT * FROM productos WHERE id = ?', [id]);
    connection.release();
    if (productos.length > 0) res.json({ success: true, data: productos[0] });
    else res.status(404).json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/productos', async (req, res) => {
  const { nombre, categoria, precio, stock, descripcion, user_id, precio_mayor, cantidad_mayor, unidad_medida, imagenes } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO productos (nombre, categoria, precio, stock, descripcion, user_id, precio_mayor, cantidad_mayor, unidad_medida, imagenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, categoria, precio, stock, descripcion, user_id, precio_mayor || 0, cantidad_mayor || 10, unidad_medida || 'lb', JSON.stringify(imagenes || [])]
    );
    connection.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock, descripcion, activo, imagenes } = req.body;
  try {
    const connection = await pool.getConnection();
    
    if (activo !== undefined && nombre === undefined) {
      await connection.query('UPDATE productos SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
    } else {
      await connection.query(
        'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ?, descripcion = ?, precio_mayor = ?, cantidad_mayor = ?, unidad_medida = ?, imagenes = ? WHERE id = ?',
        [nombre, categoria, precio, stock, descripcion, req.body.precio_mayor || 0, req.body.cantidad_mayor || 10, req.body.unidad_medida || 'lb', JSON.stringify(imagenes || []), id]
      );
    }
    
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM carrito WHERE producto_id = ?', [id]);
    await connection.query('DELETE FROM productos WHERE id = ?', [id]);
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/carrito/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT c.*, p.nombre, p.precio FROM carrito c JOIN productos p ON c.producto_id = p.id WHERE c.user_id = ?`,
      [userId]
    );
    connection.release();
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/carrito', async (req, res) => {
  const { user_id, producto_id, cantidad } = req.body;
  try {
    const connection = await pool.getConnection();
    const [existing] = await connection.query('SELECT * FROM carrito WHERE user_id = ? AND producto_id = ?', [user_id, producto_id]);
    if (existing.length > 0) {
      await connection.query('UPDATE carrito SET cantidad = ? WHERE user_id = ? AND producto_id = ?', [cantidad, user_id, producto_id]);
    } else {
      await connection.query('INSERT INTO carrito (user_id, producto_id, cantidad) VALUES (?, ?, ?)', [user_id, producto_id, cantidad]);
    }
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/carrito/:userId/:productoId', async (req, res) => {
  const { userId, productoId } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM carrito WHERE user_id = ? AND producto_id = ?', [userId, productoId]);
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/carrito/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM carrito WHERE user_id = ?', [userId]);
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/notificaciones/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await pool.getConnection();
    const [notifs] = await connection.query('SELECT * FROM notificaciones WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    connection.release();
    res.json({ success: true, data: notifs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notificaciones', async (req, res) => {
  const { user_id, tipo, mensaje } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('INSERT INTO notificaciones (user_id, tipo, mensaje) VALUES (?, ?, ?)', [user_id, tipo, mensaje]);
    connection.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/acuerdos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [acuerdos] = await connection.query('SELECT * FROM acuerdos ORDER BY created_at DESC');
    connection.release();
    res.json({ success: true, data: acuerdos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/acuerdos/:id', async (req, res) => {
  const { id } = req.params;
  const { estado, confirmado_comprador, confirmado_productor, entrega_tipo, entrega_punto, entrega_fecha } = req.body;
  try {
    const connection = await pool.getConnection();
    
    if (confirmado_comprador !== undefined || confirmado_productor !== undefined) {
      if (confirmado_comprador !== undefined) {
        await connection.query(
          'UPDATE acuerdos SET confirmado_comprador = ? WHERE id = ?',
          [confirmado_comprador ? 1 : 0, id]
        );
      }
      if (confirmado_productor !== undefined) {
        await connection.query(
          'UPDATE acuerdos SET confirmado_productor = ? WHERE id = ?',
          [confirmado_productor ? 1 : 0, id]
        );
      }
      
      const [rows] = await connection.query(
        'SELECT confirmado_comprador, confirmado_productor FROM acuerdos WHERE id = ?',
        [id]
      );
      
      if (rows.length > 0) {
        const a = rows[0];
        if (a.confirmado_comprador && a.confirmado_productor) {
          await connection.query(
            'UPDATE acuerdos SET estado = ? WHERE id = ?',
            ['finalizado', id]
          );
        } else {
          await connection.query(
            'UPDATE acuerdos SET estado = ? WHERE id = ?',
            ['entregado', id]
          );
        }
      }
    } else if (estado) {
      if (entrega_tipo && entrega_punto && entrega_fecha) {
        await connection.query(
          'UPDATE acuerdos SET estado = ?, entrega_tipo = ?, entrega_punto = ?, entrega_fecha = ? WHERE id = ?',
          [estado, entrega_tipo, entrega_punto, entrega_fecha, id]
        );
      } else {
        await connection.query(
          'UPDATE acuerdos SET estado = ? WHERE id = ?',
          [estado, id]
        );
      }
    }
    
    connection.release();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/acuerdos', async (req, res) => {
  const { comprador_id, productor_id, items, canal_contacto } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO acuerdos (comprador_id, productor_id, items, canal_contacto) VALUES (?, ?, ?, ?)',
      [comprador_id, productor_id, JSON.stringify(items || []), canal_contacto]
    );
    connection.release();
    res.json({ 
      success: true, 
      id: result.insertId.toString(),
      compradorId: comprador_id.toString(),
      productorId: productor_id.toString(),
      items: items || [],
      canalContacto: canal_contacto,
      estado: 'pendiente',
      creadoEn: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/mensajes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [mensajes] = await connection.query('SELECT * FROM mensajes ORDER BY created_at DESC');
    connection.release();
    res.json({ success: true, data: mensajes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mensajes', async (req, res) => {
  const { remitente_id, destinatario_id, acuerdo_id, texto } = req.body;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO mensajes (remitente_id, destinatario_id, acuerdo_id, texto) VALUES (?, ?, ?, ?)',
      [remitente_id, destinatario_id, acuerdo_id || null, texto]
    );
    connection.release();
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

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

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    connection.release();
    if (users.length > 0) res.json({ success: true, data: users[0] });
    else res.status(404).json({ success: false });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Backend OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Base de datos: ${process.env.DB_NAME}`);
});