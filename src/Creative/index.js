import React from 'react'
import ReactDOM from 'react-dom'
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

export function Creative({ importModule }) {
  const store = createStore(
    update,
    applyMiddleware(thunk.withExtraArgument({ importModule }))
  )
  return {
    render: (node) =>
      ReactDOM.render(React.createElement(Main, { store }), node),
  }
}
