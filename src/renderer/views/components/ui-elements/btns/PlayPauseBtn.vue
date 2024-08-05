<template>
  <TwoStateBtn id="PlayPauseBtn" :is-state1-active="isPlaying" @toggle-btn-request="toggleBtn">
    <template #state1>
      <Icon name="pause" color-main="var(--color-main)"/>
    </template>
    <template #state2>
      <Icon name="play" color-main="var(--color-main)"/>
    </template>
  </TwoStateBtn>
</template>

<script setup lang="ts">
import {defineEmits, defineProps} from 'vue';
import TwoStateBtn from "renderer/views/components/ui-elements/btns/TwoStateBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  isPlaying: boolean
}
defineProps<Props>();
const emit = defineEmits(['toggleBtnRequest']);

function toggleBtn() {
  emit('toggleBtnRequest') ;
}
</script>