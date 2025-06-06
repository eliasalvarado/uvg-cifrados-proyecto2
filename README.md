<!--
PROJECT NAME
-->

# Proyecto 2 - Plataforma de Chat Seguro
<a id="readme-top"></a>

<!--
PROJECT DESCRIPTION
-->
## 📜 Descripción

El objetivo de este proyecto consiste en diseñar e implementar un sistema de comunicaciones seguras en el que los usuarios puedan interactuar mediante transferencia de información escrita. Entre las acciones principales que los usuarios pueden efectuar, están:

- Registro y autenticación segura, mediante **OAuth 2.0** y la utilización de **MFA**.
- Intercambio de mensajes cifrados utilizando **AES** en combinación con **RSA**, o bien, con **ECC**.
- Firma digital de los mensajes mediante **ECDSA** para verificar la autenticidad de los mismos.
- Uso de hashing de mensajes para garantizar seguridad a través de **SHA-256** o **SHA-3**.
- Almacenamiento de transacciones en un **mini blockchain** para evitar manipulación. Para cada transacción, se deberá almacenar:
    - Nombre
    - Fecha de envío
    - Data enviada (hashing de mensaje)
- Envío de mensajes efímeros cifrados por medio de una llave generada por el protocolo QKD BB84.

* https://github.com/pabloozamora/uvg-cifrados-proyecto2.git

## ✨ Características
- Autenticación segura:
    - Implementación de OAuth 2.0 y MFA (TOTP/WebAuthn).
    - Protección de sesiones con JWT y Refresh Tokens.
- Cifrado de Mensajes:
    - Mensajes individuales: AES-256 + RSA/ECC.
    - Chats grupales: Clave simétrica AES-256-GCM compartida.
    - Intercambio de claves seguro con X3DH (Signal Protocol).
- Firma Digital y Hashing:
    - Mensajes firmados con ECDSA (clave privada del usuario).
    - Verificación de integridad con SHA-256 o SHA-3.
- Mini Blockchain para Registro de Mensajes:
    - Hash encadenado para evitar manipulación.
    - Registros inmutables de transacciones.
- Mensajes efímeros:
    - No se almacenan
    - Se destruyen al finalizar la conversación
    - Son imposibles de leer si no se posee la clave en el momento exacto.

## 🛠️ Arquitectura
### Diseño de Arquitectura

Este proyecto implementa un sistema de mensajería efímera utilizando **QKD (Quantum Key Distribution)** para garantizar la seguridad de los mensajes entre usuarios. La arquitectura está dividida en dos partes principales: **backend** y **frontend**, cada una diseñada para cumplir con los objetivos del sistema.

## **Estructura del Proyecto**

### **Backend**
El backend está diseñado para manejar la lógica del servidor, la comunicación mediante sockets, y las operaciones relacionadas con la base de datos y la API. Está organizado en módulos para facilitar la escalabilidad y el mantenimiento.

#### **Estructura**
```
backend/
├── apiServices/
│   ├── blockchain/
│   ├── chat/
│   └── user/
├── blockChain/
├── db/
├── middlewares/
├── sockets/
│   ├── events/
│   ├── ioInstance.js
│   └── socketHandler.js
├── utils/
├── app.js
├── bin/
└── public/
```

#### **Descripción de los módulos**
1. **apiServices:**
   - Contiene los controladores, modelos y rutas para las entidades principales del sistema: `blockchain`, `chat`, y `user`.
   - Ejemplo: `blockchain.controller.js` maneja las operaciones relacionadas con la cadena de bloques.

2. **blockChain:**
   - Contiene scripts SQL y documentación relacionada con la implementación de la cadena de bloques.

3. **db:**
   - Maneja la conexión a la base de datos y las migraciones necesarias para inicializar o actualizar el esquema.

4. **middlewares:**
   - Contiene middlewares como `auth.middleware.js` para manejar la autenticación y `readOnly.middleware.js` para limitar el acceso.

5. **sockets:**
   - Maneja la comunicación en tiempo real entre los usuarios mediante WebSockets.
   - Submódulos:
     - **events:** Contiene los eventos principales como `keyExchange.js` para el intercambio de claves y `ephemeralMessage.js` para los mensajes efímeros.
     - **socketHandler.js:** Centraliza la configuración de los eventos de socket.

