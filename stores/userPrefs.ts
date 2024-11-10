export const useUserPrefsStore = defineStore('userPrefs', () => {
    const wearingSessions = ref([{
        start: new Date(),
        end: new Date(),
    }]);

    const analysisResults = ref([{
        date: new Date(),
        volume: 0,
        concentration: 0,
        viscosity: "",
        pH: 0,
        roundCells: 0,
        whiteBloodCells: 0,
        device: "",
    }]);

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
