# ServiPro

Plataforma de contratación de servicios del hogar...

## Descripcion

ServiPro es una plataforma web (Proyecto Web 2) que conecta clientes con prestadores de servicios del hogar. Permite publicar y gestionar solicitudes, administrar perfiles y llevar un flujo claro de atencion con estados de orden y seguimiento.

El sistema ofrece paneles por rol (cliente, prestador y administrador) con procesos de registro y verificacion para garantizar confianza. Ademas, centraliza la informacion de servicios y facilita la coordinacion de trabajos en un solo lugar.

## Tecnologias y arquitectura de contenedores

- Frontend/Backend: Next.js (App Router) con TypeScript, renderizado híbrido (SSR/CSR) y rutas API internas para la capa de servicios.
- Persistencia: PostgreSQL con Prisma ORM, esquema tipado, migraciones versionadas y cliente generado para acceso a datos.
- Autenticacion y sesiones: endpoints de autenticacion en API routes y manejo de sesiones en la capa de servidor.
- Contenedores: Docker Compose orquesta la base de datos en entorno local; la app se ejecuta con `npm run dev` y se conecta mediante la variable `DATABASE_URL`.