6. **utils:**
   - Contiene herramientas auxiliares como generadores de claves (`keyGenerator.js`), cifrado (`AES-256.js`, `RSA.js`), y manejo de errores (`errorSender.js`).


### **Frontend**
El frontend está diseñado para proporcionar una interfaz interactiva y amigable para los usuarios. Utiliza React para la creación de componentes reutilizables y estilos modulares.

#### **Estructura**
```
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── helpers/
│   ├── hooks/
│   ├── pages/
│   └── styles/
└── public/
```

#### **Descripción de los módulos**
1. **assets:**
   - Contiene recursos como íconos e imágenes utilizados en la interfaz.

2. **components:**
   - Contiene los componentes reutilizables de la aplicación, como `EphemeralMessages`, `ChatInput`, y `NavBar`.
   - Ejemplo: EphemeralMessages.jsx maneja la lógica y la interfaz para el intercambio de claves y mensajes efímeros.

3. **context:**
   - Implementa contextos como `SocketContext.jsx` para manejar la conexión de sockets y `ChatContext.jsx` para el estado global del chat.

4. **helpers:**
   - Contiene funciones auxiliares como `ephimeralCrypto.js` para el cifrado y descifrado de mensajes.

5. **hooks:**
   - Contiene hooks personalizados como `useSocket.js` para acceder al socket y `useChatState.js` para manejar el estado del chat.

6. **pages:**
   - Contiene las páginas principales de la aplicación, como `HomePage.jsx` y `EphemeralMessagesPage.jsx`.

7. **styles:**
   - Contiene estilos globales y modulares para los componentes.

* https://github.com/pabloozamora/uvg-cifrados-proyecto2.git

## ✨ Características
- Autenticación segura:
    - Implementación de OAuth 2.0 y MFA (TOTP/WebAuthn).
    - Protección de sesiones con JWT y Refresh Tokens.
- Cifrado de Mensajes:
    - Mensajes individuales: AES-256 + RSA/ECC.
    - Chats grupales: Clave simétrica AES-256-GCM compartida.
    - Intercambio de claves seguro con X3DH (Signal Protocol).
- Firma Digital y Hashing:
    - Mensajes firmados con ECDSA (clave privada del usuario).
    - Verificación de integridad con SHA-256 o SHA-3.
- Mini Blockchain para Registro de Mensajes:
    - Hash encadenado para evitar manipulación.
    - Registros inmutables de transacciones.

## ⚠️ Errores/dificultades:

### Autenticación segura:

Durante el desarrollo de la autenticación multifactor (MFA) con Speakeasy, se implementó la generación de códigos TOTP siguiendo el estándar RFC 6238, lo que facilitó la compatibilidad con apps como Google Authenticator. Para el desarrollo de oAuth 2.0, fue necesario la configuración de dicho servicio en Google Cloud. Una vez realizada, se logró implementar el inicio de sesión y la interpretación de tokens de Google en la aplicación.

Entre los errores encontrados se encuentran el hecho de utilizar SHA-256 para la encriptación de contraseñas. Esto se sustituyó posteriormente por Argon2. Por otro lado, se estaba manejando de manera insegura el flujo de inicio de sesión, con Google, ya que una vez completado el inicio de sesión con Google, se comunicaba el token generado por la aplicación mediante parámetros de URL. Por ello, se refactorizó el flujo, de manera que fuera posible comunicar el token al frontend mediante un POST HTTP seguro.

### Mensajes individuales y grupales

Durante el desarrollo de la funcionalidad de envío de mensajes individuales y grupales, se presentaron varios inconvenientes relacionados con el manejo seguro de llaves y el cifrado de datos. Inicialmente, se intentó implementar un intercambio seguro de llaves privadas mediante la derivación de claves a partir de la contraseña del usuario, generando así una llave de longitud compatible con AES para su cifrado. Sin embargo, esta estrategia resultó inviable al utilizar autenticación mediante OAuth, ya que dicho método no proporciona una contraseña accesible, lo que llevó a descartar esta aproximación por razones de practicidad. Adicionalmente, se detectaron problemas de compatibilidad entre las librerías de cifrado utilizadas en el backend y frontend, lo que requirió ajustes en la forma en que se realizaban las operaciones criptográficas. Finalmente, se identificó la necesidad de almacenar los datos cifrados en formato base64 dentro de la base de datos, ya que formatos binarios o no codificados tendían a corromperse durante el almacenamiento o la recuperación de la información.

