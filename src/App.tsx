import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Recebimento from "./pages/Recebimento";
import HistoricoVendas from "./pages/HistoricoVendas";
import Movimentacoes from "./pages/Movimentacoes";
import Desperdicio from "./pages/Desperdicio";
import VendaTotal from "./pages/VendaTotal";
import Usuarios from "./pages/Usuarios";
import ImportarProdutos from "./pages/ImportarProdutos";
import ConsultaProdutos from "./pages/ConsultaProdutos";
import ProdutosRisco from "./pages/ProdutosRisco";
import FinalizarTurno from "./pages/FinalizarTurno";
import Perfil from "./pages/Perfil";
import RelatorioEstoque from "./pages/RelatorioEstoque";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RedirectIfAuthenticated />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdv"
              element={
                <ProtectedRoute>
                  <PDV />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <ProtectedRoute>
                  <Produtos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recebimento"
              element={
                <ProtectedRoute>
                  <Recebimento />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas"
              element={
                <ProtectedRoute>
                  <HistoricoVendas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movimentacoes"
              element={
                <ProtectedRoute>
                  <Movimentacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/desperdicio"
              element={
                <ProtectedRoute>
                  <Desperdicio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venda-total"
              element={
                <ProtectedRoute adminOnly>
                  <VendaTotal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute adminOnly>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/importar"
              element={
                <ProtectedRoute adminOnly>
                  <ImportarProdutos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consulta-produtos"
              element={
                <ProtectedRoute>
                  <ConsultaProdutos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos-risco"
              element={
                <ProtectedRoute adminOnly>
                  <ProdutosRisco />
                </ProtectedRoute>
              }
            />
          <Route
              path="/finalizar-turno"
              element={
                <ProtectedRoute>
                  <FinalizarTurno />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute adminOnly>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorio-estoque"
              element={
                <ProtectedRoute adminOnly>
                  <RelatorioEstoque />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
