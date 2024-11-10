<script setup lang="ts">
const route = useRoute()
const showSettings = ref(false);

const { wearingSessions, wearingGoal } = storeToRefs(useUserPrefsStore());

const streak = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;

  for (let i = 0; i < wearingSessions.value.length; i++) {
    console.log(new Date(wearingSessions.value[i].start) >= today);
    if (new Date(wearingSessions.value[i].start) >= today) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    count: currentStreak,
  };
});
</script>

<template>
  <header>
    <h1>
      <Icon name="i-tabler-left-fill" v-if="route.meta.showBackButton" @click="$router.back()"/>
      {{ route.meta.title }}</h1>
    <div class="left">
      <span class="streak">
      <Icon name="i-tabler-flame" />
      {{ streak.count }}
    </span>
      <button @click="showSettings = true">
        <Icon name="i-tabler-settings"/>
      </button>
    </div>
  </header>
  <dialogs-settings v-if="showSettings" @close="showSettings = false"/>
</template>

<style scoped>
.streak {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.3rem;
  font-weight: bold;
  background: var(--tabbar-active-color);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--tabbar-color);
  z-index: 999;
  position: sticky;
  top: 0;
  width: 100%;
  gap: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;

    button {
      padding: 0.5rem;
      border-radius: 2rem;
    }
  }
}
</style>
