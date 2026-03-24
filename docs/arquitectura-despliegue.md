# ServiPro — Diagramas

Este documento contiene:
- Un diagrama de clases (conceptual) basado en el modelo del proyecto.
- La arquitectura de despliegue.

Si quieres el diagrama generado directamente desde Prisma, ver [docs/diagrama-prisma.md](diagrama-prisma.md).

# Diagrama de clases UML 
```mermaid
classDiagram
direction TB
    class Usuario {
	    +UUID id
	    +String nombre
	    +String correo
        +String passwordHash
	    +String telefono
	    +iniciarSesion()
	    +cerrarSesion()
    }

    class Cliente {
	    +String direccionDefault
	    +solicitarOrden()
	    +calificarServicio()
    }

    class Prestador {
        +List~Servicio~ oficios
	    +Float calificacionPromedio
	    +Boolean isDisponible
        +String tipoRegistro "INDEPENDIENTE | EMPRESA"
	    +aceptarOrden()
	    +actualizarEstadoTrabajo()
    }

    class Empresa {
	    +UUID id
	    +String rfc
	    +String razonSocial
	    +String direccionFiscal
	    +registrarPrestador()
	    +obtenerReportes()
    }

    class Servicio {
	    +UUID id
	    +String nombreOficio
	    +String descripcion
	    +Float tarifaBase
	    +actualizarTarifa()
    }

    class Orden {
	    +UUID id
	    +DateTime fechaCreacion
	    +DateTime fechaAgendada
	    +String estado "Pendiente, En Proceso, Finalizada"
	    +String direccionServicio
	    +calcularCostoTotal()
	    +asignarPrestador()
    }

    class Pago {
	    +UUID id
	    +Float monto
	    +String metodoPago "Tarjeta, Efectivo, Transferencia"
	    +String estado "Pendiente, Aprobado, Rechazado"
	    +procesarTransaccion()
    }

    class Factura {
	    +UUID id
	    +String folioFiscal
	    +String rfcEmisor
	    +String rfcReceptor
	    +DateTime fechaEmision
	    +String urlXML
	    +timbrarFactura()
    }

	<<Abstract>> Usuario

    Usuario <|-- Cliente : Es un
    Usuario <|-- Prestador : Es un
    Empresa o-- Prestador : Agrupa (Trabajadores)
    Cliente "1" --> "*" Orden : Solicita
    Prestador "1" --> "*" Orden : Atiende
    Orden "*" --> "1" Servicio : Pertenece a la categoría de
    Orden "1" *-- "1" Pago : Genera
    Pago "1" --> "0..1" Factura : Emite
    Prestador "*" -- "*" Servicio : Ofrece (oficios)
```

# Arquitectura de despliegue 

Diagrama (Mermaid):

```mermaid
flowchart LR
    %% Nodos Cliente
    subgraph NodeCliente ["«Device»\nDispositivo Cliente (App/Web)"]
        ArtCliente["«Artifact»\nNavegador Web / PWA"]
    end

    subgraph NodePrestador ["«Device»\nSmartphone Prestador"]
        ArtPrestador["«Artifact»\nAplicación Móvil"]
    end

    %% Nodos de Servidor (Infraestructura Principal)
    subgraph NodeServidor ["«Execution Environment»\nServidor Node.js (Ej. Vercel)"]
        ArtNextJS["«Artifact»\nNext.js Full-Stack App\n(.next build)"]
    end

    subgraph NodeBD ["«Database Server»\nClúster de Base de Datos"]
        ArtDB["«Artifact»\nEsquema de BD (SQLite dev / PostgreSQL prod)"]
    end

    %% Nodos Externos
    subgraph NodePasarela ["«External System (Opcional)»\nServidores Stripe/MercadoPago"]
        ArtPagos["«Artifact»\nAPI de Pagos"]
    end

    subgraph NodeSAT ["«External System (Opcional)»\nServidores PAC / SAT"]
        ArtSAT["«Artifact»\nServicio de Timbrado Web"]
    end

    %% Rutas de comunicación (Communication Paths) UML
    NodeCliente -- "HTTPS / TLS 1.3" --- NodeServidor
    NodePrestador -- "HTTPS / TLS 1.3" --- NodeServidor

    NodeServidor -- "TCP/IP (Puerto 5432)" --- NodeBD

    NodeServidor -- "HTTPS" --- NodePasarela
    NodeServidor -- "HTTPS / SOAP" --- NodeSAT

    %% Estilos básicos para diferenciar Nodos (Gris) de Artefactos (Blanco)
    classDef node fill:#f0f0f0,stroke:#333,stroke-width:2px;
    classDef artifact fill:#ffffff,stroke:#666,stroke-width:1px;

    class NodeCliente,NodePrestador,NodeServidor,NodeBD,NodePasarela,NodeSAT node;
    class ArtCliente,ArtPrestador,ArtNextJS,ArtDB,ArtPagos,ArtSAT artifact;
```
