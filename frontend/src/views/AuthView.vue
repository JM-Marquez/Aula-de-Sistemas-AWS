<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const password = ref('')

async function onSubmit() {
  const ok = await auth.login(auth.email, password.value)
  if (!ok) return
  password.value = ''
  router.push({ name: auth.user?.profileComplete ? 'lobby' : 'profile' })
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
        Evalúa competencias IT, investiga incidencias y practica en laboratorios guiados.
        Accede con las credenciales que te facilite el administrador.
      </p>
      <div class="qa-auth-points">
        <div><i class="ph ph-user-check" aria-hidden="true"></i> Cuentas creadas por el administrador</div>
        <div><i class="ph ph-shield-check" aria-hidden="true"></i> Contraseñas protegidas y sesiones con caducidad</div>
        <div><i class="ph ph-timer" aria-hidden="true"></i> Escenarios y laboratorios guiados</div>
      </div>
    </div>

    <div class="qa-panel qa-panel-raised">
      <form class="qa-auth-form" @submit.prevent="onSubmit">
        <div>
          <div class="qa-auth-heading">Iniciar sesión</div>
          <div class="qa-auth-sub">Introduce el correo y la contraseña de tu cuenta.</div>
        </div>
        <label class="qa-field">
          Correo electrónico
          <input v-model="auth.email" type="email" class="qa-input qa-input-lg" placeholder="tu@correo.dev" autocomplete="username" required @input="auth.error = ''" />
        </label>
        <label class="qa-field">
          Contraseña
          <input v-model="password" type="password" class="qa-input qa-input-lg" placeholder="Tu contraseña" autocomplete="current-password" required />
        </label>
        <div v-if="auth.error" class="qa-error">
          <i class="ph ph-warning-circle" aria-hidden="true"></i> {{ auth.error }}
        </div>
        <button type="submit" class="qa-btn qa-btn-lg" :disabled="auth.sending || !auth.email || !password">
          <i class="ph ph-sign-in" aria-hidden="true"></i>
          {{ auth.sending ? 'Comprobando…' : 'Entrar' }}
        </button>
        <hr class="qa-rule" />
        <div class="qa-fineprint">Si todavía no tienes cuenta, solicita al administrador que te cree una.</div>
      </form>
    </div>
  </div>
</template>
