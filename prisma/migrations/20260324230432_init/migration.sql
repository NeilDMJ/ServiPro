-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "telefono" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "direccionDefault" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "direccionFiscal" TEXT NOT NULL,
    "adminUsuarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Empresa_adminUsuarioId_fkey" FOREIGN KEY ("adminUsuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prestador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "calificacionPromedio" REAL NOT NULL DEFAULT 0,
    "isDisponible" BOOLEAN NOT NULL DEFAULT true,
    "tipoRegistro" TEXT NOT NULL,
    "empresaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prestador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prestador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreOficio" TEXT NOT NULL,
    "descripcion" TEXT,
    "tarifaBase" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAgendada" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "direccionServicio" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Orden_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "Prestador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Orden_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monto" REAL NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "ordenId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pago_ordenId_fkey" FOREIGN KEY ("ordenId") REFERENCES "Orden" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folioFiscal" TEXT NOT NULL,
    "rfcEmisor" TEXT NOT NULL,
    "rfcReceptor" TEXT NOT NULL,
    "fechaEmision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "urlXML" TEXT NOT NULL,
    "pagoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Factura_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "Pago" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PrestadorToServicio" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PrestadorToServicio_A_fkey" FOREIGN KEY ("A") REFERENCES "Prestador" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PrestadorToServicio_B_fkey" FOREIGN KEY ("B") REFERENCES "Servicio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_role_idx" ON "Usuario"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_usuarioId_key" ON "Cliente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_rfc_key" ON "Empresa"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_adminUsuarioId_key" ON "Empresa"("adminUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Prestador_usuarioId_key" ON "Prestador"("usuarioId");

-- CreateIndex
CREATE INDEX "Prestador_tipoRegistro_idx" ON "Prestador"("tipoRegistro");

-- CreateIndex
CREATE INDEX "Prestador_empresaId_idx" ON "Prestador"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_nombreOficio_key" ON "Servicio"("nombreOficio");

-- CreateIndex
CREATE INDEX "Orden_estado_idx" ON "Orden"("estado");

-- CreateIndex
CREATE INDEX "Orden_clienteId_idx" ON "Orden"("clienteId");

-- CreateIndex
CREATE INDEX "Orden_prestadorId_idx" ON "Orden"("prestadorId");

-- CreateIndex
CREATE INDEX "Orden_servicioId_idx" ON "Orden"("servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_ordenId_key" ON "Pago"("ordenId");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_folioFiscal_key" ON "Factura"("folioFiscal");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_pagoId_key" ON "Factura"("pagoId");

-- CreateIndex
CREATE UNIQUE INDEX "_PrestadorToServicio_AB_unique" ON "_PrestadorToServicio"("A", "B");

-- CreateIndex
CREATE INDEX "_PrestadorToServicio_B_index" ON "_PrestadorToServicio"("B");
