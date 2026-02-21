import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Home } from './pages/home/HomeV2'
import { ItemsList } from './pages/items/ItemsList'
import { ItemDetail } from './pages/items/ItemDetail'
import { BossesList } from './pages/bosses/BossesList'
import { CharactersList } from './pages/characters/CharactersList'
import { SynergiesPage } from './pages/synergies/SynergiesPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import FavoritesPage from './pages/favorites/FavoritesPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { BuildsPage, BuildDetailPage, CreateBuildPage } from './features/builds'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Account from './pages/account/Account'
import PublicProfile from './pages/profile/PublicProfile'
import AdminRoute from './components/layout/AdminRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminItems from './pages/admin/items/AdminItems'
import AdminItemEditor from './pages/admin/items/AdminItemEditor'
import AdminBosses from './pages/admin/bosses/AdminBosses'
import AdminBossEditor from './pages/admin/bosses/AdminBossEditor'
import AdminCharacters from './pages/admin/characters/AdminCharacters'
import AdminCharacterEditor from './pages/admin/characters/AdminCharacterEditor'
import AdminUsers from './pages/admin/users/AdminUsers'

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
          <Route path="synergies" element={<SynergiesPage />} />
          
          {/* Builds - Public feed */}
          <Route path="builds" element={<BuildsPage />} />
          <Route path="builds/:id" element={<BuildDetailPage />} />
          
          {/* Public Profile */}
          <Route path="profile/:userId" element={<PublicProfile />} />
          
          {/* Builds - Protected create */}
          <Route path="builds/new" element={
            <ProtectedRoute>
              <CreateBuildPage />
            </ProtectedRoute>
          } />
          
          <Route path="favorites" element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          } />
          
          <Route path="account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="items" element={<AdminItems />} />
              <Route path="items/new" element={<AdminItemEditor mode="create" />} />
              <Route path="items/:id" element={<AdminItemEditor mode="edit" />} />
              
              <Route path="users" element={<AdminUsers />} />

              <Route path="bosses" element={<AdminBosses />} />
              <Route path="bosses/new" element={<AdminBossEditor mode="create" />} />
              <Route path="bosses/:id" element={<AdminBossEditor mode="edit" />} />

              <Route path="characters" element={<AdminCharacters />} />
              <Route path="characters/new" element={<AdminCharacterEditor mode="create" />} />
              <Route path="characters/:id" element={<AdminCharacterEditor mode="edit" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
  )
}

export default App
