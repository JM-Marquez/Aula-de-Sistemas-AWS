# Aula de Sistemas

**Plataforma web educativa para practicar administración de sistemas, redes, seguridad y servicios cloud mediante evaluaciones y laboratorios guiados.**

[🌐 Ver aplicación](https://aula-de-sistemas-aws.pages.dev/)

> **Aviso sobre disponibilidad:** La aplicación está publicada en Cloudflare Pages, pero su backend depende del entorno temporal AWS Academy Learner Lab. Para utilizar el inicio de sesión, las evaluaciones y las funcionalidades conectadas al backend, es necesario que el laboratorio esté iniciado. Cuando el laboratorio está apagado, la web puede cargar, pero los servicios backend no están disponibles.

---

## 1. Descripción del proyecto

Aula de Sistemas es una aplicación web educativa diseñada para acercar al usuario a situaciones habituales del trabajo en administración de sistemas y operaciones IT.

El proyecto combina evaluaciones de conocimientos con laboratorios guiados en los que se plantean incidencias técnicas y se acompaña al usuario durante el proceso de investigación y resolución.

Su objetivo es ofrecer un entorno práctico en el que aprender, comprobar conocimientos y familiarizarse con problemas que pueden aparecer en infraestructuras tecnológicas reales.

## 2. Funcionalidades principales

- **Registro e inicio de sesión:** creación de cuentas y autenticación de usuarios.
- **Verificación por correo electrónico:** confirmación de las cuentas mediante correo electrónico.
- **Evaluaciones:** cuestionarios organizados en conjuntos de preguntas.
- **Resultados y puntuaciones:** cálculo y almacenamiento de los resultados obtenidos.
- **Clasificación:** ranking basado en las mejores puntuaciones.
- **Laboratorios guiados:** simulaciones educativas para investigar incidencias técnicas.
- **Catálogo de incidencias:** escenarios relacionados con Linux, AWS, redes y seguridad.
- **Perfil de usuario:** consulta del progreso y de la actividad realizada.
- **Diseño adaptable:** interfaz preparada para utilizarse tanto en ordenador como en dispositivos móviles.

## 3. Laboratorios e incidencias

La plataforma incorpora cuatro escenarios de prácticas:

| Área | Incidencia |
|---|---|
| Linux | Un servidor SSH rechaza las conexiones. |
| AWS | Una función Lambda no puede leer objetos de S3 por un error de permisos. |
| Redes | Los usuarios no pueden resolver el DNS de la intranet. |
| Seguridad | Actividad sospechosa de inicio de sesión. |

Los laboratorios presentan una secuencia de comprobaciones, comandos y resultados simulados para que el usuario pueda comprender el diagnóstico y la resolución.

**Nota:** Los comandos forman parte de una simulación educativa. No se ejecutan sobre un sistema operativo real.

## 4. Tecnologías utilizadas

### Frontend
- Vue 3.
- TypeScript.
- Vite.
- HTML y CSS.

### Backend
- Node.js 22.
- TypeScript.
- AWS Lambda.
- Amazon API Gateway (HTTP API).

### Base de datos y almacenamiento
- Amazon DynamoDB.

### Servicios cloud y despliegue
- AWS Academy Learner Lab.
- AWS CloudFormation / AWS CDK.
- Cloudflare Pages.

### Correo electrónico
- Brevo, para el envío de correos de verificación de cuenta.

## 5. Arquitectura del proyecto

La aplicación utiliza una arquitectura desacoplada entre frontend y backend.

```text
                    USUARIO
                       |
                       v
              CLOUDFLARE PAGES
                 FRONTEND WEB
                       |
                       | Peticiones HTTP
                       v
              AMAZON API GATEWAY
                   HTTP API
                       |
                       v
                AWS LAMBDA
              Lógica de negocio
                       |
                       v
               AMAZON DYNAMODB
                 Persistencia

                       |
                       v
                     BREVO
              Verificación por email
```

El frontend se publica mediante Cloudflare Pages y consume los endpoints del backend a través de Amazon API Gateway.

Las funciones AWS Lambda ejecutan la lógica de autenticación, evaluaciones, gestión de resultados y otras operaciones de la aplicación. DynamoDB almacena la información persistente.

## 6. Estructura del repositorio

El proyecto está organizado en diferentes módulos para separar la interfaz, la lógica de servidor y el acceso a datos.

```text
Aula-de-Sistemas-AWS/
│
├── frontend/
│   └── Aplicación web
│
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   ├── lib/
│   │   ├── repository/
│   │   └── services/
│   │
│   └── scripts/
│
├── db/
│   ├── src/
│   └── scripts/
│
├── package.json
└── README.md
```

## 7. Despliegue y configuración

### Frontend

El frontend está publicado en Cloudflare Pages.

- Proyecto: `aula-de-sistemas-aws`
- Directorio de salida: `frontend/dist`
- Comando de compilación: `npm run build:web`

### Backend

El backend se ejecuta mediante funciones AWS Lambda y se comunica con el frontend a través de API Gateway.

La variable de entorno utilizada por el frontend para localizar la API es:

```env
VITE_API_BASE_URL=https://mn3doev239.execute-api.us-east-1.amazonaws.com
```

El backend utiliza variables de entorno para configurar el repositorio de datos, la tabla de DynamoDB y los servicios externos.

**Importante:** Las claves, credenciales, tokens y secretos no deben incluirse en el repositorio. Deben configurarse mediante los mecanismos seguros correspondientes.

## 8. Entorno académico y limitaciones

Este proyecto se ha desarrollado utilizando AWS Academy Learner Lab, un entorno educativo con recursos y credenciales temporales.

Por este motivo:

- La disponibilidad del backend depende de que el laboratorio esté iniciado.
- Los servicios desplegados no constituyen una infraestructura de producción permanente.
- La aplicación puede mostrar su interfaz aunque el backend no esté disponible.
- Para convertirla en un servicio de producción sería necesario desplegar la infraestructura en una cuenta AWS permanente y configurar los recursos, credenciales, dominio y medidas de seguridad correspondientes.

## 9. Objetivos de aprendizaje

Durante el desarrollo del proyecto se han trabajado diferentes áreas técnicas:

- Desarrollo de aplicaciones web con Vue y TypeScript.
- Diseño y consumo de API REST.
- Programación de funciones serverless.
- Persistencia de datos con DynamoDB.
- Autenticación y verificación de usuarios.
- Integración de servicios externos de correo electrónico.
- Despliegue de aplicaciones web.
- Configuración de infraestructura cloud.
- Diagnóstico y resolución de errores.
- Diseño de experiencias educativas interactivas.

## 10. Estado del proyecto

El proyecto dispone de las funcionalidades principales implementadas y probadas dentro del entorno académico.

Se han comprobado el registro, la verificación de correo, el inicio de sesión, las evaluaciones, el almacenamiento de puntuaciones, el ranking y los laboratorios guiados.

---

**Proyecto académico y portfolio de desarrollo cloud.**

## Aplicación en funcionamiento

La plataforma permite practicar competencias técnicas mediante evaluaciones,
investigación de incidencias y laboratorios guiados.

### Competencias
![Competencias](docs/images/01-competencias.png)

### Incidencias
![Incidencias](docs/images/02-incidencias.png)

### Inicio de sesión
![Inicio de sesión](docs/images/03-login.png)

### Laboratorios
![Laboratorios](docs/images/04-laboratorios.png)

### Clasificación (Leaderboard)
![Leaderboard](docs/images/05-leaderboard.png)

### Sets de evaluación
![Sets](docs/images/06-sets.png)
