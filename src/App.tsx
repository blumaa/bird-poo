import { Analytics } from '@vercel/analytics/react'
import { Game } from './Game'

function App() {
  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    >
      <Game />
      <Analytics />
    </div>
  )
}

export default App
