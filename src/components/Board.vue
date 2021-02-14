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
            закончить тест
          </button>

          <button
          v-else
          @click="onButtonClickStart"
          ref="endButton">
            начать тест
          </button>
        </b-col>
      </b-row>

      <b-row class="">
        <b-col class="col-9">
          <b-progress :value=getAccuracy.toFixed(0) class="mb-2"></b-progress>
        </b-col>
        <b-col>
          <p>
            Меткость: {{getAccuracy.toFixed(0)}} %
          </p>
        </b-col>

      </b-row>
    </b-container>
  </main>
</template>

<script>
import {mapGetters} from 'vuex'

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

    focusedInput(event) {
      event.target.focus()
    },

    onButtonClickStart() {
      this.testIsStart();
      this.startInterval();
    
      this.isStarted = !this.isStarted;
    },

    onButtonClickEnd() {
      this.savePrevScore();
      this.testIsEnd(true);    
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

    inputChangeHandler() {
      this.compareTexts(this.isTextComlited);
      console.log(this.userValue);
      console.log(this.lastIndexSymbol, this.userValue, this.isStarted)
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
      this.$refs['user-input'].removeAttribute('disabled');
      this.$refs['user-input'].focus();
      this.textSpans.forEach(span => {
        span.style.background = '';
      });
    },

    testIsEnd(arg) {
      if (arg) {
        this.savePrevScore();
        clearInterval(this.idSetInterval);
        this.lastIndexSymbol = 0;
        this.userValue = '';
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

    savePrevScore() {
    this.totalScore = this.lettersInMinute;
    localStorage.setItem('score', this.totalScore);
    },
  }, 

  computed: {
    ...mapGetters(['getText']),

    isTextComlited() {
      return this.lastIndexSymbol === this.getText.length - 1;
    },

    getAccuracy() {
      return this.match / this.getText.length * 100;
    }
  },
}
</script>