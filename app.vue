<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.075s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>

<script setup>
let defferedPrompt;

const installPWA = () => {
  defferedPrompt.prompt();
  defferedPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    defferedPrompt = null;
  });
};

onMounted(() => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched: Installed');
  } else {
    console.log('Launched: Browser');
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      defferedPrompt = e;
    });

    installPWA();
  }
});
</script>