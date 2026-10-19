const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), decodeURIComponent(reqPath));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8097, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    'http://127.0.0.1:8097/index.html'
  ]);
  
  setTimeout(async () => {
    try {
      const resp = await fetch('http://127.0.0.1:9226/json');
      const targets = await resp.json();
      const pageTarget = targets.find(t => t.url.includes('8097'));
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      let id = 1;
      const send = (method, params = {}) => new Promise((resolve) => {
        const msgId = id++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
      
      ws.addEventListener('open', async () => {
        await send('Page.enable');
        await send('Runtime.enable');
        await new Promise(r => setTimeout(r, 1500));

        // 1. Gallery Screenshot (default)
        await send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('gallery');
            el.scrollIntoView();
          })()`
        });
        await new Promise(r => setTimeout(r, 800));
        let s = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('shot_gallery_default.png', Buffer.from(s.data, 'base64'));

        // Hover over gallery panel 1 (Automated Gates)
        await send('Runtime.evaluate', {
          expression: `(() => {
            const panels = document.querySelectorAll('.category-panel');
            panels[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          })()`
        });
        await new Promise(r => setTimeout(r, 800));
        s = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('shot_gallery_hover_panel1.png', Buffer.from(s.data, 'base64'));

        // 2. Video section Screenshot
        await send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('craft-videos');
            const top = el.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top, behavior: 'instant' });
          })()`
        });
        await new Promise(r => setTimeout(r, 1200));
        s = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('shot_video_default.png', Buffer.from(s.data, 'base64'));

        // Click Card 2 (Louvered Entrance Portal / stylish_door.mp4)
        await send('Runtime.evaluate', {
          expression: `(() => {
            const cards = document.querySelectorAll('.video-thumb-card');
            cards[1].click();
          })()`
        });
        await new Promise(r => setTimeout(r, 1200));
        s = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('shot_video_card2.png', Buffer.from(s.data, 'base64'));

        console.log('Screenshots captured successfully');
        chrome.kill();
        server.close();
        process.exit(0);
      });
    } catch(e) {
      console.error(e);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 2000);
});
