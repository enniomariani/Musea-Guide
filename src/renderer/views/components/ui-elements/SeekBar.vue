<template>
  <div class="container">
    <input ref="seekbar" type="range" id="seekbar" min="0"
           :max="durationSec" v-model="props.playHeadPos" step="1">
  </div>
</template>

<script setup lang="ts">
import {nextTick, defineEmits, defineProps, ref, onMounted, watch, onBeforeUnmount} from 'vue';

interface Props {
  durationSec: number
  playHeadPos: number
}
const props = defineProps<Props>();
const emit = defineEmits(['seek', 'seekStart', 'seekEnd']);

const seekbar = ref();

watch(() => props.playHeadPos, async (newVal) => {
  if (seekbar.value)
    updateSliderBg(props.playHeadPos);
});

onMounted(async () => {
  seekbar.value.addEventListener("pointerdown", handlePointerDown)

  seekbar.value.addEventListener("input", (event:Event) => {
    const target = event.target as HTMLInputElement;
    const sliderValue: number = parseFloat(target.value);

    emit("seek", sliderValue);
  });

  await nextTick();

  updateSliderBg(props.playHeadPos);
});

onBeforeUnmount(() => {
  seekbar.value.removeEventListener("pointerdown", handlePointerDown)
});

function updateSliderBg(playHeadPos:number):void{
  let progress= (props.durationSec > 0? (playHeadPos / props.durationSec) * 100: 0).toString();

  // Change the background of the input based on the progress
  seekbar.value.style.background = `linear-gradient(to right, var(--color-slider) ${progress}%, var(--color-slider-bg) ${progress}%)`;
}

function handlePointerDown(){
  window.addEventListener("pointerup", handleMouseUp, {capture: true});
  window.addEventListener("touchend", handleMouseUp, {capture: true});

  emit('seekStart', props.playHeadPos);
}

function handleMouseUp() {
  window.removeEventListener("pointerup", handleMouseUp, {capture: true});
  window.removeEventListener("touchend", handleMouseUp, {capture: true});

  emit('seekEnd', props.playHeadPos);
}

</script>

<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
}

input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;

  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: var(--color-slider);
  border-radius: 50%;
  cursor: pointer;
}
</style>