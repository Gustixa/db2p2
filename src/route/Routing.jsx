import React from 'react'
import { Route, 
BrowserRouter,
Routes } from 'react-router-dom'
import Home from '@pages/home'
import NewData from '@pages/addData'
import UpdateUser from '@pages/updateData'

export default function Routing(){

  return (
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/"
          element={(<Home />)}
        />
        <Route
          exact
          path="/newData"
          element={(<NewData/>)}
        />
        <Route
          exact
          path="/updateUser/:nodeId"
          element={(<UpdateUser/>)}
        />
      </Routes>
    </BrowserRouter>
  )
}