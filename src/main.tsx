import './styles/tokens.css'
import './styles/global.css'
import './styles/prose.css'
import 'virtual:stylex.css'
import { createRoot } from 'octane'
import { App } from './app'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(App, {})
