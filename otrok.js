import { fileURLToPath, pathToFileURL } from 'url';
const url = pathToFileURL("C:/Users/jc/Documents/PROG/Projects/backend-101/zzmodules/v45/routes-v1.js").href;
const r = await import(url);
