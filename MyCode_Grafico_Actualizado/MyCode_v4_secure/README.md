# MyCode v4 — Secure ES Modules + Vite + Jest

Refactorización de la versión MyCode anterior para separar responsabilidades y preparar el MPA para bundling moderno.

## Principales cambios

- No se guardan JWT, access tokens, IDs de sesión ni credenciales en `localStorage` o `sessionStorage`.
- Autenticación basada en cookie `HttpOnly; Secure; SameSite` gestionada por el backend.
- JavaScript convertido a módulos ES6 (`import` / `export`).
- API centralizada en `src/js/api.js` con `credentials: include` y soporte para CSRF.
- Tokens y planes delegan las operaciones sensibles al servidor.
- Vite configurado para múltiples páginas.
- Jest configurado para pruebas de tokens, control de acceso, i18n y API.
- Login y registro incluyen botón de mostrar/ocultar contraseña accesible.
- Se mantienen idioma ES/EN y modo claro/oscuro; solo esas preferencias se almacenan localmente.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## Revisión rápida de seguridad

```bash
npm run check
```

## Importante

Este proyecto es el frontend. La cookie HttpOnly/Secure solo puede ser creada y protegida por el servidor. El backend también debe realizar el control de autorización, saldo de tokens y cambio de plan de forma autoritativa.

No introduzcas tarjetas, contraseñas de producción ni otros secretos en archivos frontend.
