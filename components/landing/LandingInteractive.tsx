'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const MIN_FONT_SIZE = 16
const MAX_FONT_SIZE = 22

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState(18)
  const [toast, setToast] = useState('')
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    toastTimeout.current = setTimeout(() => setToast(''), 3500)
  }

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, prev + delta))
      document.body.style.fontSize = `${next}px`
      showToast(`Tamaño de letra ajustado a ${next}px`)
      return next
    })
  }

  return (
    <>
      <div className="bg-slate-900 text-slate-200 text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs md:text-sm">
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-heart-pulse text-teal-400" />
            <span>Plataforma accesible e intuitiva en español</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Tamaño de letra:</span>
            <button
              type="button"
              onClick={() => adjustFontSize(-1)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded font-bold transition"
              title="Reducir letra"
              aria-label="Reducir letra"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => adjustFontSize(1)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded font-bold transition"
              title="Aumentar letra"
              aria-label="Aumentar letra"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-700">
          <i className="fa-solid fa-circle-check text-emerald-400 text-xl" />
          <span className="font-medium text-sm">{toast}</span>
        </div>
      )}
    </>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus:outline-none">
          <Logo iconClassName="h-11 w-11" textClassName="text-2xl" />
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 hover:text-teal-600 hover:bg-teal-50 transition-colors focus:ring-2 focus:ring-teal-500"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-teal-500"
          >
            Crear cuenta gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Menú"
        >
          <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'} text-2xl`} />
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#como-funciona"
            onClick={() => setOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            ¿Cómo funciona?
          </a>
          <a
            href="#testimonios"
            onClick={() => setOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Para la familia
          </a>
          <a
            href="#planes"
            onClick={() => setOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Planes
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 text-center"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl font-bold bg-teal-600 text-white shadow-md text-center"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export function PdfDemoCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mt-4 bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-file-pdf text-red-500 text-2xl" />
          <div>
            <p className="text-sm font-bold text-slate-800">
              Resumen_Medico_Ejemplo.pdf
            </p>
            <p className="text-xs text-slate-500">Listo para compartir en 1-clic</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition"
        >
          Vista previa
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              aria-label="Cerrar"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="border-b pb-4 mb-4 flex items-center gap-3">
              <i className="fa-solid fa-file-pdf text-red-500 text-3xl" />
              <div>
                <h4 className="font-bold text-slate-900 text-lg">
                  Resumen Médico VidaRecord
                </h4>
                <p className="text-xs text-slate-500">
                  Paciente: María Mercedes (72 años)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-700">
                  Medicamentos activos:
                </span>
                <span className="text-slate-600">
                  Losartán 50mg, Metformina 850mg
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-700">
                  Alergias declaradas:
                </span>
                <span className="text-red-600 font-semibold">Penicilina</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-700">
                  Médico tratante:
                </span>
                <span className="text-slate-600">
                  Dr. Roberto Gómez (Cardiología)
                </span>
              </div>
              <div className="pt-1">
                <span className="font-bold text-slate-700 block mb-1">
                  Último análisis IA:
                </span>
                <p className="text-xs text-slate-600 italic">
                  &quot;Los niveles de glucosa están dentro del rango
                  recomendado tras el cambio de tratamiento.&quot;
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-100"
              >
                Cerrar
              </button>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Descargar PDF Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
