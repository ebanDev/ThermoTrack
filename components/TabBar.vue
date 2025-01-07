<script setup lang="ts">
import { kTabbar, kTabbarLink } from 'konsta/vue';
const currentRoute = useRoute();
</script>

<template>
  <k-tabbar :labels="true" :icons="true" class="left-0 bottom-0 fixed">
    <k-tabbar-link :active="currentRoute.path === '/'" @click="navigateTo('/')">
      <template #icon>
        <Icon name="i-tabler-home" class="text-2xl" />
      </template>
      <template #label>Accueil</template>
    </k-tabbar-link>

    <k-tabbar-link :active="currentRoute.path === '/results'" @click="navigateTo('/results')">
      <template #icon>
        <Icon name="i-tabler-chart-bar" class="text-2xl" />
      </template>
      <template #label>Analyses</template>
    </k-tabbar-link>

    <k-tabbar-link :active="currentRoute.path === '/info'" @click="navigateTo('/info')">
      <template #icon>
        <Icon name="i-tabler-info-circle" class="text-2xl" />
      </template>
      <template #label>Infos</template>
    </k-tabbar-link>
  </k-tabbar>
</template>
