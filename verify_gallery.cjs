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

server.listen(8096, async () => {
  console.log('Test server running on port 8096');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    'http://127.0.0.1:8096/index.html'
  ]);
  
  setTimeout(async () => {
    try {
      const resp = await fetch('http://127.0.0.1:9227/json');
      const targets = await resp.json();
      const pageTarget = targets.find(t => t.url.includes('8096'));
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

        // Scroll to gallery
        await send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.getElementById('gallery');
            const top = el.getBoundingClientRect().top + window.pageYOffset - 50;
            window.scrollTo({ top, behavior: 'instant' });
          })()`
        });
        await new Promise(r => setTimeout(r, 800));

        // Initial default state
        const initial = await send('Runtime.evaluate', {
          expression: `(() => {
            const gallery = document.querySelector('.category-gallery');
            const panels = Array.from(document.querySelectorAll('.category-panel'));
            return {
              galleryHeight: gallery.getBoundingClientRect().height,
              widths: panels.map(p => Math.round(p.getBoundingClientRect().width))
            };
          })()`,
          returnByValue: true
        });
        console.log('Initial Gallery State:', JSON.stringify(initial.result.value));

        // Hover over each panel one by one
        for (let i = 0; i < 7; i++) {
          const hoverRes = await send('Runtime.evaluate', {
            expression: `(async () => {
              const panels = Array.from(document.querySelectorAll('.category-panel'));
              panels[${i}].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
              await new Promise(r => setTimeout(r, 650));
              const expContent = panels[${i}].querySelector('.category-panel__expanded-content');
              const compExp = window.getComputedStyle(expContent);
              return {
                panelIndex: ${i},
                widths: panels.map(p => Math.round(p.getBoundingClientRect().width)),
                isDominant: panels[${i}].getBoundingClientRect().width > 500,
                activeTitle: panels[${i}].querySelector('.expanded-title')?.textContent.trim(),
                expandedOpacity: compExp.opacity,
                expandedTransform: compExp.transform
              };
            })()`,
            awaitPromise: true,
            returnByValue: true
          });
          console.log(`Panel ${i} Hover Result:`, JSON.stringify(hoverRes.result.value));

          // Save a screenshot for Panel 0 and Panel 3
          if (i === 0 || i === 3) {
            const shot = await send('Page.captureScreenshot', { format: 'png' });
            fs.writeFileSync(`gallery_hover_panel_${i}.png`, Buffer.from(shot.data, 'base64'));
            console.log(`Captured gallery_hover_panel_${i}.png`);
          }
        }

        // Pointer leaves gallery
        const leaveRes = await send('Runtime.evaluate', {
          expression: `(async () => {
            const gallery = document.querySelector('.category-gallery');
            const panels = Array.from(document.querySelectorAll('.category-panel'));
            gallery.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            await new Promise(r => setTimeout(r, 650));
            return {
              widths: panels.map(p => Math.round(p.getBoundingClientRect().width)),
              allEqual: panels.every(p => Math.abs(p.getBoundingClientRect().width - panels[0].getBoundingClientRect().width) < 5)
            };
          })()`,
          awaitPromise: true,
          returnByValue: true
        });
        console.log('Gallery on Mouse Leave:', JSON.stringify(leaveRes.result.value));

        // Click interaction test (Panel 4)
        const clickRes = await send('Runtime.evaluate', {
          expression: `(async () => {
            const panels = Array.from(document.querySelectorAll('.category-panel'));
            panels[4].click();
            await new Promise(r => setTimeout(r, 650));
            const afterClickWidth = Math.round(panels[4].getBoundingClientRect().width);
            panels[4].click(); // click again to collapse
            await new Promise(r => setTimeout(r, 650));
            const afterCollapseWidth = Math.round(panels[4].getBoundingClientRect().width);
            return {
              afterClickWidth,
              afterCollapseWidth,
              expandedSuccessfully: afterClickWidth > 500
            };
          })()`,
          awaitPromise: true,
          returnByValue: true
        });
        console.log('Gallery Click Toggle Test:', JSON.stringify(clickRes.result.value));

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
