import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import Dashboard from './components/Dashboard';
import PublicRoute from './router/PublicRoute';

function App() {
  return (
		<AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* public route */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            {/* /signup, /forgot-password, etc. */}
          </Route>

          {/*  close route (authorisation is required) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* root route */}
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
		</AuthProvider>
  );
}

export default App;