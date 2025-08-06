/**
 * The calculation of the constant ROOT_DIR may need adjustment 
 * if the location of this file is changed.
 */
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Constant with root directory of project */
export const ROOT_DIR = path.resolve(__dirname, "../../");

/** Function like path.join without import path */
export const pathJoin = (...paths) => path.join(...paths);

/** Function-helper (ESM pure) to dynamic imports */
export const dynamicImport = (filePath) => {
  return import(pathToFileURL(filePath));
};
