import { Link } from "react-router-dom";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white shadow-md min-h-screen flex flex-col justify-between">
      {/* Topo */}
      <div>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">StockMaster</h1>
          <p className="text-gray-500 text-sm">Controle de Estoque</p>
        </div>

        {/* Navegação */}
        <nav className="mt-6 space-y-1 px-4">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📊 Dashboard
          </Link>
          
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">CADASTROS</div>
          <Link to="/produtos" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📦 Produtos
          </Link>
          <Link to="/equipamentos" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            💻 Equipamentos
          </Link>
          <Link to="/insumos" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            🧪 Insumos
          </Link>
          <Link to="/ferramentas" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            🔧 Ferramentas
          </Link>
          <Link to="/limpeza" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            🧼 Limpeza
          </Link>
          <Link to="/locais" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📍 Locais
          </Link>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">OPERACIONAL</div>
          <Link to="/importacao" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📄 Importação
          </Link>
          <Link to="/historico" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📈 Histórico/Movimentações
          </Link>
          <Link to="/inventario" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📑 Inventário
          </Link>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-4 mb-2">RELATÓRIOS</div>
          <Link to="/relatorios" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-black hover:text-white transition-colors">
            📊 Relatórios
          </Link>
        </nav>
      </div>

      {/* Usuário */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold">
            A
          </div>
          <div>
            <p className="font-medium text-gray-900">Administrador</p>
            <p className="text-gray-500 text-sm">Usuário</p>
          </div>
        </div>
        
        {/* Botão de Logout */}
        <button 
          onClick={handleLogout}
          className="w-full py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <span>🚪</span>
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}