<script setup lang="ts">
import { kNavbar, kButton } from 'konsta/vue';
import { useTime } from '~/composables/useTime';
import { useSessionGroups } from '~/composables/useSessionGroups';

const route = useRoute();
const settingsOpened = ref(false);
const chatAssistantOpened = ref(false);

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
  // Skip today's session if it exists
  const todayGroup = groupedSessions.value.find(group => group.date === getSessionDay(new Date()));
  const completedSessions = groupedSessions.value.filter(group => group !== todayGroup);
  
  const index = completedSessions.findIndex(group => group.total < 100);
  return index === -1 ? completedSessions.length : index;
});
</script>

<template>
  <k-navbar class="sticky top-0 z-10">
    <template #title>
      <div class="flex items-center gap-2">
        <Icon 
          name="i-tabler-left-fill" 
          v-if="route.meta.showBackButton" 
          @click="$router.back()"
          class="cursor-pointer"
        />
        {{ route.meta.title }}
      </div>
    </template>
    
    <template #right>
      <div class="flex items-center gap-2 mr-2">
        <span class="flex items-center gap-1 text-xl font-bold bg-md-light-secondary-container px-3 py-1 h-10 rounded-lg">
          <Icon name="i-tabler-flame" />
          {{ streak }}
        </span>
        <k-button @click="chatAssistantOpened = true" class="!w-10 h-10 !p-0">
          <Icon name="i-tabler-message-chatbot" class="text-xl" />
        </k-button>
        <k-button @click="settingsOpened = true" class="!w-10 h-10 !p-0">
          <Icon name="i-tabler-settings" class="text-xl" />
        </k-button>
      </div>
    </template>
  </k-navbar>
  
  <dialogs-settings 
    :opened="settingsOpened" 
    @close="settingsOpened = false" 
  />
  <dialogs-chat-assistant 
    :opened="chatAssistantOpened" 
    @close="chatAssistantOpened = false" 
  />
</template>
