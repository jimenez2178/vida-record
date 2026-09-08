components/
│
├── ui/                           # Átomos — las piezas más pequeñas
│   ├── Button.tsx                # Botón reutilizable (variantes: primary, secondary, danger)
│   ├── Input.tsx                 # Campo de texto
│   ├── Select.tsx                # Menú desplegable
│   ├── Textarea.tsx              # Campo de texto largo
│   ├── Modal.tsx                 # Modal/popup base reutilizable
│   ├── Card.tsx                  # Tarjeta contenedora
│   ├── Badge.tsx                 # Etiqueta de estado (ej: "Activo", "Premium")
│   ├── Avatar.tsx                # Foto de perfil circular
│   ├── Spinner.tsx               # Indicador de carga
│   ├── EmptyState.tsx            # Pantalla vacía (cuando no hay datos)
│   ├── ConfirmDialog.tsx         # Modal de confirmación (para eliminar)
│   ├── PremiumBadge.tsx          # Candado/badge que indica función Premium
│   └── Toast.tsx                 # Notificación flotante (éxito/error)
│
├── layout/                       # Estructura de la app
│   ├── Sidebar.tsx               # Menú lateral con navegación
│   ├── Navbar.tsx                # Barra superior (perfil activo, notificaciones)
│   ├── MobileNav.tsx             # Navegación inferior para móvil
│   ├── ProfileSwitcher.tsx       # Selector de perfil familiar (Premium)
│   └── PremiumBanner.tsx         # Banner que invita a upgradear
│
├── dashboard/                    # Widgets de la pantalla principal
│   ├── WelcomeCard.tsx           # Saludo personalizado con nombre
│   ├── NextAppointmentCard.tsx   # Próxima cita médica
│   ├── ActiveMedicationsCard.tsx # Resumen de medicamentos activos
│   ├── RecentStudiesCard.tsx     # Últimos estudios subidos
│   ├── HealthIndicatorCard.tsx   # Último indicador registrado
│   └── QuickActionsCard.tsx      # Botones de acciones rápidas
│
├── historial/                    # Línea de tiempo médica
│   ├── Timeline.tsx              # Contenedor de la línea de tiempo
│   ├── TimelineItem.tsx          # Cada evento en la línea de tiempo
│   └── TimelineFilter.tsx        # Filtros por tipo de evento
│
├── appointments/                 # Citas y consultas
│   ├── AppointmentList.tsx       # Lista de citas
│   ├── AppointmentCard.tsx       # Tarjeta de una cita
│   ├── AppointmentModal.tsx      # Modal para crear/editar cita
│   └── AppointmentDetail.tsx     # Vista detallada de una cita
│
├── medications/                  # Medicamentos
│   ├── MedicationList.tsx        # Lista de medicamentos
│   ├── MedicationCard.tsx        # Tarjeta de un medicamento
│   ├── MedicationModal.tsx       # Modal para crear/editar medicamento
│   └── MedicationBadge.tsx       # Badge de cantidad restante
│
├── studies/                      # Estudios y documentos
│   ├── StudyList.tsx             # Lista de estudios
│   ├── StudyCard.tsx             # Tarjeta de un estudio
│   ├── StudyModal.tsx            # Modal para subir/editar estudio
│   ├── FileUploader.tsx          # Componente de subida de archivos
│   └── AiAnalysisResult.tsx      # Resultado del análisis IA (Premium)
│
├── health-indicators/            # Indicadores de salud
│   ├── IndicatorList.tsx         # Lista de registros
│   ├── IndicatorModal.tsx        # Modal para registrar medición
│   ├── IndicatorChart.tsx        # Gráfica de evolución
│   └── IndicatorSummary.tsx      # Resumen del último valor
│
├── diagnoses/                    # Diagnósticos
│   ├── DiagnosisList.tsx         # Lista de diagnósticos
│   ├── DiagnosisCard.tsx         # Tarjeta de un diagnóstico
│   └── DiagnosisModal.tsx        # Modal para crear/editar diagnóstico
│
├── doctors/                      # Médicos
│   ├── DoctorList.tsx            # Lista de médicos
│   ├── DoctorCard.tsx            # Tarjeta de un médico
│   └── DoctorModal.tsx           # Modal para crear/editar médico
│
├── familia/                      # Perfiles familiares (Premium)
│   ├── FamilyList.tsx            # Lista de perfiles familiares
│   ├── FamilyCard.tsx            # Tarjeta de un miembro
│   └── FamilyModal.tsx           # Modal para agregar miembro
│
├── ai/                           # Asistente IA (Premium)
│   ├── AssistantChat.tsx         # Interfaz de chat con la IA
│   ├── AssistantMessage.tsx      # Burbuja de mensaje
│   ├── AssistantInput.tsx        # Campo de entrada del chat
│   └── AssistantDisclaimer.tsx   # Aviso: "No sustituye al médico"
│
├── pdf/                          # Resumen médico PDF
│   ├── PdfPreview.tsx            # Vista previa del resumen
│   ├── PdfTemplate.tsx           # Plantilla visual del PDF
│   └── PdfDownloadButton.tsx     # Botón de descarga
│
└── auth/                         # Autenticación
    ├── LoginForm.tsx             # Formulario de login
    ├── RegisterForm.tsx          # Formulario de registro
    └── ForgotPasswordForm.tsx    # Formulario de recuperación

