import { executeQuery } from '../../db/connection.js';
import CustomError from '../../utils/customError.js';
import { detectXSSAttempt, detectSQLInjectionAttempt } from '../../utils/stringFormatValidators.js';
import crypto from 'crypto';

const GENESIS_HASH = '0'.repeat(64);

const sha256 = (txt) =>
  crypto.createHash('sha256').update(txt).digest('hex');

/* ──────────────────────────────── Validaciones ──────────────────────────────── */

/**
 * Valida que el objeto de datos sea serializable y no contenga código malicioso
 */
function validateDataObject(dataObj) {
  if (!dataObj || typeof dataObj !== 'object') {
    throw new CustomError('El objeto ingresado no es válido', 400);
  }

  // Verificar que se puede serializar correctamente
  try {
    const serialized = JSON.stringify(dataObj);

    if (detectXSSAttempt(serialized)) {
      throw new CustomError('El objeto contiene un potencial intento de XSS', 400);
    }

    if (detectSQLInjectionAttempt(serialized)) {
      throw new CustomError('El objeto contiene un potencial intento de inyección SQL', 400);
    }

    // Limitar tamaño para evitar DoS
    if (serialized.length > 1000000) { // 1MB
      throw new CustomError('El objeto es demasiado grande', 400);
    }
  } catch (err) {
    if (err instanceof CustomError) {
      throw err;
    }
    throw new CustomError('El objeto no es serializable', 400);
  }
}

/* ──────────────────────────────── helpers ──────────────────────────────── */
export async function getLastBlock() {
  const [rows] = await executeQuery(
    'SELECT * FROM blockchain ORDER BY block_index DESC LIMIT 1',
    []
  );
  return rows[0];               // undefined si tabla vacía
}

/* Crea y guarda un bloque. Devuelve {index, hash} */
export async function addBlock(dataObj) {

  validateDataObject(dataObj);

  const prev = await getLastBlock();
  const index = prev ? prev.block_index + 1 : 0;
  const prevHash = prev ? prev.hash : GENESIS_HASH;

  const tsMillis = Date.now();

  const dataString = JSON.stringify(dataObj);

  // Sanitizar: remover caracteres de control si existen
  const sanitizedData = dataString.replace(/[\x00-\x1F\x7F]/g, '');

  const hash = sha256(prevHash + tsMillis + dataString);
  await executeQuery(
    `INSERT INTO blockchain (block_index, timestamp, prev_hash, hash, data)
     VALUES (?, ?, ?, ?, ?)`,
    [index, tsMillis, prevHash, hash, dataString]
  );

  return { index, hash };
}


/* Devuelve la cadena completa */
export async function getAllBlocks() {
  const [rows] = await executeQuery(
    'SELECT * FROM blockchain ORDER BY block_index',
    []
  );
  return rows;
}

/* Valida la cadena, devuelve {ok, firstTamperedIndex} */
export async function validateChain() {
  const chain = await getAllBlocks();
  let prevHash = GENESIS_HASH;

  for (const blk of chain) {
    const tsMillis = blk.timestamp.toString();
    const dataString = blk.data;

    const recalculated = sha256(prevHash + tsMillis + dataString);

    if (recalculated !== blk.hash) {
      return { ok: false, firstTamperedIndex: blk.block_index };
    }
    prevHash = blk.hash;
  }
  return { ok: true, firstTamperedIndex: null };
}
