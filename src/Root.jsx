import { useState } from 'react'
import InitiationPage from './components/InitiationPage.jsx'
import App from './App.jsx'

export default function Root() {
  const [initiated, setInitiated] = useState(false)
  if (!initiated) {
    return <InitiationPage onComplete={() => setInitiated(true)} />
  }
  return <App />
}
