# Historial de Cambios - iCuadrilla

## v1.4.0 (23/01/2026) - SECURITY RELEASE 🔒

- **Correcciones Críticas de Seguridad**:
  - **Email Hardcoded Eliminado**: Email de administrador maestro movido a variable de entorno `NEXT_PUBLIC_MASTER_EMAIL`
  - **Validación Zod Implementada**: Creados esquemas de validación para formularios de autenticación
    - Login: validación de email y contraseña mínima
    - Registro: validación robusta con requisitos de complejidad (mayúsculas, números, longitud mínima)
    - Mensajes de error visuales en formularios
  - **Autorización en Middleware**: Implementada verificación de roles antes de permitir acceso a rutas
    - Rutas admin-only: `/ajustes/roles`, `/temporadas`, `/cuadrilla`
    - Rutas admin/auxiliar: `/asistencia/scanner`
    - Redirección automática a dashboard si no tiene permisos

## v1.3.13 (22/01/2026)

- **Eliminación de Duplicación de Escudo**:
  - Eliminado el delay inicial en la animación del escudo para crear continuidad perfecta con el splash screen de la PWA.
  - El escudo del splash screen ahora "se transforma" directamente en el escudo animado sin duplicación visible.

## v1.3.12 (22/01/2026)

- **Solución Definitiva: Intro con Animaciones CSS Personalizadas**:
  - Eliminadas todas las dependencias de las clases de Tailwind para animaciones.
  - Implementadas animaciones @keyframes personalizadas con control total de timing.
  - Secuencia cinematográfica: Escudo (3s, delay 0.5s) → Texto (2.5s, delay 4s) → Botones (1.5s, delay 6.5s).
  - Asegurada la invisibilidad inicial con `opacity: 0` y animación `forwards`.

## v1.3.11 (22/01/2026)

- **Corrección Crítica: Pantalla Negra en Inicio**:
  - Eliminados conflictos entre clases de opacidad estáticas y animaciones dinámicas.
  - Asegurada la visibilidad de los elementos delegando el control total al motor de animaciones.
  - Ajustados los retardos secuenciales para mantener la elegancia sin comprometer la carga visual.

## v1.3.10 (22/01/2026)

- **Intro Cinematográfica Ultra-Lenta**:
  - Aumentado el tiempo de aparición del escudo a 3 segundos para una entrada majestuosa.
  - El texto permanece totalmente oculto hasta que el escudo se ha asentado (4.5s de delay).
  - Eliminado zoom-in y suavizada la entrada de textos para evitar cualquier efecto de rebote.
  - Asegurada la invisibilidad inicial mediante clases base `opacity-0`.

## v1.3.09 (22/01/2026)

- **Perfeccionamiento de Intro Cinematográfica**:
  - Ajustados los tiempos de animación para que el escudo sea el protagonista inicial.
  - Implementado un retraso mayor en la aparición de textos y botones para una entrada secuencial.
  - Eliminado el efecto "rebote" en los textos mediante suavizado `ease-in-out` y reducción de desplazamiento.

## v1.3.08 (22/01/2026)

- **Optimización de Iconografía e Inicio PWA**:
  - Simplificados los metadatos de iconos para evitar el "encogimiento" y fondos blancos no deseados en Android.
  - Asegurada la prioridad del escudo de la Hermandad como icono principal.
  - Verificada la correcta redirección post-login hacia el Dashboard.

## v1.3.07 (22/01/2026)

- **Corrección de Iconografía PWA**:
  - Reconfigurados los metadatos de iconos en `layout.tsx` y `manifest.json`.
  - Asegurada la visibilidad del escudo de la Hermandad en el icono de la aplicación para iOS y Android.
  - Añadido soporte explícito para `apple-touch-icon`.

## v1.3.06 (22/01/2026)

- **Corrección de Lógica de Redirección**:
  - Corregido el redireccionamiento post-login para ir directamente al Dashboard.
  - Refinada la entrada PWA para asegurar que la pantalla de bienvenida sea siempre el acceso inicial público.
  - Asegurado el flujo: Bienvenida -> Login -> Dashboard.

## v1.3.05 (22/01/2026)

- **Seguridad: Cierre por Inactividad**:
  - Implementado sistema de vigilancia que cierra la sesión automáticamente tras 10 minutos de inactividad.
  - Añadida pantalla de aviso de sesión caducada.

## v1.3.03 (22/01/2026)

- **Cierre de Sesión Profesional**:
  - Añadido el escudo de la hermandad a la pantalla de cierre de sesión.
  - Mejorado el sistema de redirección para evitar que la pantalla se quede bloqueada.
  - Añadido indicador visual de carga durante el proceso de salida.

## v1.3.02 (22/01/2026)

- **Pantalla de Inicio (Splash Screen) Premium**:
  - Cambiado el color de fondo de la pantalla de carga inicial de blanco a negro profundo.
  - Sincronización del color de tema para evitar el "destello blanco" al abrir la app desde el móvil.

## v1.3.01 (22/01/2026)

- **Eliminación de Saltos Visuales**:
  - Implementada cortinilla negra de seguridad durante el logout para ocultar cambios de layout.
  - Ajuste cinematográfico de la entrada: animaciones escalonadas y pausadas para una bienvenida fluida.

## v1.3.00 (22/01/2026)

- **Experiencia de Cierre de Sesión Premium**:
  - Implementada transición suave al cerrar sesión (delay de 300ms para permitir cierre de menú).
  - Rediseño de las animaciones de la pantalla de bienvenida para eliminar "saltos" y hacerlas más fluidas y elegantes.

## v1.2.99 (22/01/2026)

- **Acceso Democrático al Repertorio**:
  - El menú **Repertorio Musical** ya es visible para todos los usuarios (Costaleros e invitados).
  - Los costaleros pueden visualizar y descargar los archivos, pero no subirlos ni borrarlos.
  - Gestión restringida solo a administradores.

## v1.2.98 (22/01/2026)

