const DB_PASSWORD = process.env.DB_PASSWORD || '';

const consts = {
    apiPath: '/api',
    db: {
        host: 'localhost',
        port: 3306,
        name: 'proyecto2_cifrados',
        password: DB_PASSWORD,
        user: 'root',
    },
    cypherAlgorithms: {
        RSA: 'RSA',
        ECC: 'ECC',
    },
  };
  export default consts;