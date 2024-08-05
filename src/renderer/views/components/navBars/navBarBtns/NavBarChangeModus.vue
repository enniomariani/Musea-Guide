<template>
  <div id="screenModus" class="screen-modus">
    <BaseBtn v-for="(topic, index) in screenModi" :key="index" :id="'modus' + index"
             :text-color="activeModus === index? textColorSelected: textColor"
             :bg-color="activeModus === index? bgColorSelected: bgColor"
             :bg-color-hover="activeModus === index? bgColorHoverSelected: bgColorHover"
             @click="handleChangeModus(index)">
             {{ topic }}</BaseBtn>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, ref} from 'vue';
import BaseBtn from "renderer/views/components/ui-elements/btns/BaseBtn.vue";

interface Props {
  startModusNr: number
  screenModi: string[]
}
const props = defineProps<Props>();
const emit = defineEmits(['modusChanged']);


const textColor:string = "var(--color-secondary-500-base)";
const bgColor:string = "var(--color-secondary-800)";
const bgColorHover:string = "var(--color-secondary-800-hover)";

const textColorSelected:string = "var(--color-primary-500-base)";
const bgColorSelected:string = "var(--color-primary-800)";
const bgColorHoverSelected:string = "var(--color-primary-800-hover)";

let activeModus = ref(props.startModusNr);

async function handleChangeModus(index: number) {
  if (index == activeModus.value)
    return;

  activeModus.value = index;
  emit('modusChanged', activeModus.value);
}

</script>

<style scoped>
.screen-modus {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}
</style>