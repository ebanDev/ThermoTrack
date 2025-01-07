<script setup lang="ts">
import { ref } from 'vue';
import OpenAI from 'openai';
import { kSheet, kToolbar, kLink, kBlock, kBlockTitle, kList, kListInput, kButton } from 'konsta/vue';

defineProps<{
  opened: boolean
}>();

const emit = defineEmits(['close']);
const { disclaimerAccepted, apiKey } = storeToRefs(useUserPrefsStore());
const showDisclaimer = ref(!disclaimerAccepted.value);

function acceptDisclaimer() {
  if (apiKey.value) {
    disclaimerAccepted.value = true;
    showDisclaimer.value = false;
    initializeOpenAIClient();
  } else {
    alert('Veuillez entrer votre clé API OpenAI.');
  }
}

const client = ref(null);

function initializeOpenAIClient() {
  client.value = new OpenAI({
    apiKey: apiKey.value,
    dangerouslyAllowBrowser: true,
  });
}

// Initialize OpenAI client if the disclaimer has been accepted
if (disclaimerAccepted.value && apiKey.value) {
  initializeOpenAIClient();
}

const messages = ref([{ role: 'assistant', content: 'Bonjour ! Comment puis-je vous aider ?' }])
const userMessage = ref('');
const isLoading = ref(false);

const includeWearingSessions = ref(false);
const includeAnalysis = ref(false);
const { analysisResults } = storeToRefs(useUserPrefsStore());

const userPrefsStore = useUserPrefsStore();
const { wearingSessions, wearingGoal, dayStartAt } = storeToRefs(userPrefsStore);
const { getSessionDay, setToStartOfDay } = useTime(dayStartAt);

const { groupedSessions } = useSessionGroups(
  wearingSessions,
  wearingGoal,
  dayStartAt,
  getSessionDay,
  setToStartOfDay
);

async function sendMessage() {
  if (!userMessage.value.trim()) return;

  if (!client.value) {
    alert('Le client OpenAI n\'est pas initialisé.');
    return;
  }

  const currentMessage = userMessage.value;
  userMessage.value = '';
  isLoading.value = true;

  let messageContent = currentMessage;
  if (includeWearingSessions.value) {
    messageContent += "\n\nHistorique de port:\n" + JSON.stringify(groupedSessions.value);
  }
  if (includeAnalysis.value) {
    messageContent += "\n\nRésultats de spermogramme:\n" + JSON.stringify(analysisResults.value);
  }

  messages.value.push({ role: 'user', content: currentMessage });
  messages.value.push({ role: 'assistant', content: '' });

  try {
    const thread = await client.value.beta.threads.create({
      messages: [{ role: "user", content: messageContent }],
    });

    const stream = await client.value.beta.threads.runs.create(thread.id, {
      assistant_id: "asst_9fFvxujbP0JCLuuBrNCbC4Yj",
      stream: true,
    });

    let assistantContent = '';
    for await (const event of stream) {
      if (event.event === "thread.message.delta") {
        assistantContent += event.data.delta.content[0].text.value;
        messages.value[messages.value.length - 1].content = assistantContent;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    messages.value[messages.value.length - 1].content = 'Sorry, there was an error processing your request.';
  } finally {
    isLoading.value = false;
  }
}

async function validateApiKey() {
  if (apiKey.value) {
    acceptDisclaimer();
  } else {
    alert('Veuillez entrer votre clé API OpenAI.');
  }
}
</script>

<template>
  <k-sheet
    class="pb-safe w-full"
    :opened="opened"
    @backdropclick="emit('close')"
  >
    <k-toolbar top>
      <div class="left" />
      <div class="right">
        <k-link toolbar @click="emit('close')">Fermer</k-link>
      </div>
    </k-toolbar>

    <k-block v-if="!showDisclaimer">
      <div class="conversation overflow-y-auto max-h-[400px] mb-4 flex flex-col gap-2">
        <div v-for="(message, index) in messages" :key="index" 
          :class="[
            'p-2 rounded-lg max-w-[85%] break-words',
            message.role === 'user' ? 'self-end bg-md-light-primary text-white' : 'bg-md-light-surface-variant'
          ]"
        >
          <p>{{ message.content }}</p>
        </div>
      </div>

      <div class="mb-4">
        <p class="font-bold mb-2">Contexte donné à l'IA</p>
        <div class="flex gap-2">
          <k-button 
            :class="includeWearingSessions ? 'bg-md-light-primary' : ''"
            @click="includeWearingSessions = !includeWearingSessions"
          >
            Historique
          </k-button>
          <k-button 
            :class="includeAnalysis ? 'bg-md-light-primary' : ''"
            @click="includeAnalysis = !includeAnalysis"
          >
            Spermogrammes
          </k-button>
        </div>
      </div>

      <div class="flex gap-2">
        <k-list-input
          type="text"
          v-model="userMessage"
          @keydown.enter="sendMessage"
          placeholder="Votre message..."
          :disabled="isLoading"
          class="flex-1"
        />
        <k-button @click="sendMessage" :disabled="isLoading">
          <Icon :name="isLoading ? 'i-tabler-hourglass-high' : 'i-tabler-send'" />
        </k-button>
      </div>
    </k-block>

    <k-block v-else>
      <h2 class="text-xl font-bold mb-4">AndroBot</h2>
      <p class="mb-4">
        Ceci est un chatbot qui utilise l'intelligence artificielle générative de OpenAI pour répondre à vos questions.
        <br> Il est possible que les réponses ne soient pas toujours exactes ou appropriées.
      </p>
      <k-list strong inset>
        <k-list-input
          label="Clé API OpenAI"
          type="text"
          v-model="apiKey"
          placeholder="sk-..."
        />
      </k-list>
      <k-button class="w-full mt-4" @click="validateApiKey">
        <Icon name="i-tabler-check" class="mr-2" />
        Continuer
      </k-button>
    </k-block>
  </k-sheet>
</template>

<style scoped>
/* Add styles for the conversation component */
.conversation {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user {
  padding: 0.5rem 1rem;
  background: var(--cta-color);
  color: white;
  border-radius: 0.5rem;
  width: max-content;
  text-wrap: wrap;
  max-width: 85%;
  align-self: flex-end;
}

.assistant {
  padding: 0.5rem 1rem;
  background: var(--tabbar-active-color);
  border-radius: 0.5rem;
  width: max-content;
  text-wrap: wrap;
  max-width: 85%;
}

.input-area {
  display: flex;
  gap: 0.5rem;
}

.input-area input {
  flex: 1;
}

.input-area button {
  width: 3rem;
}

.context {
  margin-bottom: 1rem;
}

.context-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-light-color);
  font-weight: bold;
}

.chips {
  display: flex;
  gap: 0.5rem;
}

.chip {
  padding: 0.5rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  background: var(--tabbar-active-color);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  width: max-content;
  color: black;
}

.chip.active {
  background: var(--cta-color);
  color: white;
}
</style>
