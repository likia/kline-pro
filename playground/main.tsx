import { render } from 'solid-js/web'

import App from './App'

import '../src/index.less'
import './playground.less'

const root = document.getElementById('app')

if (!root) {
  throw new Error('Playground root element not found')
}

render(() => <App />, root)
