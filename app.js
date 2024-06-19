const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const sqlite3 = require('sqlite3').verbose();

// SQLite 데이터베이스 파일 생성 및 연결
const db = new sqlite3.Database('users.db');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)');
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      const filePath = path.join(__dirname, 'public', 'html', 'index.html');
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(data);
        res.end();
      });
    } else if (req.url === '/users') {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        let html = `<html><body><h2>User List</h2><ul>`;
        rows.forEach(row => {
          html += `<li>${row.username}</li>`;
        });
        html += `</ul></body></html>`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(html);
        res.end();
      });
    } else {
      const filePath = path.join(__dirname, 'public', req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
          return;
        }
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.write(data);
        res.end();
      });
    }
  } else if (req.method === 'POST') {
    if (req.url === '/signup') {
      let body = '';
      req.on('data', data => {
        body += data.toString();
      });
      req.on('end', () => {
        const { username, password } = querystring.parse(body);

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
          if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Signup Success</title>
            </head>
            <body>
              <h2>Signup Success</h2>
              <p>Username: ${username}</p>
            </body>
            </html>`;

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.write(html);
          res.end();
        });
      });
    } else if (req.url === '/update-password') {
      let body = '';
      req.on('data', data => {
        body += data.toString();
      });
      req.on('end', () => {
        const { username, newPassword } = querystring.parse(body);

        db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, username], (err) => {
          if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Password updated successfully');
        });
      });
    } else if (req.url === '/delete-user') {
      let body = '';
      req.on('data', data => {
        body += data.toString();
      });
      req.on('end', () => {
        const { username } = querystring.parse(body);

        db.run('DELETE FROM users WHERE username = ?', [username], (err) => {
          if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('User deleted successfully');
        });
      });
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
      return 'image/jpg';
    case '.html':
      return 'text/html; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}
