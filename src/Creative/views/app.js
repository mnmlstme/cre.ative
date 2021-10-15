import React from 'react'
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
  useLocation,
  useParams,
} from 'react-router-dom'

import Workbook from './workbook'
import Finder from './finder'

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/workbook/:path*">
          <WorkbookWithParams />
        </Route>
        <Route path="/finder">
          <Finder />
        </Route>
        <Route exact path="/">
          <Redirect to="/finder" />
        </Route>
        <Route path="*">
          <NoMatch />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

function WorkbookWithParams() {
  let { path } = useParams()

  return <Workbook urlpath={path} />
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
