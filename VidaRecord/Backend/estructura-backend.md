vida-record/
│
├── app/                          # Corazón de Next.js
│   │
│   ├── (auth)/                   # Páginas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx          # Pantalla de login
│   │   ├── register/
│   │   │   └── page.tsx          # Pantalla de registro
│   │   └── forgot-password/
│   │       └── page.tsx          # Recuperar contraseña
│   │
│   ├── (dashboard)/              # Páginas protegidas (requieren login)
│   │   ├── layout.tsx            # Layout con sidebar/navbar
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Pantalla principal
│   │   ├── historial/
│   │   │   └── page.tsx          # Línea de tiempo médica
│   │   ├── citas/
│   │   │   └── page.tsx          # Citas y consultas
│   │   ├── medicamentos/
│   │   │   └── page.tsx          # Medicamentos activos
│   │   ├── estudios/
│   │   │   └── page.tsx          # Estudios y documentos
│   │   ├── indicadores/
│   │   │   └── page.tsx          # Indicadores de salud
│   │   ├── diagnosticos/
│   │   │   └── page.tsx          # Diagnósticos y condiciones
│   │   ├── medicos/
│   │   │   └── page.tsx          # Médicos registrados
│   │   ├── familia/
│   │   │   └── page.tsx          # Perfiles familiares (Premium)
│   │   ├── resumen-pdf/
│   │   │   └── page.tsx          # Generar resumen médico PDF
│   │   ├── asistente/
│   │   │   └── page.tsx          # Asistente IA (Premium)
│   │   └── configuracion/
│   │       └── page.tsx          # Ajustes de cuenta y plan
│   │
│   ├── api/                      # Backend — las "ventanillas"
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts      # Callback de autenticación Supabase
│   │   │
│   │   ├── users/
│   │   │   └── route.ts          # Crear/actualizar perfil de usuario
│   │   │
│   │   ├── profiles/
│   │   │   ├── route.ts          # Listar y crear perfiles
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un perfil
│   │   │
│   │   ├── appointments/
│   │   │   ├── route.ts          # Listar y crear citas
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar una cita
│   │   │
│   │   ├── medications/
│   │   │   ├── route.ts          # Listar y crear medicamentos
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un medicamento
│   │   │
│   │   ├── studies/
│   │   │   ├── route.ts          # Listar y crear estudios
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un estudio
│   │   │
│   │   ├── health-indicators/
│   │   │   ├── route.ts          # Listar y crear indicadores
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un indicador
│   │   │
│   │   ├── diagnoses/
│   │   │   ├── route.ts          # Listar y crear diagnósticos
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un diagnóstico
│   │   │
│   │   ├── doctors/
│   │   │   ├── route.ts          # Listar y crear médicos
│   │   │   └── [id]/
│   │   │       └── route.ts      # Ver, editar y eliminar un médico
│   │   │
│   │   ├── ai/
│   │   │   ├── analyze/
│   │   │   │   └── route.ts      # Analizar documento con IA (Premium)
│   │   │   ├── chat/
│   │   │   │   └── route.ts      # Asistente conversacional IA (Premium)
│   │   │   └── summary/
│   │   │       └── route.ts      # Generar resumen médico con IA (Premium)
│   │   │
│   │   ├── pdf/
│   │   │   └── route.ts          # Generar PDF del resumen médico
│   │   │
│   │   ├── payments/
│   │   │   ├── create-order/
│   │   │   │   └── route.ts      # Crear orden de pago PayPal
│   │   │   ├── capture/
│   │   │   │   └── route.ts      # Confirmar pago PayPal
│   │   │   └── webhook/
│   │   │       └── route.ts      # Webhook PayPal (renovaciones)
│   │   │
│   │   └── account/
│   │       └── delete/
│   │           └── route.ts      # Eliminar cuenta completa
│   │
│   ├── layout.tsx                # Layout raíz de la app
│   ├── page.tsx                  # Landing page pública
│   └── globals.css               # Estilos globales
│
├── components/                   # Piezas visuales reutilizables
│   ├── ui/                       # Botones, inputs, modales, cards
│   ├── layout/                   # Sidebar, Navbar, Footer
│   ├── dashboard/                # Widgets del dashboard
│   ├── appointments/             # Formularios y cards de citas
│   ├── medications/              # Formularios y cards de medicamentos
│   ├── studies/                  # Uploader de documentos
│   ├── health-indicators/        # Gráficas de indicadores
│   ├── ai/                       # Componentes del asistente IA
│   └── pdf/                      # Plantilla del resumen PDF
│
├── lib/                          # Lógica y conexiones
│   ├── supabase/
│   │   ├── client.ts             # Cliente Supabase para el navegador
│   │   └── server.ts             # Cliente Supabase para el servidor
│   ├── paypal/
│   │   └── client.ts             # Configuración PayPal
│   ├── ai/
│   │   └── client.ts             # Configuración Claude API
│   ├── pdf/
│   │   └── generator.ts          # Lógica de generación de PDF
│   └── utils/
│       ├── plan-checker.ts       # Verificar si usuario es Premium
│       ├── date-formatter.ts     # Formatear fechas en español
│       └── file-upload.ts        # Subir archivos a Supabase Storage
│
├── hooks/                        # Lógica reutilizable del frontend
│   ├── useUser.ts                # Datos del usuario actual
│   ├── useProfile.ts             # Perfil médico activo
│   ├── useAppointments.ts        # Citas del perfil
│   ├── useMedications.ts         # Medicamentos del perfil
│   ├── useStudies.ts             # Estudios del perfil
│   ├── useHealthIndicators.ts    # Indicadores del perfil
│   └── usePlan.ts                # Plan del usuario (Free/Premium)
│
├── types/                        # Definición de tipos de datos
│   └── index.ts                  # Todos los tipos TypeScript
│
├── middleware.ts                 # Protege rutas que requieren login
│
├── public/                       # Archivos públicos
│   ├── icons/                    # Íconos de la PWA
│   ├── manifest.json             # Configuración PWA
│   └── sw.js                     # Service Worker (PWA offline)
│
├── .env.local                    # Variables de entorno (secretos)
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
├── tsconfig.json                 # Configuración TypeScript
└── package.json                  # Dependencias del proyecto
