import './App.css'
import { Routes, Route } from "react-router-dom"
import Home from './pages/home/Home'
import Navbar from './components/navbar/Navbar'
import Characters from './pages/characters/Characters'
import Items from './pages/items/Items'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/characters" element={<Characters/>}/>
        <Route path="/items" element={<Items/>}/>
      </Routes>
    </>
  )
}

export default App