import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import Dashboard from "@/pages/Dashboard";
import Produtos from "@/pages/Produtos";
import Equipamentos from "@/pages/Equipamentos";
import Insumos from "@/pages/Insumos";
import Ferramentas from "@/pages/Ferramentas";
import Limpeza from "@/pages/Limpeza";
import Locais from "@/pages/Locais";
import Historico from "@/pages/Historico";
import Inventario from "@/pages/Inventario";
import Relatorios from "@/pages/Relatorios";
import Importacao from "@/pages/Importacao";
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
              <Route path="/historico" component={Historico} />
              <Route path="/inventario" component={Inventario} />
              <Route path="/relatorios" component={Relatorios} />
              <Route path="/importacao" component={Importacao} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={AuthenticatedLayout} />
      <Route path="/:rest*" component={AuthenticatedLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
