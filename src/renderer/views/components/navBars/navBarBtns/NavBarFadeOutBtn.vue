<template>
  <BaseBtn id="fadeOutBtn" text-color="var(--color-primary-500-base)" bg-color="rgba(var(--color-primary-500-base-rgb), 0.1)"
           bg-color-hover="rgba(var(--color-primary-500-base-rgb), 0.2)">
    <template v-slot:icon><Icon name="close" color-main="var(--color-primary-500-base)"/></template>
    {{ $t('btnFadeOut') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/ui-elements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/ui-elements/Icon.vue";
</script>