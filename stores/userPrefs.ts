export const useUserPrefsStore = defineStore('userPrefs', () => {
    const wearingSessions = ref([]);

    const analysisResults = ref([]);

    const wearingGoal = ref(15);

    const resetPreferences = () => {
        wearingSessions.value = [];
        wearingGoal.value = 15;
        analysisResults.value = [];
    };

    return {
        wearingSessions,
        wearingGoal,
        resetPreferences,
        analysisResults,
    };
}, {
        persist: true,
    },
);
