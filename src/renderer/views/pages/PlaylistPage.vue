<template>
  <BaseContentPage ref="baseScreenRef" :playback-presenter="playbackPresenter" :media-station-presenter="mediaStationPresenter"
                    :inactivity-presenter="inactivityPresenter"
                     :media-station-id="mediaStationId" :show-search-field="false" :text-back-btn="textBackBtn"
                    :has-active-child-overlay="localShowTagAdmin" :version="version"
                    :selected-modus="1"
                    @exit="handleExit" @click-back="handleBackClick" @on-content-unselected="onContentUnselected">
    <template #overlays>
      <component v-if="localShowTagAdmin" :is="TagAdminPage" :content-name="tagsOpenForContent"
                 :content-id="contentIdToOpenTagAdmin" :media-station-id="mediaStationId"
                 @close="handleTagAdminClose" :tag-presenter="tagPresenter"
                 :media-station-presenter="mediaStationPresenter"/>
    </template>
    <template #main-list>
      <FolderAndContentList ref="folderContentListRef" :folder-presenter="folderPresenter"
                         :media-station-id="mediaStationId"
                         @on-content-selected="handleContentSelection" @on-click-tag-admin="handleClickTagAdmin"/>
    </template>
  </BaseContentPage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, watchEffect} from 'vue';
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import FolderAndContentList from "renderer/views/components/ui-elements/lists/FolderAndContentList.vue";
import BaseContentPage from "renderer/views/pages/BaseContentPage.vue";
import TagAdminPage from "renderer/views/pages/TagAdminPage.vue";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";

interface Props {
  folderPresenter: FolderPresenter
  playbackPresenter: PlaybackPresenter
  mediaStationPresenter: MediaStationPresenter
  tagPresenter: TagPresenter
  inactivityPresenter: InactivityPresenter
  mediaStationId: number

  selectedTagId: number
  selectedTagName: string

  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['Exit', 'onClickBack']);

const textBackBtn = ref("");

const localShowTagAdmin = ref(false);
const tagsOpenForContent = ref("");
const folderContentListRef = ref();
const baseScreenRef = ref();

let contentIdToOpenTagAdmin = ref();

watchEffect(() => {
  if (folderContentListRef.value){
    folderContentListRef.value.showTagSearchResults(props.selectedTagId);
    textBackBtn.value = props.selectedTagName;
  }
});

async function handleClickTagAdmin(contentId: number, contentName: string) {
  await handleUnselect();

  tagsOpenForContent.value = contentName;
  contentIdToOpenTagAdmin.value = contentId;
  localShowTagAdmin.value = true;
}

function handleTagAdminClose() {
  localShowTagAdmin.value = false;
}

async function handleExit() {
  emit("Exit");
}

async function handleBackClick() {
  await handleUnselect();
  emit("onClickBack");
}

async function handleContentSelection(id: number, hasVideo: boolean){
  await baseScreenRef.value.selectContent(id, hasVideo);
}

async function handleUnselect() {
  await baseScreenRef.value.unselectContent();
}

function onContentUnselected(){
  folderContentListRef.value.deselectActiveContent();
}
</script>