### Firma:

La implementación de firma y verificación de mensajes mediante ECDSA, utilizada para corroborar que el autor del mensaje, así como su contenido, no hayan sido alterados por un tercero, presentó como reto el mantener la coherencia entre la firma generada a través del Frontend, mediante herramientas nativas del navegador, y la verificación de esta misma firma mediante el backend, utilizando la librería crypto-js. La razón de esta dificultad se debe a la diferencia en que ambos algoritmos interpretan tanto las llaves pública/privada de ECDSA, así como la curva utilizada para realizar el cifrado. En este caso, se optó por utilizar la curva prime256v1 (P-256), así como descifrar el mensaje original (obtenido en base64 encriptado con AES/RSA) bajo codificación UTF-8 y asegurar que las claves no tuvieran ningún espacio en blanco para garantizar que el formato en la generación y verificación de firma fuera uniforme.

### Blockchain

Se implementó una mini-blockchain interna para sellar cada mensaje cifrado del chat con su hash, garantizando integridad y no repudio sin depender de un sistema externo. El módulo inserta bloques con block_index auto-incremental, timestamp en epoch ms y el JSON del mensaje, firma el contenido con SHA-256 y valida la cadena al vuelo. Durante el desarrollo surgieron tres dificultades clave: la desincronización de formatos de fecha entre JavaScript y MySQL, el reordenamiento automático de claves JSON (que invalidaba los hashes) y las condiciones de carrera al escribir dos bloques simultáneos. Se resolvieron almacenando el epoch como BIGINT, guardando el string JSON exacto y recalculando el hash tras conocer el insertId. Un middleware pone al backend en modo “solo lectura” si la validación falla, y un visor React muestra la cadena resaltando los bloques corruptos. Con ello, la plataforma cumple el objetivo de añadir una capa de trazabilidad e inmutabilidad a su esquema de cifrado y firmas digitales.

### Mensajes efímeros

Durante el desarrollo de los mensajes efímeros hubo un inconveniente con los sockeets. Y es que sin utilizar el contexto correcto el socket se duplicaba, provocando una mala comunicación ya que en ocasiones no se terminaba el intercambio de claves. La solución fue implementar un socket context en el que se pudiera acceder al socket global del usuario y así evitar los sockets duplicados
 
## ✒ Conclusiones
- Se implementó un sistema de autenticación robusto que admite tanto inicio de sesión tradicional como autenticación mediante Google OAuth 2.0, siguiendo los estándares de seguridad recomendados.
- A pesar de que SHA-256 es más ligero que Argon2, este útlmo es más robusto, alineando el sistema con las mejores prácticas actuales de seguridad.
- Se incorporó autenticación multifactor (MFA) como capa adicional de seguridad para usuarios registrados, fortaleciendo la protección frente a accesos no autorizados incluso si la contraseña ha sido comprometida.
- La aplicación aplica principios de seguridad como almacenamiento seguro de claves, generación de RSA/ECDSA y JWTs, contribuyendo a una arquitectura sólida y confiable.
- Usar AES junto con RSA es una buena forma de asegurar los mensajes sin sacrificar el rendimiento. RSA se usa para enviar de forma segura la clave que luego se emplea con AES-256, que es mucho más rápido para cifrar grandes cantidades de información. Esta combinación es práctica porque aprovecha la seguridad de RSA y la eficiencia de AES.
- Ambos métodos son considerados bastante seguros. AES-256 es resistente a ataques de fuerza bruta por su largo tamaño de clave, y RSA se basa en problemas matemáticos difíciles de resolver, como la factorización de números grandes. Por eso, al usarlos juntos, se logra un sistema de cifrado fuerte y confiable.
- Al utilizar funciones hash junto con firmas digitales como ECDSA, se asegura que el contenido del mensaje no haya sido alterado en tránsito. Cualquier modificación, por mínima que sea, cambia completamente el hash y hace que la firma no sea válida.
- El sistema de mensajería efímera cumple con los objetivos planteados, proporcionando una solución segura y funcional para el intercambio de mensajes cifrados utilizando una clave generada por QKD.
- La mini-blockchain sella cada mensaje con su hash, aportando integridad y no repudio al chat. Con ella cerramos el ciclo de seguridad (autenticación, cifrado, firma y registro inmutable), cumpliendo el objetivo de una comunicación segura y auditable.

