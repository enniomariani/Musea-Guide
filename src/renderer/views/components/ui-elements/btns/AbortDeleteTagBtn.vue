<template>
  <BaseBtn id="btnAbort" text-color="var(--color-on-secondary-50)"
           bg-color="var(--color-secondary-500)" bg-color-hover="var(--color-secondary-100)" gap-text-to-icon="6px">
    <template v-slot:icon><Icon name="close-small" color-main="var(--color-on-secondary-50)"/></template>
    {{ $t('btnAbort') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/ui-elements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";
</script>