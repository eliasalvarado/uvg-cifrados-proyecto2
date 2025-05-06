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
- Elías Alvarado: Mensajes directors efímeros
* [![Linkedin][Linkedin]][Linkedin-elias]
* [![GitHub][GitHub]][GitHub-elias]

## 📦 Dependencias Principales

Las principales dependencias del proyecto, incluyen:
* [![NodeJS][NodeJS]][NodeJS-url]
* [![MySQL][MySQL]][MySQL-url]

<p align="right">(<a href="#readme-top">Ir al inicio</a>)</p>

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