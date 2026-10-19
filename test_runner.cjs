const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Simple static server
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

server.listen(8099, async () => {
  console.log('Server running on 8099');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://127.0.0.1:8099/index.html'
  ]);
  
  setTimeout(async () => {
    try {
      const resp = await fetch('http://127.0.0.1:9224/json');
      const targets = await resp.json();
      const pageTarget = targets.find(t => t.url.includes('8099'));
      console.log('Target found:', pageTarget.title, pageTarget.webSocketDebuggerUrl);
      
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
        console.log('CDP connected');
        await send('Runtime.enable');
        await send('Console.enable');
        
        ws.addEventListener('message', (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.method === 'Runtime.consoleAPICalled') {
            console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
          }
          if (msg.method === 'Runtime.exceptionThrown') {
            console.log('[BROWSER ERROR]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
          }
        });
        
        await new Promise(r => setTimeout(r, 1500));
        
        // 1. Diagnostics on MatchMedia
        const matchMediaRes = await send('Runtime.evaluate', {
          expression: `JSON.stringify({
            hover: window.matchMedia('(hover: hover)').matches,
            pointerFine: window.matchMedia('(pointer: fine)').matches,
            both: window.matchMedia('(hover: hover) and (pointer: fine)').matches
          })`,
          returnByValue: true
        });
        console.log('matchMedia test:', matchMediaRes.result.value);

        // 2. Diagnostics on Gallery
        const galleryRes = await send('Runtime.evaluate', {
          expression: `(async () => {
            const gallery = document.querySelector('.category-gallery');
            const panels = Array.from(document.querySelectorAll('.category-panel'));
            const widthsBefore = panels.map(p => Math.round(p.getBoundingClientRect().width));
            
            // Dispatch mouseenter on panel 0
            panels[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
            await new Promise(r => setTimeout(r, 800));
            const widthsAfterHover0 = panels.map(p => Math.round(p.getBoundingClientRect().width));
            const classesAfterHover0 = panels.map(p => p.className);

            // Dispatch mouseenter on panel 1
            panels[1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
            await new Promise(r => setTimeout(r, 800));
            const widthsAfterHover1 = panels.map(p => Math.round(p.getBoundingClientRect().width));

            // Dispatch mouseleave on gallery
            gallery.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true }));
            await new Promise(r => setTimeout(r, 800));
            const widthsAfterLeave = panels.map(p => Math.round(p.getBoundingClientRect().width));

            return JSON.stringify({
              panelsCount: panels.length,
              widthsBefore,
              widthsAfterHover0,
              classesAfterHover0,
              widthsAfterHover1,
              widthsAfterLeave,
              galleryHeight: gallery ? gallery.getBoundingClientRect().height : null
            });
          })()`,
          awaitPromise: true,
          returnByValue: true
        });
        console.log('Gallery test:', galleryRes.result.value);

        // 3. Diagnostics on Video Section
        const videoRes = await send('Runtime.evaluate', {
          expression: `(() => {
            const video = document.querySelector('.cinema-player__video');
            const cards = Array.from(document.querySelectorAll('.video-thumb-card'));
            const initialSrc = video ? video.src : null;
            const initialClasses = video ? video.className : null;

            // Click card index 1 (stylish_door)
            cards[1].click();
            const afterClick1Src = video ? video.src : null;
            const afterClick1Classes = video ? video.className : null;
            const activeCards = cards.map(c => c.classList.contains('is-active'));

            return JSON.stringify({
              initialSrc,
              initialClasses,
              afterClick1Src,
              afterClick1Classes,
              activeCards
            });
          })()`,
          returnByValue: true
        });
        console.log('Video test:', videoRes.result.value);

        chrome.kill();
        server.close();
        process.exit(0);
      });
    } catch (e) {
      console.error('Error in test:', e);
      chrome.kill();
      server.close();
      process.exit(1);
    }
  }, 2000);
});
