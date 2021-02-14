<template>
  <main class="w-50 mx-auto d-block">

    <input 
      @blur="focusedInput"
      v-model="userValue"
      @input="inputChangeHandler"
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
            <p>
              Скорость печати: <span>{{(lettersInMinute && lettersInMinute !== Infinity) ?  lettersInMinute.toFixed(0) : '0'}} символов в минуту</span>
            </p>
          </div>

          <button
          v-if="isStarted"
          @click="onButtonClickEnd"
          ref="startButton">
            STOP
          </button>

          <button
          v-else
          @click="onButtonClickStart"
          ref="endButton">
            START
          </button>

          <button
          @click="resetScore"
          ref="resetButton">
            Reset score
          </button>
        </b-col>
      </b-row>

      <b-row class="">
        <b-col class="col-9">
          <p>Progress...</p>
          <b-progress :value=getProgress.toFixed(0) class="mb-2"></b-progress>
        </b-col>
        <b-col>
          <p>
            Меткость: {{getAccruracy}} %
          </p>
        </b-col>

      </b-row>
    </b-container>
  </main>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  name: 'Board',

  data() {
    return {
      userValue: '',
      textSpans: [],
      lastIndexSymbol: 0,
      oldTime: 0,
      totalTime: 0,
      lettersInMinute: 0,
      totalScore: 0,
      isStarted: false,
      idSetInterval: null,
      match: 0,
    }
  },

  mounted() {
    this.textSpans = this.$refs.symbol;
  },

  methods: {
    ...mapActions(['updateScore']),

    focusedInput(event) {
      event.target.focus()
    },

    onButtonClickStart() {
      this.testIsStart();
      this.startInterval();
      this.isStarted = !this.isStarted;
    },

    onButtonClickEnd() {
      this.saveScore();
      this.testIsEnd(true);    
      this.$refs.startButton.blur();
    },

    setColorSpan(index) {
      if (typeof index == 'number') {
        this.textSpans[index].style.background = 'green';
      } else {
        this.textSpans[this.lastIndexSymbol].style.background = 'red';
      }
    },

    inputChangeHandler() {
      this.compareTexts(this.isTextComlited);
    },

    /***
     * ф-я сравнивает символы из исходного текста по индексу последнего 
     * совпашего символа и каждое последнее значение из инпута, при удовлетворении 
     * условия увеличивает на шаг индекс последнего слвпавшего индекса и добавдяет 
     * span зеленый цвет, и в красный при неудовл. Обновляет счетчик времени.
     */
    compareTexts(arg) {
        if (this.userValue[this.userValue.length - 1] === this.getText[this.lastIndexSymbol]) {
          this.setColorSpan(this.lastIndexSymbol);
          this.lastIndexSymbol++;
          this.match = this.lastIndexSymbol;
          this.testIsEnd(arg);
        } else {
          this.setColorSpan();
        }
    },

    testIsStart() {
      this.match = 0;
      this.lastIndexSymbol = 0;
      this.userValue = '';
      this.$refs['user-input'].removeAttribute('disabled');
      this.$refs['user-input'].focus();
      this.textSpans.forEach(span => {
        span.style.background = '';
      });
    },

    testIsEnd(arg) {
      if (arg) {
        localStorage.setItem('score', this.lettersInMinute)
        clearInterval(this.idSetInterval);
        this.isStarted = false;
        this.oldTime = 0;
        this.totalTime = 0;
        this.$refs['user-input'].setAttribute('disabled', true)
      }
    },

    updateTime() {
      const timeNow = Date.now();

      if (this.oldTime) {
        const difference = ((timeNow - this.oldTime) / 1000);
        this.totalTime += difference;
        this.oldTime = timeNow;
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
      }, 500);
    },

    saveScore() {
    this.totalScore = this.lettersInMinute;
    localStorage.setItem('score', this.totalScore);
    this.updateScore(this.totalScore);
    },

    resetScore() {
      localStorage.setItem('score', 0);
      this.updateScore(0);
    },
  }, 

  computed: {
    ...mapGetters(['getText']),

    isTextComlited() {
      return this.lastIndexSymbol === this.getText.length - 1;
    },

    getProgress() {
      return this.match / this.getText.length * 100;
    },

    getAccruracy() {
      const accruacy = this.match / this.userValue.length * 100;
      if (typeof accruacy === 'number' && accruacy === accruacy) {
        return accruacy.toFixed(0)
      }
      else {
        return 0;
      }
    }
  },
}
</script>