export const useUserPrefsStore = defineStore('userPrefs', () => {
    const wearingSessions = ref([]);

    const analysisResults = ref([]);

    const wearingGoal = ref(15);
    const dayStartAt = ref('05:00');
    const installDeniedCount = ref(0);
    const apiKey = ref('');
    const disclaimerAccepted = ref(false);

    const resetPreferences = () => {
        wearingSessions.value = [];
        wearingGoal.value = 15;
        analysisResults.value = [];
    };

    return {
        wearingSessions,
        wearingGoal,
        dayStartAt,
        resetPreferences,
        analysisResults,
        installDeniedCount,
        apiKey,
        disclaimerAccepted,
    };
}, {
    persist: true,
});
