<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IT_SCENARIOS } from '../data/itScenarios'
const route = useRoute()
const selectedId = ref(String(route.query.scenario || IT_SCENARIOS[0].id))
const stepIndex = ref(0)
const command = ref('')
const executed = ref(false)
const commandAccepted = ref(false)
const completed = ref<string[]>([])
const scenario = computed(() => IT_SCENARIOS.find(s => s.id === selectedId.value) || IT_SCENARIOS[0])
const step = computed(() => scenario.value.steps[stepIndex.value])
const progress = computed(() => completed.value.includes(scenario.value.id) ? 100 : Math.round((stepIndex.value / scenario.value.steps.length) * 100))
const terminalOutput = computed(() => commandAccepted.value ? step.value.output : `Comando no reconocido para este paso. Revisa la instrucción y prueba: ${step.value.command}`)
onMounted(() => { try { completed.value = JSON.parse(localStorage.getItem('sp-labs-completed') || '[]') } catch { completed.value = [] } })
watch(() => route.query.scenario, value => { if (typeof value === 'string') selectScenario(value) })
function selectScenario(id: string) { selectedId.value = id; stepIndex.value = 0; command.value = ''; executed.value = false; commandAccepted.value = false }
function runCommand() { if (!command.value.trim()) command.value = step.value.command; executed.value = true; commandAccepted.value = command.value.trim() === step.value.command.trim() }
function nextStep() {
  if (stepIndex.value < scenario.value.steps.length - 1) { stepIndex.value++; command.value = ''; executed.value = false; commandAccepted.value = false }
  else { if (!completed.value.includes(scenario.value.id)) completed.value.push(scenario.value.id); localStorage.setItem('sp-labs-completed', JSON.stringify(completed.value)) }
}
function restart() { stepIndex.value = 0; command.value = ''; executed.value = false; commandAccepted.value = false }
</script>
<template>
  <div class="qa-in it-page">
    <div class="qa-kicker">ENTORNO DE PRÁCTICAS</div><h1 class="qa-h1">Laboratorios guiados</h1>
    <p class="qa-muted it-lead">Investiga una incidencia paso a paso. Escribe comandos, interpreta la salida y aprende por qué cada comprobación importa.</p>
    <div class="it-lab-layout">
      <aside class="qa-panel it-lab-sidebar"><div class="qa-label">ESCENARIOS</div>
        <button v-for="s in IT_SCENARIOS" :key="s.id" class="it-lab-choice" :class="{ active: selectedId === s.id }" @click="selectScenario(s.id)"><span><i :class="['ph', s.area === 'Linux' ? 'ph-terminal' : s.area === 'AWS' ? 'ph-cloud' : 'ph-network']"></i></span><span class="it-lab-choice-text"><strong>{{ s.title }}</strong><small>{{ s.area }} · {{ s.level }}</small></span><i v-if="completed.includes(s.id)" class="ph ph-check-circle it-done"></i></button>
      </aside>
      <section class="it-lab-main">
        <div class="qa-panel it-brief"><div class="it-card-top"><span class="it-chip">{{ scenario.area }}</span><span class="it-level">{{ scenario.level }}</span><span class="qa-spacer"></span><span class="it-step-count">PASO {{ stepIndex + 1 }} / {{ scenario.steps.length }}</span></div><h2>{{ scenario.title }}</h2><p>{{ scenario.summary }}</p><div class="it-objective"><span class="qa-label">OBJETIVO DEL LABORATORIO</span><p>{{ scenario.objective }}</p></div><div class="it-progress"><span :style="{ width: progress + '%' }"></span></div></div>
        <div class="qa-panel it-terminal-panel"><p class="it-step-instruction">{{ step.instruction }}</p><div class="it-terminal-head"><span><i class="ph ph-terminal-window"></i> Terminal de simulación</span><span class="it-terminal-status"><i></i> ENTORNO AISLADO</span></div><div class="it-terminal-body"><div class="it-terminal-line"><span class="it-prompt">alumno@srv-lab:~$</span> {{ executed ? command : step.command }}</div><pre v-if="executed" class="it-output">{{ terminalOutput }}</pre><div v-else class="it-terminal-placeholder">La salida del comando aparecerá aquí cuando lo ejecutes.</div></div><div class="it-command-row"><span class="it-prompt">$</span><input v-model="command" :placeholder="step.command" @keyup.enter="runCommand" :disabled="executed" aria-label="Comando de terminal"/><button class="qa-btn" @click="runCommand" :disabled="executed">Ejecutar <i class="ph ph-play"></i></button></div><p class="it-demo-warning">Simulación educativa: los comandos no se ejecutan en un sistema operativo real.</p></div>
        <div v-if="executed && commandAccepted" class="it-explanation"><div class="it-explanation-icon"><i class="ph ph-lightbulb"></i></div><div><strong>{{ step.title }}</strong><p>{{ step.explanation }}</p><button class="qa-btn" @click="nextStep">{{ stepIndex === scenario.steps.length - 1 ? 'Finalizar laboratorio' : 'Siguiente comprobación' }} <i class="ph ph-arrow-right"></i></button></div></div>
        <div v-if="completed.includes(scenario.id) && stepIndex === scenario.steps.length - 1 && executed && commandAccepted" class="it-complete"><i class="ph-fill ph-check-circle"></i><strong>Laboratorio completado</strong><span>Has registrado esta práctica en tu progreso.</span><button class="qa-btn" @click="restart">Repetir laboratorio</button></div>
      </section>
    </div>
  </div>
</template>
