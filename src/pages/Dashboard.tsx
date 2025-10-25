import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  History, 
  Trash2, 
  Users, 
  FileText,
  DollarSign,
  LogOut,
  BarChart3,
  Upload,
  Search,
  AlertTriangle,
  Clock,
  Settings,
  FileBarChart,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StartShiftDialog } from '@/components/StartShiftDialog';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [shiftStarted, setShiftStarted] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleShiftStarted = () => {
    setShiftStarted(true);
  };

  const cards = [
    {
      title: 'PDV - Ponto de Venda',
      description: 'Realizar vendas rápidas',
      icon: ShoppingCart,
      path: '/pdv',
      color: 'from-primary to-primary-hover',
      show: true,
    },
    {
      title: 'Finalizar Turno',
      description: 'Fechar caixa e gerar relatório',
      icon: Clock,
      path: '/finalizar-turno',
      color: 'from-yellow-500 to-yellow-600',
      show: !isAdmin,
    },
    {
      title: 'Produtos',
      description: 'Gerenciar catálogo',
      icon: Package,
      path: '/produtos',
      color: 'from-accent to-accent-hover',
      show: true,
    },
    {
      title: 'Gerar Relatório',
      description: 'Relatório de estoque',
      icon: FileBarChart,
      path: '/relatorio-estoque',
      color: 'from-orange-500 to-orange-600',
      show: isAdmin,
    },
    {
      title: 'Recebimento',
      description: 'Registrar entrada de produtos',
      icon: Truck,
      path: '/recebimento',
      color: 'from-success to-green-600',
      show: true,
    },
    {
      title: 'Consultar Produtos',
      description: 'Ver estoque disponível',
      icon: Search,
      path: '/consulta-produtos',
      color: 'from-cyan-500 to-cyan-600',
      show: true,
    },
    {
      title: 'Inventário',
      description: 'Contagem e conferência física',
      icon: ClipboardCheck,
      path: '/inventario',
      color: 'from-violet-500 to-violet-600',
      show: true,
    },
    {
      title: 'Histórico de Vendas',
      description: 'Ver todas as vendas',
      icon: FileText,
      path: '/vendas',
      color: 'from-blue-500 to-blue-600',
      show: true,
    },
    {
      title: 'Movimentações',
      description: 'Histórico de estoque',
      icon: BarChart3,
      path: '/movimentacoes',
      color: 'from-purple-500 to-purple-600',
      show: true,
    },
    {
      title: 'Desperdício',
      description: 'Registrar perdas',
      icon: Trash2,
      path: '/desperdicio',
      color: 'from-destructive to-red-600',
      show: true,
    },
    {
      title: 'Produtos em Risco',
      description: 'Estoque crítico e sem vendas',
      icon: AlertTriangle,
      path: '/produtos-risco',
      color: 'from-red-500 to-red-600',
      show: isAdmin,
    },
    {
      title: 'Venda Total',
      description: 'Resumo por usuário',
      icon: DollarSign,
      path: '/venda-total',
      color: 'from-emerald-500 to-emerald-600',
      show: isAdmin,
    },
    {
      title: 'Vendas',
      description: 'Vendas por usuário e método',
      icon: Users,
      path: '/vendas-admin',
      color: 'from-teal-500 to-teal-600',
      show: isAdmin,
    },
    {
      title: 'Histórico',
      description: 'Meus turnos finalizados',
      icon: FileText,
      path: '/historico-turnos',
      color: 'from-blue-500 to-blue-600',
      show: !isAdmin,
    },
    {
      title: 'Usuários',
      description: 'Gerenciar equipe',
      icon: Users,
      path: '/usuarios',
      color: 'from-indigo-500 to-indigo-600',
      show: isAdmin,
    },
    {
      title: 'Configurações',
      description: 'Alterar senha e email',
      icon: Settings,
      path: '/perfil',
      color: 'from-gray-500 to-gray-600',
      show: isAdmin,
    },
  ];

  // Se não for admin, mostrar dialog de início de turno
  if (!isAdmin && !shiftStarted) {
    return <StartShiftDialog onShiftStarted={handleShiftStarted} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">POSTO RODOIL</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.cargo}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Selecione uma opção abaixo para começar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.filter(card => card.show).map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate(card.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground">{card.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
