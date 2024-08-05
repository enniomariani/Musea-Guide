<template>
  <BasePopUp>
    <div class="title-container">
      <div class="title-part">
        <div id="title" class="title">{{ $t('btnTitleTagAdmin') }}</div>
          <Icon id="btnClose" class="close-btn" @click.stop="close"
                name="close-medium" color-second="var(--color-on-secondary-50)"/>
      </div>
      <div class="subTitle-part">{{ subTitle }}</div>
      <div class="search-part">
        <SearchInput :default-text="$t('defaultTxtSearchTag')" bg-color="var(--color-secondary-50)" bg-color-hover="var(--color-secondary-100)"
                     text-color="var(--color-on-secondary-50)"
                     @abort="handleAbortSearch" @search="handleSearch"/>
      </div>
    </div>
    <div class="tag-container" :class="deleteTagState?'tag-container--with-padding':''">
      <div id="newTag" class="newTag-part" :class="deleteTagState?'newTag-part--deactivated':null"
           @click.stop="handleNewTag">
        <Icon name="plus-small" color-main="var(--color-secondary-500-base)"/>
        {{ $t('btnAddNewTag') }}
      </div>
      <TagAdminList ref="listRef"
                    :tag-presenter="tagPresenter"
                    :media-station-id="mediaStationId"
                    :content-id="contentId"
                    @on-delete-state="handleDeleteState"
                    @request-select-tag="handleRequestSelectTag"
                    @request-deselect-tag="handleDeselectRequestTag"></TagAdminList>
    </div>
    <div class="btn-container" v-if="deleteTagState">
      <DeleteTagBtn @click.stop="handleClickDelete"/>
      <AbortDeleteTagBtn @click.stop="handleClickAbort"/>
    </div>
  </BasePopUp>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, ref, defineExpose, onMounted} from 'vue';
import BasePopUp from "renderer/views/components/fullScreenOverlays/popUps/BasePopUp.vue";
import {TagPresenter} from "renderer/presenters/TagPresenter.js";
import DeleteTagBtn from "renderer/views/components/ui-elements/btns/DeleteTagBtn.vue";
import AbortDeleteTagBtn from "renderer/views/components/ui-elements/btns/AbortDeleteTagBtn.vue";
import TagAdminList from "renderer/views/components/ui-elements/lists/TagAdminList.vue";
import SearchInput from "renderer/views/components/ui-elements/SearchInput.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  subTitle: string
  tagPresenter: TagPresenter
  mediaStationId: number
  contentId: number
}
defineProps<Props>();
const emit = defineEmits(['close', 'requestDeselect', 'requestSelect', 'newTag', 'deleteTags']);
defineExpose({refresh});

const listRef = ref();
const deleteTagState = ref(false);
let actualSearchString:string = "";

onMounted(() => {
  refresh();
});

function refresh(): void {
  listRef.value.refresh(actualSearchString);
}

function close() {
  emit('close');
}

function handleAbortSearch() {
  actualSearchString = "";
  refresh();
}

function handleSearch(text: string) {
  actualSearchString = text;
  refresh();
}

function handleDeselectRequestTag(id: number) {
  emit("requestDeselect", id);
}

function handleRequestSelectTag(id: number) {
  emit("requestSelect", id);
}

function handleNewTag() {
  if (!deleteTagState.value)
    emit("newTag");
}

function handleDeleteState() {
  deleteTagState.value = true;
}

function handleClickDelete() {
  emit('deleteTags', listRef.value.getTagIdsMarkedToDelete())
  handleClickAbort();
}

function handleClickAbort() {
  deleteTagState.value = false;
  listRef.value.deactivateDeleteState();
  refresh();
}
</script>

<style scoped>
.title-container {
  padding-bottom: 32px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  border-bottom: 1px solid var(--color-secondary-300);

  text-align: center;
}

.title-part {
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: var(--color-on-secondary-50);
}

.title{
  color: var(--color-on-popup);
}

.subTitle-part {
  display: flex;
  font-size: var(--font-size-small);
  color: var(--color-secondary-500-base);
}

.close-btn {
  cursor: pointer;
}

.search-part{
  width: 100%;
}

.tag-container {
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-container--with-padding {
  padding-bottom: 32px;
}

.newTag-part {
  padding: 12px 14px;

  display: flex;
  align-items: center;
  text-align: center;
  gap: 8px;

  border: 1px dashed var(--color-secondary-500-base);
  border-radius: var(--radius-default);

  cursor: pointer;

  color: var(--color-secondary-500-base);
}

.newTag-part--deactivated {
  opacity: 0.4;
  cursor: default;
}

.btn-container {
  width: 100%;
  padding-top: 32px;

  display: flex;
  justify-content: center;
  gap: 12px;

  border-top: 1px solid var(--color-secondary-300);
}

</style>