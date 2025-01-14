<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { kDialog, kDialogButton, kBlock, kButton } from 'konsta/vue';
import { useTime } from '~/composables/useTime';

const props = defineProps<{
  opened: boolean,
  dayStartAt: string
}>();

const emit = defineEmits<{
  close: [],
  confirm: [date: Date]
}>();

const { getStartOfDay } = useTime(computed(() => props.dayStartAt));
const selectedTime = ref(getStartOfDay(new Date()));

const formatDate = (date: Date) => {
  try {
    return date.toISOString().slice(0, 16);
  } catch (e) {
    return new Date().toISOString().slice(0, 16);
  }
};

const formattedTime = computed({
  get: () => formatDate(selectedTime.value),
  set: (value) => {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      selectedTime.value = date;
    }
  }
});

watch(() => props.opened, (newVal) => {
  if (newVal) {
    const now = new Date();
    selectedTime.value = getStartOfDay(now) || now;
  }
});

const handleConfirm = () => {
  emit('confirm', selectedTime.value);
  emit('close');
};

const adjustTime = (minutes: number) => {
  const newTime = new Date();
  newTime.setMinutes(newTime.getMinutes() + minutes);
  if (!isNaN(newTime.getTime())) {
    selectedTime.value = newTime;
  }
};
</script>

<template>
  <k-dialog :opened="opened" @backdropclick="emit('close')">
    <template #title>Arrêter à une heure spécifique</template>
    
    <k-block>
      <div class="flex gap-2 mb-2">
        <k-button small @click="adjustTime(-10)" class="flex-1">-10min</k-button>
        <k-button small @click="adjustTime(-30)" class="flex-1">-30min</k-button>
        <k-button small @click="adjustTime(-60)" class="flex-1">-1h</k-button>
      </div>
      <input type="datetime-local" v-model="formattedTime" class="w-full p-2 rounded-lg">
    </k-block>

    <template #buttons>
      <k-dialog-button @click="emit('close')">Annuler</k-dialog-button>
      <k-dialog-button strong @click="handleConfirm">Confirmer</k-dialog-button>
    </template>
  </k-dialog>
</template>
