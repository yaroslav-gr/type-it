<template>
  <main class="w-50 mx-auto d-block">

    <input 
      v-model="userValue"
      @input="compareTexts(userValue)"
      class="sr-only" type="text" name="" ref="user-input">


    <b-container fluid>
      <b-row class="border rounded">
        <b-col cols="9" class="border p-3">
          <span 
          v-for="(item, index) of getText"
          :key="index+item"
          ref="symbol"
          >{{item}}</span>
        </b-col>
        
        <b-col class="">
          <div>
            Скорость печати: <span>{{(lettersInMinute && lettersInMinute !== Infinity) ?  lettersInMinute.toFixed(0) : '0'}} символов в минуту</span>
          </div>

          <button
          v-if="isStarted"
          @click="onButtonClickEnd"
          ref="startButton">
            закончить тест
          </button>

          <button
          v-else
          @click="onButtonClickStart"
          ref="endButton">
            начать тест
          </button>
        </b-col>



        <b-input></b-input>
    
      </b-row>
    </b-container>
  </main>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  name: 'Board',

  data:  function() {
    return {
      userValue: '',
      textSpans: [],
      lastIndexSymbol: 0,
      oldTime: 0,
      totalTime: 0,
      lettersInMinute: 0,
      isStarted: false,
      idSetInterval: null,
    }
  },

  mounted() {
    this.textSpans = this.$refs.symbol;
    console.log(this.textSpans)
  },

  methods: {
    setFocusOnInput(arg) {
      const input = this.$refs['user-input'];
      arg ? input.blur() : input.focus();
    },

    onButtonClickStart() {
      this.setFocusOnInput(this.isStarted);
      this.startInterval();

      this.isStarted = !this.isStarted;
    },

    onButtonClickEnd() {
      this.setFocusOnInput(this.isStarted)
      this.isStarted = !this.isStarted;
      clearInterval(this.idSetInterval)
      this.$refs.startButton.blur();
    },

    setColorSpan(index) {
      console.log(typeof index);
      if (typeof index == 'number') {
        this.textSpans[index].style.background = 'green';
      } else {
        this.textSpans[this.lastIndexSymbol].style.background = 'red';
      }
    },

    compareTexts() {
      if (this.userValue[this.userValue.length - 1] === this.getText[this.lastIndexSymbol]) {
        this.setColorSpan(this.lastIndexSymbol);
        this.lastIndexSymbol++;
      } else {
        this.setColorSpan(null);
      }
      this.updateTime();
    },

    updateTime() {
      const timeNow = Date.now();

      if (this.oldTime) {
        const difference = ((timeNow - this.oldTime) / 1000);
        this.totalTime += difference;
        this.oldTime = timeNow;
        console.log(this.oldTime, difference, this.totalTime);
      } else {
        this.oldTime = timeNow;
      }  
    },

    getLettersInOneMinute () {
      if (this.totalTime !== 0) {
        return (60 / this.totalTime * this.lastIndexSymbol).toFixed(0);
      };
    },

    startInterval: function () {
      this.idSetInterval = setInterval(() => {
        this.updateTime();
        this.lettersInMinute = (60 / this.totalTime * this.lastIndexSymbol);
      }, 1000);
    },
  }, 

  computed: {
    ...mapGetters(['getText']),
  },
}
</script>