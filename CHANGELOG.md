# Historial de Cambios - iCuadrilla

## v1.1.51 (15/01/2026)

- **Corrección CRÍTICA en Notificaciones**:
  - Añadida confirmación obligatoria al pulsar "Justificar" o "Marcar Ausente".
  - Se muestra alerta de éxito/error tras cada acción.
  - Añadido logging de depuración para rastrear problemas de persistencia.

## v1.1.50 (15/01/2026)

- **Debug & Cache Fix**: Se ha forzado una actualización visual en los botones de "Justificar" para asegurar que la confirmación se cargue correctamente en todos los dispositivos.

## v1.1.49 (15/01/2026)

- **Mejora en Notificaciones (Seguridad)**:
  - Añadida **confirmación obligatoria** al Justificar o Marcar Ausencia para evitar clics accidentales.
  - Añadidas alertas visuales de éxito/error al realizar estas acciones.
  - Corrección de lógica para asegurar que el cambio de estado se aplique correctamente en base de datos.

## v1.1.48 (15/01/2026)

- **Corrección Crítica en Notificaciones**: Se garantiza que los botones de "Justificar" y "Marcar Ausente" sean siempre visibles, independientemente del estado de lectura de la notificación.

## v1.1.47 (15/01/2026)

- **Corrección en Notificaciones**:
  - Las acciones rápida (Justificar / Ausente) ahora permanecen visibles incluso si la notificación ya fue marcada como leída, permitiendo correcciones posteriores.
  - Mejorado el manejo de errores al actualizar la asistencia.

## v1.1.46 (15/01/2026)

- **Mejora en Notificaciones**: Añadidas acciones rápidas en las notificaciones para Admin/Capataces:
  - **Justificar**: Pone la falta como "Justificada" y marca la notificación como leída.
  - **Marcar Ausente**: Confirma la falta como "Ausente" y marca la notificación como leída.

## v1.1.45 (15/01/2026)

- **Sistema de Notificaciones Internas**:
  - **Costaleros**: Nueva función "Notificar Ausencia" en eventos pendientes. Permite enviar un motivo directamente a los capataces.
  - **Capataces**:
    - Nuevo contador de notificaciones no leídas en la campana del Dashboard.
    - Nueva sección "Notificaciones" en el menú lateral.
    - Gestión de avisos (Ver, Marcar como leída, Eliminar).
  - **Base de Datos**: Nueva tabla `notificaciones` para gestión centralizada.

## v1.1.44 (15/01/2026)

- **Corrección Visual**: La barra de navegación inferior (Navbar) ahora usa dinámicamente el color primario (Verde), eliminando valores "hardcoded" antiguos.

## v1.1.43 (15/01/2026)

- **Corrección Visual**: La tarjeta inferior de estadísticas "Cuadrilla" ahora usa el color verde corporativo (`bg-primary/5`) en lugar de azul.

## v1.1.42 (15/01/2026)

- **Corrección Visual**: Actualizados los indicadores de carrusel (puntos de navegación) al color corporativo (Verde Hermandad).

## v1.1.41 (15/01/2026)

- **Identidad Corporativa**: Cambio del color primario a "Verde Hermandad" para cumplir con la identidad visual corporativa (Verde/Negro).

## v1.1.40 (15/01/2026)

- **Rediseño Premium**: Nueva ficha de costalero con estética oscura y acentos dorados. Diseño de tarjetas más moderno y limpio.
- **Mejora de UX**: Iconografía actualizada y mejor jerarquía visual en los datos del hermano.

## v1.1.39 (15/01/2026)

- **Mejora de UX**: Campos "Trabajadera" y "Puesto" convertidos a desplegables para evitar errores de escritura.
- **Corrección Visual**: Ajuste de colores en los desplegables para asegurar legibilidad en modo oscuro.

## v1.1.38 (15/01/2026)

- **Corrección Visual**: Solucionado error de visibilidad en el formulario de editar costalero (texto oscuro sobre fondo oscuro).
- **Mejoras Generales**: Revisión de contrastes en formularios con tema oscuro.

## v1.1.37 (15/01/2026)

- **Datos de Costalero**: Añadidos campos "Suplemento" (0.5cm - 6.0cm) y "Año de Ingreso" en la ficha del costalero.
- **Formularios Actualizados**: Se pueden registrar y editar estos nuevos datos desde los formularios correspondientes.

