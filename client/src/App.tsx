// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Produtos from "@/pages/Produtos";
import Equipamentos from "@/pages/Equipamentos";
import Insumos from "@/pages/Insumos";
import Ferramentas from "@/pages/Ferramentas";
import Limpeza from "@/pages/Limpeza";
import Locais from "@/pages/Locais";
import Inventario from "@/pages/Inventario";
import InventarioDetalhes from "@/pages/InventarioDetalhes";
import Relatorios from "@/pages/Relatorios";
import Importacao from "@/pages/Importacao";
import Movimentacoes from "@/pages/Movimentacoes";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/produtos" component={Produtos} />
              <Route path="/equipamentos" component={Equipamentos} />
              <Route path="/insumos" component={Insumos} />
              <Route path="/ferramentas" component={Ferramentas} />
              <Route path="/limpeza" component={Limpeza} />
              <Route path="/locais" component={Locais} />
              <Route path="/inventario" component={Inventario} />
              <Route path="/relatorios" component={Relatorios} />
              <Route path="/importacao" component={Importacao} />
              <Route path="/movimentacoes" component={Movimentacoes} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Componente para proteger rotas autenticadas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Rota específica para inventario/:id fora do AuthenticatedLayout */}
      <Route path="/inventario/:id">
        {(params) => (
          <ProtectedRoute>
            <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-auto p-6">
                    <InventarioDetalhes id={params.id} />
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </ProtectedRoute>
        )}
      </Route>

      {/* Todas as outras rotas usam o AuthenticatedLayout normal */}
      <Route path="/">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/produtos">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/equipamentos">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/insumos">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/ferramentas">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/limpeza">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/locais">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/inventario">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/relatorios">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/importacao">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      <Route path="/movimentacoes">
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
      
      {/* Rota curinga para 404 */}
      <Route>
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;