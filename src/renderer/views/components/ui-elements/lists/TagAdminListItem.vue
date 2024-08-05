<template>
  <div ref="tagListItemRef" class="main-container"
       :class="{
    'main-container--highlighted': highlighted,
    'main-container--selected': selected && !highlighted
  }">
    <div class="check-box" @click.stop="toggleSelected">
      <Icon v-if="!highlighted" :name="selected? 'checkbox-true': 'checkbox-false'"
            :id="selected? 'checkbox-true': 'checkbox-false'"
            :color-main="selected?'var(--color-on-primary-500-base)': undefined"
            :color-second="selected?'var(--color-primary-500-base)': 'var(--color-secondary-300)'"/>
    </div>
    <div id="text" class="text" :class="{
    'text--highlighted': highlighted,
    'text--selected': selected && !highlighted
  }">{{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, ref, defineProps, onMounted, onBeforeUnmount} from 'vue';
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  text: string
  selected: boolean
  selectable: boolean
  highlighted: boolean
  opacity: number
}

const props = defineProps<Props>();
const emit = defineEmits(['requestDeselect', 'requestSelect', 'longClickSelected']);

const tagListItemRef = ref();
let timerId: ReturnType<typeof setTimeout> | null = null;
let longClickDone: boolean = false;

onMounted(async () => {
  tagListItemRef.value.addEventListener("pointerdown", handlePointerDown)
});

onBeforeUnmount(() => {
  tagListItemRef.value.removeEventListener("pointerdown", handlePointerDown)
});

function handlePointerDown() {
  longClickDone = false;

  timerId = setTimeout(onLongClick, 1000);
  window.addEventListener("pointerup", handleMouseUp);
  window.addEventListener("touchend", handleMouseUp);
}

function handleMouseUp() {
  if (timerId !== null)
    clearTimeout(timerId);

  window.removeEventListener("pointerup", handleMouseUp);
  window.removeEventListener("touchend", handleMouseUp);

  if (longClickDone)
    emit("longClickSelected");
}

function onLongClick() {
  timerId = null;
  longClickDone = true;
}

function toggleSelected() {
  if (longClickDone || !props.selectable)
    return;

  props.selected ? emit('requestDeselect') : emit('requestSelect');
}
</script>

<style scoped>
.main-container {
  box-sizing: border-box;

  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px 14px;
  border-radius: var(--radius-default);

  background-color: var(--color-secondary-50);

  opacity: v-bind(opacity);
}

.main-container:hover {
  background-color: var(--color-secondary-100);
}

.main-container--selected {
  background-color: var(--color-primary-50);
  color: var(--color-primary-500-base) !important;
}

.main-container--selected:hover {
  background-color: var(--color-primary-50-hover);
  color: var(--color-primary-500-base);
}

.main-container--highlighted {
  background-color: var(--color-primary-500-base);
}

.main-container--highlighted:hover {
  background-color: var(--color-primary-500-base);
}

.check-box {
  cursor: pointer;
}

.text {
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-on-secondary-50);
  font-size: var(--font-size-medium);
}

.text--selected {
  color: var(--color-primary-500-base) !important;
}

.text--highlighted {
  color: var(--color-on-primary-500-base) !important;
}
</style>