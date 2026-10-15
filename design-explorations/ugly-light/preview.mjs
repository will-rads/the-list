import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
// ponytail: explicit file allowlist; no repository browsing or backend.
const files={'/':'full-app.html','/full-app.js':'full-app.js','/full-app.css':'full-app.css','/home':'index.html','/before':'before-mobbin.html'};
createServer(async (req,res)=>{
 const file=files[new URL(req.url,'http://localhost').pathname];
 if(!file){res.writeHead(404);res.end('Not found');return;}
 try{const data=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(data);}
 catch{res.writeHead(500);res.end('Preview file unavailable');}
}).listen(5180,'127.0.0.1',()=>console.log('Full app mockup: http://127.0.0.1:5180'));
