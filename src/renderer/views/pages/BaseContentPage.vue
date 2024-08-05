<template>
  <BasePage
      :show-overlays="infoText !== '' || showTwoButtonOverlayCloseMS || hasActiveChildOverlay">
    <template #overlays>
      <component v-if="infoText !== ''" :is="FullScreenInfo" :text="infoText"/>
      <component v-if="showTwoButtonOverlayCloseMS" :is="TwoBtnPopUp"
                 :title="$t('reallyCloseMediastation')"
                 iconNo="cross" iconYes="check"
                 :btn-text-yes="$t('btnYes')" :btn-text-no="$t('btnNo')" highlightBtn="yes" @yes="handleCloseMSyes"
                 @no="handleCloseMSno"/>
      <slot name="overlays"></slot>
    </template>
    <template #column-1>
      <NavBarLeft :text="mediaStationName" :has-exit-btn="true" @exit-clicked="handleClickExit"
                  :has-fade-out-btn="showFadeOutBtn" @fade-out-clicked="handleClickFadeOut" :version="version"/>
    </template>
    <template #column-2>
      <NavBarTop :has-back-btn="textBackBtn !== ''" :title="textBackBtn"
                 :show-search="showSearchField" :has-refresh-btn="false"
                 @back-clicked="handleBackClick" @search="handleSearch" @abort-search="handleAbortSearch"
                 @modus-changed="handleChangedModus"
                 :screen-modi="screenModi" :start-modus-nr="selectedModus"/>
      <slot name="main-list"></slot>
      <MediaControlPanel ref="mediaControlRef"
                         v-show="showMediaControls"
                         :media-station-id="mediaStationId"
                         :playback-presenter="playbackPresenter"
                         :content-id="selectedContentId"
                         @exit="handleVideoEnded"/>
      <NavBarBottom v-show="!showMediaControls"/>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, onMounted, onUnmounted} from 'vue';
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import FullScreenInfo from "renderer/views/components/fullScreenOverlays/FullScreenInfo.vue";
import TwoBtnPopUp from "renderer/views/components/fullScreenOverlays/popUps/TwoBtnPopUp.vue";
import BasePage from "renderer/views/pages/BasePage.vue";
import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";
import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";
import NavBarBottom from "renderer/views/components/navBars/NavBarBottom.vue";
import MediaControlPanel from "renderer/views/components/ui-elements/MediaControlPanel.vue";
import {useI18n} from "vue-i18n";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {useInactivity} from "renderer/views/composables/useInactivity.js";

interface Props {
  playbackPresenter: PlaybackPresenter
  mediaStationPresenter: MediaStationPresenter
  inactivityPresenter:InactivityPresenter
  mediaStationId: number

  showSearchField:boolean

  textBackBtn:string
  selectedModus:number

  hasActiveChildOverlay:boolean

  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['Exit', 'Search','AbortSearch', 'ClickBack', 'ModusChanged', 'onContentUnselected']);
defineExpose({unselectContent, selectContent});

const { t } = useI18n();
const screenModi = [t('modusContents'), t('modusTags')];
const infoText = ref("");
const mediaStationName: string = props.mediaStationPresenter.getName(props.mediaStationId);
const showTwoButtonOverlayCloseMS = ref(false);
const showFadeOutBtn = ref(false);
const showMediaControls = ref(false);
const mediaControlRef = ref();

const selectedContentId = ref(-1);

useInactivity(props.inactivityPresenter);

onMounted(async () => {
  props.inactivityPresenter.resetAndStart();
});

function handleClickExit() {
  showTwoButtonOverlayCloseMS.value = true;
}

function handleClickFadeOut(){
  unselectContent();
}

async function handleCloseMSyes() {
  showTwoButtonOverlayCloseMS.value = false;

  await props.playbackPresenter.stop(props.mediaStationId);
  await props.mediaStationPresenter.unregisterAndCloseAllMediaPlayers(props.mediaStationId);

  props.inactivityPresenter.stop();

  emit("Exit");
}

function handleCloseMSno() {
  showTwoButtonOverlayCloseMS.value = false;
}

async function handleBackClick() {
  emit("ClickBack");
}

async function handleSearch(searchString: string) {
  emit('Search', searchString);
}

function handleChangedModus(newModusId: number) {
  emit('ModusChanged', newModusId);
}

async function handleAbortSearch() {
  emit('AbortSearch');
}

async function selectContent(id: number, hasVideo: boolean) {
  selectedContentId.value = id;

  showMediaControls.value = hasVideo;
  showFadeOutBtn.value = true;

  if(hasVideo)
    await mediaControlRef.value.playMedia(selectedContentId.value);
  else{
    await props.playbackPresenter.play(props.mediaStationId, selectedContentId.value, false,
        () => {
        }, () => {
        });
  }
}

async function unselectContent() {
  if (selectedContentId.value === -1)
    return;

  showFadeOutBtn.value = false;
  showMediaControls.value = false;
  selectedContentId.value = -1;

  await props.playbackPresenter.stop(props.mediaStationId);

  emit("onContentUnselected");
}

async function handleVideoEnded(): Promise<void> {
  await unselectContent();
}

</script>