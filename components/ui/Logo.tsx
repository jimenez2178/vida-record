const HEART_PATH =
  'M12 21s-6.716-4.35-9.428-8.243C.29 9.516 1.13 5.6 4.5 4.257c2.02-.805 4.14-.09 5.5 1.53C11.36 4.167 13.48 3.452 15.5 4.257c3.37 1.343 4.21 5.259 1.928 8.5C18.716 16.65 12 21 12 21z'

function LogoIcon({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="120" fill="#1E40AF" />
      <g transform="translate(98,85) scale(14.35)">
        <path fill="#ffffff" d={HEART_PATH} />
      </g>
      <polyline
        points="120,272 182,272 207,222 242,322 272,242 302,272 392,272"
        fill="none"
        stroke="#10B981"
        strokeWidth={15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({
  variant = 'full',
  theme = 'light',
  className = '',
  iconClassName = 'h-10 w-10',
  textClassName = 'text-2xl',
}: {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  if (variant === 'icon') {
    return <LogoIcon className={iconClassName} />
  }

  const textColor = theme === 'dark' ? 'text-white' : 'text-blue-900'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon className={iconClassName} />
      <span className={`font-bold tracking-tight ${textColor} ${textClassName}`}>
        Vida<span className="text-emerald-500">Record</span>
      </span>
    </div>
  )
}
