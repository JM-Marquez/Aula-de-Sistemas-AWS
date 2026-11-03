# Aula de Sistemas AWS

**Plataforma de evaluación de competencias IT, análisis de incidencias y laboratorios guiados.**

Proyecto de portfolio construido a partir de la arquitectura de las Jornadas Cloud 2026. Conserva el enfoque didáctico del proyecto original y su stack AWS, pero orienta el producto a un problema empresarial: ayudar a equipos de soporte y sistemas a practicar incidencias habituales, evaluar conocimientos técnicos y detectar áreas de formación.

## Qué permite hacer

1. **Situaciones empresariales:** catálogo de incidencias de Linux, AWS y redes con impacto, síntomas y objetivo de diagnóstico.
2. **Evaluación:** sets de preguntas con puntuación, explicaciones e historial. Se conserva el motor de evaluación original.
3. **Laboratorios guiados:** terminal simulada con comandos y salidas controladas, evidencias, explicación técnica y progreso.
4. **Diagnóstico de competencias:** resumen del progreso práctico por área y recomendaciones de qué practicar.

> Los laboratorios de esta versión son simulaciones educativas en el navegador. No ejecutan comandos en máquinas reales ni modifican recursos AWS. El progreso de laboratorios se guarda localmente en el navegador; no se presenta como dato multiusuario ni como evaluación certificada.

## Arquitectura heredada y reutilizada

```text
Navegador
  └─ Vue 3 + TypeScript + Vite + Pinia + Vue Router
       ├─ Evaluaciones (API original / mock)
       ├─ Catálogo de incidencias
       ├─ Laboratorios simulados (salidas controladas)
       └─ Panel de competencias (progreso local)

AWS (infraestructura original CDK)
  ├─ Amazon S3 privado + CloudFront + OAC
  ├─ Amazon API Gateway HTTP API
  ├─ AWS Lambda (TypeScript)
  ├─ Amazon DynamoDB (tabla + GSI)
  ├─ AWS Secrets Manager
  └─ Amazon CloudWatch (logs, métricas, dashboard y alarma)
```

Las pantallas nuevas de incidencias, laboratorios y competencias funcionan en el frontend y no requieren nuevas Lambdas ni tablas. El backend original sigue atendiendo autenticación, sets, intentos y leaderboard. Así se evita ampliar el coste y el alcance para la primera entrega.

## Requisitos

- Node.js 22 o superior (los scripts de datos usan TypeScript ejecutable por Node 22).
- npm.
- Para AWS: AWS CLI y CDK v2.
- Una cuenta AWS con permisos suficientes para los servicios que se desplieguen. AWS Academy Learner Lab puede restringir IAM, CloudFormation, CloudFront o CDK bootstrap; hay que validar esas restricciones antes de desplegar.

## Ejecutar en local

```bash
npm ci
cp .env.example .env
npm run dev
```

El frontend usa el adaptador mock cuando `VITE_API_BASE_URL` está vacío. Para probar también la API local:

```bash
# Terminal 1
npm run dev:api
# Terminal 2
npm run dev
```

Acceso de demostración: introduce un correo y usa el enlace demo cuando esté disponible. No configures SES para probar las nuevas pantallas.

## Compilar y comprobar

```bash
npm run typecheck
npm run build
```

## Despliegue AWS por etapas

La infraestructura se conserva para poder aprender los servicios en orden. No se presupone que Learner Lab permita todos los recursos.

1. Configurar las credenciales temporales del Learner Lab y comprobar identidad/región:

   ```bash
   aws sts get-caller-identity
   aws configure get region
   ```

2. Instalar dependencias y compilar:

   ```bash
   npm ci
   npm run build
   ```

3. Revisar qué creará CDK antes de desplegar:

   ```bash
   npx cdk synth
   npx cdk diff
   ```

4. Si el rol del laboratorio permite bootstrap y CloudFormation, hacer bootstrap una sola vez en la cuenta/región elegida:

   ```bash
   npx cdk bootstrap aws://ID_CUENTA/REGION
   ```

5. Desplegar primero solo la web:

   ```bash
   npm run deploy:web
   ```

6. Cuando la web esté validada, estudiar el despliegue de API y datos:

   ```bash
   npm run deploy:all
   npm run seed
   ```

   El backend requiere permisos adicionales y recursos que pueden estar bloqueados en Learner Lab. No continúes si `cdk diff` muestra roles o políticas que el laboratorio no permite crear.

### Importante sobre AWS Learner Lab

- Las credenciales son temporales. No guardes claves en `.env`, en el repositorio ni en capturas.
- La región debe ser la que indique el Learner Lab y debe coincidir en todos los comandos.
- CloudFront puede tardar varios minutos en desplegar y puede estar restringido por el laboratorio.
- CDK bootstrap crea recursos y roles auxiliares; puede fallar si el laboratorio impide crear roles IAM.
- SES no es necesario para la demo; el modo de taller usa enlace demo.
- No habilites dominio propio, certificado ACM ni correo real para esta primera práctica.
- Revisa los recursos activos al terminar y destruye los stacks que ya no necesites. CloudFront puede tardar en eliminarse.
- No se puede garantizar despliegue en cualquier Learner Lab sin comprobar las políticas concretas de la sesión.

## Aprender AWS paso a paso

Consulta [`GUIA_AWS_LEARNER_LAB.md`](./GUIA_AWS_LEARNER_LAB.md). La guía separa qué aprenderás en cada etapa: S3, CloudFront, OAC, CDK, Lambda, API Gateway, DynamoDB, IAM y CloudWatch.

## Estructura

- `frontend/`: aplicación Vue y pantallas.
- `frontend/src/data/itScenarios.ts`: escenarios y pasos de laboratorio simulados.
- `backend/`: handlers Lambda, dominio, autenticación y repositorio.
- `db/`: modelo de acceso y scripts DynamoDB.
- `infra/`: stacks CDK de web, API y datos.

## Nota de portfolio

El proyecto demuestra diseño de una aplicación web, separación frontend/backend, infraestructura como código, despliegue serverless, persistencia NoSQL, observabilidad y control de acceso. Las simulaciones están claramente delimitadas como simulaciones; una futura versión podría incorporar entornos efímeros reales aislados, pero eso requeriría controles de seguridad, presupuesto y limpieza automática.

> **Nota de despliegue Learner Lab:** consulta [PREPARACION_Y_LIMITACIONES.md](./PREPARACION_Y_LIMITACIONES.md) antes de desplegar. El acceso actual de taller usa enlace mágico sin correo; aún no es autenticación real con contraseña.
