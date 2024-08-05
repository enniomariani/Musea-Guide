<template>
  <div class="tag-list">
    <TagAdminListItem v-for="(item, index) in tagsWithContentInfo" :key="index" v-show="item.show" :text="item.title"
                 :selectable="!deleteTagState" :selected="item.selected" :highlighted="item.markedToDelete"
                 :opacity="deleteTagState&&!item.markedToDelete?0.4: 1"
                 :id="'tag' + index"
                 @request-select="handleRequestSelectTag(item.id)"
                 @request-deselect="handleDeselectRequestTag(item.id)"
                 @long-click-selected="handleLongClick(index)"
                 @click.stop="handleItemClick(index)"/>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, defineExpose, defineProps, ref} from "vue";
import {ITag, TagPresenter} from "renderer/presenters/TagPresenter.js";
import TagAdminListItem from "renderer/views/components/ui-elements/lists/TagAdminListItem.vue";

interface Tag {
  id: number;
  title: string;
  selected: boolean;
  show: boolean;
  markedToDelete: boolean;
}

interface Props {
  tagPresenter: TagPresenter
  mediaStationId: number
  contentId:number
}
const props = defineProps<Props>();
const emit = defineEmits(['onDeleteState', 'requestDeselectTag', 'requestSelectTag']);
defineExpose({refresh, getTagIdsMarkedToDelete, deactivateDeleteState});

let tagsWithContentInfo = ref<Tag[]>([]);
let deleteTagState = ref(false);
let longClick: boolean;

function refresh(searchString: string = "") {
  const allTags: ITag[] = props.tagPresenter.getAllTags(props.mediaStationId);
  const textLowercase:string = searchString.toLowerCase();
  const selectedTagIds:number[] = props.tagPresenter.getAssignedTagIds(props.mediaStationId, props.contentId);

  tagsWithContentInfo.value = allTags.map(tag => ({
    ...tag,
    selected: selectedTagIds.includes(tag.id), // Check if tag.id is in the selectedTags array, then mark the tag as "selected"
    show: searchString === ""?true: tag.title.toLowerCase().includes(textLowercase),
    markedToDelete: false
  }));
}

function deactivateDeleteState() {
  deleteTagState.value = false;
}

async function handleLongClick(index: number) {
  deleteTagState.value = true;
  longClick = true;

  tagsWithContentInfo.value[index].markedToDelete = true;

  emit("onDeleteState");
}

function handleItemClick(index: number) {
  //handleItemClick is also fired when a longclick is emitted
  // -> this prevents that the markedToDelete-state is immediately set to false again after the long-click
  if (longClick) {
    longClick = false;
    return;
  }

  if (deleteTagState.value)
    tagsWithContentInfo.value[index].markedToDelete = !tagsWithContentInfo.value[index].markedToDelete;
}

function getTagIdsMarkedToDelete(): number[] {
  let tagIdsToDelete: number[] = [];

  for (let i: number = 0; i < tagsWithContentInfo.value.length; i++)
    if (tagsWithContentInfo.value[i].markedToDelete)
      tagIdsToDelete.push(tagsWithContentInfo.value[i].id);

  return tagIdsToDelete;
}

function handleDeselectRequestTag(id: number) {
  emit("requestDeselectTag", id);
}

function handleRequestSelectTag(id: number) {
  emit("requestSelectTag", id);
}

</script>

<style scoped>
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  max-height: 310px;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--color-secondary-100);
  border-radius: 6.6px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb {
  background: var(--color-secondary-500-base);
  border-radius: 6.6px;
  cursor: pointer;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary-600);
}
</style>