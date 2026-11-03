# Guía de despliegue — AWS Learner Lab

Esta guía está pensada para aprender AWS mientras se despliega Sistemas en Práctica. Haz una etapa cada vez y no avances hasta entender qué recurso se ha creado.

## 0. Preparar el laboratorio

1. Inicia AWS Academy Learner Lab y pulsa **Start Lab**.
2. Abre AWS Details y copia las credenciales temporales según las instrucciones de tu plataforma.
3. Configura el entorno local de forma segura. Si usas AWS CLI, utiliza el método de credenciales temporales recomendado por el laboratorio; no pegues claves en archivos versionados.
4. Comprueba:

```bash
aws sts get-caller-identity
aws configure get region
```

Guarda el ID de cuenta y región para tus notas, pero no publiques las credenciales.

## 1. Entender el proyecto antes de desplegar

```bash
npm ci
npm run build
npx cdk synth
```

- `npm ci`: instala versiones fijadas en `package-lock.json`.
- `npm run build`: compila frontend y funciones Lambda.
- `cdk synth`: traduce los stacks CDK a plantillas CloudFormation; todavía no crea recursos.

Si falla el build, no despliegues. Si `cdk synth` falla, revisa el error antes de seguir.

## 2. Revisar permisos y costes

```bash
aws sts get-caller-identity
npx cdk diff
```

El Learner Lab puede limitar creación de roles IAM, políticas, buckets bootstrap o distribuciones CloudFront. Un `AccessDenied` no se soluciona ampliando permisos desde el proyecto: el rol temporal lo controla el laboratorio. Anota el servicio y la acción denegada.

## 3. Día web — S3 + CloudFront + OAC

La web se sirve desde un bucket S3 privado. CloudFront accede al bucket mediante Origin Access Control; el bucket no necesita acceso público.

```bash
npm run deploy:web
```

En la salida de CloudFormation/CDK localiza `SiteUrl`, `BucketName` y `DistributionId`.

En la consola AWS comprueba:

- S3: bucket creado y **Block all public access** activado.
- CloudFront: distribución desplegada y origen S3 con OAC.
- La web abre por HTTPS y las rutas internas funcionan.

Si la distribución está en `Deploying`, espera a `Deployed`. Si el laboratorio no permite CloudFront, detente aquí y practica localmente; no cambies el bucket a público como atajo.

## 4. Día API — Lambda + API Gateway + DynamoDB

Solo si el laboratorio permite los permisos necesarios:

```bash
# En .env establece VITE_API_BASE_URL=/api
npm run deploy:all
npm run seed
```

Aprende a identificar:

- API Gateway HTTP API: rutas HTTP y sus integraciones.
- Lambda: una función por ruta, logs propios y permisos IAM acotados.
- DynamoDB: tabla bajo demanda, claves PK/SK e índice GSI1.
- Secrets Manager: secreto de firma de sesiones y lista de administradores.

El `seed` carga sets y preguntas de evaluación. Las nuevas simulaciones de laboratorio no crean recursos reales.

## 5. Día observabilidad — CloudWatch

Después de usar la aplicación, revisa CloudWatch:

- Log groups de Lambda y retención.
- Errores e invocaciones de las funciones.
- Dashboard de la aplicación.
- Alarma declarada por CDK.

En el README de `backend/` e `infra/` hay más contexto sobre EMF, IAM y métricas.

## 6. Limpieza

Cuando termines la práctica, revisa primero los stacks:

```bash
npx cdk list
```

Si ya no necesitas los recursos y tienes claro que no contienen datos que quieras conservar:

```bash
npm run destroy
```

Comprueba en CloudFormation que los stacks se han eliminado. Comprueba también CloudFront y S3; las distribuciones pueden tardar en deshabilitarse y eliminarse. Revisa Billing/Cost Explorer cuando haya datos disponibles.

## Qué capturar para el portfolio

1. Vista general de la aplicación con los tres módulos.
2. Un escenario de incidencia y su diagnóstico.
3. Terminal simulada y explicación de una práctica.
4. Panel de competencias.
5. Arquitectura AWS (CDK/CloudFormation) y recursos desplegados.
6. CloudWatch con logs o dashboard tras una prueba.

No incluyas correos personales, tokens, IDs sensibles, credenciales temporales ni secretos en capturas públicas.
