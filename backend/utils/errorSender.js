import CustomError from './customError.js';
import fs from 'fs';
import path from 'path';

/**
 * Se encarga del empaquetamiento y envío uniforme del error.
 * Dentro de esta función se ejecuta el parámetro res.send({err,status}).
 * Se recomienda que no se ejecute nada posterior a esta función.
 * @param res Objeto res del controlador de la ruta.
 * @param ex Objeto de la excepción o error generado. Puede ser un CustomError y texto.
 * Si es null o undefined se utiliza un mensaje y satus por default.
 * @param session Objeto session de la bd de mongo. Es opcional. Si se adjunta, se aborta y finaliza
 * la sesión.
 */
const errorSender = async ({
  res, ex, defaultError = 'Ocurrió un error.', defaultStatus = 500,
}) => {
  let err = defaultError;
  let status = defaultStatus;

  // Determinar si el error es un CustomError
  if (ex instanceof CustomError) {
    err = ex.message;
    status = ex.status ?? 500;
  }

  // Crear el directorio de logs si no existe
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Crear el archivo de log con el nombre del día actual
  const logFileName = `${new Date().toISOString().split('T')[0]}.log`;
  const logFilePath = path.join(logsDir, logFileName);

  // Formatear el mensaje de log
  const logMessage = `[
${new Date().toISOString()}]
Error: ${ex?.message || 'Sin mensaje'}
Stack: ${ex?.stack || 'Sin stack'}
Detalles: ${JSON.stringify(ex, null, 2)}
\n`;

  // Escribir el log en el archivo
  fs.appendFileSync(logFilePath, logMessage);

  // Enviar un mensaje genérico en el response
  res.statusMessage = err;
  res.status(status).send({
    err,
    status,
    ok: false,
  });
};

export default errorSender;
