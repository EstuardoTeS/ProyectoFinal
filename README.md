# TechSolutions ERP

Sistema web full-stack para administrar clientes, proyectos, empleados y tareas con autenticacion JWT.

## Roles del sistema

- Administrador: visualiza y gestiona todo el sistema. Puede crear clientes, proyectos, empleados, tareas y reasignar tareas manualmente.
- Cliente: se registra desde la pantalla de login, crea solicitudes/tareas asociadas a proyectos y consulta su avance.
- Empleado: visualiza solo sus tareas asignadas y registra avance, estado y notas de trabajo.

## Administrador inicial

El sistema crea un administrador principal mediante migracion:

- Usuario: `admin`
- Contrasena: `Admin12345`

Este administrador queda protegido: no puede ser bloqueado, cambiado de rol ni eliminado.

## Flujo funcional

1. El administrador inicia sesion con las credenciales iniciales.
2. El administrador registra clientes empresariales, proyectos y empleados.
3. Un cliente crea una tarea desde la seccion Tareas.
4. El backend asigna automaticamente la tarea al empleado activo con menor carga de tareas pendientes.
5. El empleado actualiza estado, porcentaje de avance y nota de seguimiento.
6. El administrador puede supervisar todas las tareas y reasignarlas manualmente si un empleado no cumple.

## Ejecucion local

Backend:

```bash
cd techsolutions
py -3.10 -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary python-decouple
py -3.10 manage.py migrate
py -3.10 manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

La API local se consume desde `http://127.0.0.1:8000/api`.
# ProyectoFinal
