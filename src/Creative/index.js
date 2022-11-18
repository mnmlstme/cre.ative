import React from 'react'
import { createRoot } from 'react-dom/client'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { update } from './update'
import App from './views/app'

// Redux store

// React-Redux main

function Main({ store }) {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export function Creative(loaders) {
  const store = createStore(
    update,
    applyMiddleware(thunk.withExtraArgument(loaders))
  )
  return {
    render: (node) => {
      const root = createRoot(node)
      root.render(React.createElement(Main, { store }))
    },
  }
}