- **Nueva Función: Repertorio Musical**:
  - Implementada base de datos y almacenamiento para partituras y listados.
  - Soporte para archivos PDF y Word.
  - Organización por temporadas y eventos.

## v1.2.97 (22/01/2026)

- **Extensión de Robustez Offline**:
  - Implementado soporte offline y caché en la página de **Detalle de Asistentes**.
  - Ahora todas las vistas de asistencia permiten trabajar sin conexión y sincronizan en segundo plano.

## v1.2.96 (22/01/2026)

- **Estabilidad Offline Crítica**:
  - Corregidos errores de red ("Failed to fetch") en el Sidebar y Dashboard al trabajar sin conexión.
  - Mayor robustez en la sincronización de asistencia.
  - Silenciados errores de red en segundo plano para una experiencia fluida.

## v1.2.95 (22/01/2026)

- **Escritura Offline y Sincronización**:
  - Añadida "Cola de Sincronización" para guardar cambios realizados sin conexión.
  - Sincronización automática en segundo plano al recuperar el internet.
  - Eliminado el error "Failed to fetch" al marcar asistencia offline.
  - Actualización inmediata del caché local tras cualquier cambio.

## v1.2.94 (22/01/2026)

- **Caché de Datos Offline**:
  - Implementado sistema de persistencia local (`localStorage`) para datos de la base de datos.
  - El Dashboard, la Agenda y la lista de Asistencias ahora son accesibles sin conexión tras la primera carga.
  - Optimización de caché de imágenes de Supabase para visualización offline.

## v1.2.93 (22/01/2026)

- **Mejora del Modo Offline**:
  - Actualización a `@ducanh2912/next-pwa` para mayor estabilidad y rendimiento en Next.js 14.
  - Implementación de una página de fallback ("Sin Conexión") personalizada.
  - Añadido un banner de estado de conexión en tiempo real en la parte superior.
  - Mejoras en el sistema de caché para permitir navegación básica sin internet.

## v1.2.92 (21/01/2026)

- **Ajuste UI Asistencia Manual**: Movido el indicador de "Suplemento" a la esquina inferior derecha y simplificado el texto (Cantidad + "cm").

## v1.2.91 (21/01/2026)

- **Mejora Asistencia Manual**: Ahora se muestra visualmente el "Suplemento" en la tarjeta del costalero si lo tiene asignado, facilitando la identificación de necesidades especiales en la igualá.

## v1.2.90 (21/01/2026)

- **Mejora Gestión de Relevos**: Actualizada la nomenclatura de puestos. Ahora se distingue entre "Patero" (Trabajaderas 1 y 7) y "Costero" (Trabajaderas intermedias), corrigiendo las validaciones de posición incorrectas.

## v1.2.89 (21/01/2026)

- **Rediseño Tablón de Anuncios**: Actualizada la estética del tablón de anuncios para coincidir con el diseño global de la app. Reemplazados los bloques negros por tarjetas blancas con sombras suaves, tipografía moderna y bordes redondeados, mejorando la legibilidad y coherencia visual.

## v1.2.88 (21/01/2026)

- **Corrección Bug WhatsApp**: Corregido el campo de ubicación en el mensaje de compartir WhatsApp. Ahora usa correctamente `ubicacion` en lugar de `lugar`, evitando que aparezca "undefined".

## v1.2.87 (21/01/2026)

- **Fix Build**: Añadida comprobación de nulidad para `evento` en el botón de compartir WhatsApp para resolver error de compilación TypeScript.

## v1.2.86 (21/01/2026)

- **Compartir WhatsApp Mejorado**: Mensaje de compartir eventos por WhatsApp ahora incluye toda la información del evento formateada profesionalmente con emojis: título, fecha completa (día de la semana), horario completo (inicio-fin), lugar, tipo, estado y descripción. Mucho más claro y visual para compartir eventos con la cuadrilla.

## v1.2.85 (21/01/2026)

- **Hotfix Scroll Button**: Ajuste final de posición del botón scroll-to-top a `bottom-52` (208px) para garantizar separación adecuada con todos los botones flotantes en diferentes páginas (eventos, relevos, etc.). Ahora el botón no interfiere con ningún elemento interactivo.

## v1.2.84 (21/01/2026)

- **Hotfix Scroll Button**: Ajustada nuevamente la posición del botón scroll-to-top (de `bottom-28` a `bottom-40`) para evitar solapamiento con botones flotantes de acción (FAB) como el de "Crear Evento" en la agenda. Ahora hay suficiente separación vertical entre ambos elementos.

## v1.2.83 (21/01/2026)

- **Hotfix Scroll Button**: Ajustada la posición del botón scroll-to-top (de `bottom-20` a `bottom-28`) para evitar solapamiento con la barra de navegación inferior. Ahora el botón tiene suficiente espacio y no interfiere con otros elementos flotantes.

## v1.2.82 (20/01/2026)

- **UX Global**: Añadido botón flotante "Scroll to Top" en todas las páginas. Aparece discretamente al hacer scroll hacia abajo (después de 300px) y permite volver al inicio con un solo clic. Diseño minimalista que no entorpece la navegación.

## v1.2.81 (20/01/2026)

- **Fix Build**: Añadido el campo `qr_code` faltante a la interfaz TypeScript de `Costalero` en exportaciones para resolver error de compilación.

## v1.2.80 (20/01/2026)

- **Hotfix Crítico QR**: Corregido error crítico en la exportación de códigos QR. Ahora se usa el campo `qr_code` (único y permanente del costalero) en lugar del `id`. Los QR exportados ahora coinciden exactamente con los QR de las fichas de los costaleros y son reconocidos correctamente por el escáner.

## v1.2.79 (20/01/2026)

- **Hotfix QR Codes**: Incrementado significativamente el tamaño y calidad de los códigos QR exportados (de 35mm a 50mm, resolución de 200px a 400px). Añadido nivel máximo de corrección de errores (H) para garantizar el escaneo correcto incluso con impresiones de menor calidad. Los QR ahora se reconocen perfectamente al escanearlos.

