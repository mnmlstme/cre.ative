import Im from 'immutable'

export const initial = Im.Map({
  workbook: Im.Map({
    isLoaded: false,
  }),
  finder: Im.Map({
    projects: [],
  }),
  resources: Im.Map(),
  current: 1,
})
