<template>
  <main class="w-50 mx-auto d-block">

    <input 
      @blur="focusedInput"
      v-model="userValue"
      @input="inputChangeHandler"
      class="sr-only" type="text" name="" ref="user-input">


    <b-container fluid>
      <b-row class="mb-5">
        <b-col cols="9" class="p-3 text">
          <span 
          v-for="(item, index) of getText"
          :key="index+item"
          ref="symbol"
          >{{item}}</span>
        </b-col>
        
        <b-col class="">
          <div>
            <p>
              Speed: <span class="total">{{(lettersInMinute && lettersInMinute !== Infinity) ?  lettersInMinute.toFixed(0) : '0'}} LPM</span>
            </p>
          </div>
          <div>
            <p>
            Accuracy: <span class="total">{{getAccuracy}} %</span>
          </p>
          </div>
         
        </b-col>
      </b-row>

      <b-row class="mb-5">
        <b-col class="col-9">
          <p>Progress...</p>
          <b-progress :value=getProgress.toFixed(0) class="mb-2"></b-progress>
        </b-col>
        <b-col class="d-flex flex-column justify-content-between button-container">
          
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

        <b-row>
          <div class="w-100">
            <b-table striped hover :items="items"></b-table>
          </div>
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
      items: [],
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

        this.items.push({
          Try: this.items.length + 1,
          ['Print Speed, LPM']: (this.lettersInMinute > 0 && this.lettersInMinute !== Infinity) ? this.lettersInMinute.toFixed(0) : 0,
          ['Accuracy, %']: this.getAccuracy,
        });

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
      }, 100);
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

    getAccuracy() {
      const accuracy = this.match / this.userValue.length * 100;
      if (typeof accuracy === 'number' && accuracy === accuracy) {
        return accuracy.toFixed(0)
      }
      else {
        return 0;
      }
    }
  },
}
</script>

<style scoped>
  main {
    padding: 1rem;
    background: linear-gradient(47deg, rgba(177,246,212,1) 0%, rgba(208,255,246,0.5130427170868348) 100%);

    -webkit-box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
    -moz-box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
    box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
  }

  .text {
    background: rgba(255, 255, 255, 0.781);
    border: #b0b0b1 1px solid;

    font-size: 25px;
  }

  button {
    border: #b0b0b1 1px solid;
    padding: 0.5rem 0rem;
    margin-bottom: 1rem;
  }

  .total {
    font-size: 20px;
  }

  .button-container {
    margin-right: -15px;
  }
</style>