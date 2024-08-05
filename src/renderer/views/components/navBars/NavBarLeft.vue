<template>
  <nav class="nav-bar-left">
    <div class="container-top">
      <img v-if="pathToLogo !== ''" class= "logo" :src="pathToLogo"/>
      <NavBarExitBtn :class="hasExitBtn?null:'btn--hide'" @click.stop="exitClicked"></NavBarExitBtn>
      <NavBarFadeOutBtn :class="hasFadeOutBtn?null:'btn--hide'" @click.stop="fadeOutClicked"></NavBarFadeOutBtn>
    </div>
    <div class="container-center">
      <div id="navBarTitle" class="navbar-content">{{ text }}</div>
    </div>
    <div class="container-bottom">
      <div id="versionNr" class="version-nr"> {{version}}</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, ref, onMounted} from 'vue';
import NavBarExitBtn from "renderer/views/components/navBars/navBarBtns/NavBarExitBtn.vue";
import NavBarFadeOutBtn from "renderer/views/components/navBars/navBarBtns/NavBarFadeOutBtn.vue";

interface Props {
  text: string
  hasExitBtn: boolean
  hasFadeOutBtn: boolean
  version: string
}
defineProps<Props>();
const emit = defineEmits(['exitClicked', 'fadeOutClicked']);

const pathToLogo = ref("");

onMounted(() => {
  readLogoFromCssVar();
});

function readLogoFromCssVar() {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--logo-path').trim();
  if (val) pathToLogo.value = val.replace(/^["']|["']$/g, '');
}

function fadeOutClicked() {
  emit('fadeOutClicked');
}

function exitClicked() {
  emit('exitClicked');
}

</script>

<style scoped>
.nav-bar-left {
  width: 100%;
  height: 100%;
  padding: 36px 24px;

  background-color: var(--color-secondary-800);
  display: flex;
  align-items: center;
  flex-direction: column;
}

.container-top {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 45px;
}

.btn--hide{
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.logo{
  width: 152px;
  height: 35px;
}

.container-center {
  margin-block: auto;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 60px;
}

.container-bottom {
  margin-top: auto;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.navbar-content {
  color: var(--color-on-primary-800);
  text-align: center;
}

.version-nr{
  color: var(--color-on-primary-800);
}
</style>