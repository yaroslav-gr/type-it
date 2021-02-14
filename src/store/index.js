import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    text: 'aaaaaaaaaaaaa',
    score: localStorage.getItem('score') ? localStorage.getItem('score') : 0,
  },
  mutations: {
    updateScore(state, score) {
      state.score = score * 1;
    }
  },
  actions: {
    updateScore({commit}, score) {
      commit('updateScore', score)
    }
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
  }
})
