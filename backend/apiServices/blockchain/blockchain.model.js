import { executeQuery } from '../../database/connection.js';
import crypto from 'crypto';

const GENESIS_HASH = '0'.repeat(64);

const sha256 = (txt) =>
    crypto.createHash('sha256').update(txt).digest('hex');

//  ──────────────────────────────── helpers ──────────────────────────────── 
export async function getLastBlock() {
    const [rows] = await executeQuery(
        'SELECT * FROM blockchain ORDER BY block_index DESC LIMIT 1',
        []
    );
    return rows[0];               // undefined si tabla vacía
}

/* Crea y guarda un bloque. Devuelve {index, hash} */
export async function addBlock(dataObj) {
    const prev = await getLastBlock();
    const index = prev ? prev.block_index + 1 : 0;
    const prevHash = prev ? prev.hash : GENESIS_HASH;
    const ts = new Date().toISOString();

    const hash = sha256(prevHash + ts + JSON.stringify(dataObj));

    await executeQuery(
        `INSERT INTO blockchain (block_index, timestamp, prev_hash, hash, data)
     VALUES (?, ?, ?, ?, ?)`,
        [index, ts, prevHash, hash, JSON.stringify(dataObj)]
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
        const recalculated = sha256(
            prevHash + blk.timestamp.toISOString() + JSON.stringify(blk.data)
        );
        if (recalculated !== blk.hash) {
            return { ok: false, firstTamperedIndex: blk.block_index };
        }
        prevHash = blk.hash;
    }
    return { ok: true, firstTamperedIndex: null };
}
