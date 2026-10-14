# Catálogo WhatsApp

Aplicación de catálogo con una API Express, una interfaz React/Vite, MySQL y Cloudinary para las imágenes.

## Despliegue en Vercel

El repositorio contiene dos aplicaciones. Crea **dos proyectos** en Vercel, ambos conectados al repositorio `Fernando88323/catalogo`:

1. **API (backend):** establece `backend` como **Root Directory**. Vercel detecta la aplicación Express en `src/app.js`.
2. **Sitio (frontend):** establece `frontend` como **Root Directory**. Usa el preset Vite y el comando de compilación `npm run build` (directorio de salida `dist`).

En el frontend, `vercel.json` envía las rutas de React Router a `index.html`. Cada aplicación se despliega por separado; configura primero la API y luego el sitio.

### 1. Preparar la base MySQL en la nube

Vercel no puede conectarse al MySQL de tu computadora. Crea un clúster de TiDB Cloud compatible con MySQL, una base de datos y un usuario. Conserva el host, puerto, usuario, contraseña y nombre de la base. Habilita las conexiones TLS y sigue la guía del proveedor para permitir la conexión desde la aplicación.

La base local no se copia automáticamente. Si ya tienes productos y categorías que quieres conservar, exporta tus datos y migra ese respaldo a la base en la nube. Las imágenes que solo existan en `backend/uploads` tampoco se despliegan; súbelas a Cloudinary y guarda sus URL públicas en los productos.

Para crear el esquema y el usuario administrador inicial desde PowerShell, configura temporalmente en la terminal las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` con los valores de producción y luego ejecuta:

```powershell
Set-Location .\backend
npm run db:setup
```

Usa una contraseña nueva y segura para el administrador. El script crea las tablas y un administrador, pero no exporta ni importa automáticamente los datos del MySQL local.

### 2. Configurar y desplegar el backend

En Vercel, abre el proyecto de la API y, en **Settings → Environment Variables**, agrega para **Production**:

| Variable | Valor |
| --- | --- |
| `DB_HOST` | Host del clúster MySQL |
| `DB_PORT` | Puerto de MySQL del proveedor |
| `DB_USER` | Usuario de la base |
| `DB_PASSWORD` | Contraseña de la base |
| `DB_NAME` | Nombre de la base de datos |
| `DB_SSL` | `true` |
| `DB_SSL_CA_BASE64` | Opcional: certificado CA de TiDB codificado en Base64 si lo requiere el proveedor |
| `JWT_SECRET` | Secreto aleatorio largo y privado |
| `CORS_ORIGIN` | URL HTTPS del sitio frontend en Vercel, sin `/` al final |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

No agregues comillas a los valores ni publiques secretos. Después de crear estas variables, despliega el backend y copia su dominio HTTPS, por ejemplo `https://mi-api.vercel.app`.

Si TiDB requiere el certificado CA que muestra su panel, descarga el archivo PEM y conviértelo a Base64 en PowerShell con `[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\ruta\al\ca.pem'))`. Guarda el resultado en `DB_SSL_CA_BASE64` tanto en `backend\.env` (para inicializar el esquema desde tu equipo) como en Vercel.

Comprueba que `https://mi-api.vercel.app/api/health` responda `{"ok":true}`.

### 3. Configurar y desplegar el frontend

En el proyecto frontend, agrega la variable de entorno de Production:

```text
VITE_API_URL=https://mi-api.vercel.app/api
```

Sustituye el dominio de ejemplo por el dominio real del backend, sin `/` al final después de `api`. Despliega el frontend y abre su dominio HTTPS.

Si el dominio del frontend cambia, actualiza `CORS_ORIGIN` en el backend y vuelve a desplegarlo. La URL de Vite se incluye durante la compilación, así que, si cambia la API, actualiza `VITE_API_URL` y vuelve a desplegar el frontend.

### Notas

- No subas `.env` ni pegues contraseñas o claves en el repositorio. Configúralas en Vercel.
- En **Project Settings → General → Root Directory**, cada proyecto debe usar su propia carpeta (`backend` o `frontend`).
- El endpoint `/api/health` comprueba que la API está activa; las demás rutas también requieren conexión válida a MySQL.
- Cloudinary almacena las imágenes nuevas. El almacenamiento local del backend no es persistente en funciones serverless.
