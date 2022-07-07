import { createApp, provide, h } from 'vue'
import { createPinia } from 'pinia'

import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { DefaultApolloClient } from '@vue/apollo-composable'

import App from './App.vue'
import './assets/base.css'

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  cache,
  uri: 'https://swapi-gql.netlify.app/.netlify/functions/index'
})

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App)
})

app.use(createPinia())

app.mount('#app')
