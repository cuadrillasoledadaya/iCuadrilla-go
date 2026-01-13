# Historial de Cambios - iCuadrilla

## v1.0.14 (13/01/2026)

- **Corrección Crítica de Base de Datos**: Eliminado campo `evento_id` que provocaba el error "Error al actualizar conexión". Ahora se vincula correctamente por fecha.
- **Mejora UI**: Añadido espacio extra (padding) al final de los menús desplegables para que los botones de abajo no queden tapados por la barra de navegación del móvil.

## v1.0.13 (13/01/2026)

- **Corrección Hotfix**: Reparado error de sintaxis en `setStats` que rompía la compilación del detalle del evento.

## v1.0.12 (13/01/2026)

- **Corrección de Contadores y UX**: Ajustada la lógica de contadores en el detalle del evento para que "Pendientes" coincida exactamente con la lista interior (incluyendo lógica de ausentes).
- **Actualización Instantánea (Optimistic UI)**: Eliminados los recargos de página al cambiar estado. Ahora la lista se actualiza instantáneamente al tocar una opción.

## v1.0.11 (13/01/2026)

- **Corrección Definitiva Build**: Eliminación de bloque de código duplicado persistente en detalle de evento.

## v1.0.10 (13/01/2026)

- **Corrección de Build**: Solucionado error crítico en la compilación de la página "Ver por Trabajaderas" debido a código duplicado.

## v1.0.09 (12/01/2026)

- **Interactividad Total**: Las listas de "Asistentes", "Pendientes" y "Trabajaderas" ahora son totalmente interactivas. Se puede entrar en ellas y clicar en cualquier costalero para cambiar su estado (Presente/Justificado/Ausente) o limpiar su registro.

## v1.0.08 (12/01/2026)

- **Lógica de Eventos Dinámica**: Implementado cálculo real de contadores (Presentes, Justificados, Ausentes) y listas dinámicas en el detalle del evento. Ahora "Pendientes" muestra el Total menos los asistentes/excusados.

## v1.0.07 (12/01/2026)

- **Seguridad DB**: Añadida política RLS `ENABLE INSERT` en la tabla `asistencias` para que los usuarios autenticados puedan registrar la asistencia desde el escáner.

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
