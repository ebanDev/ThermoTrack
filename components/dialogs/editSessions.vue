<script setup lang="ts">
import { kSheet, kToolbar, kLink, kBlock, kList, kListInput, kButton } from 'konsta/vue';

const props = defineProps({
  sessionGroup: {
    type: Object,
    required: false,
    default: () => ({
      date: new Date().toISOString().split('T')[0],
      sessions: []
    })
  },
  opened: {
    type: Boolean,
    required: true
  }
});


const emit = defineEmits();
const { wearingSessions, dayStartAt, updateWearingSessions } = storeToRefs(useUserPrefsStore());
const userPrefsStore = useUserPrefsStore();

const newSessionGroup = reactive({
  date: props.sessionGroup?.date || new Date().toISOString().split('T')[0],
  sessions: (props.sessionGroup?.sessions || []).map((session) => ({
    ...session,
    start: session ? new Date(session.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
    end: session ? new Date(session.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
  })),
});

watch(
  () => props.sessionGroup,
  (newValue) => {
    newSessionGroup.date = newValue?.date || new Date().toISOString().split('T')[0];
    newSessionGroup.sessions = (newValue?.sessions || []).map((session) => ({
      ...session,
      start: session ? new Date(session.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
      end: session ? new Date(session.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '00:00',
    }));
  },
  { deep: true, immediate: true }
);

function save() {
  const sessionGroupToSave = {
    date: newSessionGroup.date,
    sessions: newSessionGroup.sessions.map((session) => {
      const [startHours, startMinutes] = session.start.split(':').map(Number);
      const [endHours, endMinutes] = session.end.split(':').map(Number);
      const [dayStartHours, dayStartMinutes] = dayStartAt.value.split(':').map(Number);
      
      // Create base date
      const baseDate = new Date(newSessionGroup.date);
      
      // If the time is before dayStartAt, use previous day as base
      const startIsBeforeDayStart = startHours < dayStartHours || (startHours === dayStartHours && startMinutes < dayStartMinutes);
      
      let startDate = new Date(baseDate);
      let endDate = new Date(baseDate);
      
      if (startIsBeforeDayStart) {
        startDate.setDate(startDate.getDate() - 1);
      }
      
      // Set the times
      startDate.setHours(startHours, startMinutes);
      endDate.setHours(endHours, endMinutes);

      // If end time is before start time, it means it's crossing to next day
      // In this case, truncate it to end just before dayStartAt
      if (endDate.getTime() < startDate.getTime()) {
        endDate = new Date(baseDate);
        endDate.setHours(dayStartHours, dayStartMinutes - 1);
      }

      return {
        ...session,
        start: startDate,
        end: endDate
      };
    }),
  };

  // Get the start of the day (dayStartAt) for the selected date
  const [dayStartHours, dayStartMinutes] = dayStartAt.value.split(':').map(Number);
  const dayStart = new Date(newSessionGroup.date);
  dayStart.setHours(dayStartHours, dayStartMinutes, 0, 0);
  
  // Get end of the wearing day (next day's dayStartAt)
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  userPrefsStore.updateWearingSessions(sessionGroupToSave.sessions, dayStart, dayEnd);
  emit('close');
}

function addNewSession() {
  newSessionGroup.sessions.push({
    start: '00:00',
    end: '00:00',
  });

  console.log(newSessionGroup);
}

function removeSession(session) {
  const index = newSessionGroup.sessions.findIndex((s) => s === session);
  newSessionGroup.sessions.splice(index, 1);
}
</script>

<template>
  <k-sheet class="pb-safe w-full overflow-auto" style="max-height: 70vh" :opened="opened"
    @backdropclick="emit('close')">
    <k-toolbar top>
      <div class="left" />
      <div class="right">
        <k-link toolbar @click="save">Enregistrer</k-link>
      </div>
    </k-toolbar>

    <k-block>
      <h2 class="text-xl font-bold mb-4">{{ newSessionGroup.date }}</h2>
      <k-list strong inset class="mb-4 !mx-0">
        <div v-for="session in newSessionGroup.sessions" :key="session.start" class="flex items-center py-2">
          <k-list-input type="time" label="Début" :value="session.start" @input="session.start = $event.target.value"
            inputmode="numeric" pattern="[0-9]{2}:[0-9]{2}" class="w-40" />
          <k-list-input type="time" label="Fin" :value="session.end" @input="session.end = $event.target.value"
            inputmode="numeric" pattern="[0-9]{2}:[0-9]{2}" class="w-40" />
          <button @click="removeSession(session)" class="p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
            <Icon name="i-tabler-trash" class="text-red-500" />
          </button>
        </div>
      </k-list>

      <k-button @click="addNewSession" class="w-full">
        <Icon name="i-tabler-plus" class="mr-2" />
        Ajouter une session
      </k-button>
    </k-block>
  </k-sheet>
</template>

<style scoped>
.form {
  gap: 1rem !important;
  display: flex;
  flex-direction: column;

  .session {
    display: flex;
    justify-content: space-between;
    gap: .5rem;

    button {
      width: min-content;
    }

    input {
      margin: 0 !important;
    }
  }
}

:deep(.k-list-input) {
  margin: 0;
  padding: 0;
}
</style>
