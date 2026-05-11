# TechSolutions ERP

Manual de usuario y documentacion tecnica del Proyecto Integrador Full-Stack Empresarial.

## 1. Descripcion general

TechSolutions ERP es una aplicacion web empresarial para centralizar la gestion de clientes, empleados, proyectos, tareas y auditoria de cambios. El sistema fue desarrollado para TechSolutions S.A. con un flujo de trabajo por roles:

- Administrador: controla todo el sistema.
- Cliente: se registra, consulta sus proyectos y crea solicitudes de trabajo.
- Empleado: consulta sus tareas asignadas y registra avances.

La aplicacion usa autenticacion JWT, API REST, base de datos PostgreSQL en Supabase, frontend en Vercel, backend en Render y una version movil Android generada con Capacitor.

## 2. Enlaces del proyecto

- Frontend desplegado: `https://proyecto-final-sooty-ten.vercel.app`
- Backend API: `https://techsolutions-backend.onrender.com/api`
- Health check backend: `https://techsolutions-backend.onrender.com/api/health/`
- Repositorio GitHub: `https://github.com/EstuardoTeS/ProyectoFinal`
- APK Android local: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## 3. Tecnologias utilizadas

Frontend:

- React
- Vite
- React Router
- Axios
- CSS personalizado responsivo
- Capacitor para aplicacion Android

Backend:

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- django-cors-headers
- WhiteNoise
- Gunicorn

Nube y despliegue:

- Supabase PostgreSQL
- Render para backend
- Vercel para frontend
- GitHub como repositorio de codigo

## 4. Estructura del proyecto

```text
ProyectoFinal/
  README.md
  render.yaml
  requirements.txt
  frontend/
    src/
      api/
      components/
      pages/
      app-theme.css
      native-app.css
    android/
    capacitor.config.json
    package.json
    vercel.json
  techsolutions/
    config/
    users/
    clients/
    projects/
    tasks/
    chat/
    manage.py
    requirements.txt
```

Carpetas principales:

- `frontend`: interfaz web y aplicacion movil Android.
- `techsolutions`: backend Django con API REST.
- `users`: usuarios, roles y administrador protegido.
- `clients`: clientes empresariales.
- `projects`: proyectos asociados a clientes.
- `tasks`: tareas, avance e historial de auditoria.
- `chat`: modulo backend de conversaciones; no se muestra en la interfaz actual para evitar fallos durante la presentacion.

## 5. Roles y permisos

| Modulo | Administrador | Cliente | Empleado |
| --- | --- | --- | --- |
| Inicio / Dashboard | Ve resumen general | Ve acceso a sus proyectos | Ve acceso a sus tareas |
| Clientes | Crear, listar, editar y eliminar | No disponible | No disponible |
| Empleados | Crear, bloquear, activar y eliminar empleados | No disponible | No disponible |
| Proyectos | Crear, listar, editar y eliminar | Ver solo sus proyectos | Ver proyectos donde tiene tareas |
| Tareas | Crear, editar, reasignar, eliminar y actualizar | Crear solicitudes en sus proyectos y consultar avance | Ver solo tareas asignadas y registrar avance |
| Auditoria | Ver e imprimir historial general | No disponible | No disponible |
| Reportes | Imprimir reportes de proyectos y tareas | Imprimir reportes de sus proyectos/tareas | No disponible |

Reglas importantes:

- El administrador inicial ya existe por migracion.
- No se pueden registrar administradores desde la pantalla publica.
- El administrador principal no puede ser eliminado, bloqueado ni cambiado de rol.
- Los clientes solo ven proyectos y tareas vinculados a su cuenta.
- Los empleados solo ven tareas asignadas a ellos.
- Las rutas internas estan protegidas con token JWT.

## 6. Credenciales iniciales del administrador

Al ejecutar las migraciones se crea el administrador principal:

```text
Usuario: admin
Contrasena: Admin12345
```

Este usuario es protegido por el sistema. Se recomienda usarlo para la demostracion inicial y, en un entorno real, cambiar la contrasena desde un flujo seguro.

## 7. Manual de usuario

### 7.1 Acceso al sistema

1. Abrir `https://proyecto-final-sooty-ten.vercel.app`.
2. Presionar `Iniciar sesion`.
3. Ingresar usuario y contrasena.
4. El sistema redirige segun el rol:
   - Administrador: `Inicio`.
   - Cliente: `Mis proyectos`.
   - Empleado: `Tareas`.

Si Render esta en reposo, el primer inicio de sesion puede tardar unos segundos mientras despierta el backend.

### 7.2 Registro de cliente

1. Entrar a la pantalla de login.
2. Seleccionar la pestaña `Registro cliente`.
3. Completar:
   - Nombre del cliente.
   - Correo electronico.
   - Telefono.
   - Empresa.
   - Contrasena.
4. Presionar `Registrar cliente`.
5. Iniciar sesion con el usuario y contrasena registrados.

El registro publico siempre crea un usuario con rol `Cliente`.

### 7.3 Uso como administrador

