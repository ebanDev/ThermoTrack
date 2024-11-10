<script setup lang="ts">
const { analysisResults } = storeToRefs(useUserPrefsStore());
const showAddAnalysisDialog = ref(false);
const showEditAnalysisDialog = ref(false);
const currentAnalysis = ref(null);

definePageMeta({
    title: 'Résultats',
});

const dateToLocaleString = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
</script>

<template>
    <main class="container">
        <div class="card" v-for="result in analysisResults" :key="result.id" @click="showEditAnalysisDialog = true; currentAnalysis = result">
            <h2>{{ dateToLocaleString(result.date) }}</h2>
            <div class="form">
                <div class="form-item">
                    <Icon name="i-tabler-flask" />
                    <span><b>Concentration: {{ result.concentration }}</b></span>
                </div>
                <div class="form-item">
                    <Icon name="i-tabler-cube" />
                    <span>Volume (mL): {{ result.volume }}</span>
                </div>
                <div class="form-item">
                    <Icon name="i-tabler-droplet" />
                    <span>Viscosité: {{ result.viscosity }}</span>
                </div>
                <div class="form-item">
                    <Icon name="i-tabler-test-pipe" />
                    <span>pH: {{ result.pH }}</span>
                </div>
                <div class="form-item">
                    <Icon name="i-tabler-droplet-filled-2" />
                    <span>Cellules rondes (M/mL): {{ result.roundCells }}</span>
                </div>
                <div class="form-item">
                    <Icon name="i-tabler-circle" />
                    <span>Leucocytes (M/mL): {{ result.whiteBloodCells }}</span>
                </div>
                <div class="form-item" v-if="result.device">
                    <Icon name="i-mdi-underwear-outline" />
                    <span>Moyen contraceptif: {{ result.device }}</span>
                </div>
            </div>
        </div>
        <button @click="showAddAnalysisDialog = true">
            <Icon name="i-tabler-plus" />
            Ajouter un résultat
        </button>
        <dialogs-add-analysis v-if="showAddAnalysisDialog" @close="showAddAnalysisDialog = false" />
        <dialogs-edit-analysis v-if="showEditAnalysisDialog" @close="showEditAnalysisDialog = false" :analysis="currentAnalysis" />
    </main>
</template>

<style scoped>
button {
    width: 100%;
}

.card .form {
    display: flex;
    flex-direction: column;

    .form-item {
        display: flex;
        align-items: center;
        gap: .3rem;
    }
}
</style>