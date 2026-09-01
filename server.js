var express = require('express');
var mysql = require('mysql2');
var cors = require('cors');
var path = require('path');
var { exec } = require('child_process');

var app = express();
var PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Servizio file statici (immagini)
app.use('/fotogalleria', express.static(path.join(__dirname, 'fotogalleria')));

// Connessione al database MySQL
var db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'photochiara'
});

db.connect(function(err) {
  if (err) {
    console.error('Errore di connessione a MySQL:', err);
    return;
  }
  console.log('Connesso con successo al Database MySQL di MAMP!');
});

// Rotta per ottenere tutte le foto
app.get('/api/photos', function(req, res) {
  var sql = 'SELECT * FROM FOTO ORDER BY idFOTO DESC';
  db.query(sql, function(err, risultati) {
    if (err) {
      console.error('Errore durante il recupero delle foto:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(risultati);
  });
});

// Rotta per la ricerca delle foto (per Tag, Luogo, Nome e Fotocamera)
app.get('/api/photos/search', function(req, res) {
  var testoCercato = req.query.q;

  if (!testoCercato || testoCercato.trim() === '') {
    return res.json([]);
  }

  // Rimuove gli spazi dal testo cercato per matchare con REPLACE nella query SQL
  var pulito = testoCercato.replace(/\s+/g, '');
  var searchPattern = '%' + pulito + '%';

  var sql = `
    SELECT DISTINCT f.* 
    FROM FOTO f
    LEFT JOIN foto_has_tag fht ON f.idFOTO = fht.FOTO_idFOTO
    LEFT JOIN TAG t ON fht.TAG_idTAG = t.idTAG
    WHERE REPLACE(t.NOME_TAG, ' ', '') LIKE ?
       OR REPLACE(f.LUOGO, ' ', '') LIKE ? 
       OR REPLACE(f.NOME, ' ', '') LIKE ? 
       OR REPLACE(f.FOTOCAMERA, ' ', '') LIKE ?
    ORDER BY f.idFOTO DESC
  `;

  var parametri = [searchPattern, searchPattern, searchPattern, searchPattern];

  db.query(sql, parametri, function(err, risultati) {
    if (err) {
      console.error('Errore query di ricerca MySQL:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(risultati);
  });
});

// Rotta opzionale per sincronizzare manualmente il DB via Python (da chiamare all'occorrenza)
app.post('/api/sync', function(req, res) {
  exec('python DB1.py', function(error, stdout, stderr) {
    if (error) {
      console.error('Errore durante l esecuzione di DB1.py:', error);
      return res.status(500).json({ error: 'Sincronizzazione fallita' });
    }
    res.json({ message: 'Database sincronizzato con successo!' });
  });
});

// Avvio del server
app.listen(PORT, function() {
  console.log('Server attivo su http://localhost:' + PORT);
});