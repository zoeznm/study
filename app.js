const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const querystring = require('querystring');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      const index = fs.readFileSync('./public/html/index.html');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.writeHead(200);
      res.write(index);
      res.end();
    } else if (req.url === '/users') {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'});
          res.end('Internal Server Error');
          return;
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(200);
        res.end(JSON.stringify(rows));
      });
    }
  } else if (req.method === 'POST') {
    if (req.url === '/login') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { username, password } = querystring.parse(body);
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run(username, password, function(err) {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          res.end(JSON.stringify({ id: this.lastID, username, message: 'User registered successfully!' }));
        });
        stmt.finalize();
      });
    }
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
