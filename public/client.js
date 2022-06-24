import { Creative } from '@cre.ative/cre-a-tive'

Creative({
  importModule: (path) => import(`PROJECTS/${path}`),
}).render(document.getElementById('lets-be-cre-at-ive'))