## 👨🏻‍💻 Responsabilidades
- Pablo Zamora: Autenticación segura
* [![Linkedin][Linkedin]][Linkedin-pablo]
* [![GitHub][GitHub]][GitHub-pablo]
- Diego Morales: Cifrado de Mensajes
<!-- * [![Linkedin][Linkedin]][Linkedin-diego] -->
* [![GitHub][GitHub]][GitHub-diego]
- Erick Guerra: Firma Digital y Hashing
* [![Linkedin][Linkedin]][Linkedin-erick]
* [![GitHub][GitHub]][GitHub-erick]
- Brandon Sicay: Mini Blockchain para Registro de Mensajes
* [![Linkedin][Linkedin]][Linkedin-brandon]
* [![GitHub][GitHub]][GitHub-brandon]
- Elías Alvarado: Mensajes directos efímeros
* [![Linkedin][Linkedin]][Linkedin-elias]
* [![GitHub][GitHub]][GitHub-elias]

## 📦 Dependencias Principales

Las principales dependencias del proyecto, incluyen:

* [![NodeJS][NodeJS]][NodeJS-url] - Entorno de ejecución para JavaScript.
* [![Express][Express]][Express-url] - Framework para crear aplicaciones web y APIs.
* [![Socket.IO][SocketIO]][SocketIO-url] - Comunicación en tiempo real mediante WebSockets.
* [![MySQL][MySQL]][MySQL-url] - Base de datos relacional para almacenar información.
* [![dotenv][dotenv]][dotenv-url] - Manejo de variables de entorno.
* [![jsonwebtoken][jsonwebtoken]][jsonwebtoken-url] - Generación y verificación de tokens JWT.
* [![argon2][argon2]][argon2-url] - Hashing seguro de contraseñas.
* [![crypto-js][crypto-js]][crypto-js-url] - Cifrado y descifrado de datos.
* [![elliptic][elliptic]][elliptic-url] - Implementación de curvas elípticas para ECDSA y ECC.
* [![nodemon][nodemon]][nodemon-url] - Herramienta para desarrollo con reinicio automático del servidor.
* [![speakeasy][speakeasy]][speakeasy-url] - Generación de códigos para autenticación multifactor (MFA).
* [![qrcode][qrcode]][qrcode-url] - Generación de códigos QR.

### **Frontend**
* [![NodeJS][NodeJS]][NodeJS-url] - Entorno de ejecución para JavaScript.
* [![React][React]][React-url] - Biblioteca para construir interfaces de usuario.
* [![Vite][Vite]][Vite-url] - Herramienta de desarrollo rápida para proyectos frontend.
* [![crypto-js][crypto-js]][crypto-js-url] - Cifrado y descifrado de datos.

<p align="right">(<a href="#readme-top">Ir al inicio</a>)</p>

## 🚀 Cómo levantar el proyecto localmente

Sigue los pasos a continuación para clonar y levantar el proyecto en tu máquina local.

### **Requisitos**
1. Configurar una base de datos MySQL:
   - Crea una base de datos llamada `chat_secure`.
   - Importa las migraciones necesarias desde el directorio `backend/db/migrations`.

### **Pasos para clonar y levantar el proyecto**

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/pabloozamora/uvg-cifrados-proyecto2.git
   cd uvg-cifrados-proyecto2
   ```

2. **Configurar el backend:**
   - Navega al directorio `backend`:
     ```bash
     cd backend
     ```
   - Instala las dependencias:
     ```bash
     npm install
     ```
   - Configura las variables de entorno:
     - Crea un archivo `.env` en el directorio backend con el siguiente contenido:
       ```env
       DB_HOST=localhost
       DB_USER=tu_usuario
       DB_PASSWORD=tu_contraseña
       DB_NAME=chat_secure
       JWT_SECRET=tu_secreto
       ```
   - Levanta el servidor backend:
     ```bash
     npm run start
     ```

3. **Configurar el frontend:**
   - Navega al directorio frontend:
     ```bash
     cd ../frontend
     ```
   - Instala las dependencias:
     ```bash
     npm install
     ```
   - Levanta el servidor frontend:
     ```bash
     npm run dev
     ```

4. **Acceder a la aplicación:**
   - Abre tu navegador y accede a:
     - **Frontend:** `http://localhost:5173`

