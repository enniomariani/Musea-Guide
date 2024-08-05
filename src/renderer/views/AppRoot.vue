<template>
  <Suspense>
    <MediaStationPage v-if="activePage === Pages.MediaStation" :media-station-presenter="mediaStationPresenter"
                      :version="version" @open-media-station="onOpenMediaStation"
                      :timeout-info-text="infoText"></MediaStationPage>
    <FolderPage v-if="activePage === Pages.Folder" :folder-presenter="folderPresenter"
                :playback-presenter="playbackPresenter" :inactivity-presenter="inactivityPresenter"
                :media-station-presenter="mediaStationPresenter" :media-station-id="selectedMediaStationId"
                :version="version" :tag-presenter="tagPresenter"
                @exit="onExitMediaStation" @modus-changed="onModusChanged"></FolderPage>
    <TagPage v-if="activePage === Pages.Tags" :folder-presenter="folderPresenter"
             :playback-presenter="playbackPresenter" :inactivity-presenter="inactivityPresenter"
             :media-station-presenter="mediaStationPresenter" :media-station-id="selectedMediaStationId"
             :version="version" :tag-presenter="tagPresenter"
             @exit="onExitMediaStation" @modus-changed="onModusChanged" @tag-selected="onTagSelected"></TagPage>
    <PlaylistPage v-if="activePage === Pages.Playlist" :folder-presenter="folderPresenter"
                  :playback-presenter="playbackPresenter" :inactivity-presenter="inactivityPresenter"
                  :media-station-presenter="mediaStationPresenter"
                  :selected-tag-id="selectedTag" :media-station-id="selectedMediaStationId"
                  :version="version" :tag-presenter="tagPresenter" :selected-tag-name="selectedTagName"
                  @exit="onExitMediaStation" @on-click-back="onBackFromPlaylist"></PlaylistPage>
  </Suspense>
</template>

<script setup lang="ts">
import {defineProps, onMounted, ref} from 'vue';
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {useI18n} from "vue-i18n";
import MediaStationPage from "renderer/views/pages/MediaStationPage.vue";
import FolderPage from "renderer/views/pages/FolderPage.vue";
import TagPage from "renderer/views/pages/TagPage.vue";
import PlaylistPage from "renderer/views/pages/PlaylistPage.vue";

const { t } = useI18n();

const Pages ={
  MediaStation: "mediastation",
  Folder: "folder",
  Tags: "tags",
  Playlist: "playlist"
} as const;
type PageType = typeof Pages[keyof typeof Pages];

const activePage = ref<PageType>(Pages.MediaStation);
const selectedMediaStationId = ref();
const selectedTag = ref();
const selectedTagName = ref();

const infoText = ref("");

interface Props {
  mediaStationPresenter: MediaStationPresenter
  tagPresenter: TagPresenter
  folderPresenter: FolderPresenter
  playbackPresenter: PlaybackPresenter
  inactivityPresenter: InactivityPresenter

  inputTimeoutSec:number

  version: string
}
const props = defineProps<Props>();

onMounted((() =>{
  props.inactivityPresenter.init(props.inputTimeoutSec, onInputTimeout);
  props.inactivityPresenter.setResetGuard(() => !props.playbackPresenter.isPlaying());
}));

function onOpenMediaStation(mediaStationId: number): void {
  selectedMediaStationId.value = mediaStationId;
  activePage.value = Pages.Folder;
}

function onModusChanged(id: number): void {
  if (id === 0)
    activePage.value = Pages.Folder;
  else if (id === 1)
    activePage.value = Pages.Tags;
}

function onTagSelected(id: number, name: string) {
  selectedTag.value = id;
  selectedTagName.value = name;
  activePage.value = Pages.Playlist;
}

function onBackFromPlaylist() {
  activePage.value = Pages.Tags;
}

function onExitMediaStation(): void {
  activePage.value = Pages.MediaStation;
}

function onInputTimeout(): void {
  activePage.value = Pages.MediaStation;
  infoText.value = t('mediaStationTimeOutPartOne') + (Math.round(Number(props.inputTimeoutSec / 60) * 100) / 100).toString() + t('mediaStationTimeOutPartTwo');

  setTimeout(() => {
    infoText.value = "";
  }, 10000);
}

</script>