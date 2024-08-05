<template>
  <BaseContentPage :playback-presenter="playbackPresenter" :media-station-presenter="mediaStationPresenter"
                    :inactivity-presenter="inactivityPresenter"
                     :media-station-id="mediaStationId" :show-search-field="true" :text-back-btn="''"
                    :show-fade-out-btn="false" :has-active-child-overlay="false" :version="version"
                    :selected-modus="1"
                    @exit="handleExit" @search="handleSearch" @abort-search="handleAbortSearch"
                    @modus-changed="handleChangedModus">
    <template #main-list>
      <TagList ref="tagListRef" :tag-presenter="tagPresenter"
                         :media-station-id="mediaStationId"
                         @on-click-tag="handleTagSelection"/>
    </template>
  </BaseContentPage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps} from 'vue';
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import BaseContentPage from "renderer/views/pages/BaseContentPage.vue";
import TagList from "renderer/views/components/ui-elements/lists/TagList.vue";
import {PlaybackPresenter} from "renderer/presenters/PlaybackPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";

interface Props {
  folderPresenter: FolderPresenter
  playbackPresenter: PlaybackPresenter
  mediaStationPresenter: MediaStationPresenter
  tagPresenter: TagPresenter
  inactivityPresenter: InactivityPresenter
  mediaStationId: number

  version: string
}
defineProps<Props>();
const emit = defineEmits(['Exit', 'ModusChanged', 'TagSelected']);

const tagListRef = ref();

async function handleExit() {
  emit("Exit");
}

async function handleTagSelection(id: number, name:string) {
  emit("TagSelected", id, name);
}

async function handleSearch(searchString: string) {
  tagListRef.value.showSearchResult(searchString);
}

async function handleAbortSearch() {
  tagListRef.value.abortSearch();
}

function handleChangedModus(newModusId: number) {
  emit('ModusChanged', newModusId);
}

</script>