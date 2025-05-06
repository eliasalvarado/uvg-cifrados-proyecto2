import mysql from 'mysql2';
import consts from '../utils/consts.js';

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
        return reject(error);
      }
      resolve([results, fields]);
    });
  });
};

export {
  connection,
  executeQuery,
};