## v1.2.78 (20/01/2026)

- **Exportación de Códigos QR**: Nueva funcionalidad para exportar todos los códigos QR de la cuadrilla en un PDF organizado por trabajaderas. Los códigos QR están correctamente espaciados en una cuadrícula de 2 columnas con nombre y puesto de cada costalero debajo del QR. Perfecto para imprimir y usar en eventos. Archivo generado: `codigos_qr_cuadrilla_DD_MM_YYYY.pdf`

## v1.2.77 (20/01/2026)

- **Exportación Individual Mejorada**: Las exportaciones individuales ahora también usan formato Excel (.xlsx) con la misma estructura de hojas que la exportación global. Nombres de archivo actualizados al formato `estadistica_[Evento]_[Año].xlsx/pdf` para mejor organización.

## v1.2.76 (20/01/2026)

- **Exportación Excel Multi-Hoja**: Implementada exportación global en formato Excel (.xlsx) real. Ahora cada evento ocupa una **hoja separada** dentro del archivo, con el título del evento como nombre de la hoja. Esto facilita enormemente la navegación y análisis de datos en Excel/Google Sheets.

## v1.2.75 (20/01/2026)

- **UX Exportación**: Cambiado el formato de fecha en nombres de archivo. Ahora se usa formato legible DD_MM_YYYY (ej: `estadistica_global_20_01_2026.csv`) en lugar del formato compacto anterior.

## v1.2.74 (20/01/2026)

- **Exportación Global Mejorada**: Refinado el formato de las estadísticas globales. Cada evento ahora aparece claramente separado con su título destacado (=== TÍTULO ===), facilitando la lectura del CSV. El archivo descargado se nombra `estadistica_global_YYYYMMDD.csv` incluyendo la fecha de exportación.

## v1.2.73 (20/01/2026)

- **Hotfix Exportación PC**: Solucionado problema donde Windows 10/11 mostraba el diálogo de compartir incluso en PC. Ahora la descarga es **directa y automática** en ordenadores, sin diálogos intermedios. En móviles se mantiene el menú de compartir.

## v1.2.71 (20/01/2026)

- **UI Dashboard**: Alineada perfectamente la campana de notificaciones con el botón de menú. Ahora ambos elementos guardan la misma altura y separación, restaurando la simetría del encabezado.

## v1.2.70 (20/01/2026)

- **Mejora Móvil (Compartir)**: Al descargar informes desde el móvil, ahora se abrirá automáticamente el menú nativo de "Compartir". Esto te permite enviar los CSV/PDF directamente por WhatsApp, Telegram, Email o guardarlos en "Archivos" de forma mucho más fácil.

## v1.2.69 (20/01/2026)

- **Hotfix Exportación**: Solucionado un error crítico que impedía la carga de la pantalla de exportación debido a una variable de estado faltante.

## v1.2.68 (20/01/2026)

- **Exportación Flexible**: Ahora puedes elegir. Hemos añadido dos modos de exportación de estadísticas:
  - **Global**: Descarga toda la actividad de la temporada de una sola vez.
  - **Individual**: Selecciona un evento específico del desplegable y descarga solo su informe.

## v1.1.97 (16/01/2026)

- **UI Relevos**: Integrado el suplemento por defecto del costalero. Si un hermano está en su trabajadera habitual, ahora también se muestra su suplemento base automáticamente.

## v1.2.67 (20/01/2026)

- **Corrección Exportación**: Se ha añadido el filtro por temporada activa en la pantalla de Exportación. Ahora solo verás y exportarás los eventos y estadísticas correspondientes a la temporada actual (ej. 2026), ocultando los datos históricos de años anteriores.

## v1.2.66 (20/01/2026)

- **UI Mediciones**: Centrado el encabezado en la pantalla de mediciones de eventos.
- **UI Cuadrilla**: Añadido botón de retorno en el listado de cuadrilla para facilitar la navegación.

## v1.2.65 (20/01/2026)

- **UI Standardization**: Todos los encabezados de la aplicación han sido centralizados para una mayor coherencia visual.
- **Navegación**: Se han añadido flechas de "Volver" en páginas donde faltaban (como Anuncios, Estadísticas y Altas), mejorando la navegabilidad.

## v1.2.64 (20/01/2026)

- **Rediseño Registro**: La página de "Crear Cuenta" ha sido rediseñada completamente para compartir la estética premium y oscura de la pantalla de inicio de sesión, manteniendo la coherencia visual en todo el flujo de autenticación.

## v1.2.63 (20/01/2026)

- **UI Fix**: Eliminado el borde blanco (overscroll) que aparecía al deslizar la pantalla de bienvenida en móviles. Ahora el fondo se mantiene negro sólido en todo momento, mejorando la sensación de app nativa.

## v1.2.62 (20/01/2026)

- **Mejora Comercial**: Cambiado el flujo de cierre de sesión. Ahora, al salir de la aplicación, el usuario es redirigido a la **Página de Bienvenida** en lugar del login, mostrando la pantalla comercial e imagen de la hermandad.

## v1.2.61 (20/01/2026)

- **Corrección de Roles**: Solucionado un problema por el que el menú lateral no se actualizaba correctamente al iniciar sesión como Administrador. Ahora los permisos se recalculan automáticamente en tiempo real.

## v1.2.60 (20/01/2026)

- **UI Dashboard**: Extendida la interactividad de los puntos indicadores (dots) también al carrusel de **Avisos Recientes**. Ahora ambos deslizadores responden al movimiento.

## v1.2.59 (20/01/2026)

- **UI Dashboard**: Los puntos indicadores de paginación en el carrusel de eventos ahora son **interactivos y dinámicos**. Al deslizar las tarjetas, el punto activo cambia automáticamente para reflejar la posición actual.

## v1.2.58 (20/01/2026)

- **UI Dashboard**: Eliminada la etiqueta del tipo de evento (ej: "Ensayo") de la tarjeta para simplificar la vista. Se ha puesto en **negrita** la hora de fin para igualarla visualmente con la hora de inicio.

