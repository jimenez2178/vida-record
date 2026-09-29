export type IndicatorReading = {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
}

export type IndicatorTone = 'good' | 'warn' | 'bad'

export type IndicatorStatus = { label: string; tone: IndicatorTone }

export const indicatorTypeLabels: Record<string, string> = {
  presion: 'Presión arterial',
  glucosa: 'Glucosa',
  peso: 'Peso',
  temperatura: 'Temperatura',
  frecuencia_cardiaca: 'Frecuencia cardíaca',
  colesterol: 'Colesterol',
  otro: 'Otro',
}

export function formatIndicatorValue(indicator: IndicatorReading) {
  if (indicator.type === 'presion') {
    return `${indicator.value_primary}/${indicator.value_secondary}${
      indicator.unit ? ` ${indicator.unit}` : ''
    }`
  }
  return `${indicator.value_primary}${indicator.unit ? ` ${indicator.unit}` : ''}`
}

function unitIs(unit: string | null, ...expected: string[]) {
  if (!unit) return true
  const normalized = unit.toLowerCase().replace(/\s/g, '')
  return expected.some((e) => normalized === e.toLowerCase())
}

// Clasificación orientativa con rangos de referencia generales para adultos.
// Devuelve null cuando el valor depende de contexto que no tenemos (p. ej.
// glucosa en ayunas o no) o la unidad no es la esperada.
export function classifyIndicator(
  reading: IndicatorReading
): IndicatorStatus | null {
  const value = reading.value_primary
  if (value === null) return null

  switch (reading.type) {
    case 'presion': {
      const sys = value
      const dia = reading.value_secondary
      if (dia === null) return null
      if (sys <= dia || sys - dia < 20) return { label: 'Revisar dato', tone: 'warn' }
      if (sys >= 180 || dia >= 120) return { label: 'Crisis', tone: 'bad' }
      if (sys >= 140 || dia >= 90) return { label: 'Alta', tone: 'bad' }
      if (sys >= 130 || dia >= 80) return { label: 'Alta etapa 1', tone: 'warn' }
      if (sys >= 120) return { label: 'Elevada', tone: 'warn' }
      if (sys < 90 || dia < 60) return { label: 'Baja', tone: 'warn' }
      return { label: 'Normal', tone: 'good' }
    }
    case 'frecuencia_cardiaca': {
      if (!unitIs(reading.unit, 'bpm', 'lpm', 'ppm')) return null
      if (value > 100) return { label: 'Alta', tone: 'warn' }
      if (value < 50) return { label: 'Baja', tone: 'warn' }
      return { label: 'Normal', tone: 'good' }
    }
    case 'temperatura': {
      if (!unitIs(reading.unit, '°c', 'c', 'ºc')) return null
      if (value >= 38) return { label: 'Fiebre', tone: 'bad' }
      if (value >= 37.5) return { label: 'Febrícula', tone: 'warn' }
      if (value < 35) return { label: 'Baja', tone: 'bad' }
      return { label: 'Normal', tone: 'good' }
    }
    case 'glucosa': {
      if (!unitIs(reading.unit, 'mg/dl')) return null
      if (value < 70) return { label: 'Baja', tone: 'bad' }
      if (value >= 200) return { label: 'Alta', tone: 'bad' }
      return null
    }
    case 'colesterol': {
      if (!unitIs(reading.unit, 'mg/dl')) return null
      if (value >= 240) return { label: 'Alto', tone: 'bad' }
      if (value >= 200) return { label: 'Límite', tone: 'warn' }
      return { label: 'Deseable', tone: 'good' }
    }
    default:
      return null
  }
}
