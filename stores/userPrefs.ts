export const useUserPrefsStore = defineStore('userPrefs', () => {
    const wearingSessions = ref([]);

    const analysisResults = ref([]);

    const wearingGoal = ref(15);
    const dayStartAt = ref('05:00');
    const installDeniedCount = ref(0);
    const apiKey = ref('');
    const disclaimerAccepted = ref(false);
    const preferredVisualization = ref('progress'); // 'progress' or 'time'

    const resetPreferences = () => {
        wearingSessions.value = [];
        wearingGoal.value = 15;
        analysisResults.value = [];
        preferredVisualization.value = 'progress';
    };

    const updateWearingSessions = (newSessions, dayStart, dayEnd) => {
        // Keep sessions that are completely outside the day period
        const otherSessions = wearingSessions.value.filter(session => {
            const sessionStart = new Date(session.start);
            const sessionEnd = new Date(session.end);
            // Keep if session ends before dayStart or starts after dayEnd
            return sessionEnd.getTime() <= dayStart.getTime() || 
                   sessionStart.getTime() >= dayEnd.getTime();
        });
        
        // Handle sessions that might cross day boundaries
        const processedSessions = newSessions.map(session => {
            const sessionStart = new Date(session.start);
            const sessionEnd = new Date(session.end);

            // If session is completely within the day period, keep as is
            if (sessionStart >= dayStart && sessionEnd < dayEnd) {
                return session;
            }

            // If session starts before day period, truncate start
            if (sessionStart < dayStart) {
                return {
                    ...session,
                    start: dayStart
                };
            }

            // If session ends after day period, truncate end
            if (sessionEnd >= dayEnd) {
                return {
                    ...session,
                    end: new Date(dayEnd.getTime() - 60000) // 1 minute before dayEnd
                };
            }

            return session;
        });

        // Sort all sessions by start time
        wearingSessions.value = [...otherSessions, ...processedSessions].sort((a, b) => 
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );
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
        preferredVisualization,
        updateWearingSessions,
    };
}, {
    persist: true,
});
