import Im from 'immutable'

export const initial = Im.Map({
  workbook: {
    filepath: 'ElmWorkbook.kr',
    isLoaded: false,
  },
  resources: Im.Map(),
  current: 1,
})
