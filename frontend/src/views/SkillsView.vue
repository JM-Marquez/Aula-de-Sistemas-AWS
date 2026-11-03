<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IT_SCENARIOS } from '../data/itScenarios'
const completed = ref<string[]>([])
onMounted(() => { try { completed.value = JSON.parse(localStorage.getItem('sp-labs-completed') || '[]') } catch { completed.value = [] } })
const areas = computed(() => ['Linux','AWS','Redes','Seguridad'].map(area => {
  const total = IT_SCENARIOS.filter(s => s.area === area).length
  const done = IT_SCENARIOS.filter(s => s.area === area && completed.value.includes(s.id)).length
  return { area, done, total, value: total ? Math.round(done / total * 100) : 0, note: done ? 'Prácticas completadas' : 'Pendiente de practicar' }
}))
const overall = computed(() => Math.round(completed.value.length / IT_SCENARIOS.length * 100))
</script>
<template>
  <div class="qa-in it-page"><div class="qa-kicker">DESARROLLO PROFESIONAL · INFORME PERSONAL</div><h1 class="qa-h1">Tu mapa de competencias.</h1><p class="qa-muted it-lead">Consulta tu progreso práctico y descubre qué áreas conviene reforzar. Los indicadores se actualizan al completar laboratorios.</p>
    <div class="it-overview-grid"><div class="qa-panel it-overview-card"><span class="qa-label">LABORATORIOS COMPLETADOS</span><strong>{{ completed.length }}<small> / {{ IT_SCENARIOS.length }}</small></strong><span class="it-overview-foot">Prácticas registradas en este navegador</span></div><div class="qa-panel it-overview-card"><span class="qa-label">PROGRESO PRÁCTICO</span><strong>{{ overall }}<small>%</small></strong><div class="it-progress"><span :style="{ width: overall + '%' }"></span></div></div><div class="qa-panel it-overview-card"><span class="qa-label">SIGUIENTE OBJETIVO</span><strong class="it-next-goal">{{ completed.length === IT_SCENARIOS.length ? 'Ampliar nivel' : 'Completar prácticas' }}</strong><span class="it-overview-foot">Consolida tus conocimientos con escenarios.</span></div></div>
    <div class="it-section-head"><div><div class="qa-kicker">ÁREAS TÉCNICAS</div><h2 class="qa-h2">Diagnóstico de competencias</h2></div></div>
    <div class="qa-panel it-skills-panel"><div v-for="a in areas" :key="a.area" class="it-skill-row"><div class="it-skill-name"><strong>{{ a.area }}</strong><span>{{ a.note }}</span></div><div class="it-skill-track"><span :style="{ width: a.value + '%' }"></span></div><strong class="it-skill-value">{{ a.value }}%</strong></div></div>
    <div class="it-note"><i class="ph ph-info"></i><div><strong>Cómo interpretar este informe</strong><p>Este primer diagnóstico refleja las prácticas completadas, no una certificación ni una medición automática de conocimientos. Las evaluaciones y más escenarios permitirán ampliar el diagnóstico en futuras iteraciones.</p></div></div>
  </div>
</template>