### **Notas importantes**
- Asegúrate de que tener la base de datos de MySQL .
- Si necesitas cambiar la configuración de la base de datos, actualiza las variables de entorno en el archivo `.env`.
- Las migraciones de la base de datos están en migrations. Importa los archivos SQL en tu base de datos para inicializar el esquema.

## 👥 Contribuciones
Si deseas contribuir al proyecto, por favor sigue los siguientes pasos:
1. Realiza un fork del repositorio.
2.	Crea una nueva rama para tu funcionalidad (git checkout -b feature/nueva-funcionalidad).
3.	Haz commit de tus cambios (git commit -m 'Añadir nueva funcionalidad').
4.	Haz push a la rama (git push origin feature/nueva-funcionalidad).
5.	Abre un Pull Request.

<p align="right">(<a href="#readme-top">Ir al inicio</a>)</p>



<!-- IMAGES -->
[NodeJS]: https://img.shields.io/badge/node.js-339933?style=flat&logo=Node.js&logoColor=white
[NodeJS-url]: https://nodejs.org/es
[MySQL]: https://shields.io/badge/MySQL-lightgrey?logo=mysql&style=plastic&logoColor=white&labelColor=blue
[MySQL-url]: https://www.mysql.com/
[Linkedin]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[GitHub]: https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white
[Express]: https://img.shields.io/badge/express.js-000000?style=flat&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[SocketIO]: https://img.shields.io/badge/socket.io-010101?style=flat&logo=socket.io&logoColor=white
[SocketIO-url]: https://socket.io/
[MySQL]: https://shields.io/badge/MySQL-lightgrey?logo=mysql&style=plastic&logoColor=white&labelColor=blue
[MySQL-url]: https://www.mysql.com/
[dotenv]: https://img.shields.io/badge/dotenv-000000?style=flat&logo=dotenv&logoColor=white
[dotenv-url]: https://github.com/motdotla/dotenv
[jsonwebtoken]: https://img.shields.io/badge/jsonwebtoken-000000?style=flat&logo=jsonwebtoken&logoColor=white
[jsonwebtoken-url]: https://github.com/auth0/node-jsonwebtoken
[argon2]: https://img.shields.io/badge/argon2-000000?style=flat&logo=argon2&logoColor=white
[argon2-url]: https://github.com/ranisalt/node-argon2
[crypto-js]: https://img.shields.io/badge/crypto--js-000000?style=flat&logo=crypto-js&logoColor=white
[crypto-js-url]: https://github.com/brix/crypto-js
[elliptic]: https://img.shields.io/badge/elliptic-000000?style=flat&logo=elliptic&logoColor=white
[elliptic-url]: https://github.com/indutny/elliptic
[nodemon]: https://img.shields.io/badge/nodemon-000000?style=flat&logo=nodemon&logoColor=white
[nodemon-url]: https://nodemon.io/
[speakeasy]: https://img.shields.io/badge/speakeasy-000000?style=flat&logo=speakeasy&logoColor=white
[speakeasy-url]: https://github.com/speakeasyjs/speakeasy
[qrcode]: https://img.shields.io/badge/qrcode-000000?style=flat&logo=qrcode&logoColor=white
[qrcode-url]: https://github.com/soldair/node-qrcode
[React]: https://img.shields.io/badge/react.js-61DAFB?style=flat&logo=react&logoColor=white
[React-url]: https://reactjs.org/
[Vite]: https://img.shields.io/badge/vite.js-646CFF?style=flat&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/

<!-- DEVELOPERS'S CONTACT -->
[Linkedin-pablo]: https://www.linkedin.com/in/pablo-zamora02/
[Github-pablo]: https://github.com/pabloozamora
<!-- [Linkedin-diego]: https://www.linkedin.com/in/erick-guerra-02a80b204/ -->
[Github-diego]: https://github.com/Aq202
[Linkedin-erick]: https://www.linkedin.com/in/erick-guerra-02a80b204/
[Github-erick]: https://github.com/erickguerra22
[Linkedin-brandon]: https://www.linkedin.com/in/brandon-ronaldo-sicay-cumes-8a6542205/
[Github-brandon]: https://github.com/bsicay
[Linkedin-elias]: https://www.linkedin.com/in/ealvaradorax/
[Github-elias]: https://github.com/eliasalvarado
