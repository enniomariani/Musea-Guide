<template>
  <div class="overlays"
       v-if="showNewTagDialog || showTwoButtonOverlayDeleteTag || showTwoButtonOverlayRemoveTagFromContent">
    <component v-if="showNewTagDialog" :is="FullScreenInput" @save="handleSaveNewTag"
               @close="handleCloseNewTag" :title="$t('createTag')" :save-btn-name="$t('btnSave')"
               :place-holder-text="$t('placeHolderInsertTagName')"/>
    <component v-if="showTwoButtonOverlayDeleteTag" :is="TwoBtnPopUp"
               :title="$t('reallyWantToDeleteTag')"
               icon-no="cross" icon-yes="trash"
               :btn-text-yes="$t('btnDelete')" :btn-text-no="$t('btnAbort')" highlightBtn="yes" @yes="handleDeleteTagYes"
               @no="handleDeleteTagNo"/>
    <component v-if="showTwoButtonOverlayRemoveTagFromContent" :is="TwoBtnPopUp"
               :title="$t('reallyWantToRemoveTagFromContent')"
               icon-no="cross" icon-yes="check"
               :btn-text-yes="$t('btnYes')" :btn-text-no="$t('btnAbort')" highlightBtn="yes"
               @yes="handleRemoveTagFromContentYes"
               @no="handleRemoveTagFromContentNo"/>
  </div>
  <TagAdminPopUp ref="popUpRef"
                 :tag-presenter="tagPresenter"
                 :sub-title="tagsOpenForContent"
                 :media-station-id="mediaStationId"
                 :content-id="contentId"
                 @close="handleTagAdminClose"
                 @new-tag="handleNewTagClicked"
                 @request-select="handleAddTagToContent"
                 @request-deselect="handleRemoveTagFromContentRequest"
                 @delete-tags="handleDeleteTags"/>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps} from 'vue';
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import FullScreenInput from "renderer/views/components/fullScreenOverlays/FullScreenInput.vue";
import TwoBtnPopUp from "renderer/views/components/fullScreenOverlays/popUps/TwoBtnPopUp.vue";
import TagAdminPopUp from "renderer/views/components/fullScreenOverlays/popUps/TagAdminPopUp.vue";
import {SyncEvent} from "musea-client/renderer";

interface Props {
  contentId: number
  contentName: string
  tagPresenter: TagPresenter
  mediaStationPresenter: MediaStationPresenter
  mediaStationId: number
}
const props = defineProps<Props>();
const emit = defineEmits(['close']);

const showTwoButtonOverlayDeleteTag = ref(false);
const showTwoButtonOverlayRemoveTagFromContent = ref(false);
const showNewTagDialog = ref(false);
const tagsOpenForContent = ref("");
const popUpRef = ref();

let tagsToDelete: number[];
let tagToDeselectFromContent: number;

tagsOpenForContent.value = props.contentName;

async function handleTagAdminClose() {
  await props.mediaStationPresenter.sync(props.mediaStationId,
      (evt: SyncEvent) => {console.log(evt.scope + "-" + evt.type)});

  emit('close');
}

function handleNewTagClicked() {
  showNewTagDialog.value = true;
}

function handleCloseNewTag() {
  showNewTagDialog.value = false;
}

async function handleSaveNewTag(tagName: string) {
  const id: number = props.tagPresenter.createNewTag(props.mediaStationId, tagName);
  showNewTagDialog.value = false;
  await handleAddTagToContent(id);
}

async function handleAddTagToContent(tagId: number) {
  props.tagPresenter.addTagToContent(props.mediaStationId, props.contentId, tagId);
  popUpRef.value.refresh();
}

function handleRemoveTagFromContentRequest(tagId: number) {
  tagToDeselectFromContent = tagId;
  showTwoButtonOverlayRemoveTagFromContent.value = true;
}

function handleRemoveTagFromContentYes() {
  showTwoButtonOverlayRemoveTagFromContent.value = false;
  props.tagPresenter.removeTagFromContent(props.mediaStationId, props.contentId, tagToDeselectFromContent);
  popUpRef.value.refresh();
}

function handleRemoveTagFromContentNo() {
  showTwoButtonOverlayRemoveTagFromContent.value = false;
}

function handleDeleteTags(tagIds: number[]) {
  tagsToDelete = tagIds;
  showTwoButtonOverlayDeleteTag.value = true;
}

function handleDeleteTagYes() {
  showTwoButtonOverlayDeleteTag.value = false;
  props.tagPresenter.deleteTags(props.mediaStationId, tagsToDelete);
  popUpRef.value.refresh();
}

function handleDeleteTagNo() {
  showTwoButtonOverlayDeleteTag.value = false;
}
</script>

<style scoped>
.overlays {
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
}
</style>