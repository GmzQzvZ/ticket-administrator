# ticket-administrator

**ticket-administrator** es una API minimalista de autenticación y un frontend ligero que sirve como base para la gestión de tickets de soporte. Está diseñada para ejecutarse con Node.js, guardar usuarios en archivos JSON y facilitar pruebas rápidas sobre endpoints de registro, inicio de sesión y recuperación de contraseña.

---

## Tecnologías y dependencias

- Node.js (Express 5.x como servidor HTTP)
- JavaScript (controladores y utilidades en backend)
- JSON (almacenamiento local en `backend/data/users.json`)
- HTML y CSS (frontend de prueba en `frontend/index.html`)

---

## Requisitos

- Node.js v14 o superior
- npm (gestor de paquetes)
- Navegador web moderno (para acceder al frontend incluido)

---

## Cómo ejecutar

1. Instala dependencias y asegúrate de tener los módulos de Node actualizados:

   ```bash
   npm install
   ```

2. Inicia el servidor Express:

   ```bash
   npm start
   ```

   El backend escucha en `http://localhost:3000` y sirve automáticamente el frontend de pruebas.

---

## Estructura relevante

```
backend/             # API Express, controladores y utilidades
backend/controllers/ # Controlador de autenticación y validaciones
backend/routes/      # Rutas agrupadas bajo /api
frontend/            # Interfaz mínima que consume la API
backend/data/        # Usuarios y otros datos JSON
package.json         # Scripts, metadata y dependencia de Express
README.md            # Guía que estás leyendo
```

---

## Endpoints disponibles

Todos los endpoints residen bajo `/api`.

- `POST /api/register`: registra un usuario con `name`, `email` y `password`. Valida los campos mínimos, normaliza el correo y guarda un hash con salt.
- `POST /api/login`: recibe `email` y `password`, verifica el hash y responde con un token simulado y los datos públicos del usuario.
- `POST /api/recover`: solicita recuperación de contraseña con `email`. Siempre responde con una nota genérica y entrega un `resetToken` para pruebas.
- `GET /api/data/{clients|categories|services|priorities|responsibles|statuses|tickets}`: expone los JSON en `backend/data/` para poblar los formularios y la tabla de requerimientos.
- `POST /api/tickets`: recibe los campos del formulario de radicación y persiste un ticket nuevo en `backend/data/tickets.json`.
- `PUT /api/tickets/{caseNumber}`: actualiza los campos de un ticket existente sin modificar su historial.
- `DELETE /api/tickets/{caseNumber}`: elimina un ticket existente del mismo archivo, usado desde la tabla de `tablet.html`.

---

## Frontend incluido

La carpeta `frontend` contiene un `index.html` basado en la antigua `Login.html` (con sus estilos en `frontend/css/login.css`). Ese formulario envía las credenciales a `/api/login` y redirige a `tablet.html` si el servidor responde con éxito. El resto de vistas (`Register.html`, `password.html`, `case.html`, `tablet.html`) ahora consumen `/api/data/*`, así los selects y la tabla se llenan con los datos de `backend/data/*.json`; `tablet.html` ofrece un botón “Radicar caso” y acciones “Ver” / “Eliminar” en cada fila para navegar o descartar entradas locales. La vista de radicación reusa los datos del ticket seleccionado y guarda la descripción, mientras que los casos nuevos reutilizan la numeración consecutiva (`C0001`, `C0002`, …).

---

## Notas

- Las contraseñas se hashean con `crypto.scrypt` y un `salt` único por registro.
- Se utilizan mensajes neutros de recuperación para evitar filtrado de usuarios.
- El token devuelto en login es ilustrativo; debería reemplazarse por JWT u otra estrategia en producción.
