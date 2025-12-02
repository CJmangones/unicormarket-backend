-- Esquema de base de datos para UnicorMarket (compatible con Supabase / Postgres)

create extension if not exists "pgcrypto";

-- Tabla de usuarios
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  correo_institucional text not null unique,
  nombre text not null,
  facultad text,
  telefono text,
  reputacion numeric(3,2) default 5.0,
  password_hash text not null,
  rol text not null default 'estudiante',
  created_at timestamptz not null default now()
);

-- Tabla de categorías
create table if not exists categorias (
  id serial primary key,
  nombre text not null
);

-- Tabla de publicaciones
create table if not exists publicaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  categoria_id int references categorias(id),
  modalidad text not null, -- venta, trueque, donacion
  tipo text not null,      -- producto, servicio
  titulo text not null,
  descripcion text not null,
  precio numeric(12,2),
  facultad text,
  estado text not null default 'activo',
  created_at timestamptz not null default now()
);

-- Imágenes de cada publicación
create table if not exists imagenes_publicacion (
  id serial primary key,
  publicacion_id uuid not null references publicaciones(id) on delete cascade,
  url text not null
);

-- Trueques (intercambios)
create table if not exists trueques (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references publicaciones(id) on delete cascade,
  oferente_id uuid not null references usuarios(id),
  receptor_id uuid not null references usuarios(id),
  acordado_en timestamptz,
  estado text not null default 'pendiente'
);

-- Órdenes (compras/ventas)
create table if not exists ordenes (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references publicaciones(id),
  comprador_id uuid not null references usuarios(id),
  vendedor_id uuid not null references usuarios(id),
  cantidad int not null,
  monto_total numeric(12,2) not null,
  estado text not null default 'pendiente',
  creada_en timestamptz not null default now()
);

-- Pagos asociados a órdenes
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes(id) on delete cascade,
  monto numeric(12,2) not null,
  metodo text not null,
  referencia text,
  pagado_en timestamptz
);

-- Mensajes entre usuarios sobre una publicación
create table if not exists mensajes (
  id uuid primary key default gen_random_uuid(),
  publicacion_id uuid not null references publicaciones(id) on delete cascade,
  remitente_id uuid not null references usuarios(id),
  destinatario_id uuid not null references usuarios(id),
  contenido text not null,
  enviado_en timestamptz not null default now()
);

-- Reportes de publicaciones o usuarios
create table if not exists reportes (
  id serial primary key,
  publicacion_id uuid not null references publicaciones(id) on delete cascade,
  denunciado_id uuid not null references usuarios(id),
  denunciante_id uuid not null references usuarios(id),
  motivo text not null,
  creado_en timestamptz not null default now(),
  estado text not null default 'pendiente'
);

-- Calificaciones entre usuarios
create table if not exists calificaciones (
  id serial primary key,
  trueque_id uuid references trueques(id),
  orden_id uuid references ordenes(id),
  autor_id uuid not null references usuarios(id),
  receptor_id uuid not null references usuarios(id),
  puntaje int not null check (puntaje >= 1 and puntaje <= 5),
  comentario text,
  creado_en timestamptz not null default now()
);