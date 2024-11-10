<template>
  <NuxtLayout>
    <NuxtPage />
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
let deferredPrompt;

const installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  }
};

const handleFirstClick = () => {
  installPWA();
  window.removeEventListener('click', handleFirstClick); // Remove listener after first click
};

onMounted(() => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched: Installed');
  } else {
    console.log('Launched: Browser');

    if ('serviceWorker' in navigator) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Bind the install prompt to the first click
        window.addEventListener('click', handleFirstClick);
      });
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleFirstClick); // Clean up on unmount
});
</script>
