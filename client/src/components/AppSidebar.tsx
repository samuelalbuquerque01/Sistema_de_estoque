// components/AppSidebar.tsx - VERSÃO LIMPA
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Package,
  Monitor,
  FlaskConical,
  Wrench,
  Sparkles,
  MapPin,
  Upload,
  History,
  ClipboardList,
  BarChart3,
  LogOut,
  Users
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";
import { useState } from "react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
];

const cadastrosItems = [
  { title: "Produtos", icon: Package, path: "/produtos" },
  { title: "Equipamentos", icon: Monitor, path: "/equipamentos" },
  { title: "Insumos", icon: FlaskConical, path: "/insumos" },
  { title: "Ferramentas", icon: Wrench, path: "/ferramentas" },
  { title: "Limpeza", icon: Sparkles, path: "/limpeza" },
  { title: "Locais", icon: MapPin, path: "/locais" },
];

const operacionalItems = [
  { title: "Movimentações", icon: Upload, path: "/movimentacoes" },
  { title: "Importação", icon: Upload, path: "/importacao" },
  { title: "Histórico de Importações", icon: History, path: "/historico-importacoes" },
  { title: "Inventário", icon: ClipboardList, path: "/inventario" },
];

const relatoriosItems = [
  { title: "Relatórios", icon: BarChart3, path: "/relatorios" },
];

const administracaoItems = [
  { title: "Usuários", icon: Users, path: "/usuarios" },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [logoError, setLogoError] = useState(false);

  const canManageUsers = user?.role === 'super_admin' || user?.role === 'admin';

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      'super_admin': 'Super Admin',
      'admin': 'Administrador', 
      'user': 'Usuário'
    };
    return roles[role as keyof typeof roles] || 'Usuário';
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center mb-1">
            {logoError ? (
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
                NPC
              </div>
            ) : (
              <img 
                src="/images/logo.png" 
                alt="Neuropsicocentro Logo"
                className="h-14 w-14 object-contain transition-opacity hover:opacity-90"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          
          <div className="w-full px-2">
            <h1 className="text-lg font-bold text-gray-900 leading-tight break-words">
              Neuropsicocentro
            </h1>
            <p className="text-xs text-sidebar-foreground/70 mt-1 font-medium">
              Gestão de Estoque
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>CADASTROS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cadastrosItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>OPERACIONAL</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operacionalItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>RELATÓRIOS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {relatoriosItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location === item.path}>
                    <Link href={item.path} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canManageUsers && (
          <SidebarGroup>
            <SidebarGroupLabel>ADMINISTRAÇÃO</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {administracaoItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={location === item.path}>
                      <Link href={item.path} data-testid={`link-${item.title.toLowerCase()}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user ? getUserInitials(user.name) : 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user ? user.name : 'Administrador'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user ? user.email : 'admin@neuropsicocentro.com'}
            </p>
            {user && (
              <p className="text-xs text-sidebar-foreground/40 truncate">
                {getRoleBadge(user.role)}
              </p>
            )}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}