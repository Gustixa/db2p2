import { useState } from 'react'
import Routing from '@route'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='general'>
      <Routing/>
    </div>
  )
}

export default App
