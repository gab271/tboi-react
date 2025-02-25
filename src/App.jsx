import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/home/Home'
import Navbar from './components/navbar/Navbar'


function App() {

  return (
    <>
    <Navbar></Navbar>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/navbar" element={<Navbar/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