## v1.1.36 (15/01/2026)

- **Corrección de Despliegue**: Solucionado un error de compilación que impedía la correcta visualización del dashboard. Se han aplicado correcciones de tipado y estilos para los carruseles.

## v1.1.35 (15/01/2026)

- **Carruseles Completos**: Implementado el diseño de carrusel horizontal también para los "Avisos Recientes". Ahora el Dashboard presenta una interfaz unificada y compacta para revisar tanto la agenda como las notificaciones.

## v1.1.34 (15/01/2026)

- **Carrusel de Eventos**: Transformada la vista de "Próximo Evento" en un carrusel horizontal deslizante con indicadores. Ahora puedes ver de un vistazo los próximos 5 eventos de la agenda sin ocupar toda la pantalla.

## v1.1.33 (15/01/2026)

- **Dashboard Dinámico**: La sección "Avisos Recientes" ahora muestra en tiempo real los últimos 3 comunicados publicados en el Tablón, con acceso directo para leer más.

## v1.1.32 (15/01/2026)

- **Corrección Visual Tablón**: Solucionado el problema de contraste en el formulario de creación de anuncios. Ahora el texto es blanco sobre el fondo oscuro, garantizando su legibilidad.

## v1.1.31 (15/01/2026)

- **Gestión Avanzada de Anuncios**: Implementada la edición y borrado de anuncios en el Tablón. Ahora los administradores pueden corregir o retirar comunicados directamente desde la app.

## v1.1.30 (14/01/2026)

- **Mejora en Listado Cuadrilla**: La lista de hermanos costaleros ahora se ordena automáticamente por número de trabajadera y luego por apellido, facilitando la visualización por palos.

## v1.1.29 (14/01/2026)

- **Hotfix de Permisos**: Restaurado el acceso total de Superadmin para la cuenta principal (`proyectoszipi@gmail.com`), asegurando que siempre tenga rol de gestión independientemente de si está vinculado a un costalero.

## v1.1.28 (14/01/2026)

- **Corrección de Enlaces de Email**: Los correos de autenticación ahora usarán siempre el dominio de producción si está configurado, evitando enlaces a `localhost` que fallan al abrirse desde dispositivos móviles.

## v1.1.27 (14/01/2026)

- **Mejora Recuperación**: Añadida detección detallada. El sistema diferencia entre "Email no autorizado" y "Email autorizado pero no registrado", guiando al usuario a registrarse si aún no lo ha hecho en lugar de enviar un correo fallido.

## v1.1.26 (14/01/2026)

- **Mejora UX Recuperación**: Ahora el sistema verifica si el email existe en la base de datos de la Hermandad antes de intentar enviar el correo de recuperación, dando feedback inmediato si no está registrado.

## v1.1.25 (14/01/2026)

- **Corrección Crítica**: Solucionado el problema con el enlace "¿Olvidaste tu contraseña?" que redirigía al login. Se han abierto las rutas de `/recuperar` y `/auth` en el middleware.

## v1.1.24 (14/01/2026)

- **Corrección de Logo 2.0**: Eliminados los artefactos visuales (bordes blancos superiores) para un fondo negro totalmente integrado.

## v1.1.23 (14/01/2026)

- **Corrección de Logo**: Actualización definitiva del escudo con fondo negro puro y eliminación de resplandores para el login.

## v1.1.22 (14/01/2026)

- **Actualización de Assets**: Sustituido el logo de la Hermandad por la versión oficial con fondo negro para mejor integración en el modo oscuro.

## v1.1.21 (14/01/2026)

- **Rediseño de Login**: Nueva pantalla de acceso estilo "Dark Mode" corporativo.
  - Escudo de la Hermandad integrado.
  - Colores corporativos (Verde Esmeralda/Negro).
  - UI modernizada con inputs oscuros y tipografía serif.

## v1.1.20 (14/01/2026)

- **Corrección UI**: Añadido enlace "Ajustes" (🔒) en el menú lateral para acceder a la gestión de contraseñas.

## v1.1.19 (14/01/2026)

