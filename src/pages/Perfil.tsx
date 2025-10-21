import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !currentPassword) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha o email e a senha atual',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('users')
        .update({ email })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Email atualizado',
        description: 'Seu email foi atualizado com sucesso',
      });
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar email',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos de senha',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres',
      });
      return;
    }

    setLoading(true);
    try {
      // Importar bcrypt dinamicamente
      const bcrypt = await import('bcryptjs');
      
      // 1. Buscar o usuário atual no banco para verificar a senha atual
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id)
        .single();

      if (fetchError || !userData) {
        throw new Error('Erro ao buscar dados do usuário');
      }

      // 2. Verificar se a senha atual está correta
      if (!userData.password_hash) {
        throw new Error('Usuário sem senha cadastrada');
      }
      
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash);
      
      if (!isCurrentPasswordValid) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Senha atual incorreta',
        });
        setLoading(false);
        return;
      }

      // 3. Gerar hash da nova senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // 4. Atualizar a senha no banco de dados
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi atualizada com sucesso',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar senha',
        description: error.message || 'Erro ao atualizar senha',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Configurações do Perfil</h1>

        <div className="space-y-6">
          {/* Card de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Alterar Email
              </CardTitle>
              <CardDescription>
                Atualize seu endereço de email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Novo Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password-email">Senha Atual</Label>
                  <Input
                    id="current-password-email"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar Email'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card de Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Crie uma nova senha para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
