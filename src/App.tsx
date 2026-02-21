import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Dogs from './pages/Dogs'
import DogDetail from './pages/DogDetail'
import Donate from './pages/Donate'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import AdminDogs from './pages/admin/AdminDogs'
import AdminDogNew from './pages/admin/AdminDogNew'
import AdminDogEdit from './pages/admin/AdminDogEdit'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dogs" element={<Dogs />} />
            <Route path="/dogs/:id" element={<DogDetail />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute><AdminDogs /></AdminRoute>
            } />
            <Route path="/admin/dogs/new" element={
              <AdminRoute><AdminDogNew /></AdminRoute>
            } />
            <Route path="/admin/dogs/:id" element={
              <AdminRoute><AdminDogEdit /></AdminRoute>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
