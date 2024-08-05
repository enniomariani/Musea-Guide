<template>
  <BaseBtn id="btnDelete" text-color="var(--color-status-red)"
           bg-color="rgba(var(--color-status-red-rgb), 0.1)" bg-color-hover="rgba(var(--color-status-red-rgb), 0.2)" gap-text-to-icon="6px">
    <template v-slot:icon><Icon name="delete-small" color-main="var(--color-status-red)"/></template>
    {{ $t('btnDeleteTags') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/ui-elements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";
</script>