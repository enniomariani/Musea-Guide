44<template>
  <div class="media-controls">
    <div class="line"></div>
    <div class="controls">
      <div class="top">
        <div class="left">
          <PlayPauseBtn :is-playing="isPlaying" @toggle-btn-request="handlePlayToggle"></PlayPauseBtn>
          <div class="timeInfo">
            {{ convertSecToMinAndSecStr(playHeadPosSec) }} / {{ convertSecToMinAndSecStr(videoTotalTimeSec) }}
          </div>
        </div>
        <AudioControlPanel ref="audioControlRef" :playback-presenter="playbackPresenter" :media-station-id="mediaStationId"></AudioControlPanel>
      </div>
      <div class="bottom">
        <SeekBar :duration-sec="videoTotalTimeSec" :play-head-pos="playHeadPosSec"
                 @seek="handleSeek" @seek-start="handleStartSeek" @seek-end="handleEndSeek"></SeekBar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, ref, defineEmits} from 'vue';
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import AudioControlPanel from "renderer/views/components/ui-elements/AudioControlPanel.vue";
import PlayPauseBtn from "renderer/views/components/ui-elements/btns/PlayPauseBtn.vue";
import SeekBar from "renderer/views/components/ui-elements/SeekBar.vue";

interface Props {
  playbackPresenter: PlaybackPresenter
  mediaStationId:number
}
const props = defineProps<Props>();
const emit = defineEmits(['Exit']);
defineExpose({playMedia})

const playHeadPosSec = ref(-1);
const videoTotalTimeSec = ref(-1);
const audioControlRef = ref();

let isPlaying = ref(true);

async function playMedia(contentId:number):Promise<void>{
  isPlaying.value = true;
  audioControlRef.value.reset();

  videoTotalTimeSec.value = props.playbackPresenter.getMaxDuration(props.mediaStationId, contentId);
  playHeadPosSec.value = 0;
  await props.playbackPresenter.play(props.mediaStationId, contentId, true, onAdvancePlayhead, onVideoEnded)
}

function onAdvancePlayhead(timeInMs: number): void {
  playHeadPosSec.value = Math.floor(timeInMs / 1000);
}

async function onVideoEnded(): Promise<void> {
  emit("Exit");
}

function handlePlayToggle(){
  if(isPlaying.value === true){
    isPlaying.value = false;
    props.playbackPresenter.pause(props.mediaStationId);
  }else{
    isPlaying.value = true;
    props.playbackPresenter.resume(props.mediaStationId,  true);
  }
}

function handleSeek(newPositionSec:number){
  props.playbackPresenter.seek(props.mediaStationId, newPositionSec);
}

function handleStartSeek(newPositionSec:number){
  props.playbackPresenter.startSeek(props.mediaStationId, newPositionSec);
}

function handleEndSeek(newPositionSec:number){
  props.playbackPresenter.endSeek(props.mediaStationId, newPositionSec);
}

function convertSecToMinAndSecStr(timeInSec:number){
  const minutes:number = Math.floor(timeInSec / 60);
  const seconds:number = timeInSec % 60;

  const minStr:string = String(minutes >= 10? "": "0") + minutes.toString();
  const secStr:string = String(seconds >= 10? "": "0") + seconds.toString();

  return minStr + ":" + secStr;
}

</script>

<style scoped>
.media-controls {
  height: 104px;
  width: 100%;
  background-color: var(--color-on-secondary-50);
  padding: 0 28px 20px;
}

.line {
  margin-top: 0;
  height: 1px;
  width: 100%;
  background: var(--color-secondary-700);
}

.controls{
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.top{
  width:100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
}

.timeInfo{
  font-variant-numeric: tabular-nums;
  color: var(--color-main);
  font-size: var(--font-size-medium);
}

.bottom{
  width: 100%;
  display: flex;
}
</style>