import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Lock, Mail, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [employeeData, setEmployeeData] = useState({ cpf: '', password: '' });
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await login(employeeData.cpf, employeeData.password, false);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error,
      });
      setLoading(false);
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao POSTO RODOIL',
      });
      navigate('/dashboard');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await login(adminData.email, adminData.password, true);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error,
      });
      setLoading(false);
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao POSTO RODOIL',
      });
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">POSTO RODOIL</h1>
          <p className="text-muted-foreground">Sistema de Gerenciamento de Estoque</p>
        </div>

        <Tabs defaultValue="employee" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employee">Funcionário</TabsTrigger>
            <TabsTrigger value="admin">Administrador</TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="space-y-4">
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={employeeData.cpf}
                    onChange={(e) => setEmployeeData({ ...employeeData, cpf: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emp-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="emp-password"
                    type="password"
                    placeholder="••••••"
                    value={employeeData.password}
                    onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-hover"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={adminData.email}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adm-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="adm-password"
                    type="password"
                    placeholder="••••••"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary-hover"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
