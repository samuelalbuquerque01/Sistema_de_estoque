// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Locais from "./pages/Locais";
import Historico from "./pages/Historico";
import Inventario from "./pages/Inventario";
import Relatorios from "./pages/Relatorios";
import Importacao from "./pages/Importacao";
import Equipamentos from "./pages/Equipamentos";
import Insumos from "./pages/Insumos";
import Ferramentas from "./pages/Ferramentas";
import Limpeza from "./pages/Limpeza";
import Login from "./pages/Login";

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Painel de Controle</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">🔔</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {user ? `👤 ${user.name}` : '👤 Usuário'}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 ml-2"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para rotas protegidas
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  return token && isAuthenticated ? children : <Navigate to="/login" />;
}

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Produtos /></ProtectedRoute>} />
            <Route path="/locais" element={<ProtectedRoute><Locais /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
            <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/importacao" element={<ProtectedRoute><Importacao /></ProtectedRoute>} />
            <Route path="/equipamentos" element={<ProtectedRoute><Equipamentos /></ProtectedRoute>} />
            <Route path="/insumos" element={<ProtectedRoute><Insumos /></ProtectedRoute>} />
            <Route path="/ferramentas" element={<ProtectedRoute><Ferramentas /></ProtectedRoute>} />
            <Route path="/limpeza" element={<ProtectedRoute><Limpeza /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}