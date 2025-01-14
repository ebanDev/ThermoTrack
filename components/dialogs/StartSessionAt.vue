<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { kDialog, kDialogButton, kBlock } from 'konsta/vue';
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
</script>

<template>
  <k-dialog :opened="opened" @backdropclick="emit('close')">
    <template #title>Démarrer à une heure spécifique</template>
    
    <k-block>
      <input type="datetime-local" v-model="formattedTime" class="w-full p-2 rounded-lg">
    </k-block>

    <template #buttons>
      <k-dialog-button @click="emit('close')">Annuler</k-dialog-button>
      <k-dialog-button strong @click="handleConfirm">Confirmer</k-dialog-button>
    </template>
  </k-dialog>
</template>