- **Gestión de Contraseñas**: Nueva pantalla `/ajustes` para cambiar contraseña desde el dashboard.
- **Recuperar Contraseña**: Flujo completo de "Olvidé mi contraseña" desde el login con email de recuperación.
- **Nueva Contraseña**: Página para establecer nueva contraseña tras recibir el enlace de recuperación.
- **UX Mejorada**: Enlace visible en el login para recuperación de acceso.

## v1.1.18 (14/01/2026)

- **Centrado de Encabezados**: Unificación estética de todas las pantallas con títulos centrados y botones laterales equilibrados.
- **Consistencia Visual**: Estandarización de fondos (`#FAFAFA`) y tipografía `font-black` en toda la zona de administración.
- **UX Optimizada**: Mejor disposición de botones de acción en Relevos y Cuadrilla para evitar solapamientos en dispositivos móviles.

## v1.1.17 (14/01/2026)

- **Prevención de Duplicados en QR**: El escáner ahora comprueba si un costalero ya ha sido registrado antes de intentar guardarlo.
- **Feedback Mejorado**: Mostrará un mensaje informativo azul indicando el estado actual (ej: "Ya registrado - Estado: PRESENTE") en lugar de dar un error genérico.

## v1.1.16 (14/01/2026)

- **Sincronización Definitiva (v1.0.21 Legacy)**:
  - **Base de Datos**: Eliminada restricción `unique_asistencia` que impedía múltiples registros por día.
  - **Multi-Evento**: Ahora el sistema admite que un costalero tenga asistencias diferentes en varios eventos el mismo día.
  - **Estandarización**: Unificada toda la lógica de `Pendientes`, `Asistentes` y `Trabajaderas` para usar exclusivamente `evento_id` y `upsert`.
  - **Limpieza Automática**: Eliminados registros corruptos sin ID de evento.

## v1.1.03 (13/01/2026)

- **Corrección de Relevos**: Restaurada la funcionalidad de intercambio (swap) entre huecos que se había bloqueado por el modal.
- **Acceso a Reservas mejorado**: Añadido botón en la barra flotante para asignar/cambiar costaleros desde la reserva sin bloquear el swap.
- **Ajuste de Versión**: Corregido formato correlativo a dos dígitos.

- **Gestión de Relevos Táctica**: Implementado sistema de formación del paso por evento.
- **Intercambio Dinámico (Swap)**: Permite intercambiar o mover costaleros tocando sus posiciones.
- **Asignación Manual**: Modal de selección con filtros por trabajadera y búsqueda global.
- **Persistencia en Tiempo Real**: Los relevos se guardan por evento en la base de datos.
- **Feedback Visual**: Resaltado de selección activa y visualización táctica de las 7 trabajaderas.

## v1.0.29 (13/01/2026)

- **Mejora en Visibilidad Horaria**: Se ha añadido la hora de finalización de los eventos en las tarjetas de la agenda y en la sección de "Próximo Evento" del Dashboard.

## v1.0.28 (13/01/2026)

- **Corrección Horaria Crítica**: Solucionado el desfase de 1 hora al guardar eventos. Ahora se utiliza UTC ISO de forma estricta.
- **Dashboard Real**: Activada la sección de "Próximo Evento" con datos reales de la base de datos y estadísticas actualizadas.
- **Refuerzo de Color**: Intensificados los tonos pastel en las tarjetas de eventos para mejorar la visibilidad y el contraste.

## v1.0.27 (13/01/2026)

- **Estados Dinámicos Automáticos**: Los eventos cambian de estado (`Pendiente`, `En Curso`, `Finalizado`) automáticamente basándose en la hora actual.
- **Sincronización Inteligente**: La aplicación actualiza el estado en la base de datos de forma automática cuando detecta cambios de horario.
- **Diseño Pastel Suave**: Las tarjetas de eventos ahora lucen tonos pastel muy suaves según su estado, mejorando la legibilidad y estética.
- **Refresco en Tiempo Real**: Los estados se actualizan en el navegador cada minuto sin necesidad de recargar la página.

## v1.0.26 (13/01/2026)

- **Gestión Completa de Eventos**: Implementada la capacidad de editar y borrar eventos.
- **Borrado Inteligente**: Al eliminar un evento, se limpian automáticamente todas las asistencias asociadas de ese día para evitar residuos en la base de datos.
- **Página de Edición**: Nueva interfaz para modificar convocatorias existentes con carga de datos automática.

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
