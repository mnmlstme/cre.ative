import Im from 'immutable'

export const initial = Im.Map({
  workbook: {
    isLoaded: false,
  },
  finder: Im.Map({
    project: 'MyProject',
  }),
  resources: Im.Map(),
  current: 1,
})
