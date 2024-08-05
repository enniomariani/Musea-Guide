<template>
  <BaseBtn id="openTagAdmin" text-color="var(--color-on-secondary-800)" bg-color="var(--color-secondary-800)"
           bg-color-hover="var(--color-secondary-800-hover)">
    <template v-slot:icon><Icon name="plus" color-main="var(--color-on-secondary-800)"/></template>
    {{ $t('openTagAdminBtn') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/ui-elements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";
</script>