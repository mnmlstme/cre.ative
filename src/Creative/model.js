import Im from 'immutable'

export const initial = Im.Map({
  workbook: {
    isLoaded: false,
  },
  finder: Im.Map({
    project: './Workbooks',
    selected: '',
    workbooks: [
      // TODO: store these in project.yaml
      { file: 'ElmWorkbook.kr', title: 'Elm Workbook' },
      { file: 'ReactWorkbook.kr', title: 'React Workbook' },
    ],
  }),
  resources: Im.Map(),
  current: 1,
})
