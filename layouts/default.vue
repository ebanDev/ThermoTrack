<template>
  <top-bar/>
  <slot/>
  <tab-bar/>
</template>

<style>
main {
  display: flex;
  align-items: start;
  flex-direction: column;
  height: calc(100vh - 56px);
  padding: 20px 20px calc(20px + 56px);
  gap: 16px;
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
