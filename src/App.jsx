import React from 'react'
import { useNavigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/api'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Home } from './pages/home/Home'
import { ItemsList } from './pages/items/ItemsList'
import { ItemDetail } from './pages/items/ItemDetail'
import { BossesList } from './pages/bosses/BossesList'
import { CharactersList } from './pages/characters/CharactersList'

// Placeholder components 
const Placeholder = ({ title }) => (
  <div className="container mx-auto py-20 text-center animate-fade-in">
    <h1 className="text-4xl font-serif text-gold mb-4">{title}</h1>
    <p className="text-muted">Currently under construction by the community.</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id" element={<ItemDetail />} />
          
          <Route path="bosses" element={<BossesList />} />
          <Route path="characters" element={<CharactersList />} />
          
          <Route path="builds" element={<Placeholder title="Community Builds" />} />
          <Route path="favorites" element={<Placeholder title="My Collection" />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App