## v1.2.57 (20/01/2026)

- **UI Dashboard**: Ajuste fino en tarjeta de eventos. Movido el horario al pie de la tarjeta, mostrando ahora **Inicio - Fin** (ej: 21:00 - 23:30) para mayor claridad.

## v1.2.56 (20/01/2026)

- **UI Dashboard**: Rediseñadas las tarjetas de próximos eventos. Ahora muestran la hora directamente en la cabecera y el estado ("Pendiente") estructurado bajo el icono del reloj.

## v1.2.55 (20/01/2026)

- **Agenda Inteligente**: Mejorada la ordenación de los eventos. Ahora los eventos **Pendientes y En Curso** aparecen siempre arriba (ordenados por fecha más próxima), mientras que los **Finalizados** se mueven automáticamente al final de la lista.

## v1.2.54 (20/01/2026)

- **Permisos Cuadrilla**: Ahora todos los costaleros pueden ver el listado completo de la cuadrilla (no solo su propio perfil).
- **Seguridad**: Se ha restringido el botón de "Alta de Costalero" y "Editar Información" exclusivamente a los Administradores y Capataces. Los costaleros no pueden añadir nuevos miembros ni modificar datos de otros.

## v1.2.53 (20/01/2026)

- **Seguridad**: Restringido el acceso a la creación y cambio de temporadas. Si un costalero accede a la página de temporadas, solo verá el historial pero no tendrá los controles para crear o activar nuevas temporadas.

## v1.2.52 (19/01/2026)

- **Feature Aniversarios**: Añadida notificación automática para los costaleros que cumplen **50 años** en la cuadrilla. Se une a la ya existente de los 25 años.

## v1.2.51 (19/01/2026)

- **Mantenimiento**: Ejecutada corrección de datos en base de datos. Se han restaurado y asignado correctamente los eventos antiguos de 2025 que habían quedado huérfanos tras la actualización de temporadas.

## v1.2.50 (19/01/2026)

- **UI Global**: Corregidos los textos de "Temporada 2025" que aparecían fijos en el Dashboard y la Agenda. Ahora muestran automáticamente el nombre de la temporada que esté activa (2026, 2027, etc.).

## v1.2.49 (19/01/2026)

- **Fix Eventos**: Ahora la agenda de eventos filtra correctamente por la **temporada activa**. Los eventos antiguos o de otros años ya no se mezclan en la vista principal. Al crear eventos nuevos, se asignan automáticamente a la temporada actual.

## v1.2.48 (19/01/2026)

- **UX Sidebar**: El selector de "Temporada" del menú lateral ahora es funcional. Permite ver cuál está activa y cambiar a otras temporadas creadas rápidamente (con confirmación), sin tener que ir a ajustes.

## v1.2.47 (19/01/2026)

- **UI Eventos**: Eliminados los botones de selección de tipo ("Ensayo", "Igualá", etc.) del formulario de creación de eventos, para simplificar la interfaz.

## v1.2.46 (19/01/2026)

- **Lógica Temporadas**: Implementada la migración automática de datos al crear una nueva temporada. Ahora, al activarla, se copian automáticamente los datos del 'Perfil de Palio' (alturas de trabajaderas) de la temporada anterior. Confirmado que el listado de costaleros se mantiene global.

## v1.2.45 (19/01/2026)

- **UI Temporadas**: Rediseñada por completo la página de Gestión de Temporadas. Ahora sigue la estética visual del resto de la aplicación (fondo blanco, tarjetas con sombras suaves, tipografía bold).
- **Mejora UX**: Añadido botón rápido para "Activar" temporadas antiguas desde el historial.

## v1.2.44 (19/01/2026)

- **Mejora Datos Palio**: Implementada confirmación de seguridad per-input (al perder foco) y arreglado el botón "Guardar Todo". Si no hay temporada activa, ahora muestra un mensaje de error claro en lugar de no hacer nada.

## v1.2.43 (19/01/2026)

- **Mejora Mediciones**: Añadida confirmación de seguridad en inputs. Ahora, al cambiar un valor y salir del campo (perder foco), se pide confirmación explícita para guardar esa medición individualmente en la base de datos.

## v1.2.42 (19/01/2026)

- **Nueva Función Eventos**: Implementada la sección 'Mediciones' dentro de cada ensayo/evento. Permite registrar las alturas del costal 'Pre' y 'Post' ensayo para cada costalero, ordenados por trabajadera.

## v1.2.41 (19/01/2026)

- **UI Datos Palio**: Rediseñado el botón de guardar para que aparezca al final del formulario (inline) en lugar de fijo abajo. Esto mejora la experiencia de uso y evita conflictos visuales con la navegación.

## v1.2.40 (19/01/2026)

- **Fix UI Datos Palio**: Se ha asegurado la visibilidad del boton de guardar datos, que ahora aparece fijo en la parte inferior con mayor prioridad visual (z-index) y un fondo degradado para evitar superposiciones.

## v1.2.39 (18/01/2026)

- **Mejora Datos Palio**: Mejora en la confirmación de guardado, indicando explícitamente la temporada a la que corresponden los datos.

## v1.2.38 (18/01/2026)

- **Nueva Seccion**: Implementada la pagina 'Datos Palio' con perfil de alturas de trabajaderas. Incluye grafico de linea SVG para visualizar el perfil, inputs editables para cada trabajadera (T1-T7), calculo automatico de diferencias entre trabajaderas, y guardado por temporada.

## v1.2.37 (18/01/2026)

- **Mejora Visual Relevos**: Las posiciones de relevo ahora muestran el color de asistencia del costalero asignado (verde=presente, naranja=justificado, rojo=ausente). Ademas, si el costalero esta fuera de posicion o trabajadera, la tarjeta tiene un efecto flotante y un indicador de alerta naranja.

## v1.2.36 (18/01/2026)

- **Mejora Relevos**: Al activar "Otras trabajaderas", ahora los costaleros se ordenan por trabajadera (1 a 7) y luego alfabeticamente por apellidos. Esto facilita encontrar cualquier costalero de la cuadrilla.