## 📁 Servicios — La lógica separada de la presentación

```
lib/
│
└── services/                     # Aquí vive TODA la lógica
    ├── appointments.service.ts   # CRUD de citas
    ├── medications.service.ts    # CRUD de medicamentos
    ├── studies.service.ts        # CRUD de estudios + subida de archivos
    ├── health-indicators.service.ts  # CRUD de indicadores
    ├── diagnoses.service.ts      # CRUD de diagnósticos
    ├── doctors.service.ts        # CRUD de médicos
    ├── profiles.service.ts       # CRUD de perfiles familiares
    ├── ai.service.ts             # Llamadas a Claude API
    ├── pdf.service.ts            # Generación de PDF
    └── payments.service.ts       # Lógica de pagos PayPal
```

## 📁 Hooks — El puente entre servicios y componentes

```
hooks/
├── useUser.ts                    # ¿Quién está logueado?
├── useProfile.ts                 # ¿Qué perfil está activo?
├── usePlan.ts                    # ¿Es Free o Premium?
├── useAppointments.ts            # Citas del perfil activo
├── useMedications.ts             # Medicamentos del perfil activo
├── useStudies.ts                 # Estudios del perfil activo
├── useHealthIndicators.ts        # Indicadores del perfil activo
├── useDiagnoses.ts               # Diagnósticos del perfil activo
└── useDoctors.ts                 # Médicos del usuario
```

## 📁 Types — El diccionario del proyecto

```typescript
// types/index.ts

export type Plan = 'free' | 'premium'

export type User = {
  id: string
  email: string
  plan: Plan
  plan_expires_at: string | null
  active_profile_id: string | null
}

export type Profile = {
  id: string
  user_id: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  blood_type: string | null
  allergies: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  avatar_url: string | null
  is_owner: boolean
  relationship: string
}

export type Appointment = {
  id: string
  profile_id: string
  doctor_id: string | null
  date: string
  time: string | null
  specialty: string | null
  clinic_name: string | null
  reason: string | null
  diagnosis: string | null
  notes: string | null
  next_appointment_date: string | null
  status: 'programada' | 'completada' | 'cancelada'
}

export type Medication = {
  id: string
  profile_id: string
  name: string
  dose: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
  quantity_initial: number | null
  quantity_remaining: number | null
  is_active: boolean
}

export type Study = {
  id: string
  profile_id: string
  name: string
  type: 'laboratorio' | 'imagen' | 'receta' | 'otro'
  date: string | null
  file_url: string | null
  file_type: 'pdf' | 'image' | null
  ai_summary: string | null
  ai_processed: boolean
}

export type HealthIndicator = {
  id: string
  profile_id: string
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
}

export type Diagnosis = {
  id: string
  profile_id: string
  name: string
  description: string | null
  diagnosed_at: string | null
  is_active: boolean
  is_chronic: boolean
}

export type Doctor = {
  id: string
  user_id: string
  name: string
  specialty: string | null
  phone: string | null
  clinic_name: string | null
}
```

## 🧠 La regla de oro del Frontend en VidaRecord

Así fluye todo, de arriba hacia abajo:

```
Supabase
   ↓
services/        ← aquí se habla con la base de datos
   ↓
hooks/           ← aquí se preparan los datos para la pantalla
   ↓
components/      ← aquí solo se muestra, nunca se calcula
   ↓
app/pages        ← aquí se ensamblan los componentes
```

Un componente nunca llama directamente a Supabase. Siempre pasa por el servicio y el hook. Eso hace que el código sea ordenado y fácil de mantener.
