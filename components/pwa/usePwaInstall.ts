'use client'

import { useSyncExternalStore } from 'react'

const DISMISSED_KEY = 'vidarecord-install-dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type Platform = 'ios' | 'android' | 'other'

// El navegador dispara `beforeinstallprompt` una sola vez, así que se guarda
// a nivel de módulo para compartirlo entre todos los botones de instalación.
let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    emit()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const media = window.matchMedia('(display-mode: standalone)')
  media.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    media.removeEventListener('change', listener)
  }
}

function getCanPrompt() {
  return deferredPrompt !== null
}

function getIsInstalled() {
  return (
    installed ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function getPlatform(): Platform {
  const ua = navigator.userAgent
  // iPadOS se identifica como Mac, pero tiene pantalla táctil.
  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  ) {
    return 'ios'
  }
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

function getDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

export function dismissInstallBanner() {
  try {
    localStorage.setItem(DISMISSED_KEY, 'true')
  } catch {}
  emit()
}

export async function promptInstall() {
  if (!deferredPrompt) return
  const prompt = deferredPrompt
  deferredPrompt = null
  await prompt.prompt()
  await prompt.userChoice
  emit()
}

export function usePwaInstall() {
  const canPrompt = useSyncExternalStore(subscribe, getCanPrompt, () => false)
  // En el servidor se asume instalada/descartada para no mostrar nada hasta hidratar.
  const isInstalled = useSyncExternalStore(subscribe, getIsInstalled, () => true)
  const dismissed = useSyncExternalStore(subscribe, getDismissed, () => true)
  const platform = useSyncExternalStore<Platform>(
    subscribe,
    getPlatform,
    () => 'other'
  )

  return { canPrompt, isInstalled, dismissed, platform }
}
