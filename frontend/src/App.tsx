import React from 'react'
import UserTable from './components/UserTable'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Challenge 1: Data Processing & Rendering</h1>
        <UserTable />
      </div>
    </div>
  )
}

export default App
