import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    text: '',
    score: localStorage.getItem('score') ? localStorage.getItem('score') : 0,
  },
  mutations: {
    setText(state, text) {
      state.text = text;
    }
  },
  actions: {
    /**
     * Посылаем запрос, передаем response в mutations, удаляет лишние пробелы в исходном тектсе.
     */
    async fetchText({commit}) {
      const response = await fetch(`https://fish-text.ru/get?format=json&number=2`)
          .then((response) => {
            return response.json();
          }).then((result) => result = result.text.replace(/ {1,}/g," "));
      commit('setText', response);
    },
  },

  modules: {
  },
  getters: {
    getText(state) {
      return state.text;
    },

    getScore(state) {
      return state.score;
    },
  },
});