## v1.2.35 (18/01/2026)

- **Mejora Relevos**: Ahora se muestran TODOS los costaleros de la trabajadera en la lista de seleccion (no solo los presentes). Los costaleros aparecen con borde de color segun su estado de asistencia: verde (presente), naranja (justificado), rojo (ausente), gris (pendiente). Esto permite planificar relevos con antelacion antes del evento.

## v1.2.34 (18/01/2026)

- **Bugfix Critico**: Corregido el fallo de independencia de eventos en la gestion de relevos. Ahora la asistencia se filtra por `evento_id` en lugar de por fecha, asegurando que cada evento tiene su propia lista de costaleros elegibles totalmente independiente.

## v1.2.33 (17/01/2026)

- **Bugfix**: Segundo intento de correccion de encoding CSV. Ahora se usan bytes explicitos para el BOM (EF BB BF) y TextEncoder para garantizar UTF-8.

## v1.2.32 (17/01/2026)

- **Bugfix**: Corregida la codificacion de caracteres especiales (tildes, Ñ) en la exportacion CSV. Ahora se utiliza UTF-8 con BOM para garantizar compatibilidad con Excel.

## v1.2.31 (17/01/2026)

- **Mejora Exportacion**: Enriquecida la exportacion de estadisticas. Ahora incluye datos detallados por evento: nombre, apellidos, trabajadera, puesto, suplemento y estado de cada costalero. Ademas, se ha anadido un encabezado destacado con el nombre del evento, estado, fecha y hora.

## v1.2.30 (17/01/2026)

- **Bugfix**: Corregida la exportación a PDF en el Centro de Exportación. Se ha actualizado la forma de importar `jspdf-autotable` para compatibilidad con el entorno de producción.

## v1.2.29 (17/01/2026)

- **Nueva Funcionalidad**: Implementado el Centro de Exportación de Datos (`/exportar`). Permite descargar el listado de costaleros de la temporada activa y las estadísticas de asistencia de todos los eventos en formato CSV (compatible con Excel/Google Sheets) o PDF.

## v1.2.28 (17/01/2026)

- **UI Refinamiento**: Rediseñada la alerta de costaleros pendientes con un estilo más sobrio y premium. El badge ahora usa texto blanco sobre fondo negro, y el efecto de pulsación de la tarjeta cicla entre negro y gris oscuro.

## v1.2.27 (17/01/2026)

- **UI Refinamiento**: Ajustada la posición del punto de alerta flotante en las tarjetas de costaleros pendientes para mejorar el equilibrio visual.

## v1.2.26 (17/01/2026)

- **UI Registro Manual**: Implementadas alertas visuales de alta visibilidad para costaleros pendientes. Ahora las tarjetas sin registrar pulsan con un resplandor ámbar, incluyen un punto de alerta flotante y el distintivo "PENDIENTE" animado para asegurar que ningún miembro sea ignorado.

## v1.2.25 (17/01/2026)

- **UI Refinamiento**: Renombrado botones en el detalle del evento para mayor claridad: "ESCANEAR NUEVOS" pasa a ser "ESCANEAR ASISTENCIA" y "VER POR TRABAJADERAS" ahora es "ASISTENCIA MANUAL".

## v1.2.24 (17/01/2026)

- **Hotfix**: Corregido error de compilación en Vercel causado por una referencia inexistente a un icono de Lucide ('ListCircle').

## v1.2.23 (17/01/2026)

- **UI Registro**: Implementado un modal de éxito premium tras dar de alta un costalero. Incluye el código QR, opciones para realizar otra alta o navegar directamente al listado de la cuadrilla.

## v1.2.22 (17/01/2026)

- **Seguridad**: Corregido error de RLS que impedía a los usuarios con rol "Auxiliar" dar de alta nuevos costaleros. Se han unificado los permisos de gestión para todo el equipo de staff (Capataces y Auxiliares).

## v1.2.21 (17/01/2026)

- **Performance Estadísticas**: Implementado refresco automático de datos cada 30 segundos en el panel de estadísticas detalladas. Esto permite ver la llegada de los costaleros en tiempo real sin tener que recargar la página manualmente.

## v1.2.20 (17/01/2026)

- **Feedback de Usuario**: Ahora el costalero puede ver si su notificación de ausencia ha sido leída por el staff. El mensaje "RESPUESTA ENVIADA" cambia a "RESPUESTA LEÍDA" (en color esmeralda) una vez que se marca como leída en el centro de notificaciones.

## v1.2.19 (17/01/2026)

- **Notificaciones**: Añadido el nombre del costalero al título de las notificaciones de ausencia. Ahora el equipo de staff puede identificar rápidamente quién ha enviado la falta desde la lista de notificaciones.

## v1.2.18 (17/01/2026)

- **Corrección Lógica**: Corregido el contador de asistencia por trabajadera. Ahora solo los hermanos marcados como "Presente" cuentan en el indicador numérico (ej: 5 de 7), excluyendo las ausencias justificadas del conteo de presencia real.

## v1.2.17 (17/01/2026)

- **UI Estadísticas**: Implementado orden personalizado en los bocadillos de trabajadera. Ahora aparecen primero los Presentes, luego los Ausentes y por último los Justificados, manteniendo el orden alfabético dentro de cada grupo.

## v1.2.16 (17/01/2026)

- **UI Estadísticas**: Mejorada la legibilidad de los bocadillos de costaleros. Aumentado el tamaño de fuente y unificado el color de texto a negro para mayor contraste sobre los colores de fondo.

## v1.2.15 (17/01/2026)

- **Interactividad**: Añadida la posibilidad de expandir cada trabajadera en las estadísticas. Ahora puedes ver quién está en cada fila, su posición y su estado mediante bocadillos visuales horizontales.

## v1.2.14 (17/01/2026)

- **Terminología**: Cambiado el término "Fila" por "Trabajadera" en la sección de Estadísticas Detalladas para mantener la consistencia en toda la app.

