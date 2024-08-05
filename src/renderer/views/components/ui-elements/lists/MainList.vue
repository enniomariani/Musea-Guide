<template>
  <div class="main-list-container">
    <div class="main-list" ref="listRef">
      <div :id="'item' + index" v-for="(item, index) in items" :key="index"
           :class="['list-item', itemsClickable ? 'list-item--selectable' : 'list-item--not-selectable',
        index === selectedItemIndex ? 'list-item--selected' : '']"
           @click="itemsClickable ? handleItemClick(index, item.id, item.title, item.type): null">
        <div class="left-side">
          <Icon :name="item.iconName" color-main="var(--color-main)"/>
          <div class="title" id="title"  :title="item.title" >{{ item.title }}</div>
        </div>
        <div class="right-side">
          <!-- Slot for custom content on the right side -->
          <slot name="right-content" :item="item" :index="index" :item-id="item.id"></slot>
          <div id="optionsBtn" class="options-icon" v-if="item.hasOptions" @click.stop="handleOptionsClick(item.id, item.title, item.type)">
            <Icon name="more-options" color-main="var(--color-main)"/></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps, defineEmits, defineExpose} from 'vue';
import Icon from "renderer/views/components/ui-elements/Icon.vue";

interface PassedItem{
  id: number;
  iconName: string;
  title: string;
  type: string;
  hasOptions?:boolean;
  [key: string]: any; // Allow for additional properties
}

interface Props {
  items: PassedItem[]
  itemsClickable: boolean
}
const props = defineProps<Props>();
const emit = defineEmits(['item-clicked', 'options-clicked']);
defineExpose({selectItem});

const selectedItemIndex = ref<number|null>(null);
const listRef = ref(null);

function selectItem(itemId:number) {
  const index = props.items.findIndex(item => item.id === itemId);

  if (index !== -1)
    selectedItemIndex.value = index; // Update the selected index
  else
    selectedItemIndex.value = null;
}

function handleItemClick(index:number,id:number, title:string, type:string) {
  //only emit click if item is not already selected
  if (selectedItemIndex.value !== null && selectedItemIndex.value === index)
    return;

  emit('item-clicked', id, title, type);
}

function handleOptionsClick(itemId:number, title:string, type:string) {
  emit('options-clicked', itemId, title, type);
}

</script>

<style scoped>
.main-list-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--color-background);
  padding: 40px 56px;
  overflow-x: hidden;
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

.main-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.list-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 8px;
  border-bottom: 1px solid var(--color-secondary-700);
  transition: background-color 0.2s;
}

.list-item--selected {
  background-color: var(--color-secondary-700);
}

.list-item--selectable {
  cursor: pointer;
}

.list-item--not-selectable {
  cursor: default;
}

.list-item:hover {
  background-color: var(--color-secondary-700);
}

.left-side {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow:hidden;
}

.title{
  max-width: 100%;
  flex-grow: 1;

  color: var(--color-main);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow:hidden;
}

.right-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.options-icon{
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
