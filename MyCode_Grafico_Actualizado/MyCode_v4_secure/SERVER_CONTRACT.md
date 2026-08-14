# MyCode v4 — Contrato de autenticación seguro

Esta versión elimina el almacenamiento de JWT o identificadores de sesión en `localStorage` y `sessionStorage`.

## Cookie de sesión

El backend debe emitir una cookie de sesión opaca, por ejemplo:

```http
Set-Cookie: mycode_session=<opaque-session-id>; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

La aplicación frontend nunca debe poder leer esa cookie. El navegador la adjunta automáticamente a las peticiones `fetch` porque `api.js` usa `credentials: "include"`.

## Endpoints esperados

- `GET /api/auth/me` → `{ user }`
- `POST /api/auth/register` → `{ user }` y `Set-Cookie`
- `POST /api/auth/login` → `{ user }` y `Set-Cookie`
- `POST /api/auth/logout` → invalida la sesión en servidor y expira la cookie
- `POST /api/tokens/consume` → valida y descuenta tokens atómicamente en servidor
- `POST /api/plans/change` → valida el plan, autorización y aplica el cambio en servidor

## CSRF

Para operaciones mutables se recomienda protección CSRF de servidor. `api.js` envía `X-CSRF-Token` cuando la página contiene un `<meta name="csrf-token" content="...">` generado por el backend.

Nunca confíes en el plan, saldo de tokens o permisos enviados por el cliente. El backend debe obtenerlos de la sesión/base de datos y hacer la operación de consumo de tokens de forma atómica.

## Headers recomendados

```http
Cache-Control: no-store
Content-Type: application/json
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Para producción, añadir CSP y HSTS desde el servidor.
