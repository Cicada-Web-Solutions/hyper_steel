const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), decodeURIComponent(reqPath));
  const ext = path.extname(filePath).toLowerCase();
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8094, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--window-size=1440,1100',
    '--no-first-run',
    'http://127.0.0.1:8094/index.html'
  ]);
  setTimeout(async () => {
    const resp = await fetch('http://127.0.0.1:9229/json');
    const targets = await resp.json();
    const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === msgId) { ws.removeEventListener('message', handler); resolve(msg.result); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
    ws.addEventListener('open', async () => {
      await send('Page.enable');
      await send('Runtime.enable');
      await new Promise(r => setTimeout(r, 1200));

      await send('Runtime.evaluate', {
        expression: `(() => {
          const el = document.getElementById('gallery');
          const top = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: top - 20, behavior: 'instant' });
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      // Hover over panel 1
      await send('Runtime.evaluate', {
        expression: `document.querySelectorAll('.category-panel')[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));`
      });
      await new Promise(r => setTimeout(r, 800));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('gallery_full_in_view.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved gallery_full_in_view.png');
      chrome.kill();
      server.close();
      process.exit(0);
    });
  }, 2000);
});
