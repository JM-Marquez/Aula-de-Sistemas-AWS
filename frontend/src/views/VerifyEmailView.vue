<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, ApiError } from '../services'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(async () => {
  const token = String(route.query.token ?? '')

  if (!token) {
    message.value = 'El enlace de confirmación no es válido.'
    loading.value = false
    return
  }

  try {
    await api.verifyEmail(token)
    success.value = true
    message.value = 'Tu correo ha sido confirmado. Ya puedes iniciar sesión.'
  } catch (error) {
    message.value =
      error instanceof ApiError
        ? error.message
        : 'No se ha podido confirmar el correo.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="verify-page">
    <section class="verify-card">
      <h1>Confirmación de correo</h1>

      <p v-if="loading">Estamos comprobando tu enlace...</p>

      <template v-else>
        <p>{{ message }}</p>

        <button v-if="success" type="button" @click="router.push('/')">
          Ir al inicio de sesión
        </button>

        <button v-else type="button" @click="router.push('/')">
          Volver
        </button>
      </template>
    </section>
  </main>
</template>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.verify-card {
  width: min(100%, 440px);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  background: #202437;
  color: #fff;
}

.verify-card button {
  margin-top: 20px;
  padding: 12px 22px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}
</style>