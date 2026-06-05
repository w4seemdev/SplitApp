import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Splits from './pages/Splits.jsx'
import Plan from './pages/Plan.jsx'
import Exercises from './pages/Exercises.jsx'
import Tracker from './pages/Tracker.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/splits" element={<Splits />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
