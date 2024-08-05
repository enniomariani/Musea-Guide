<template>
  <div class="base-page">
    <div class="overlays" v-if="showOverlays">
      <slot name="overlays"></slot>
    </div>
    <div class="main-content">
      <div class="column-1">
        <slot name="column-1"></slot>
      </div>
      <div class="column-2">
        <slot name="column-2"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps} from 'vue';

interface Props {
  showOverlays: boolean
}
defineProps<Props>();

</script>

<style scoped>
.base-page {
  height: 100vh;
  width: 100vw;
  display: flex;
}

.overlays{
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
}

.main-content {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.column-1 {
  flex-shrink: 0;
  width: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-2 {
  width: 100%;
  height: 100%;
  flex-grow: 1; /* Takes up more space compared to column-1 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>