## v1.2.13 (17/01/2026)

- **UI/UX Refactor**: Reubicado el Dashboard de Estadísticas Visuales a una sección propia llamada "Estadísticas Detalladas" para mantener el detalle del evento organizado y limpio.

## v1.2.12 (17/01/2026)

- **Nueva Función**: Dashboard Visual de Estadísticas en el detalle de eventos. Incluye barra de progreso global, mensajes predictivos de llegada ("Faltan X costaleros") y un mapa visual de asistencia por trabajaderas (las 7 filas).

## v1.2.11 (17/01/2026)

- **Filtros**: Corregida la lista de Trabajaderas en eventos. Ahora se filtra correctamente al personal técnico (Capataces y Auxiliares), mostrando únicamente a los costaleros.

## v1.2.10 (17/01/2026)

- **UI/UX**: Corregido el color de la etiqueta "JUSTIFICADA" en la vista por Trabajaderas. Ahora se muestra correctamente en naranja independientemente del género.

## v1.2.09 (17/01/2026)

- **UI/UX**: Añadido botón de retroceso en el Escáner de Asistencia para facilitar la navegación.

## v1.2.08 (17/01/2026)

- **Corrección de Errores**: Mejorada la inicialización de la cámara en el Escáner de Asistencia. Añadido botón de reintento y lógica más robusta para evitar el "cuadro negro" en dispositivos móviles.

## v1.2.07 (17/01/2026)

- **Seguridad**: Corregido el acceso al Escáner de Asistencia. Ahora los Capataces y Administradores tienen acceso correcto a la función, restringiéndola únicamente a costaleros base.

## v1.2.06 (17/01/2026)

- **UI Agenda**: Corregida la navegación del acordeón. Ahora al tocar la tarjeta se expande para ver las observaciones, y la entrada al evento se realiza mediante el nuevo botón "Entrar al Evento" dentro del detalle expandido.

## v1.2.05 (17/01/2026)

- **UI Agenda**: Implementada la función de acordeón en las tarjetas de eventos. Ahora se pueden ver las observaciones/descripciones directamente desde la agenda expandiendo la tarjeta.
- **UX**: Añadido acceso directo "Entrar al Evento" dentro de la vista expandida.

## v1.2.04 (17/01/2026)

- **PWA Standalone**: Restaurado el comportamiento de "App nativa". Se han añadido los meta-tags necesarios para iPhone y Android y sincronizado los colores del manifest con el nuevo verde corporativo.

## v1.2.03 (17/01/2026)

- **Gestión de Roles**: Restaurado el acceso a la sección de Gestión de Roles para Superadmins dentro del panel de Ajustes.
- **Seguridad**: Reforzada la protección de rutas administrativas.

## v1.2.02 (16/01/2026)

- **UI Relevos**: Cambiado el nombre por defecto del primer relevo generado automáticamente de "Relevo 1" a "Salida".

## v1.2.01 (16/01/2026)

- **UI Relevos**: Optimización de la visibilidad de los nombres. Se ha aumentado de nuevo la altura de los huecos y ajustado el diseño para garantizar que los nombres y los suplementos se vean sin cortes.

## v1.2.00 (16/01/2026)

- **Corrección Crítica (Base de Datos)**: Eliminada una restricción de unicidad que impedía tener formaciones independientes por relevo. Ahora cada relevo ("Muda") puede tener su propio listado de costaleros sin interferir con los demás.
- **Gestión de Relevos**: Refactorizada la lógica de intercambio y movimiento de costaleros para evitar duplicados y asegurar la sincronización en tiempo real.
- **Estabilidad**: Corregido el error visual en la Trabajadera 7 donde los nombres "bailaban" o no se guardaban correctamente.

## v1.1.99 (16/01/2026)

- **Corrección Crítica**: Filtrado estricto de roles en eventos. Se ha corregido el error por el cual los usuarios con rol "Auxiliar" aparecían erróneamente en los listados de costaleros, asistencias y relevos.
- **Estadísticas**: Actualizado el cálculo de estadísticas de eventos para contar únicamente a los hermanos costaleros activos.

## v1.1.98 (16/01/2026)

- **UI Relevos**: Corregido el problema de visibilidad de nombres. Se ha aumentado el espacio de los huecos y mejorado el contraste del texto para asegurar que los nombres sean siempre legibles.
- **Visual Improvement**: Ajustado el tamaño y disposición de las celdas de la cuadrícula táctica.

## v1.1.96 (16/01/2026)

- **UI Relevos**: Restaurada la etiqueta de puesto del costalero sin el prefijo "Hab:".
- **Mejora Visual**: Optimizada la disposición de etiquetas para mayor claridad.

## v1.1.95 (16/01/2026)

- **UI Relevos**: Eliminada la etiqueta de puesto habitual ("Hab") a petición del usuario para simplificar el diseño.

## v1.1.94 (16/01/2026)

- **UI Relevos**: Añadida la visualización del puesto habitual ("Hab") del costalero en la esquina superior derecha de cada hueco.
- **Mejora Visual**: Ajustada la disposición de etiquetas de suplemento y puesto para mejor legibilidad.

## v1.1.93 (16/01/2026)

- **Fix Build**: Corregido error de tipos que bloqueaba el despliegue en Vercel.
- **UI Relevos**: Garantizada la prioridad del color naranja para costaleros en trabajadera distinta.

## v1.1.92 (16/01/2026)

- **Prioridad de Colores**: Reajustada la jerarquía de alertas visuales. Ahora el color naranja (cambio de trabajadera) tiene prioridad absoluta sobre el rojo para evitar confusiones.

## v1.1.91 (16/01/2026)

- **Corrección de Colores**: Asegurado el resaltado en naranja para cambios de trabajadera en todas las posiciones.
- **Validación Flexible**: El sistema ahora reconoce correctamente los puestos (ej: "Patero" en "Patero Izq") para evitar falsos positivos en rojo.

## v1.1.90 (16/01/2026)

