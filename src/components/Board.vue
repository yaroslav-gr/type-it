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
          <span class="cell"
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
            Reset last score
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
import {mapGetters, mapActions} from 'vuex';

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
    this.fetchText()
      .then(() => this.textSpans = this.$refs.symbol);
  },

  methods: {
    ...mapActions(['fetchText']),

    /**
    * Колбэк на input, слушаем blur -> ставим обратно фокус на input
    */
    focusedInput(event) {
      event.target.focus();
    },

    /**
    * Хендлер на кнопке Старт; вызывет ф-ю начала теста, запускает интервал; пернключает флаг, объявляя, что тест запущен.
    */
    onButtonClickStart() {
      this.startTest();
      this.startInterval();
      this.isStarted = !this.isStarted;
    },

    /**
    * Хендлер на кнопке Завершить; вызывет ф-ю сохраниения очков, завершения теста с аргументом true; убирает фокус на кнопке Старт.
    */
    onButtonClickEnd() {
      this.saveScore();
      this.endTest(true);    
      this.$refs.startButton.blur();
    },

    /**
    * Добавляет нужный цвет backgroung span в коллекции по индексу.
    * @param {nymber} index - вызывается без пареметра в случае, когда проверка символов не прошла.
    */
    setColorSpan(index) {
      if (typeof index == 'number') {
        this.textSpans[index].style.background = '#4fd06b';
      } else {
        this.textSpans[this.lastIndexSymbol].style.background = '#ff9c9cd4';
      }
    },

    /**
    * Колбэк на input, слушает change.
    */
    inputChangeHandler() {
      this.compareTexts(this.isTextComlited);
    },

    /***
     * ф-я сравнивает символы из исходного текста по индексу последнего 
     * совпашего символа и каждое последнее значение из инпута, при удовлетворении 
     * условия увеличивает на шаг индекс последнего совпавшего индекса и вызывает ф-ю окрашивания span; обновляет счетчик времени.
     * @param {Boolien} arg - аргумент true нужет только чтобы вызвать ф-ю завершения теста в случае, когда сравнивниваем
     * последний символ в тексте и условие успеха удовлетворяется.
     */
    compareTexts(arg) {
        if (this.userValue[this.userValue.length - 1] === this.getText[this.lastIndexSymbol]) {
          this.setColorSpan(this.lastIndexSymbol);
          this.lastIndexSymbol++;
          this.match = this.lastIndexSymbol;
          this.endTest(arg);
        } else {
          this.setColorSpan();
        }
    },

    /**
    * Ф-я сбразывает свойства в data; очищает input и делает его активным; сбрасывает background у всех span.
    */ 
    startTest() {
      this.match = 0;
      this.lastIndexSymbol = 0;
      this.userValue = '';
      this.$refs['user-input'].removeAttribute('disabled');
       this.$refs['user-input'].focus();
      this.textSpans.forEach(span => {
        span.style.background = '';
      });
    },

    /**
    * Обновляет значение в localStorage, удаляет интервал; сбрасывает значения в data; добывляет полю input disabled.
    * @param {Boolien} arg - в случае нажатия на кнопку "завершить" вызовется с аргументом true; в случае, когда проходят тест до конца, "флаг"
    * меняется с false на true, тогда ф-я и отрабатывает.
    */
    endTest(arg) {
      if (arg) {
        localStorage.setItem('score', this.lettersInMinute);
        clearInterval(this.idSetInterval);
        this.addNewScoreInTable();
        this.isStarted = false;
        this.oldTime = 0;
        this.totalTime = 0;
        this.$refs['user-input'].setAttribute('disabled', true);
      }
    },

    /**
    * Добавляет в массив объект с итогами оконченного теста для отображения в таблице.
    * Ограничивает длинну массива с итогами теста, позволяе вывести только 5 последних попыток.
    */
    addNewScoreInTable() {
      if (this.items.length > 4) {
        this.items.shift();
        this.items.push({
          ['Print Speed, LPM']: (this.lettersInMinute > 0 && this.lettersInMinute !== Infinity) ? this.lettersInMinute.toFixed(0) : 0,
          ['Accuracy, %']: this.getAccuracy,
        });
      } else {
        this.items.push({
          ['Print Speed, LPM']: (this.lettersInMinute > 0 && this.lettersInMinute !== Infinity) ? this.lettersInMinute.toFixed(0) : 0,
          ['Accuracy, %']: this.getAccuracy,
        });
      }
    },

    /**
    * Устанавливает начальное значение oldTime, если нет, или обновляет его; рассчитывает общее время totalTime
    */
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

    /**
    * Запускает ф-ю обновления времени и рассчитывает количество символов в минуту каждую 1/10 секунды
    */ 
    startInterval: function () {
      this.idSetInterval = setInterval(() => {
        this.updateTime();
        this.lettersInMinute = (60 / this.totalTime * this.lastIndexSymbol);
      }, 100);
    },

    /**
    * Сохраняет значение очков в localStorage и обновляет в store
    */
    saveScore() {
    this.totalScore = this.lettersInMinute;
    localStorage.setItem('score', this.totalScore);
    },
    
    /**
    * Удаляет результаты теста, если тест не запущен.
    */
    resetScore() {
      if (!this.isStarted) {
      this.items = [];
      }
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
        return accuracy.toFixed(0);
      }
      else {
        return 0;
      }
    },
  },
}
</script>

<style scoped>
  main {
    min-width: 90%;
    padding: 1rem;
    background: linear-gradient(47deg, rgba(177,246,212,1) 0%, rgba(208,255,246,0.5130427170868348) 100%);

    -webkit-box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
    -moz-box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
    box-shadow: 20px 20px 3px 0px rgba(57,76,122,1);
  }

  .text {
    background: rgba(255, 255, 255, 0.781);
    border: rgba(57,76,122,1) 1px solid;

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

  .cell {
    letter-spacing: 0.5px;
  }
</style>