-- ============================================================
-- PSICO APP - Esquema completo de base de datos
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- PROFESIONALES (vinculada a auth.users)
create table public.profesionales (
  id           uuid references auth.users(id) on delete cascade primary key,
  nombre       text not null,
  apellido     text not null,
  email        text not null unique,
  telefono     text,
  especialidad text default 'Psicología Clínica',
  matricula    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- PACIENTES
create table public.pacientes (
  id                    uuid default uuid_generate_v4() primary key,
  profesional_id        uuid references public.profesionales(id) on delete cascade not null,
  nombre                text not null,
  apellido              text not null,
  dni                   text,
  fecha_nacimiento      date,
  genero                text check (genero in ('masculino','femenino','no_binario','otro','prefiero_no_decir')),
  estado_civil          text check (estado_civil in ('soltero','casado','divorciado','viudo','union_libre','separado')),
  ocupacion             text,
  nivel_educativo       text check (nivel_educativo in ('sin_estudios','primaria','secundaria','tecnico','universitario','posgrado')),
  telefono              text,
  email                 text,
  direccion             text,
  ciudad                text,
  contacto_emergencia_nombre    text,
  contacto_emergencia_telefono  text,
  contacto_emergencia_relacion  text,
  motivo_consulta       text,
  diagnostico_cie       text,
  diagnostico_dsm       text,
  diagnostico_descripcion text,
  antecedentes_personales text,
  antecedentes_familiares text,
  tratamientos_previos  text,
  medicacion_actual     text,
  alergias              text,
  observaciones_iniciales text,
  fecha_inicio_tratamiento date default current_date,
  estado                text default 'activo' check (estado in ('activo','alta','derivado','inactivo')),
  objetivos_terapeuticos text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- SESIONES
create table public.sesiones (
  id              uuid default uuid_generate_v4() primary key,
  paciente_id     uuid references public.pacientes(id) on delete cascade not null,
  profesional_id  uuid references public.profesionales(id) on delete cascade not null,
  numero_sesion   integer,
  fecha           date not null default current_date,
  duracion_min    integer default 50,
  estado_emocional text check (estado_emocional in ('muy_mal','mal','regular','bien','muy_bien')),
  contenido       text,
  avances         text,
  tareas_asignadas text,
  proximos_objetivos text,
  tipo            text default 'individual' check (tipo in ('individual','pareja','familiar','grupo')),
  modalidad       text default 'presencial' check (modalidad in ('presencial','online')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- CITAS
create table public.citas (
  id              uuid default uuid_generate_v4() primary key,
  paciente_id     uuid references public.pacientes(id) on delete set null,
  profesional_id  uuid references public.profesionales(id) on delete cascade not null,
  titulo          text not null,
  fecha           date not null,
  hora_inicio     time not null,
  hora_fin        time not null,
  estado          text default 'pendiente' check (estado in ('pendiente','confirmada','cancelada','realizada','no_asistio')),
  modalidad       text default 'presencial' check (modalidad in ('presencial','online')),
  notas           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- TRIGGER: auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profesionales (id, nombre, apellido, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'apellido', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TRIGGER: auto-número de sesión
create or replace function public.set_numero_sesion()
returns trigger as $$
begin
  if new.numero_sesion is null then
    select coalesce(max(numero_sesion), 0) + 1
    into new.numero_sesion
    from public.sesiones
    where paciente_id = new.paciente_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger before_insert_sesion
  before insert on public.sesiones
  for each row execute procedure public.set_numero_sesion();

-- TRIGGER: updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger t_pacientes_updated before update on public.pacientes for each row execute procedure public.update_updated_at();
create trigger t_sesiones_updated  before update on public.sesiones  for each row execute procedure public.update_updated_at();
create trigger t_citas_updated     before update on public.citas     for each row execute procedure public.update_updated_at();
create trigger t_prof_updated      before update on public.profesionales for each row execute procedure public.update_updated_at();

-- ROW LEVEL SECURITY
alter table public.profesionales enable row level security;
alter table public.pacientes     enable row level security;
alter table public.sesiones      enable row level security;
alter table public.citas         enable row level security;

create policy "profesional_propio" on public.profesionales for all using (auth.uid() = id);
create policy "pacientes_propios"  on public.pacientes     for all using (auth.uid() = profesional_id);
create policy "sesiones_propias"   on public.sesiones      for all using (auth.uid() = profesional_id);
create policy "citas_propias"      on public.citas         for all using (auth.uid() = profesional_id);

-- ÍNDICES
create index idx_pacientes_profesional on public.pacientes(profesional_id);
create index idx_pacientes_nombre      on public.pacientes(lower(nombre), lower(apellido));
create index idx_pacientes_estado      on public.pacientes(estado);
create index idx_sesiones_paciente     on public.sesiones(paciente_id);
create index idx_sesiones_fecha        on public.sesiones(fecha desc);
create index idx_citas_profesional     on public.citas(profesional_id);
create index idx_citas_fecha           on public.citas(fecha);
