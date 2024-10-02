import React from 'react'

import ContentWrapper from './components/ContentWrapper'
import UserRegistrationComponent from './components/UserRegistrationComponent'
import LoginComponent from './components/LoginComponent'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppRoutes from './utils/AppRoutes'
function App() {

  const router = createBrowserRouter(AppRoutes)


  return (
    <>
      <RouterProvider router={router} />

    </>
  )
}

export default App