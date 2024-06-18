const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// 데이터베이스 역할을 할 간단한 객체
const users = [];

// 서버 생성
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      // 루트 경로로 접근할 경우 회원가입 폼 제공
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
    } else {
      // 다른 GET 요청에 대한 처리 (예: CSS 파일 로드 등)
      const filePath = path.join(__dirname, 'public', req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
          return;
        }
        // 파일의 확장자에 따라 Content-Type 설정
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.write(data);
        res.end();
      });
    }
  } else if (req.method === 'POST') {
    if (req.url === '/signup') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        // POST 요청으로 받은 데이터 파싱
        const { username, password } = querystring.parse(body);
        
        // 간단한 예시로 사용자를 배열에 저장
        users.push({ username, password });
        
        // 회원가입 성공 메시지 응답
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
    }
  } else {
    // 지원하지 않는 메서드에 대한 처리
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// Content-Type 설정을 위한 함수
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