- **Bug Fix**: Corregido error de tipos en relevos que afectaba al filtrado de costaleros.
- **Gstión de Relevos**: Activado el resaltado en naranja y visualización de suplementos para todas las posiciones de la trabajadera.

## v1.1.89 (16/01/2026)

- **Gstión de Relevos**: Implementados suplementos específicos por asignación. Ahora se puede indicar una medida en cm al asignar un costalero.
- **Alertas Visuales**: Añadido color naranja pastel para costaleros que trabajan en una trabajadera distinta a la suya habitual.
- **Base de Datos**: Actualizado esquema para soportar suplementos en relevos.

## v1.1.88 (16/01/2026)

- **Corrección de Búsqueda**: Reescrito el motor de filtrado de costaleros para asegurar que la búsqueda en otras trabajaderas funcione al 100%.
- **UI Legibilidad**: Completada la migración de textos grises a negro/neutral-900 para una visibilidad perfecta.

## v1.1.87 (16/01/2026)

- **Mejora de Selección**: Corregida la lógica de búsqueda en otras trabajaderas para mostrar todos los costaleros disponibles correctamente.
- **UI Legibilidad**: Cambiados textos grises por negro/neutral-900 para mejorar el contraste y la visibilidad en toda la página de relevos.

## v1.1.86 (16/01/2026)

- **Corrección de Error**: Solucionado error de validación "expected string, received null" en el campo de email al editar costaleros.
- **Formulario Mejorado**: El formulario ahora maneja correctamente los campos vacíos provenientes de la base de datos.

## v1.1.85 (16/01/2026)

- **Corrección de Formulario**: El campo de email ahora es opcional en la edición de costaleros, permitiendo guardar cambios sin necesidad de correo electrónico.

## v1.1.84 (16/01/2026)

- **Bug Fix**: Corregido error de sintaxis en la página de relevos que impedía la carga correcta de la cuadrícula táctica.
- **Gstión de Relevos**: Refinada la validación de puestos con resaltado en rojo pastel.

## v1.1.83 (16/01/2026)

- **Gstión de Relevos**: Implementada validación visual de posición. Los costaleros que no estén en su puesto habitual se resaltan en rojo pastel para una gestión más intuitiva.

## v1.1.82 (16/01/2026)

- **UI Consistencia**: Aplicado el fondo verde pastel (`bg-background`) a todas las páginas de gestión de eventos, asistentes, relevos y escaneo QR para una experiencia visual uniforme.

## v1.1.81 (16/01/2026)

- **Corrección de Permisos**: Restaurados los botones de Gestión de Relevos, Escaneo QR y Mediciones para Superadmins, Capataces y Auxiliares.
- **UI Eventos**: Refinada la visibilidad del botón de notificar ausencia para que solo aparezca a usuarios con rol exclusivo de costalero.

## v1.1.80 (16/01/2026)

- **Bug Fix**: Corregida la visualización del suplemento en la edición del costalero. Ahora los valores numéricos se formatean correctamente para coincidir con el desplegable (ej: 3 -> "3.0").

## v1.1.79 (16/01/2026)

- **UI Formularios**: Invertidos los colores de los formularios de costaleros (fondo blanco, texto negro).
- **Legibilidad**: Mejora significativa del contraste en las pantallas de Alta y Edición sobre el fondo verde pastel.
- **Header**: Ajustados los colores de cabecera en la edición de costaleros para mayor claridad.

## v1.1.78 (16/01/2026)

- **UI Global**: Cambiado el color de fondo de toda la aplicación a un verde pastel suave.
- **Visual**: Reemplazados los fondos blancos y grises neutros por una estética más orgánica y relajada.

## v1.1.77 (16/01/2026)

- **UI Cuadrilla**: Implementados "Sticky Headers" (encabezados fijos) para cada trabajadera.
- **Navegación**: Los costaleros ahora aparecen agrupados por trabajadera y el encabezado se mantiene fijo al hacer scroll para mejorar la usabilidad.

## v1.1.76 (16/01/2026)

- **Layout**: Restaurada la barra de navegación (bocadillo) en las secciones internas de la aplicación.
- **Identidad**: El menú solo se mantiene oculto en la Landing Page, Login y Registro para un diseño más limpio en la entrada.

## v1.1.75 (16/01/2026)

- **Layout**: Eliminada la barra de navegación (bocadillo) de la Landing Page.
- **Bugfix**: Corregida la zona blanca inferior mediante la eliminación de padding estático y aplicación de fondo negro global.
- **Optimización**: Gestión dinámica del espacio inferior según la visibilidad del menú.

## v1.1.74 (16/01/2026)

- **UI Premium**: Refinado el fundido del logo en la Landing Page mediante máscara radial dinámica.
- **Visual**: Eliminados los bordes cuadrados visibles para una integración perfecta y profesional del escudo.

## v1.1.73 (16/01/2026)

- **UI Premium**: Rediseño completo de la Landing Page con estética "Dark Mode" y verde esmeralda.
- **Identidad**: Incorporación del logo oficial de la hermandad con efectos de iluminación.
- **Bugfix**: Corregida visibilidad del enlace de registro (hover invisible).

## v1.1.72 (16/01/2026)

- **DB**: Actualizada la restricción de roles para incluir 'superadmin'.
- **Gestión**: Confirmada la exclusión definitiva del Superadmin de los listados de cuadrilla y estadísticas.

## v1.1.71 (16/01/2026)

- **Gestión**: Corregida exclusión del Superadmin en el listado de cuadrilla mediante actualización de rol en la base de datos.

## v1.1.70 (16/01/2026)

- **Seguridad**: Corregidos permisos de acceso (RLS) para el Staff.
- **UI Cuadrilla**: Restaurado el acceso al listado de costaleros para Capataces y Auxiliares mediante nuevas políticas de seguridad en la base de datos.

## v1.1.69 (16/01/2026)

