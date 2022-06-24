import {create, start} from './server'

const PORT = 3000
const app = create()

start(app, PORT)
