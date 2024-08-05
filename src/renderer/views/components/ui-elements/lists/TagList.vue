<template>
  <MainList ref="mainListRef" :items="tagsWithIcons" :items-clickable="true" @item-clicked="handleOpenItem" />
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, computed, defineExpose, onMounted} from 'vue';
import {ITag, TagPresenter} from "renderer/presenters/TagPresenter.js";
import MainList from "renderer/views/components/ui-elements/lists/MainList.vue";


interface Props {
  tagPresenter: TagPresenter
  mediaStationId: number
}
const props = defineProps<Props>();
const emit = defineEmits(['onClickTag']);
defineExpose({showSearchResult, abortSearch});

const iconName = 'tag-outline';
const allTags = ref<ITag[]>([]);
const mainListRef = ref(null);

const tagsWithIcons = computed(() => {
  return allTags.value.map(tag => ({
    ...tag,
    iconName: iconName,
    hasOptions: false,
    type: 'tag'
  }));
});

onMounted(() => {
  showAllTags();
});

function showAllTags():void{
  allTags.value = props.tagPresenter.getAllTags(props.mediaStationId);
}

function showSearchResult(searchPattern:string):void{
  allTags.value = props.tagPresenter.findTagsContainingString(props.mediaStationId, searchPattern);
}

function abortSearch():void{
  showAllTags();
}

async function handleOpenItem(id: number, name:string) {
  emit("onClickTag", id, name);
}

</script>