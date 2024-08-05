<template>
  <div class="control-panel">
    <VolumeChangeBar ref="volumeChangeRef" :volume="volume" @change-volume="handleChangeVolume"></VolumeChangeBar>
    <MuteUnmuteBtn :is-muted="isMutedRef" @toggle-btn-request="handleMuteToggle"></MuteUnmuteBtn>
  </div>
</template>

<script setup lang="ts">
import {defineProps, ref, onMounted} from 'vue';
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import VolumeChangeBar from "renderer/views/components/ui-elements/VolumeChangeBar.vue";
import MuteUnmuteBtn from "renderer/views/components/ui-elements/btns/MuteUnmuteBtn.vue";

interface Props {
  playbackPresenter: PlaybackPresenter
  mediaStationId: number
}
const props = defineProps<Props>();
defineExpose({reset})

const volume = ref(0.5);
const volumeChangeRef = ref(null);

let isMutedRef = ref(false);

onMounted(async () => {
  reset();
});

function reset() {
  isMutedRef.value = false;
  volume.value = 0.5;
}

function handleMuteToggle() {
  if (isMutedRef.value === true) {
    isMutedRef.value = false;
    props.playbackPresenter.unmute(props.mediaStationId);
  } else {
    isMutedRef.value = true;
    props.playbackPresenter.mute(props.mediaStationId);
  }
}

function handleChangeVolume(newVolume: number) {
  volume.value = newVolume;
  props.playbackPresenter.setVolume(props.mediaStationId, newVolume);
}
</script>

<style scoped>
.control-panel {
  display: flex;
  align-items: center;
}
</style>