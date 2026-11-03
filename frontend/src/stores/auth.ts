
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, ApiError } from '../services'
import { config } from '../config'
import type { User } from '../types'

export type AuthStep = 'email' | 'sent'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const step = ref<AuthStep>('email')
  const email = ref('')
  const error = ref('')
  const sending = ref(false)
  const resendIn = ref(0)
  const ready = ref(false)
  const pendingToken = ref('')

  let ticker: ReturnType<typeof setInterval> | null = null

  const isAuthenticated = computed(() => user.value !== null)
  const canResend = computed(() => resendIn.value === 0)
  const resendLabel = computed(() =>
    resendIn.value > 0
      ? `Reenviar en 0:${String(resendIn.value).padStart(2, '0')}`
      : 'Reenviar el enlace',
  )

  function startCountdown() {
    resendIn.value = config.resendSeconds
    if (ticker) clearInterval(ticker)
    ticker = setInterval(() => {
      resendIn.value -= 1
      if (resendIn.value <= 0 && ticker) {
        clearInterval(ticker)
        ticker = null
      }
    }, 1000)
  }

  async function restore() {
    if (ready.value) return
    try {
      user.value = await api.me()
    } catch (e) {
      user.value = null
      error.value = e instanceof ApiError
        ? e.message
        : 'No se ha podido contactar con el servidor.'
    } finally {
      ready.value = true
    }
  }

  async function login(emailValue: string, passwordValue: string) {
    error.value = ''
    sending.value = true
    try {
      const session = await api.login(
        emailValue.trim().toLowerCase(),
        passwordValue,
      )
      user.value = session.user
      ready.value = true
      pendingToken.value = ''
      return true
    } catch (e) {
      error.value = e instanceof ApiError
        ? e.message
        : 'No se ha podido iniciar sesión.'
      return false
    } finally {
      sending.value = false
    }
  }

  async function register(emailValue: string, passwordValue: string) {
    error.value = ''
    sending.value = true
    try {
      await api.register(
        emailValue.trim().toLowerCase(),
        passwordValue,
      )
      email.value = emailValue.trim().toLowerCase()
      return true
    } catch (e) {
      error.value = e instanceof ApiError
        ? e.message
        : 'No se ha podido crear la cuenta.'
      return false
    } finally {
      sending.value = false
    }
  }

  async function sendLink() {
    error.value = ''
    sending.value = true
    try {
      const sent = await api.requestMagicLink(email.value)
      pendingToken.value = sent.demoToken ?? ''
      step.value = 'sent'
      startCountdown()
    } catch (e) {
      error.value = e instanceof ApiError
        ? e.message
        : 'No se ha podido enviar el enlace.'
    } finally {
      sending.value = false
    }
  }

  async function resend() {
    if (!canResend.value) return
    await sendLink()
  }

  async function verify(token = pendingToken.value) {
    error.value = ''
    try {
      const session = await api.verifyMagicLink(token)
      user.value = session.user
      pendingToken.value = ''
      return true
    } catch (e) {
      error.value = e instanceof ApiError
        ? e.message
        : 'El enlace no es válido.'
      return false
    }
  }

  function changeEmail() {
    step.value = 'email'
    error.value = ''
    pendingToken.value = ''
    resendIn.value = 0
    if (ticker) {
      clearInterval(ticker)
      ticker = null
    }
  }

  async function logout() {
    await api.logout()
    user.value = null
    changeEmail()
    email.value = ''
  }

  return {
    user,
    step,
    email,
    error,
    sending,
    resendIn,
    ready,
    pendingToken,
    isAuthenticated,
    canResend,
    resendLabel,
    restore,
    sendLink,
    login,
    register,
    resend,
    verify,
    changeEmail,
    logout,
  }
})
