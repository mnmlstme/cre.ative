import React from 'react'
import { connect } from 'react-redux'

import Workbook from './workbook'
import Finder from './finder'

const App = ({ maybeWorkbook }) => {
  if (maybeWorkbook) {
    return <Workbook />
  } else {
    return <Finder />
  }
}

function mapStateToProps(state) {
  const workbook = state.get('workbook')

  return {
    maybeWorkbook: workbook.isLoaded ? workbook.module : null,
  }
}

export default connect(mapStateToProps)(App)
