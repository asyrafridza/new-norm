const routes = (app) => {
  // Init sqlite db
  const fs = require('fs');
  const dbFile = './.data.sqlite.db';
  const exists = fs.existsSync(dbFile);
  const sqllite3 = require('sqlite3').verbose();
  const db = new sqllite3.Database(dbFile);

  const Joi = require('@hapi/joi');

  db.serialize(() => {
    if (!exists) {
      db.run(`CREATE TABLE Visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        timestamp TIMESTAMP DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW', 'localtime'))
      )`);
      console.log('Database created...');
    } else {
      console.log('Database is already exist...');
    }
  });

  app.get('/', (req, res) => {
    res.send('Welcome to New Norm API');
  });

  app.get('/allVisitors', (req, res) => {
    db.all('SELECT * FROM Visitors', (err, rows) => {
      if (err) return console.error(err);
      res.send(JSON.stringify(rows));
    });
  });

  app.post('/visitor', (req, res) => {
    const { error } = validateVisitor(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    db.run(
      'INSERT INTO Visitors (name, phone, temperature) VALUES (?, ?, ?)',
      [req.body.name, req.body.phone, req.body.temperature],
      (err, rows) => {
        if (err) return console.error(err);
        console.log('Data inserted...');
        return res.send('Success!!!');
      },
    );
  });

  function validateVisitor(visitor) {
    const schema = Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      temperature: Joi.number().required(),
    });

    return schema.validate(visitor);
  }
};

module.exports = routes;
