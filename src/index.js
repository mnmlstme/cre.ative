import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { update } from './Creative/update'
import App from './Creative/views/app'

// Redux store

const store = createStore(update, applyMiddleware(thunk))

// React-Redux main

function Main({ store }) {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

const mountpoint = document.getElementById('lets-be-cre-at-ive')

ReactDOM.render(React.createElement(Main, { store }), mountpoint)
