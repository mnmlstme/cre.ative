import Im from 'immutable'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { update, immutableScene } from './update'
import Workbook from './views/workbook'

function App({ store }) {
  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Workbook />}>
            <Route path="/s/:sceneId/:slug" element={<Workbook />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </HashRouter>
    </Provider>
  )
}

function NoMatch() {
  let location = useLocation()

  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  )
}

export function Main(workbook) {
  const { basename, title, scenes, modules, plugin, init } = workbook

  const initial = Im.Map({
    workbook: Im.Map({
      basename,
      isLoaded: true,
      title,
      scenes: Im.List(scenes).map(immutableScene),
      modules: Im.List(modules || []),
      plugin,
      init,
    }),
    finder: Im.Map({
      projects: [],
    }),
    resources: Im.Map(),
    current: 1,
  })

  const store = createStore(
    (state, action) => update(state || initial, action),
    applyMiddleware(thunk)
  )

  return {
    render: (node) => {
      const root = createRoot(node)
      root.render(React.createElement(App, { store }))
    },
  }
}
