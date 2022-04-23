import { Creative } from '@cre.ative/cre-a-tive'

Creative(
  {
    importModule: (path) => import(`DOCROOT/${path}`)
  }
).render(document.getElementById('lets-be-cre-at-ive'))
