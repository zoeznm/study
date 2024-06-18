const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
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
    if (req.url === '/users') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const user = JSON.parse(body);
        const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
        stmt.run(user.name, user.email, function(err) {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          res.end(JSON.stringify({ id: this.lastID }));
        });
        stmt.finalize();
      });
    } else if (req.url === '/updateUser') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const user = JSON.parse(body);
        const stmt = db.prepare("UPDATE users SET email = ? WHERE name = ?");
        stmt.run(user.email, user.name, function(err) {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          res.end(JSON.stringify({ changes: this.changes }));
        });
        stmt.finalize();
      });
    } else if (req.url === '/deleteUser') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const user = JSON.parse(body);
        const stmt = db.prepare("DELETE FROM users WHERE name = ?");
        stmt.run(user.name, function(err) {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
          res.end(JSON.stringify({ changes: this.changes }));
        });
        stmt.finalize();
      });
    }
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

