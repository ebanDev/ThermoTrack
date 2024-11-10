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

<script>
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
</script>