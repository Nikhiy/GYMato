// import React from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Login from './pages/Login';
import Home from './pages/Home';
import {Toaster} from 'react-hot-toast'
import ProtectedRoute from './components/protectedRoute';
import PublicRoute from './components/publicRoute';
import SelectRole from './pages/SelectRole';
import Navbar from './components/navbar';

const App = () => {
  return(
  <BrowserRouter>
  <Navbar />
  <Routes>
    <Route element={<PublicRoute/>}>
      <Route path='/login' element={<Login/>} />
    </Route>
    <Route element={<ProtectedRoute/>}>
      <Route path='/' element={<Home/>} />
      <Route path='/select-role' element={<SelectRole/>} />
    </Route>
  </Routes>
  <Toaster />
  </BrowserRouter>
  )
};

export default App
