
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const mode = ref<'login' | 'register'>('login')
const registrationSent = ref(false)

async function onSubmit() {
  auth.error = ''

  if (mode.value === 'register') {
    if (password.value.length < 10) {
      auth.error = 'La contraseña debe tener al menos 10 caracteres.'
      return
    }

    if (password.value !== confirmPassword.value) {
      auth.error = 'Las contraseñas no coinciden.'
      return
    }

    const ok = await auth.register(auth.email, password.value)

    if (ok) {
      password.value = ''
      confirmPassword.value = ''
      registrationSent.value = true
    }

    return
  }

  const ok = await auth.login(auth.email, password.value)
  if (!ok) return

  password.value = ''
  router.push({
    name: auth.user?.profileComplete ? 'lobby' : 'profile',
  })
}

function changeMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  registrationSent.value = false
  password.value = ''
  confirmPassword.value = ''
  auth.error = ''
}
</script>

<template>
  <div class="qa-auth">
    <div>
      <div class="qa-brand" style="margin-bottom: var(--space-8)">
        <i class="ph-fill ph-lightning" aria-hidden="true"></i>
        <span>Sistemas en Práctica</span>
      </div>

      <h1 class="qa-auth-title">Practica. Diagnostica. Mejora.</h1>

      <p class="qa-lead">
        Evalúa competencias IT, investiga incidencias y practica en
        laboratorios guiados. Crea tu cuenta y empieza a practicar.
      </p>

      <div class="qa-auth-points">
        <div>
          <i class="ph ph-user-check" aria-hidden="true"></i>
          Registro con correo electrónico
        </div>
        <div>
          <i class="ph ph-shield-check" aria-hidden="true"></i>
          Contraseñas protegidas y sesiones con caducidad
        </div>
        <div>
          <i class="ph ph-timer" aria-hidden="true"></i>
          Escenarios y laboratorios guiados
        </div>
      </div>
    </div>

    <div class="qa-panel qa-panel-raised">
      <form class="qa-auth-form" @submit.prevent="onSubmit">
        <div v-if="registrationSent">
          <div class="qa-auth-heading">Comprueba tu correo</div>
          <div class="qa-auth-sub">
            Hemos procesado tu solicitud de registro para
            <strong>{{ auth.email }}</strong>.
            Si la dirección es válida, recibirás un correo con un enlace
            para confirmar tu cuenta. Revisa también la carpeta de spam.
          </div>

          <button
            type="button"
            class="qa-btn qa-btn-lg"
            @click="changeMode('login')"
          >
            Volver al inicio de sesión
          </button>
        </div>

        <template v-else>
          <div>
            <div class="qa-auth-heading">
              {{ mode === 'login' ? 'Iniciar sesión' : 'Crear una cuenta' }}
            </div>
            <div class="qa-auth-sub">
              {{
                mode === 'login'
                  ? 'Introduce el correo y la contraseña de tu cuenta.'
                  : 'Regístrate con tu correo y crea una contraseña.'
              }}
            </div>
          </div>

          <label class="qa-field">
            Correo electrónico
            <input
              v-model="auth.email"
              type="email"
              class="qa-input qa-input-lg"
              placeholder="tu@correo.com"
              autocomplete="email"
              required
              @input="auth.error = ''"
            />
          </label>

          <label class="qa-field">
            Contraseña
            <input
              v-model="password"
              type="password"
              class="qa-input qa-input-lg"
              placeholder="Tu contraseña"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              required
              minlength="10"
            />
          </label>

          <label v-if="mode === 'register'" class="qa-field">
            Repite la contraseña
            <input
              v-model="confirmPassword"
              type="password"
              class="qa-input qa-input-lg"
              placeholder="Repite tu contraseña"
              autocomplete="new-password"
              required
              minlength="10"
            />
          </label>

          <div v-if="auth.error" class="qa-error">
            <i class="ph ph-warning-circle" aria-hidden="true"></i>
            {{ auth.error }}
          </div>

          <button
            type="submit"
            class="qa-btn qa-btn-lg"
            :disabled="
              auth.sending ||
              !auth.email ||
              !password ||
              (mode === 'register' && !confirmPassword)
            "
          >
            <i
              :class="mode === 'login' ? 'ph ph-sign-in' : 'ph ph-user-plus'"
              aria-hidden="true"
            ></i>
            {{
              auth.sending
                ? 'Procesando…'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Crear cuenta'
            }}
          </button>

          <hr class="qa-rule" />

          <div class="qa-fineprint">
            <template v-if="mode === 'login'">
              ¿Todavía no tienes cuenta?
              <button
                type="button"
                class="qa-link"
                @click="changeMode('register')"
              >
                Crear una cuenta
              </button>
            </template>

            <template v-else>
              ¿Ya tienes cuenta?
              <button
                type="button"
                class="qa-link"
                @click="changeMode('login')"
              >
                Iniciar sesión
              </button>
            </template>
          </div>
        </template>
      </form>
    </div>
  </div>
</template>
