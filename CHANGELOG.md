# Historial de Cambios - iCuadrilla

## v1.0.06 (12/01/2026)

- **Base de Datos**: Eliminada restricción `NOT NULL` en la columna `email` para permitir registros sin correo (Hotfix Backend).

## v1.0.05 (12/01/2026)

- **Email Opcional**: Retirada obligatoriedad del campo Email en el alta de costaleros. Ahora se puede registrar dejando el campo vacío.

## v1.0.04 (12/01/2026)

- **Corrección UI Inputs**: Forzado color de texto blanco (`text-white`) en formulario de alta de costaleros para corregir el error de "texto invisible" (negro sobre fondo negro).

## v1.0.03 (12/01/2026)

- **Escáner QR V2 (Robusto)**: Cambio profundo a la clase `Html5Qrcode` para control manual de la cámara y corrección definitiva de la "pantalla negra".

## v1.0.02 (12/01/2026)

- **Corrección Escáner QR**: Solucionado el problema de pantalla negra mediante refactorización de la inicialización de la cámara (`useRef`).

## v1.0.01 (12/01/2026)

- **Versión inicial estable PWA.**
- Corrección de navbar superpuesto: La barra de navegación se oculta al abrir el menú lateral.
- Refuerzo de seguridad: Middleware de protección de rutas y redirección estricta.
- UX: Cierre de sesión automático y redirección limpia al Login.
