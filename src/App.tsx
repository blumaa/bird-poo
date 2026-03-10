import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Game } from './Game'

function App() {
  const [ready, setReady] = useState(!Capacitor.isNativePlatform())

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    async function setup() {
      await ScreenOrientation.lock({ orientation: 'portrait' })
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.hide()
      await SplashScreen.hide()
      setReady(true)
    }
    setup()
  }, [])

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    >
      {ready && <Game />}
      {!Capacitor.isNativePlatform() && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </div>
  )
}

export default App
