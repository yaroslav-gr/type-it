import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    text: '',
    score: localStorage.getItem('score') ? localStorage.getItem('score') : 0,
  },
  mutations: {
    updateScore(state, score) {
      state.score = score * 1;
    },

    setText(state, text) {
      state.text = text;
    }
  },
  actions: {

    /**
     * Передает количетво очков в mutations -> обновляем state
     * @param {number} score  
     */
    updateScore({commit}, score) {
      commit('updateScore', score);
    },
    
    /**
     * Посылаем запрос, передаем response в mutations
     */
    async fetchText({commit}) {
      const response = await fetch(`https://fish-text.ru/get?format=json`)
          .then((response) => {
            return response.json();
          });
      commit('setText', response.text);
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
