# Materiales de Apoyo a la Intervención Social

Plataforma web con recursos físicos y digitales para integradores sociales, trabajadores sociales y educadores.

**En producción:** https://myappsserver.duckdns.org/materialesis/

## Qué incluye

- **Web pública:** portada, «Tu opinión» (muro de reseñas en masonry), contacto y licencia anual.
- **Zona privada** (con cuenta): 7 áreas — Contexto, Inmersión, FOL, Metodología, Promoción, Mediación y Apoyo idiomático.
  - En cada área, sin licencia: 1 material físico demo (visor web, sin descarga) y 1 herramienta digital demo (totalmente funcional).
  - El resto de la biblioteca aparece bloqueada con candado y llamada a la licencia.
  - Con licencia anual activa: todo desbloqueado, con descargas.
- **Administración** (`/admin`): CRUD de materiales con subida de ficheros, usuarios y licencias, moderación de reseñas y bandeja de mensajes.

Acceso inicial de administración: usuario `admin` / contraseña `integracion` (cámbiala tras el primer acceso).

## Stack

| Parte | Tecnología |
| --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS 4 + React Router |
| API | PHP 8.3 sin dependencias (PDO) |
| Base de datos | SQLite por defecto; MySQL/MariaDB cambiando el DSN |
| Servidor | Apache (`.htaccess` con reescritura para SPA y API) |

Tipografías: Fraunces (titulares) y Plus Jakarta Sans (texto). Paleta: arena, papel, tinta, terracota, salvia y mostaza.

## Estructura

```
frontend/            App React (Vite)
  src/pages/         Landing, acceso, opinión, contacto, licencia
  src/pages/app/     Zona privada: inicio, área, material
  src/pages/admin/   Panel de administración
  src/components/    UI, visor de páginas, marca
  src/components/interactive/   Las 7 herramientas digitales
api/                 API REST en PHP
  index.php          Punto de entrada
  src/routes.php     Todas las rutas
  src/Controllers/   Auth, materiales, comunidad, administración
  src/Db.php         Conexión, esquema y migración automática
  src/Seed.php       Datos iniciales (admin + biblioteca de ejemplo)
deploy/deploy.sh     Compila y despliega en el servidor
```

`data/` (base de datos y ficheros subidos) se crea sola en el servidor y nunca se sube al repositorio ni es accesible por web.

## Desarrollo local

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo redirige `/materialesis/api` a la API del servidor de producción (cambia `VITE_API_TARGET` en `frontend/.env.local` para usar otra).

## Despliegue

```bash
MIS_SSH_KEY=/ruta/a/servidor-apps.key ./deploy/deploy.sh
```

Compila el frontend, sube frontend + API a `/var/www/html/materialesis` y conserva `data/` y `api/config.local.php`.

## Configuración

Los valores por defecto están en `api/src/config.php`. Para cambiarlos en un servidor, crea `api/config.local.php`:

```php
<?php
return [
    'db_dsn'        => 'mysql:host=localhost;dbname=materialesis;charset=utf8mb4',
    'db_user'       => 'materialesis',
    'db_pass'       => '••••••',
    'license_price' => 49,
];
```

## Licencias y pago

Ahora mismo el pago es **manual**: la persona solicita la licencia desde la web, administración confirma el pago y pulsa «Activar» en Usuarios (suma 365 días). El punto para conectar una pasarela (Stripe, Redsys…) es `CommunityController::requestLicense`.

## Formato de las páginas de texto del visor

```
## Subtítulo
- Viñeta
[ ] Casilla para marcar
> Texto destacado
___        (línea para escribir)
```

## API (resumen)

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `auth/me` · POST `auth/login`, `auth/register`, `auth/logout` | Público |
| GET | `sections`, `materials?section=`, `materials/{id}` | Con cuenta |
| GET | `materials/{id}/page/{n}` | Demo o licencia |
| GET | `materials/{id}/download` | Solo licencia |
| GET/POST | `reviews` · POST `contact` · POST `license/request` | Público / con cuenta |
| * | `admin/materials`, `admin/users`, `admin/reviews`, `admin/messages`, `admin/stats` | Administración |

Toda petición que modifica datos debe incluir la cabecera `X-MIS: 1` (protección CSRF).
