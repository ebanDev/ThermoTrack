<script setup lang="ts">
const props = defineProps({
    sessionGroup: {
        type: Object,
        required: true,
    },
});

console.log(props.sessionGroup);

const emit = defineEmits();
const { wearingSessions, dayStartAt } = storeToRefs(useUserPrefsStore());

const newSessionGroup = reactive({
    date: props.sessionGroup.date,
    sessions: props.sessionGroup.sessions.map((session) => ({
        ...session,
        start: new Date(session.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(session.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })),
});

// Watch for changes in the props.sessionGroup and update newSessionGroup
watch(
    () => props.sessionGroup,
    (newValue) => {
        newSessionGroup.date = newValue.date;
        newSessionGroup.sessions = newValue.sessions.map((session) => ({
            ...session,
            start: new Date(session.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            end: new Date(session.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
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
            
            const baseDate = new Date(newSessionGroup.date);
            let startDate = new Date(baseDate.setHours(startHours, startMinutes));
            let endDate = new Date(baseDate.setHours(endHours, endMinutes));

            if (session.start < dayStartAt.value) {
                startDate.setDate(startDate.getDate() + 1);
            }
            if (session.end < dayStartAt.value) {
                endDate.setDate(endDate.getDate() + 1);
            }

            return {
                ...session,
                start: startDate,
                end: endDate
            };
        }),
    };

    console.log(sessionGroupToSave);

    // Delete all sessions for the date of the sessionGroup (aka between dayStartAt and dayStartAt + 1 day, dayStartAt being a string like 05:00) and add the new ones
    wearingSessions.value = wearingSessions.value.filter((session) => {
        const sessionDate = new Date(session.start);
        return sessionDate < new Date(newSessionGroup.date) || sessionDate >= new Date(newSessionGroup.date).setDate(new Date(newSessionGroup.date).getDate() + 1);
    }).concat(sessionGroupToSave.sessions);

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
    <div class="shadowClose" @click="emit('close')"></div>
    <dialog open>
        <h2>{{ sessionGroup.date }} </h2>
        <div class="form">
            <div class="session" v-for="session in newSessionGroup.sessions" :key="session.start">
                <input type="time" id="start" v-model="session.start" />
                <input type="time" id="end" v-model="session.end" />
                <button @click="removeSession(session)">
                    <Icon name="i-tabler-trash" />
                </button>
            </div>
        </div>
        <button @click="addNewSession">
            <Icon name="i-tabler-plus" />
            Ajouter une session
        </button>
        <button @click="save">
            <Icon name="i-tabler-device-floppy" />
            Enregistrer
        </button>
    </dialog>
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
</style>