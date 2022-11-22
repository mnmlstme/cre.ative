import React from 'react'
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

import Workbook from './workbook'
import Finder from './finder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app">
          <Route path="finder" element={<Finder />} />
          <Route path="workbook/:projectId/:workbookId" element={<Workbook />}>
            <Route path=":slug/:sceneId" element={<Workbook />} />
          </Route>
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
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
