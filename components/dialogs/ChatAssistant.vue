<script setup lang="ts">
import { ref } from 'vue';
import OpenAI from 'openai';

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
  <div class="shadowClose" @click="emit('close')"></div>
  <dialog open v-if="!showDisclaimer">
    <h2>Assistant</h2>
    <div class="conversation">
      <div v-for="(message, index) in messages" :key="index" :class="message.role">
        <p>{{ message.content }}</p>
      </div>
    </div>
    <div class="context">
      <p class="context-title">Contexte donné à l'IA</p>
      <div class="chips">
        <button class="chip" :class="{ active: includeWearingSessions }"
          @click="includeWearingSessions = !includeWearingSessions">
          Historique
        </button>
        <button class="chip" :class="{ active: includeAnalysis }" @click="includeAnalysis = !includeAnalysis">
          Spermogrammes
        </button>
      </div>
    </div>
    <div class="input-area">
      <input type="text" v-model="userMessage" @keydown.enter="sendMessage" placeholder="Type your message..."
        :disabled="isLoading" />
      <button @click="sendMessage" :disabled="isLoading">
        <Icon :name="isLoading ? 'i-tabler-hourglass-high' : 'i-tabler-send'" />
      </button>
    </div>
  </dialog>
  <dialog open v-if="showDisclaimer">
    <h2>AndroBot</h2>
    <p>
      Ceci est un chatbot qui utilise l'intelligence artificielle générative de OpenAI pour répondre à vos questions.
      <br> Il est possible que les réponses ne soient pas toujours exactes ou appropriées.
    </p>
    <div class="form">
      <label for="apiKey">
        <Icon name="i-tabler-brand-openai" />
        Clé API OpenAI
      </label>
      <input type="text" v-model="apiKey" placeholder="sk-..." />
    </div>
    <button @click="validateApiKey">
      <Icon name="i-tabler-check" />
      Continuer
    </button>
  </dialog>
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
