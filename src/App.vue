<template>
  <div id="app">
    <Header />
    <Board />
  </div>
</template>

<script>

import Header from './components/Header';
import Board from './components/Board';

export default {
  name: 'App',
  components: {
    Header, Board
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  min-height: 100vh;
  background: linear-gradient(47deg, rgba(106,255,138,1) 0%, rgba(69,252,216,0.5) 100%);
}

</style>
