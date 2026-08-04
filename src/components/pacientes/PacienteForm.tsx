'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Paciente } from '@/types'
import { buscarCIE10, getNombreCIE10 } from '@/lib/cie10'

interface Props {
  paciente?: Partial<Paciente>
  profesionalId: string
  modo: 'nuevo' | 'editar'
}

type FormSection = 'personal' | 'contacto' | 'emergencia' | 'clinica'

export default function PacienteForm({ paciente, profesionalId, modo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [openSections, setOpenSections] = useState(new Set<FormSection>(['personal', 'contacto', 'clinica']))
  const [cie10Query, setCie10Query] = useState(paciente?.diagnostico_cie10 || '')
  const [cie10Sugerencias, setCie10Sugerencias] = useState<{ codigo: string; nombre: string }[]>([])

  const [form, setForm] = useState({
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    dni: paciente?.dni || '',
    fecha_nacimiento: paciente?.fecha_nacimiento || '',
    genero: paciente?.genero || '',
    ocupacion: paciente?.ocupacion || '',
    obra_social: paciente?.obra_social || '',
    numero_afiliado: paciente?.numero_afiliado || '',
    telefono: paciente?.telefono || '',
    email: paciente?.email || '',
    direccion: paciente?.direccion || '',
    contacto_emergencia_nombre: paciente?.contacto_emergencia_nombre || '',
    contacto_emergencia_telefono: paciente?.contacto_emergencia_telefono || '',
    contacto_emergencia_relacion: paciente?.contacto_emergencia_relacion || '',
    motivo_consulta: paciente?.motivo_consulta || '',
    enfermedad_actual: paciente?.enfermedad_actual || '',
    examen_psicosemiologico: paciente?.examen_psicosemiologico || '',
    diagnostico_cie10: paciente?.diagnostico_cie10 || '',
    antecedentes_personales: paciente?.antecedentes_personales || '',
    antecedentes_familiares: paciente?.antecedentes_familiares || '',
    tratamientos_previos: paciente?.tratamientos_previos || '',
    indicaciones: paciente?.indicaciones || '',
    objetivos_terapeuticos: paciente?.objetivos_terapeuticos || '',
    estado: paciente?.estado || 'activo',
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

  function handleCie10Change(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCie10Query(value)
    if (value.length >= 2) {
      setCie10Sugerencias(buscarCIE10(value))
    } else {
      setCie10Sugerencias([])
    }
    setForm(prev => ({ ...prev, diagnostico_cie10: value }))
  }

  function seleccionarCie10(codigo: string, nombre: string) {
    setCie10Query(`${codigo} - ${nombre}`)
    setForm(prev => ({ ...prev, diagnostico_cie10: codigo }))
    setCie10Sugerencias([])
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

      {/* DATOS PERSONALES */}
      <div className="card p-6">
        <SH id="personal" label="Datos personales" />
        {openSections.has('personal') && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div><L text="Nombre" req /><input name="nombre" value={form.nombre} onChange={handleChange} placeholder="María" required className="input-field" /></div>
            <div><L text="Apellido" req /><input name="apellido" value={form.apellido} onChange={handleChange} placeholder="González" required className="input-field" /></div>
            <div><L text="DNI" /><input name="dni" value={form.dni} onChange={handleChange} placeholder="12.345.678" className="input-field" /></div>
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
            <div><L text="Ocupación" /><input name="ocupacion" value={form.ocupacion} onChange={handleChange} placeholder="Ej: Docente" className="input-field" /></div>
            <div><L text="Obra social" /><input name="obra_social" value={form.obra_social} onChange={handleChange} placeholder="Ej: OSDE, PAMI..." className="input-field" /></div>
            <div><L text="Número de afiliado" /><input name="numero_afiliado" value={form.numero_afiliado} onChange={handleChange} placeholder="Ej: 123456789" className="input-field" /></div>
          </div>
        )}
      </div>

      {/* CONTACTO */}
      <div className="card p-6">
        <SH id="contacto" label="Información de contacto" />
        {openSections.has('contacto') && (
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div><L text="Teléfono" /><input type="tel" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+54 11 1234-5678" className="input-field" /></div>
            <div><L text="Email" /><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="paciente@email.com" className="input-field" /></div>
            <div className="sm:col-span-2"><L text="Dirección" /><input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle 123, Piso 4" className="input-field" /></div>
          </div>
        )}
      </div>

      {/* EMERGENCIA */}
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

      {/* HISTORIA CLÍNICA */}
      <div className="card p-6">
        <SH id="clinica" label="Historia clínica" />
        {openSections.has('clinica') && (
          <div className="space-y-4 pt-2">
            <div><L text="Motivo de consulta" /><textarea name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} rows={3} className="input-field" placeholder="Describir el motivo principal..." /></div>
            <div><L text="Enfermedad actual" /><textarea name="enfermedad_actual" value={form.enfermedad_actual} onChange={handleChange} rows={3} className="input-field" placeholder="Descripción de la enfermedad o problema actual..." /></div>
            <div><L text="Examen psicosemiológico" /><textarea name="examen_psicosemiologico" value={form.examen_psicosemiologico} onChange={handleChange} rows={4} className="input-field" placeholder="Descripción del estado mental: conciencia, orientación, atención, memoria, pensamiento, lenguaje, afecto..." /></div>

            {/* CIE-10 con autocompletado */}
            <div className="relative">
              <L text="Diagnóstico según CIE-10" />
              <input
                type="text"
                value={cie10Query}
                onChange={handleCie10Change}
                placeholder="Ej: F41 o ansiedad..."
                className="input-field"
                autoComplete="off"
              />
              {form.diagnostico_cie10 && getNombreCIE10(form.diagnostico_cie10) && (
                <p className="text-xs text-primary-600 font-medium mt-1">
                  ✓ {form.diagnostico_cie10} — {getNombreCIE10(form.diagnostico_cie10)}
                </p>
              )}
              {cie10Sugerencias.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {cie10Sugerencias.map(s => (
                    <button
                      key={s.codigo}
                      type="button"
                      onClick={() => seleccionarCie10(s.codigo, s.nombre)}
                      className="w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span className="text-xs font-bold text-primary-600 mr-2">{s.codigo}</span>
                      <span className="text-sm text-gray-700">{s.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div><L text="Antecedentes personales" /><textarea name="antecedentes_personales" value={form.antecedentes_personales} onChange={handleChange} rows={3} className="input-field" placeholder="Historial de salud mental previo..." /></div>
            <div><L text="Antecedentes familiares" /><textarea name="antecedentes_familiares" value={form.antecedentes_familiares} onChange={handleChange} rows={3} className="input-field" placeholder="Historial familiar..." /></div>
            <div><L text="Tratamientos previos" /><textarea name="tratamientos_previos" value={form.tratamientos_previos} onChange={handleChange} rows={2} className="input-field" placeholder="Tratamientos anteriores..." /></div>
            <div><L text="Indicaciones" /><textarea name="indicaciones" value={form.indicaciones} onChange={handleChange} rows={3} className="input-field" placeholder="Indicaciones terapéuticas..." /></div>
            <div><L text="Objetivos terapéuticos" /><textarea name="objetivos_terapeuticos" value={form.objetivos_terapeuticos} onChange={handleChange} rows={3} className="input-field" placeholder="Metas y objetivos del tratamiento..." /></div>
            <div><L text="Estado" />
              <select name="estado" value={form.estado} onChange={handleChange} className="input-field">
                <option value="activo">Activo</option>
                <option value="alta">Alta</option>
                <option value="derivado">Derivado</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
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