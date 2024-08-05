<template>
  <div class="nav-bar-top">
    <div class="content">
      <div class="left-side">
        <NavBarBackBtn v-if="hasBackBtn" :text="title" @on-click="backClicked"></NavBarBackBtn>
      </div>
      <div class="right-side">
        <NavBarRefreshBtn v-if="hasRefreshBtn" @click.stop="refreshClicked"></NavBarRefreshBtn>
        <div>
          <NavBarChangeModus v-if="showSearch" :start-modus-nr="startModusNr" :screen-modi="screenModi"
                             @modus-changed="handleChangeModus"></NavBarChangeModus>
        </div>
        <div v-if="showSearch" class="search-container">
          <SearchInput ref="searchInputRef" :default-text="$t('defaultTextSearch')" text-color="var(--color-secondary-500-base)"
                       bg-color="var(--color-secondary-800)" bg-color-hover="var(--color-secondary-800-hover)"
                       @abort="handleAbortSearch" @search="handleSearch" @on-focus="handleSearchFocus"/>
        </div>
      </div>
    </div>
    <div class="line"></div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch, nextTick} from 'vue';
import NavBarBackBtn from "renderer/views/components/navBars/navBarBtns/NavBarBackBtn.vue";
import NavBarChangeModus from "renderer/views/components/navBars/navBarBtns/NavBarChangeModus.vue";
import NavBarRefreshBtn from "renderer/views/components/navBars/navBarBtns/NavBarRefreshBtn.vue";
import SearchInput from "renderer/views/components/ui-elements/SearchInput.vue";

interface Props {
  title: string
  hasRefreshBtn: boolean
  hasBackBtn: boolean
  showSearch: boolean
  startModusNr: number
  screenModi: string[]
}
const props = defineProps<Props>();
const emit = defineEmits(['backClicked', 'refreshClicked', 'search', 'abortSearch', 'modusChanged']);

let actualSearchString = "";
let searchInputRef = ref();

watch(() => props.showSearch, async () => {
  if (!searchInputRef.value)
    await nextTick();

  searchInputRef.value.setSearchValue(actualSearchString);
});

async function handleChangeModus(newModus: number) {
  searchInputRef.value.reset();
  actualSearchString = ""
  emit('modusChanged', newModus);
}

function backClicked() {
  emit('backClicked');
}

function refreshClicked() {
  emit('refreshClicked');
}

function handleSearch(searchString: string) {
  actualSearchString = searchString;
  emit('search', searchString);
}

function handleAbortSearch() {
  actualSearchString = "";
  emit('abortSearch');
}

function handleSearchFocus() {
  emit('search', actualSearchString);
}
</script>

<style scoped>
.nav-bar-top {
  height: 100px;
  width: 100%;
  padding: 0 28px;

  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}

.content {
  min-width: max-content;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.line {
  width: 100%;
  height: 1px;

  margin-bottom: 0;

  background: var(--color-secondary-700);
}

.left-side {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.right-side {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.search-container {
  min-width: 100px;
  max-width: 327px;

  flex: 0 1 327px;
}
</style>