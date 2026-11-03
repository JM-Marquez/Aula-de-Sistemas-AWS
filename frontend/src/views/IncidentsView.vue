<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IT_SCENARIOS } from '../data/itScenarios'
const router = useRouter()
const icons: Record<string,string> = { Linux: 'ph-terminal-window', AWS: 'ph-cloud', Redes: 'ph-network' }
</script>
<template>
  <div class="qa-in it-page">
    <div class="it-hero">
      <div class="qa-kicker">OPERACIONES · CASOS DE EMPRESA</div>
      <h1 class="qa-h1">Aprende a resolver lo que pasa en producción.</h1>
      <p class="qa-muted it-lead">Incidencias inspiradas en el día a día de un equipo IT. Analiza síntomas, reúne evidencias y decide cómo actuar antes de tocar un sistema real.</p>
      <div class="it-hero-meta"><span><i class="ph ph-briefcase"></i> Escenarios empresariales</span><span><i class="ph ph-shield-check"></i> Entorno seguro de simulación</span><span><i class="ph ph-clock"></i> 5–10 min por caso</span></div>
    </div>
    <div class="it-section-head"><div><div class="qa-kicker">CATÁLOGO DE INCIDENCIAS</div><h2 class="qa-h2">¿Qué está fallando hoy?</h2></div><span class="it-count">{{ IT_SCENARIOS.length }} escenarios disponibles</span></div>
    <div class="it-scenario-grid">
      <article v-for="s in IT_SCENARIOS" :key="s.id" class="qa-panel it-scenario-card">
        <div class="it-card-top"><span class="it-icon"><i :class="['ph', icons[s.area] || 'ph-warning']"></i></span><span class="it-chip">{{ s.area }}</span><span class="it-level">{{ s.level }}</span></div>
        <h3>{{ s.title }}</h3><p class="qa-muted">{{ s.summary }}</p>
        <div class="it-symptom"><span class="qa-label">SÍNTOMA DETECTADO</span><p>{{ s.symptom }}</p></div>
        <div class="it-impact"><i class="ph ph-users"></i>{{ s.impact }}</div>
        <button class="qa-btn it-full-btn" @click="router.push({ name: 'labs', query: { scenario: s.id } })">Investigar incidencia <i class="ph ph-arrow-up-right"></i></button>
      </article>
    </div>
    <div class="it-note"><i class="ph ph-info"></i><div><strong>Casos simulados, aprendizaje real.</strong><p>Los comandos y resultados están preparados para practicar diagnóstico y toma de decisiones. No se ejecutan acciones sobre tu cuenta AWS ni sobre servidores reales.</p></div></div>
  </div>
</template>
