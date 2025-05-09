import { promises as fs, existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
import fg from 'fast-glob';
import impostazioni from '../impostazioni/impostazioni.js';
import * as errorLog from '../utils/errorLog.js';

// Utils per eseguire comandi shell in modo asincrono
const execAsync = promisify(execCallback);

/**
 * Verifica se un file esiste
 * @param {string} filePath - Percorso del file
 * @returns {Promise<boolean>}
 */
export async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se un percorso (file o cartella) esiste
 * @param {string} targetPath - Percorso da verificare
 * @returns {Promise<boolean>}
 */
export async function checkFolderExists(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    return stats.isFile() || stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Attende fino a che il file non diventa disponibile
 * @param {number|string} id
 * @param {string} targetFile
 * @param {object|string} utente
 * @param {number|string} ordine
 */
export async function waitForFile(id, targetFile, utente, ordine) {
  await errorLog.logError('File', id, `Attendo file in: ${targetFile}`, utente, ordine);
  while (!(await checkFileExists(targetFile))) {
    await new Promise(r => setTimeout(r, 1000));
  }
  await errorLog.logError('File', id, `File disponibile in: ${targetFile}`, utente, ordine);
}

/**
 * Elimina un file
 */
export async function deleteFile(id, filePath, utente, ordine) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    await errorLog.logError('File', id, err, utente, ordine);
  }
}

/**
 * Crea una cartella (incluse quelle intermedie)
 */
export async function createFolder(id, folderPath, utente, ordine) {
  try {
    await fs.mkdir(folderPath, { recursive: true });
  } catch (err) {
    await errorLog.logError('File', id, err, utente, ordine);
  }
}

/**
 * Copia un file da src a dest
 */
export async function copiaFile(id, src, dest, utente, ordine) {
  try {
    await fs.copyFile(src, dest);
    await errorLog.logError('File', id, 'File copiato con successo', utente, ordine);
  } catch (err) {
    await errorLog.logError('File', id, err, utente, ordine);
  }
}

/**
 * Sposta un file con retry su EBUSY
 */
export async function muoviFile(id, src, dest, utente, ordine, tentativiMax = 5, intervallo = 1000) {
  let tentativi = 0;
  while (tentativi < tentativiMax) {
    try {
      await fs.rename(src, dest);
      return;
    } catch (err) {
      await errorLog.logError('File', id, err, utente, ordine);
      if (err.code === 'EBUSY' && tentativi < tentativiMax - 1) {
        await new Promise(r => setTimeout(r, intervallo));
      } else {
        throw err;
      }
    }
    tentativi++;
  }
}

/**
 * Esegue un comando shell
 */
export async function execCommand(id, command, utente, ordine) {
  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch (err) {
    await errorLog.logError('File', id, err, utente, ordine);
    throw err;
  }
}

/**
 * Legge il contenuto di un file di testo e restituisce le righe
 */
export async function leggiFile(nomeFile) {
  try {
    const data = await fs.readFile(nomeFile, 'utf8');
    return data.split(/\r?\n/);
  } catch (err) {
    console.error(`Errore nella lettura del file ${nomeFile}:`, err);
    throw err;
  }
}

/**
 * Cerca file/cartelle con glob nelle directory configurate
 */
export async function findFiles(pattern) {
  const result = {};
  const opts = { onlyFiles: false, deep: 2 };
  result[impostazioni.pathDati]     = await fg(pattern, { cwd: impostazioni.pathDati, ...opts });
  result[impostazioni.pathPdf]      = await fg(pattern, { cwd: impostazioni.pathPdf,  ...opts });
  result[impostazioni.pathMontato]  = await fg(pattern, { cwd: impostazioni.pathMontato, ...opts });
  return result;
}

/**
 * Costruisce ricorsivamente la struttura ad albero di una cartella
 */
export async function tree(dir, chiave = '', isRoot = true) {
  let idCounter = 1;
  async function _walk(currentDir) {
    const nodes = [];
    const items = await fs.readdir(currentDir);
    for (const name of items) {
      if (name.startsWith('.') || impostazioni.esclusioni.some(ext => name.endsWith(ext))) continue;
      const full = path.join(currentDir, name);
      const stats = await fs.stat(full);
      if (stats.isDirectory()) {
        const children = await _walk(full);
        nodes.push({
          id: idCounter++, 
          text: isRoot ? `[${chiave}] ${name}` : name,
          state: children.length ? 'closed' : 'open',
          children
        });
      } else {
        nodes.push({ id: idCounter++, text: name, state: 'open' });
      }
    }
    // After first level, isRoot only applies to top
    isRoot = false;
    return nodes;
  }
  return _walk(dir);
}

/**
 * Restituisce solo i file del primo livello della cartella
 */
export async function contenutoCartellaPrimoLivello(dir) {
  let idCounter = 1;
  const list = [];
  const items = await fs.readdir(dir);
  for (const name of items) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const stats = await fs.stat(full);
    if (!stats.isDirectory()) {
      list.push({ id: idCounter++, text: name, state: 'open' });
    }
  }
  return list;
}

/**
 * Restituisce tutti i file e sottocartelle del primo livello
 */
export async function contenutoCartella(dir) {
  let idCounter = 1;
  const list = [];
  const items = await fs.readdir(dir);
  for (const name of items) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const stats = await fs.stat(full);
    if (stats.isDirectory()) {
      // per cartelle carica solo metadati, non ricorsivo
      list.push({ id: idCounter++, text: name, state: 'closed', children: [] });
    } else {
      list.push({ id: idCounter++, text: name, state: 'open' });
    }
  }
  return list;
}
