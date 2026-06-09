import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { router } from './router'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <TooltipProvider>
      {loading ? (
        <LoadingScreen onFinished={() => setLoading(false)} />
      ) : (
        <RouterProvider router={router} />
      )}
    </TooltipProvider>
  )
}

export default App
