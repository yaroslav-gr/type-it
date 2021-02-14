<template>
  <h1 v-if="getScore > 0">
    Your last scorre: <span>{{(getScore *1).toFixed(0)}}</span>. 
    Let's try again?
  </h1>
  <h1 v-else>
    Let's check your typing speed.
    Get ready and press Start button!
  </h1>
</template>

<script>
  import {mapGetters} from 'vuex';

  export default {
  name: 'Header',

  computed: {
    ...mapGetters(['getScore']),
  },
}
</script>

<style scoped>
  h1 {
    margin-bottom: 4rem;
  }
</style>