El administrador tiene acceso completo al sistema.

Inicio:

1. Revisar tarjetas de resumen: clientes, proyectos, tareas y empleados.
2. Usar accesos rapidos para crear registros.

Clientes:

1. Entrar a `Clientes`.
2. Crear un cliente con nombre, correo, telefono, empresa y estado.
3. Editar datos cuando sea necesario.
4. Eliminar clientes solo si ya no se requieren.

Empleados:

1. Entrar a `Empleados`.
2. Crear empleado con usuario, correo, contrasena y telefono.
3. Bloquear empleados que no deben ingresar temporalmente.
4. Activar empleados bloqueados si vuelven a operar.
5. Eliminar empleados cuando corresponda.

El administrador principal aparece marcado como `Principal` y sus acciones de bloqueo/eliminacion quedan deshabilitadas.

Proyectos:

1. Entrar a `Proyectos`.
2. Crear proyecto asociado a un cliente.
3. Definir nombre, descripcion, fecha de inicio, fecha de fin y estado.
4. Editar o eliminar proyectos desde las tarjetas.

Tareas:

1. Entrar a `Tareas`.
2. Crear una tarea indicando titulo, proyecto, prioridad, estado y fecha limite.
3. Seleccionar un empleado responsable o dejar asignacion automatica.
4. Si no se selecciona empleado, el backend asigna la tarea al empleado activo con menor carga de tareas pendientes o en proceso.
5. Editar o reasignar tareas si un empleado no cumple.
6. Actualizar porcentaje de avance y nota de seguimiento.
7. Imprimir reporte historico de una tarea cuando sea necesario.

Auditoria:

1. Entrar a `Auditoria`.
2. Revisar movimientos agrupados por proyecto.
3. Buscar por proyecto, tarea, cliente, empleado o estado.
4. Presionar `Imprimir auditoria` para generar el reporte.

La auditoria muestra fecha, hora, tarea, cambio realizado, empleado asignado, usuario que realizo el cambio y nota registrada.

### 7.4 Uso como cliente

El cliente tiene acceso a su portal de seguimiento.

Mis proyectos:

1. Entrar con la cuenta de cliente.
2. Ir a `Mis proyectos`.
3. Revisar proyectos asociados a su empresa.
4. Consultar tareas del proyecto, responsable y estado.
5. Usar `Imprimir reporte` para generar un reporte visual del avance.

Tareas:

1. Entrar a `Tareas`.
2. Crear una nueva solicitud de trabajo seleccionando uno de sus proyectos.
3. Completar titulo, descripcion, prioridad y fecha limite.
4. El sistema asigna automaticamente un empleado activo.
5. Consultar el avance y el historial de movimientos.
6. Imprimir el reporte PDF de una tarea si se necesita evidencia.

El cliente no puede ver clientes, empleados ni proyectos de otras empresas.

### 7.5 Uso como empleado

El empleado trabaja desde la vista `Tareas`.

1. Iniciar sesion con las credenciales creadas por el administrador.
2. Revisar las tareas asignadas.
3. Cambiar el estado de la tarea:
   - Pendiente.
   - En proceso.
   - Finalizada.
   - Cancelada.
4. Registrar porcentaje de avance entre 0 y 100.
5. Agregar una nota de avance.
6. El sistema guarda cada cambio en el historial para auditoria.

El empleado solo visualiza sus propias tareas.

## 8. Reportes disponibles

Reporte de proyecto:

- Disponible para clientes desde `Mis proyectos`.
- Muestra avance general, cliente, fechas, estado y detalle de tareas.
- Se abre en una ventana imprimible.

Reporte historico de tarea:

- Disponible desde la vista de tareas.
- Muestra datos de la tarea, cliente, proyecto, responsable, avance e historial.
- Se imprime con la paleta visual del sistema.

Reporte de auditoria:

- Disponible solo para administrador desde `Auditoria`.
- Muestra todos los movimientos por proyecto.
- Incluye fecha y hora del cambio, tarea, empleado, usuario y nota.

## 9. Auditoria y trazabilidad

El sistema crea movimientos historicos cuando:

- Se crea una tarea.
- Cambia el estado de una tarea.
- Se actualiza el avance o nota de una tarea.

La auditoria permite responder preguntas como:

- Que tarea cambio de estado.
- Quien realizo el cambio.
- Cuando ocurrio el cambio.
- Que empleado tenia asignada la tarea.
- A que proyecto y cliente pertenece.

## 10. Ejecucion local

### 10.1 Requisitos previos

- Python 3.10 o superior.
- Node.js y npm.
- PostgreSQL local o credenciales de Supabase.
- Git.

### 10.2 Backend local

Desde la raiz del proyecto:

```bash
cd techsolutions
py -3.10 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
py -3.10 manage.py migrate
py -3.10 manage.py runserver
```

Variables importantes en `techsolutions/.env`:

```text
SECRET_KEY=change-this-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOW_ALL_ORIGINS=True
```

API local:

```text
http://127.0.0.1:8000/api
```

