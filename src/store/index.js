import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    text: 'Lover',
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
  getters: {
    getText: function (state) {
      return state.text;
    },
  }
})
