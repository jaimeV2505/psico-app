'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Paciente } from '@/types'

interface Props {
  paciente?: Partial<Paciente>
  profesionalId: string
  modo: 'nuevo' | 'editar'
}

type FormSection = 'personal' | 'contacto' | 'emergencia' | 'clinica' | 'tratamiento'

export default function PacienteForm({ paciente, profesionalId, modo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openSections, setOpenSections] = useState(new Set<FormSection>(['personal', 'contacto', 'clinica']))

  const [form, setForm] = useState({
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    dni: paciente?.dni || '',
    fecha_nacimiento: paciente?.fecha_nacimiento || '',
    genero: paciente?.genero || '',
    estado_civil: paciente?.estado_civil || '',
    ocupacion: paciente?.ocupacion || '',
    nivel_educativo: paciente?.nivel_educativo || '',
    telefono: paciente?.telefono || '',
    email: paciente?.email || '',
    direccion: paciente?.direccion || '',
    ciudad: paciente?.ciudad || '',
    contacto_emergencia_nombre: paciente?.contacto_emergencia_nombre || '',
    contacto_emergencia_telefono: paciente?.contacto_emergencia_telefono || '',
    contacto_emergencia_relacion: paciente?.contacto_emergencia_relacion || '',
    motivo_consulta: paciente?.motivo_consulta || '',
    diagnostico_cie: paciente?.diagnostico_cie || '',
    diagnostico_dsm: paciente?.diagnostico_dsm || '',
    diagnostico_descripcion: paciente?.diagnostico_descripcion || '',
    antecedentes_personales: paciente?.antecedentes_personales || '',
    antecedentes_familiares: paciente?.antecedentes_familiares || '',
    tratamientos_previos: paciente?.tratamientos_previos || '',
    medicacion_actual: paciente?.medicacion_actual || '',
    alergias: paciente?.alergias || '',
    observaciones_iniciales: paciente?.observaciones_iniciales || '',
    fecha_inicio_tratamiento: paciente?.fecha_inicio_tratamiento || new Date().toISOString().split('T')[0],
    estado: paciente?.estado || 'activo',
    objetivos_terapeuticos: paciente?.objetivos_terapeuticos || '',
  })

  function toggle(section: FormSection) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.apellido) return toast.error('Nombre y apellido son requeridos')
    setLoading(true)
    const supabase = createClient()
    const payload = {
      ...form,
      profesional_id: profesionalId,
      fecha_nacimiento: form.fecha_nacimiento || null,
      genero: form.genero || null,
      estado_civil: form.estado_civil || null,
      nivel_educativo: form.nivel_educativo || null,
    }

    if (modo === 'nuevo') {
      const res = await supabase.from('pacientes').insert(payload).select().single()
      if (res.error) { toast.error(res.error.message); setLoading(false) }
      else { toast.success('Paciente registrado'); router.push(`/pacientes/${res.data.id}`) }
    } else {
      const res = await supabase.from('pacientes').update(payload).eq('id', paciente!.id!).select().single()
      if (res.error) { toast.error(res.error.message); setLoading(false) }
      else { toast.success('Paciente actualizado'); router.push(`/pacientes/${paciente!.id}`); router.refresh() }
    }
  }

  const SH = ({ id, label }: { id: FormSection; label: string }) => (
    <button type="button" onClick={() => toggle(id)} className="w-full flex items-center justify-between py-3 text-left">
      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
      {openSections.has(id) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  )

  const L = ({ text, req }: { text: string; req?: boolean }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {text}{req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">

      <div className="card p-6">
        <SH id="personal" label="Datos personales" />
        {openSections.has('personal') && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div><L text="Nombre" req /><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="María" required className="input-field" /></div>
            <div><L text="Apellido" req /><input name="apellido" value={form.apellido} onChange={handleChange} placeholder="González" required className="input-field" /></div>
            <div><L text="DNI / Cédula" /><input name="dni" value={form.dni} onChange={handleChange} placeholder="12.345.678" className="input-field" /></div>
            <div><L text="Fecha de nacimiento" /><input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className="input-field" /></div>
            <div><L text="Género" />
              <select name="genero" value={form.genero} onChange={handleChange} className="input-field">
                <option value="">— Seleccionar —</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no_binario">No binario</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>
            <div><L text="Estado civil" />
              <select name="estado_civil" value={form.estado_civil} onChange={handleChange} className="input-field">
                <option value="">— Seleccionar —</option>
                <option value="soltero">Soltero/a</option>
                <option value="casado">Casado/a</option>
                <option value="divorciado">Divorciado/a</option>
                <option value="viudo">Viudo/a</option>
                <option value="union_libre">Unión libre</option>
                <option value="separado">Separado/a</option>
              </select>
            </div>
            <div><L text="Ocupación" /><input name="ocupacion" value={form.ocupacion} onChange={handleChange} placeholder="Ej: Docente" className="input-field" /></div>
            <div><L text="Nivel educativo" />
              <select name="nivel_educativo" value={form.nivel_educativo} onChange={handleChange} className="input-field">
                <option value="">— Seleccionar —</option>
                <option value="sin_estudios">Sin estudios</option>
                <option value="primaria">Primaria</option>
                <option value="secundaria">Secundaria</option>
                <option value="tecnico">Técnico</option>
                <option value="universitario">Universitario</option>
                <option value="posgrado">Posgrado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <SH id="contacto" label="Información de contacto" />
        {openSections.has('contacto') && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div><L text="Teléfono" /><input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+54 11 1234-5678" className="input-field" /></div>
            <div><L text="Email" /><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="paciente@email.com" className="input-field" /></div>
            <div><L text="Dirección" /><input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle 123, Piso 4" className="input-field" /></div>
            <div><L text="Ciudad" /><input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Buenos Aires" className="input-field" /></div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <SH id="emergencia" label="Contacto de emergencia" />
        {openSections.has('emergencia') && (
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div><L text="Nombre completo" /><input name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre} onChange={handleChange} placeholder="Juan González" className="input-field" /></div>
            <div><L text="Teléfono" /><input type="tel" name="contacto_emergencia_telefono" value={form.contacto_emergencia_telefono} onChange={handleChange} placeholder="+54 11 1234-5678" className="input-field" /></div>
            <div><L text="Relación" /><input name="contacto_emergencia_relacion" value={form.contacto_emergencia_relacion} onChange={handleChange} placeholder="Ej: Hermano/a" className="input-field" /></div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <SH id="clinica" label="Historia clínica" />
        {openSections.has('clinica') && (
          <div className="space-y-4 pt-2">
            <div><L text="Motivo de consulta" /><textarea name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} rows={3} className="input-field" placeholder="Describir el motivo principal..." /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><L text="Diagnóstico CIE-11" /><input name="diagnostico_cie" value={form.diagnostico_cie} onChange={handleChange} placeholder="Ej: F41.1" className="input-field" /></div>
              <div><L text="Diagnóstico DSM-5" /><input name="diagnostico_dsm" value={form.diagnostico_dsm} onChange={handleChange} placeholder="Ej: 300.02" className="input-field" /></div>
            </div>
            <div><L text="Descripción del diagnóstico" /><textarea name="diagnostico_descripcion" value={form.diagnostico_descripcion} onChange={handleChange} rows={3} className="input-field" placeholder="Descripción clínica..." /></div>
            <div><L text="Antecedentes personales" /><textarea name="antecedentes_personales" value={form.antecedentes_personales} onChange={handleChange} rows={3} className="input-field" placeholder="Historial de salud mental previo..." /></div>
            <div><L text="Antecedentes familiares" /><textarea name="antecedentes_familiares" value={form.antecedentes_familiares} onChange={handleChange} rows={3} className="input-field" placeholder="Historial familiar..." /></div>
            <div><L text="Tratamientos previos" /><textarea name="tratamientos_previos" value={form.tratamientos_previos} onChange={handleChange} rows={2} className="input-field" placeholder="Tratamientos anteriores..." /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><L text="Medicación actual" /><textarea name="medicacion_actual" value={form.medicacion_actual} onChange={handleChange} rows={2} className="input-field" placeholder="Medicamentos actuales..." /></div>
              <div><L text="Alergias" /><textarea name="alergias" value={form.alergias} onChange={handleChange} rows={2} className="input-field" placeholder="Alergias conocidas..." /></div>
            </div>
            <div><L text="Observaciones iniciales" /><textarea name="observaciones_iniciales" value={form.observaciones_iniciales} onChange={handleChange} rows={3} className="input-field" placeholder="Impresiones de la evaluación inicial..." /></div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <SH id="tratamiento" label="Estado del tratamiento" />
        {openSections.has('tratamiento') && (
          <div className="space-y-4 pt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><L text="Fecha inicio del tratamiento" /><input type="date" name="fecha_inicio_tratamiento" value={form.fecha_inicio_tratamiento} onChange={handleChange} className="input-field" /></div>
              <div><L text="Estado" />
                <select name="estado" value={form.estado} onChange={handleChange} className="input-field">
                  <option value="activo">Activo</option>
                  <option value="alta">Alta</option>
                  <option value="derivado">Derivado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div><L text="Objetivos terapéuticos" /><textarea name="objetivos_terapeuticos" value={form.objetivos_terapeuticos} onChange={handleChange} rows={4} className="input-field" placeholder="Metas y objetivos del tratamiento..." /></div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Guardando...' : modo === 'nuevo' ? 'Registrar paciente' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}