Panel administrativo Django:

```text
http://127.0.0.1:8000/admin/
```

### 10.3 Frontend local

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Para desarrollo local, usar en `frontend/.env`:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

Frontend local:

```text
http://localhost:5173
```

## 11. Aplicacion movil Android

El proyecto incluye una version movil con Capacitor.

Comandos principales:

```bash
cd frontend
npm run android:sync
npm run android:apk
```

APK generada:

```text
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

La app movil usa por defecto la API desplegada en Render:

```text
https://techsolutions-backend.onrender.com/api
```

## 12. Despliegue

### 12.1 Backend en Render

El archivo `render.yaml` define el servicio:

```yaml
services:
  - type: web
    name: techsolutions-backend
    env: python
    rootDir: techsolutions
    buildCommand: pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
    startCommand: gunicorn config.wsgi:application
```

Variables necesarias en Render:

```text
SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=techsolutions-backend.onrender.com
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://proyecto-final-sooty-ten.vercel.app
CSRF_TRUSTED_ORIGINS=https://proyecto-final-sooty-ten.vercel.app,https://techsolutions-backend.onrender.com
```

### 12.2 Frontend en Vercel

Configuracion recomendada:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Variable de entorno:

```text
VITE_API_URL=https://techsolutions-backend.onrender.com/api
```

El archivo `frontend/vercel.json` permite que las rutas internas de React funcionen al recargar la pagina.

### 12.3 Base de datos en Supabase

El backend usa PostgreSQL. Para Supabase se configuran:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Despues de cambiar modelos o migraciones, hacer redeploy del backend para ejecutar `python manage.py migrate`.

## 13. Endpoints principales

Autenticacion:

- `POST /api/auth/login/`
- `POST /api/auth/refresh/`

Usuarios:

- `GET /api/users/`
- `POST /api/users/`
- `PATCH /api/users/:id/`
- `DELETE /api/users/:id/`

Clientes:

- `GET /api/clients/`
- `POST /api/clients/`
- `PUT /api/clients/:id/`
- `DELETE /api/clients/:id/`

Proyectos:

- `GET /api/projects/`
- `POST /api/projects/`
- `PUT /api/projects/:id/`
- `DELETE /api/projects/:id/`
- `GET /api/projects/:id/report/`

Tareas:

- `GET /api/tasks/`
- `POST /api/tasks/`
- `PATCH /api/tasks/:id/`
- `DELETE /api/tasks/:id/`
- `GET /api/tasks/history/`

Sistema:

- `GET /api/health/`

## 14. Validaciones y seguridad

- Las peticiones protegidas requieren token JWT.
- El token se almacena en `localStorage` para la sesion web.
- Las rutas privadas redirigen al login si no hay token.
- El backend limita consultas segun rol.
- El avance de tareas debe estar entre 0 y 100.
- El administrador principal esta protegido por reglas del backend.
- CORS se configura para permitir el frontend desplegado.

## 15. Flujo recomendado para demostracion

1. Iniciar sesion como `admin`.
2. Crear uno o mas empleados.
3. Registrar o verificar un cliente.
4. Crear un proyecto asociado al cliente.
5. Crear una tarea sin seleccionar empleado para mostrar la asignacion automatica.
6. Entrar como empleado y actualizar estado, avance y nota.
7. Entrar como cliente y revisar el proyecto/tarea.
8. Imprimir reporte de proyecto.
9. Volver como admin y abrir `Auditoria`.
10. Imprimir reporte de auditoria.

## 16. Problemas comunes

Render tarda al iniciar:

- Si el backend esta dormido, el primer acceso puede tardar.
- Esperar unos segundos y volver a intentar.

No se ven datos:

- Verificar que el backend responda en `/api/health/`.
- Confirmar que `VITE_API_URL` apunte a la API correcta.
- Confirmar que el usuario tenga el rol correcto.

No aparece auditoria nueva:

- Verificar que el backend desplegado tenga las ultimas migraciones.
- Hacer redeploy en Render si se subieron cambios recientes.

No compila la app movil:

- Verificar que exista Android SDK.
- Revisar `frontend/android/local.properties`.
- Ejecutar `npm run android:sync` antes de generar APK.

## 17. Comandos utiles

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run dev
npm run android:apk
```

Backend:

```bash
cd techsolutions
py -3.10 manage.py check
py -3.10 manage.py migrate
py -3.10 manage.py runserver
```

Git:

```bash
git status
git add .
git commit -m "Descripcion del cambio"
git push origin main
```

## 18. Estado actual del proyecto

El proyecto incluye:

- Frontend web responsivo.
- Backend REST con JWT.
- Roles administrador, cliente y empleado.
- CRUD de clientes.
- CRUD de empleados.
- CRUD de proyectos.
- CRUD y seguimiento de tareas.
- Asignacion automatica de tareas a empleados activos.
- Registro de avance por empleados.
- Auditoria de cambios de tareas.
- Reportes imprimibles.
- Despliegue web.
- APK Android de demostracion.

