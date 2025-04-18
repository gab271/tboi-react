import './App.css'
import { Routes, Route } from "react-router-dom"
import Home from './pages/home/Home'
import Navbar from './components/navbar/Navbar'
import Characters from './pages/characters/Characters'
import Comments from './pages/comments/Comments'
import Items from './pages/items/Items'
import News from './pages/rss/Rss'
import Achievements from './components/achivements/Achievements'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/characters" element={<Characters/>}/>
        <Route path="/comments" element={<Comments/>}/>
        <Route path="/items" element={<Items/>}/>
        <Route path="/news" element={<News />} />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </>
  )
}

export default App