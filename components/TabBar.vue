<script setup lang="ts">
const currentRoute = useRoute()
</script>

<template>
  <nav class="tab-bar">
    <div class="item" :class="{ active: currentRoute.path === '/' }">
      <nuxt-link to="/">
        <Icon name="i-tabler-home"/>
        <span>Home</span>
      </nuxt-link>
    </div>
    <div class="item" :class="{ active: currentRoute.path === '/results' }">
      <nuxt-link to="/results">
        <Icon name="i-tabler-chart-bar"/>
        <span>Results</span>
      </nuxt-link>
    </div>
    <div class="item" :class="{ active: currentRoute.path === '/info' }">
      <nuxt-link to="/info">
        <Icon name="i-tabler-info-circle"/>
        <span>Info</span>
      </nuxt-link>
    </div>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: space-around;
  background-color: var(--tabbar-color);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 0;

  .item {
    transition: all 0.1s;
  }

  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: var(--text-color);
    padding: 5px 15px;
    border-radius: 15px;

    .iconify {
      font-size: 26px;
    }

    span:not(.iconify) {
      display: none;
    }
  }

  .item.active a {
    color: var(--cta-hover-color);
    background: var(--tabbar-active-color);
  }
}
</style>
