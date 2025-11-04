import mysql from 'mysql2';
import consts from '../utils/consts.js';
import errorSender from '../utils/errorSender.js';

const connection = mysql.createConnection({
  host: consts.db.host,
  user: consts.db.user,
  password: consts.db.password,
  database: consts.db.name,
  port: consts.db.port,
});

// Función helper que envuelve connection.execute en una promesa
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    connection.execute(query, params, (error, results, fields) => {
      if (error) {
        // Manejo de errores con errorSender
        const err = error instanceof Error ? error : new Error(String(error));
        errorSender({ res: null, ex: err });
        return reject(err);
      }
      resolve([results, fields]);
    });
  });
};

export {
  connection,
  executeQuery,
};