- **Gestión**: Separación lógica de Staff y Cuadrilla activa.
- **UI Cuadrilla**: El listado de "La Cuadrilla" ahora solo muestra a los miembros con el rol de Costalero.
- **Dashboard**: El contador de "Total Costaleros" se ha ajustado para reflejar únicamente a los costaleros de a pie, excluyendo al Staff (superadmin, capataces y auxiliares).

## v1.1.68 (16/01/2026)

- **UI Diseño**: Rediseño premium de los botones de retroceso (Back Buttons).
- **UI Diseño**: Sustituido icono de Chevron por Flecha dinámica con micro-animaciones al pasar el ratón y respuesta táctil al pulsar.

## v1.1.67 (15/01/2026)

- **UI Dashboard**: Homogeneizado el estilo de las etiquetas de rol (Superadmin, Capataz, Auxiliar) para que todas usen el mismo diseño premium de la aplicación.

## v1.1.66 (15/01/2026)

- **UI Dashboard**: Actualizada la etiqueta de rol para mostrar específicamente "CAPATAZ" o "AUXILIAR" cuando corresponda, eliminando la etiqueta genérica de "ADMIN + COSTALERO" para estos casos.

## v1.1.65 (15/01/2026)

- **UI Eventos**: Revertido el botón de creación de eventos a su diseño original (botón flotante circular FAB).
- **Gestión de Roles**: Añadida confirmación antes de aplicar cambios de rol para mayor seguridad.
- **Gestión de Roles**: Refinada la interfaz para mostrar claramente el rol activo actual.

## v1.1.64 (15/01/2026)

- **Seguridad**: Excluido el Superadmin (`proyectoszipi@gmail.com`) de la lista de gestión de roles para evitar cambios accidentales en la cuenta maestra.

## v1.1.63 (15/01/2026)

- **Gestión de Roles**: Implementado sistema avanzado de roles (Costalero, Capataz, Auxiliar).
- **Permisos**: Los Capataces y Auxiliares ahora pueden crear, editar y borrar eventos y anuncios.
- **Seguridad**: La gestión de temporadas y el cambio de roles sigue siendo exclusivo del Superadmin (`proyectoszipi@gmail.com`).
- **UI**: Añadida nueva página "Gestión de Roles" en el panel de Ajustes para el Superadmin.

## v1.1.62 (15/01/2026)

- **Notificaciones**: Optimizada la carga inicial para que los avisos de aniversario aparezcan **al instante** tras el login, sin necesidad de recargar la página. Se ha reordenado la lógica de generación antes del conteo del icono de la campana.

## v1.1.61 (15/01/2026)

- **Notificaciones**: Reparada la lógica del Dashboard que impedía la carga correcta de avisos de aniversario al inicio. Ahora el sistema espera a que los roles del usuario se resuelvan antes de procesar las notificaciones.
- **Sincronización**: Mejorada la persistencia de avisos de aniversario para asegurar su restauración si han sido eliminados por error.

## v1.1.60 (15/01/2026)

- **Roles**: Restaurada la etiqueta de **SUPERADMIN** para la cuenta maestra, asegurando que mantenga su estatus visual previo mientras conserva la nueva lógica de notificaciones independientes.
- **Detección de Roles**: Mejorada la jerarquía de roles en el hook `useUserRole` para evitar conflictos entre perfiles de administrador y costalero.

## v1.1.59 (15/01/2026)

- **Corrección en Notificaciones**: Se ha ajustado la lógica de regeneración de avisos de aniversario para que solo se vuelvan a crear para el rol que los ha borrado, evitando interferencias entre Administradores y Costaleros.
- **Mejora de Roles**: Perfeccionada la detección de perfiles Administrador/Capataz para usuarios que no están en la tabla de costaleros.
- **Sincronización UI**: El borrado individual de notificaciones ahora actualiza correctamente los contadores en toda la aplicación.

## v1.1.58 (15/01/2026)

- **Roles y Notificaciones**: Implementación de soporte para **Roles Duales**. Ahora los usuarios pueden ser identificados como Administradores y Costaleros simultáneamente.
- **Independencia Real**: El borrado de una notificación en el perfil de costalero no afecta a su visibilidad en el perfil de administrador, permitiendo una gestión 100% independiente para usuarios con ambos roles.
- **Mejora UI**: Añadidos indicadores en la lista de notificaciones para distinguir el destinatario (Admin/Costalero) para usuarios con roles duales.

## v1.1.57 (15/01/2026)

- **Notificaciones**: Ahora el estado de "leído" y el borrado de notificaciones de aniversario es independiente para costaleros y administradores. Si un costalero la marca como leída o la borra, los administradores seguirán viéndola en su propio centro de mando hasta que ellos también la gestionen.

## v1.1.56 (15/01/2026)

- **Lógica de Aniversarios**: Se ha restringido la generación automática de notificaciones de 25 años al periodo comprendido entre el 2 de enero y el 1 de mayo de cada año. Si se borra la notificación fuera de este periodo, no se volverá a generar hasta el año siguiente.

## v1.1.55 (15/01/2026)

- **Corrección de Errores**:
  - Corregido error que causaba pantalla en blanco para costaleros en notificaciones.
  - Corregido error visual que mostraba botones de acción en notificaciones de aniversario.

## v1.1.54 (15/01/2026)

- **Mejora de Notificaciones**: Los costaleros ahora pueden ver sus propias notificaciones (ej. 25 aniversario).
  - El contador de notificaciones del dashboard se filtra por usuario.
  - El centro de notificaciones ahora es accesible para todos, mostrando solo los avisos pertinentes a cada rol.
  - Las acciones administrativas (Justificar/Ausente) se ocultan automáticamente para los costaleros.

## v1.1.53 (15/01/2026)

- **Nueva Función**: Notificaciones automáticas de "25 Años de Costalero".
  - El sistema detecta automáticamente quién cumple 25 años (contando el año de ingreso como el primero).
  - Genera una notificación especial con icono de trofeo en el panel de capataces.

## v1.1.52 (15/01/2026)

- **Corrección Crítica**: Corregido el valor del estado de asistencia de 'justificado' a 'justificada' para coincidir con la restricción de la base de datos.

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
