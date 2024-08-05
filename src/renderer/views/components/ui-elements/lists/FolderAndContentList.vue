<template>
  <MainList ref="mainListRef" :items="contentsWithIcons" :items-clickable="true" @item-clicked="handleOpenItem">
    <template #right-content="{ item, index, itemId }">
      <div v-for="media in item.media" :key="media.id">
        <div class="media">
          <Icon v-if="media.savedMedia === 'image'" name="file-image-2" color-main="var(--color-main)" />
          <Icon v-else-if="media.savedMedia === 'video'" name="file-video-2" color-main="var(--color-main)"/>
          <Icon v-else name="file-blank-2" color-main="var(--color-main)"/>
          <div>{{ media.mediaPlayerName }}</div>
        </div>
      </div>
      <TagAdminBtn v-if="item.type==='content'" @click.stop="handleClickTagAdmin(item.id, item.title)"></TagAdminBtn>
    </template>
  </MainList>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, computed, defineExpose, onMounted} from 'vue';
import {
  FolderPresenter, ICompleteContentInfo, IContentMediaInfo, IFolderInfo,
} from "renderer/presenters/FolderPresenter.js";
import TagAdminBtn from "renderer/views/components/ui-elements/btns/TagAdminBtn.vue";
import MainList from "renderer/views/components/ui-elements/lists/MainList.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface Props {
  folderPresenter: FolderPresenter
  mediaStationId: number
}
const props = defineProps<Props>();
const emit = defineEmits(['onContentSelected', 'onClickTagAdmin', 'onNewFolderOpened']);
defineExpose({navigateOneFolderUp, deselectActiveContent, showSearchResult, abortSearch, showTagSearchResults});

const iconContentName = 'content';
const iconFolderName = 'folder';
const mainListRef = ref();

let selectedFolderId: number = 0;
let selectedContentId: number = -1;
let contents = ref<ICompleteContentInfo[]>([]);
let subFolders = ref<IFolderInfo[]>([]);

const contentsWithIcons = computed(() => {
  // Map contents and add the content icon
  const mappedContents = contents.value.map(content => ({
    ...content,
    iconName: iconContentName,
    hasOptions: false,
    type: 'content'
  }));

  // Map subFolders and add the subfolder icon
  const mappedSubFolders = subFolders.value.map(folder => ({
    ...folder,
    iconName: iconFolderName,
    hasOptions: false,
    type: 'subFolder'
  }));

  // Concatenate both arrays
  return [...mappedContents, ...mappedSubFolders];
});

onMounted(async ()=>{
  await handleOpenFolder(0);
})

function navigateOneFolderUp():void{
  let idOfParentFolder: number;

  if(selectedFolderId <= 0)
    throw new Error("Can not navigate to a folder higher than the top-folder!");

  idOfParentFolder = props.folderPresenter.getIdOfParentFolder(props.mediaStationId, selectedFolderId);

  handleOpenFolder(idOfParentFolder);
}

function deselectActiveContent():void{
  if(selectedContentId > -1)
    mainListRef.value.selectItem(-1);
}

function showSearchResult(searchPattern:string):void{
  subFolders.value = [];
  contents.value = props.folderPresenter.findContentsContainingString(props.mediaStationId, selectedFolderId, searchPattern);
}

function showTagSearchResults(tagId:number):void{
  subFolders.value = [];
  contents.value = props.folderPresenter.findContentsContainingTag(props.mediaStationId, tagId);
}

function abortSearch():void{
  handleOpenFolder(selectedFolderId);
}

function handleClickTagAdmin(contentId: number, contentName: string) {
  emit("onClickTagAdmin", contentId, contentName);
}

async function handleOpenItem(id: number, name: string, type: string) {
  let hasVideo:boolean;
  let contentEntry:any;
  let allMediaInContent: IContentMediaInfo[];

  if (type === "content") {
    contentEntry = contents.value.find(content => content.id === id);
    allMediaInContent = contentEntry ? contentEntry.media : [];
    hasVideo = allMediaInContent.some(media => media.savedMedia === "video");

    mainListRef.value.selectItem(id);
    selectedContentId = id;

    emit("onContentSelected", id, hasVideo);

  } else if (type === "subFolder")
    await handleOpenFolder(id);
}

async function handleOpenFolder(id: number) {
  contents.value = props.folderPresenter.getAllContentsInFolder(props.mediaStationId, id);
  subFolders.value = props.folderPresenter.getAllSubFoldersInFolder(props.mediaStationId, id);

  selectedFolderId = id;

  emit("onNewFolderOpened", id);
}

</script>

<style scoped>
.media {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  color: var(--color-main);
}
</style>