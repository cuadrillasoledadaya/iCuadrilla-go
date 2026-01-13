# Historial de Cambios - iCuadrilla

## v1.0.25 (13/01/2026)

- **Superadmin God Mode**: Implementado acceso total (`ALL`) para el rol Superadmin en todas las tablas de la base de datos (`costaleros`, `asistencias`, `eventos`, `anuncios`, `temporadas`).
- **Unificación de Seguridad**: Centralizada la lógica de permisos en la función `es_superadmin()`, eliminando dependencias de correos electrónicos específicos en las políticas RLS.

## v1.0.24 (13/01/2026)

- **CORRECCIÓN CRÍTICA DE PERSISTENCIA**: Se han activado las políticas de seguridad (RLS) en la base de datos que faltaban. Sin ellas, el servidor denegaba silenciosamente cualquier intento de borrar o actualizar estados, lo que causaba que los cambios "desaparecieran" al recargar. Ahora las limpiezas y cambios de estado son permanentes.

## v1.0.23 (13/01/2026)

- **Borrado Ultra-Robusto**: Cambiada la lógica de "Limpiar Asistencia" para usar el ID único del registro. Esto garantiza que el borrado funcione siempre, sin importar discrepancias de fecha o zona horaria.
- **Corrección de Visibilidad 'Ausente'**: Corregido un error donde marcar a alguien como ausente en la lista de Asistentes hacía que desapareciera temporalmente hasta recargar la página.

## v1.0.22 (13/01/2026)

- **Limpieza de Código y Tipos**: Corregidos errores de TypeScript relacionados con la discrepancia entre el estado visual (justificado) y el de base de datos (justificada).
- **Consistencia de Estados**: Asegurada la visibilidad y el color correcto de los estados en todas las listas de asistencia.

## v1.0.21 (13/01/2026)

- **Corrección de Fechas y Timezones**: Cambiada la lógica de cálculo de fecha para usar la hora local en lugar de UTC. Esto evita que los registros se guarden en el día anterior/siguiente por error de zona horaria.
- **Mejora de Visibilidad**: Los costaleros marcados como "Ausente" ahora aparecen en la lista de Asistentes (con indicador rojo) para evitar que desaparezcan de ambas listas.
- **Sincronización de Agentes**: Verificados y aplicados cambios del equipo de desarrollo para estabilizar el sistema de asistencia.

## v1.0.20 (13/01/2026)

- **Auto-Refresh al Volver**: Las listas de "Pendientes" y "Asistentes" ahora recargan datos automáticamente cuando vuelves a ellas (al cambiar de pestaña o navegar de vuelta). Esto asegura que al limpiar un estado en Asistentes, el costalero reaparezca correctamente en Pendientes.
- **Manejo de Errores Delete**: Añadido feedback si el borrado de estado falla.

## v1.0.19 (13/01/2026)

- **Corrección UX (Spinner Infinito)**: Eliminado el estado de carga (`setLoading`) al cambiar estados. Al haber quitado la recarga de página, el spinner se quedaba bloqueado para siempre. Ahora la actualización es instantánea y sin bloqueos.

## v1.0.18 (13/01/2026)

- **Corrección UX (Race Condition)**: Eliminada la recarga automática de datos al cerrar el modal en listas de asistencia. Esto evita que la aplicación "olvide" el cambio reciente si el servidor tarda en responder, confiando en la actualización instantánea (Optimistic UI) para una experiencia más fluida.

## v1.0.17 (13/01/2026)

- **Corrección de Texto BD**: Solucionado error `check constraint` donde el servidor esperaba "justificada" (femenino) pero recibía "justificado". Se ha añadido una transformación automática al guardar.

## v1.0.16 (13/01/2026)

- **Corrección Lógica de Guardado**: Reemplazado `upsert` por una lógica manual de `check -> insert/update` para evitar el error de restricción de base de datos ("unique constraint"). Esto asegura compatibilidad total sin tener que tocar la base de datos.

## v1.0.15 (13/01/2026)

- **Corrección Base de Datos**: Eliminado campo `hora` en las actualizaciones, ya que no existe en la estructura actual de `asistencias`.

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
