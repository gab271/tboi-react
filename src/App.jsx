import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Home } from './pages/home/Home'
import { ItemsList } from './pages/items/ItemsList'
import { ItemDetail } from './pages/items/ItemDetail'
import { BossesList } from './pages/bosses/BossesList'
import { CharactersList } from './pages/characters/CharactersList'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import FavoritesList from './pages/favorites/FavoritesList'
import BuildsList from './pages/builds/BuildsList'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Account from './pages/account/Account'

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id" element={<ItemDetail />} />
          
          <Route path="bosses" element={<BossesList />} />
          <Route path="characters" element={<CharactersList />} />
          
          <Route path="builds" element={<BuildsList />} />
          
          <Route path="favorites" element={
            <ProtectedRoute>
              <FavoritesList />
            </ProtectedRoute>
          } />
          
          <Route path="account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  )
}

export default App
