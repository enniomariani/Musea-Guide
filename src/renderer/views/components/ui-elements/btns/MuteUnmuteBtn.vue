<template>
  <TwoStateBtn id="muteUnmuteBtn" :is-state1-active="isMuted" @toggle-btn-request="toggleBtn">
    <template #state1>
      <Icon name="mute" color-main="var(--color-main)"/>
    </template>
    <template #state2>
      <Icon name="volume" color-main="var(--color-main)"/>
    </template>
  </TwoStateBtn>
</template>

<script setup lang="ts">
import {defineEmits, defineProps} from 'vue';
import TwoStateBtn from "renderer/views/components/ui-elements/btns/TwoStateBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  isMuted: boolean
}
defineProps<Props>();
const emit = defineEmits(['toggleBtnRequest']);

function toggleBtn() {
  emit('toggleBtnRequest') ;
}
</script>