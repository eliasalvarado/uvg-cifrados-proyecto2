// Prevent mysql2 from creating real connections during tests by mocking createConnection
const mysql = jest.createMockFromModule('mysql2');

mysql.createConnection = () => ({
  execute: (query, params, cb) => cb(null, [], []),
  // provide any other methods used
});

jest.doMock('mysql2', () => mysql);
