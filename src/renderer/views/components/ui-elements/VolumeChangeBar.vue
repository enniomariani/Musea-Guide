<template>
  <div class="container">
    <input ref="volumeChangeBar" type="range" id="bar" min="0" max="1" :value="volume" step="0.1">
    <Icon name="volume" color-main="var(--color-main)"/>
  </div>
</template>

<script setup lang="ts">
import {nextTick, defineEmits, defineProps, ref, onMounted, watch} from 'vue';
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  volume: number
}
const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'changeVolume', volume: number): void }>();

const volumeChangeBar = ref();
let slider:HTMLInputElement;

onMounted(async () => {
  slider = volumeChangeBar.value;  // Access the seekbar element via the ref

  slider.addEventListener("input", (event: Event) => {
    const target = event.target as HTMLInputElement;
    const sliderValue: number = parseFloat(target.value);

    updateSliderBg(sliderValue);

    emit("changeVolume", sliderValue)
  });

  await nextTick();

  updateSliderBg(parseFloat(volumeChangeBar.value.value));
});

watch(() => props.volume, (val) => {
  if (!slider) return;
  slider.value = String(val);
  updateSliderBg(val);
});

function updateSliderBg(actualSliderValue:number){
  const progress:string = ((actualSliderValue / parseFloat(slider.max)) * 100).toString();

  // Change the background of the input based on the progress
  slider.style.background = `linear-gradient(to right, var(--color-slider) ${progress}%, var(--color-slider-bg) ${progress}%)`;
}

</script>

<style scoped>
.container {
  display: flex;
  align-items: center;

  padding: 2px 5px;
  width: 100%;
  height: 100%;
}

input[type="range"] {
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  border-radius: 4px;

  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-slider);
  border-radius: 50%;
  cursor: pointer;
}

</style>