<template>
  <BaseContentPage ref="basePageRef" :playback-presenter="playbackPresenter" :media-station-presenter="mediaStationPresenter"
                   :inactivity-presenter="inactivityPresenter"
                   :media-station-id="mediaStationId" :show-search-field="true" :text-back-btn="textBackBtn"
                   :show-fade-out-btn="showFadeOutBtn" :has-active-child-overlay="localShowTagAdmin"
                   :version="version" :selected-modus="0"
                   @exit="handleExit" @search="handleSearch" @abort-search="handleAbortSearch"
                   @click-back="handleBackClick" @modus-changed="handleChangedModus" @on-content-unselected="onContentUnselected">
    <template #overlays>
      <component v-if="localShowTagAdmin" :is="TagAdminPage" :content-name="tagsOpenForContent"
                 :content-id="contentIdToOpenTagAdmin" :media-station-id="mediaStationId"
                 @close="handleTagAdminClose" :tag-presenter="tagPresenter"
                 :media-station-presenter="mediaStationPresenter"/>
    </template>
    <template #main-list>
      <FolderAndContentList ref="folderContentListRef" :folder-presenter="folderPresenter"
                   :media-station-id="mediaStationId"
                   @on-content-selected="handleContentSelection" @on-click-tag-admin="handleClickTagAdmin"
                   @on-new-folder-opened="handleOpenFolder"/>
    </template>
  </BaseContentPage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps} from 'vue';
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import FolderAndContentList from "renderer/views/components/ui-elements/lists/FolderAndContentList.vue";
import BaseContentPage from "renderer/views/pages/BaseContentPage.vue";
import TagAdminPage from "renderer/views/pages/TagAdminPage.vue";

interface Props {
  folderPresenter: FolderPresenter
  playbackPresenter: PlaybackPresenter
  mediaStationPresenter: MediaStationPresenter
  tagPresenter: TagPresenter
  inactivityPresenter: InactivityPresenter
  mediaStationId: number

  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['Exit', 'ModusChanged']);

const textBackBtn = ref("");

const showFadeOutBtn = ref(false);
const localShowTagAdmin = ref(false);
const tagsOpenForContent = ref("");
const folderContentListRef = ref();
const basePageRef = ref();

let contentIdToOpenTagAdmin = ref();

function handleClickTagAdmin(contentId: number, contentName: string) {
  handleUnselect();

  tagsOpenForContent.value = contentName;
  contentIdToOpenTagAdmin.value = contentId;
  localShowTagAdmin.value = true;
}

function handleTagAdminClose() {
  localShowTagAdmin.value = false;
}

async function handleExit() {
  await handleUnselect();
  emit("Exit");
}

async function handleBackClick() {
  folderContentListRef.value.navigateOneFolderUp();
}

async function handleOpenFolder(id: number) {
  await handleUnselect();
  textBackBtn.value = id === 0 ? "" : props.folderPresenter.getNameOfFolder(props.mediaStationId, id);
}

async function handleSearch(searchString: string) {
  textBackBtn.value = "";
  await handleUnselect();

  folderContentListRef.value.showSearchResult(searchString);
}

async function handleAbortSearch() {
  await handleUnselect();
  folderContentListRef.value.abortSearch();
}

async function handleChangedModus(newModusId: number) {
  await handleUnselect();
  emit('ModusChanged', newModusId);
}

async function handleContentSelection(id: number, hasVideo: boolean){
  await basePageRef.value.selectContent(id, hasVideo);
}

async function handleUnselect() {
  await basePageRef.value.unselectContent();
}

function onContentUnselected(){
  folderContentListRef.value.deselectActiveContent();
}
</script>