import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/home/Home'
import Navbar from './components/navbar/Navbar'
import Characters from './pages/characters/Characters'
import Items from './pages/items/Items'


function App() {

  return (
    <>
    <Navbar></Navbar>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/characters" element={<Characters/>}/>
          <Route path="/items" element={<Items/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
