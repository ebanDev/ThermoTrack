<script setup lang="ts">
import { useTime } from '~/composables/useTime';
import { useSessionGroups } from '~/composables/useSessionGroups';

const route = useRoute();
const showSettings = ref(false);
const showChatAssistant = ref(false);

const { wearingSessions, dayStartAt, wearingGoal } = storeToRefs(useUserPrefsStore());

const { getSessionDay, getStartOfDay, setToStartOfDay } = useTime(dayStartAt);
const { groupedSessions } = useSessionGroups(
  wearingSessions,
  wearingGoal,
  dayStartAt,
  getSessionDay,
  setToStartOfDay
);

const streak = computed(() => {
  const index = groupedSessions.value.findIndex(group => group.total < 100);
  return index === -1 ? groupedSessions.value.length : index;
});
</script>

<template>
  <header>
    <h1>
      <Icon name="i-tabler-left-fill" v-if="route.meta.showBackButton" @click="$router.back()" />
      {{ route.meta.title }}
    </h1>
    <div class="left">
      <span class="streak">
        <Icon name="i-tabler-flame" />
        {{ streak }}
      </span>
      <button @click="showChatAssistant = true">
        <Icon name="i-tabler-message-chatbot" />
      </button>
      <button @click="showSettings = true">
        <Icon name="i-tabler-settings" />
      </button>
    </div>
  </header>
  <dialogs-settings v-if="showSettings" @close="showSettings = false" />
  <dialogs-chat-assistant v-if="showChatAssistant" @close="showChatAssistant = false" />
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

  .left {    display: flex;    align-items: center;    gap: .5rem;    button {      padding: 0.5rem;      border-radius: 2rem;    }  }}</style>
