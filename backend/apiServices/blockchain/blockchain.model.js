import { executeQuery } from '../../db/connection.js';
import toMysql from "../../utils/dateFormat.js"

import crypto from 'crypto';

const GENESIS_HASH = '0'.repeat(64);

const sha256 = (txt) =>
  crypto.createHash('sha256').update(txt).digest('hex');

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
  const prev   = await getLastBlock();
  const index  = prev ? prev.block_index + 1 : 0;
  const prevHash = prev ? prev.hash : GENESIS_HASH;

  const tsMillis = Date.now();   

  const dataString = JSON.stringify(dataObj);  

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
