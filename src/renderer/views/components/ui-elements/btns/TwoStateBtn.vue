<template>
  <button class="btn" @click.stop="toggleBtn">
    <slot name="state1" v-if="isState1Active"></slot>
    <slot name="state2" v-else></slot>
  </button>
</template>

<script setup lang="ts">
import {defineEmits, defineProps} from 'vue';

interface Props {
  isState1Active: boolean
}
defineProps<Props>();
const emit = defineEmits(['toggleBtnRequest']);

function toggleBtn() {
  emit('toggleBtnRequest') ;
}
</script>

<style scoped>
.btn {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  border: 0;
  background-color: rgba(0, 0, 0, 0);
}

.btn:hover {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 36px;
}
</style>