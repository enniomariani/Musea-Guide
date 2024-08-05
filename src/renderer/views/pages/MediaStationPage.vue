<template>
  <BasePage :showOverlays="infoText !== '' || showTwoButtonOverlay || timeoutInfoText!==''">
    <template #overlays>
      <component v-if="infoText !== ''" :is="FullScreenInfo" :text="infoText"/>
      <component v-if="timeoutInfoText !== '' && infoText === ''" :is="FullScreenInfo" :text="timeoutInfoText"/>
      <component v-if="showTwoButtonOverlay" :is="TwoBtnPopUp"
                 :title="$t('alertBlockMediastation')"
                 icon-no="cross" icon-yes="check"
                 :btn-text-yes="$t('btnContinue')" :btn-text-no="$t('btnAbort')" highlight-btn="yes" @yes="handleOpenMSyes"
                 @no="handleOpenMSno"/>
    </template>
    <template #column-1>
      <NavBarLeft :text="$t('appName')" :version="version" :has-exit-btn="false" :has-fade-out-btn="false" />
    </template>
    <template #column-2>
      <NavBarTop title="" :has-refresh-btn="true" :has-back-btn="false" @refresh-clicked="handleRefresh"
                 :show-search="false" :start-modus-nr="0" :screen-modi="[]"/>
      <MainList v-if="mediaStationsWithIcons" :items="mediaStationsWithIcons" @item-clicked="handleClickMediaStation"
                :items-clickable="true">
        <template #right-content="{ item }">
          <ConnectionIndicator :is-ok="item.status"/>
        </template>
      </MainList>
      <NavBarBottom/>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, computed, onMounted, nextTick} from 'vue';
import {
  DownloadContentsResult,
  DownloadContentsStatus,
  IViewMediastation,
  MediaStationPresenter
} from "renderer/presenters/MediaStationPresenter.js";
import { useI18n } from 'vue-i18n';
import TwoBtnPopUp from "renderer/views/components/fullScreenOverlays/popUps/TwoBtnPopUp.vue";
import BasePage from "renderer/views/pages/BasePage.vue";
import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";

import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";
import MainList from "renderer/views/components/ui-elements/lists/MainList.vue";
import NavBarBottom from "renderer/views/components/navBars/NavBarBottom.vue";
import FullScreenInfo from "renderer/views/components/fullScreenOverlays/FullScreenInfo.vue";
import ConnectionIndicator from "renderer/views/components/ui-elements/ConnectionIndicator.vue";

interface IMediaStationView {
  id: number
  title: string
  iconName: string
  status: boolean
  type: string
}

interface Props {
  mediaStationPresenter: MediaStationPresenter
  timeoutInfoText:string
  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['OpenMediaStation']);

const { t } = useI18n();
const iconName: string = 'mediastation';

const infoText = ref("");
const showTwoButtonOverlay = ref(false);
const clickedMediaStationId = ref<number>(-1);
let mediaStations = ref<IViewMediastation[]>([]);

const mediaStationsWithIcons = computed<IMediaStationView[]>(() =>
    mediaStations.value.map(station => ({
      ...station,
      iconName: iconName,
      type: 'mediaStation',
    }))
);

onMounted(async () => {
  mediaStations.value = await props.mediaStationPresenter.loadSavedMediaStations();
  await checkOnlineStatus();
});

function handleClickMediaStation(itemId: number) {
  clickedMediaStationId.value = itemId;
  showTwoButtonOverlay.value = true;
}

async function handleOpenMSyes() {
  showTwoButtonOverlay.value = false;
  await onTryToOpenMediaStation(clickedMediaStationId.value);
}

function handleOpenMSno() {
  showTwoButtonOverlay.value = false;
}

async function handleRefresh() {
  await checkOnlineStatus();
}

async function checkOnlineStatus() {
  infoText.value = t('infoCheckOnlineStateOfMediaStations');

  for (const [key, item] of Object.entries(mediaStationsWithIcons.value))
    await updateMediaStationStatus(item as IMediaStationView);

  closeInfoWindow();
}

async function updateMediaStationStatus(mediaStation: IMediaStationView) {
  const status:boolean = await props.mediaStationPresenter.checkOnlineStatusOfAllMediaPlayers(mediaStation.id);
  setMediaStationStatus(mediaStation.id, status);
  infoText.value += t('checkMediaStation') + mediaStation.title + "\n" + (status ? t('mediaStationReachable') : t('mediaStationNotReachable'));
}

function setMediaStationStatus(mediaStationId: number, status: boolean): void {
  const original = mediaStations.value.find(ms => ms.id === mediaStationId);

  if (original)
    (original as any).status = status;
}

async function onTryToOpenMediaStation(mediaStationId: number): Promise<void> {
  infoText.value = t('checkConnectionToController');

  const downloadAnswer:DownloadContentsResult = await props.mediaStationPresenter.downloadContents(mediaStationId);
  const key:string = toDownloadMessageKey(downloadAnswer.status);
  let msg:string = t(key);

  if(downloadAnswer.status === DownloadContentsStatus.NoResponseFromController)
    msg += downloadAnswer.params?.ip;

  infoText.value += msg;

  if (downloadAnswer.status === DownloadContentsStatus.Success || downloadAnswer.status === DownloadContentsStatus.NoContentsOnController) {
    setTimeout(async () => {
      await onOpenMediaStation(mediaStationId);
    }, 500);
  } else {
    setMediaStationStatus(mediaStationId, false)
    closeInfoWindow();
  }
}

function toDownloadMessageKey(status: DownloadContentsStatus): string {
  switch (status) {
    case DownloadContentsStatus.Success: return 'download.success'
    case DownloadContentsStatus.NoContentsOnController: return 'download.noContentsOnController'
    case DownloadContentsStatus.NoControllerIp: return 'download.noControllerIp'
    case DownloadContentsStatus.NoResponseFromController: return 'download.noResponseFromController'
    case DownloadContentsStatus.Other: return 'download.other'
  }
}

async function onOpenMediaStation(mediaStationId: number): Promise<void> {
  infoText.value = "";
  await props.mediaStationPresenter.connnectAndRegisterAllMediaPlayers(mediaStationId);
  emit('OpenMediaStation', mediaStationId);
}

function closeInfoWindow(): void {
  setTimeout(() => {infoText.value = ""}, 1000);
}

</script>