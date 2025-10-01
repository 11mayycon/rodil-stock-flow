import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users as UsersIcon, Plus, Edit, Trash2, Ban, Check, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: 'admin' | 'employee';
  cargo: string;
  blocked: boolean;
}

interface Sale {
  id: string;
  total: number;
  created_at: string;
  forma_pagamento: string;
}

export default function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showSalesDialog, setShowSalesDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserSales, setSelectedUserSales] = useState<Sale[]>([]);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'employee' as 'admin' | 'employee',
    cargo: '',
    password: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      cpf: '',
      role: 'employee',
      cargo: '',
      password: '',
    });
    setShowDialog(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      cargo: user.cargo,
      password: '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        cpf: formData.cpf,
        role: formData.role,
        cargo: formData.cargo,
        password_hash: '$2b$10$demo', // Em produção, usar bcrypt real
      };

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);
        
        if (error) throw error;
        toast({ title: 'Usuário atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('users')
          .insert([userData as any]);
        
        if (error) throw error;
        toast({ title: 'Usuário cadastrado com sucesso!' });
      }

      setShowDialog(false);
      loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const toggleBlockUser = async (userId: string, currentBlocked: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ blocked: !currentBlocked })
        .eq('id', userId);
      
      if (error) throw error;
      toast({
        title: currentBlocked ? 'Usuário desbloqueado!' : 'Usuário bloqueado!',
      });
      loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      // Verificar se o usuário tem vendas associadas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (salesError) throw salesError;

      if (sales && sales.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Não é possível excluir',
          description: 'Este usuário possui vendas registradas no sistema.',
        });
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      toast({ title: 'Usuário excluído com sucesso!' });
      loadUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const viewUserSales = async (user: User) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayISO)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSelectedUserSales(data || []);
      setSelectedUserName(user.name);
      setShowSalesDialog(true);
    } catch (error) {
      console.error('Error loading user sales:', error);
    }
  };

  return (
    <Layout title="Usuários" showBack>
      <div className="space-y-6">
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-primary to-primary-hover"
        >
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar Usuário
        </Button>

        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <UsersIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        {user.blocked && (
                          <Badge variant="destructive">Bloqueado</Badge>
                        )}
                        {user.role === 'admin' && (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.cargo}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">CPF: {user.cpf}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewUserSales(user)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Vendas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBlockUser(user.id, user.blocked)}
                    >
                      {user.blocked ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Desbloquear
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-1" />
                          Bloquear
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Cadastrar Usuário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee') => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Senha Inicial</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Deixe em branco para senha padrão"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Vendas do Usuário */}
      <Dialog open={showSalesDialog} onOpenChange={setShowSalesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vendas de {selectedUserName} Hoje</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedUserSales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada hoje
              </p>
            ) : (
              selectedUserSales.map((sale) => (
                <Card key={sale.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.forma_pagamento}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      R$ {sale.total.toFixed(2)}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
