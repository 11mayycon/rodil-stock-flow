import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Search, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Product {
  id: string;
  nome: string;
  codigo_barras: string;
}

interface WasteRecord {
  id: string;
  quantidade: number;
  motivo?: string;
  image_paths?: string[];
  confirmed: boolean;
  created_at: string;
  products?: { nome: string };
  users?: { name: string };
}

export default function Desperdicio() {
  const [showDialog, setShowDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantidade: '',
    motivo: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadWasteRecords();
  }, []);

  useEffect(() => {
    if (searchProduct.length >= 2) {
      searchProducts();
    } else {
      setProducts([]);
    }
  }, [searchProduct]);

  const loadWasteRecords = async () => {
    try {
      let query = supabase
        .from('waste_records')
        .select('*, products(nome), users!waste_records_user_id_fkey(name)')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setWasteRecords(data as any || []);
    } catch (error) {
      console.error('Error loading waste records:', error);
    }
  };

  const searchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`nome.ilike.%${searchProduct}%,codigo_barras.ilike.%${searchProduct}%`)
        .limit(10);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const selectProduct = (product: Product) => {
    setFormData({ ...formData, product_id: product.id });
    setSearchProduct(product.nome);
    setProducts([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.quantidade) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos obrigatórios' });
      return;
    }

    try {
      let imagePaths: string[] = [];

      // Upload de imagens
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('desperdicios')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          imagePaths.push(fileName);
        }
      }

      // Criar registro de desperdício
      const { error: wasteError } = await supabase
        .from('waste_records')
        .insert([{
          product_id: formData.product_id,
          user_id: user?.id,
          quantidade: parseInt(formData.quantidade),
          motivo: formData.motivo || null,
          image_paths: imagePaths.length > 0 ? imagePaths : null,
        }] as any);

      if (wasteError) throw wasteError;

      // Atualizar estoque
      const { data: product } = await supabase
        .from('products')
        .select('quantidade_estoque')
        .eq('id', formData.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ quantidade_estoque: product.quantidade_estoque - parseInt(formData.quantidade) })
          .eq('id', formData.product_id);

        // Criar movimentação
        await supabase
          .from('stock_movements')
          .insert([{
            product_id: formData.product_id,
            user_id: user?.id,
            tipo: 'desperdicio',
            quantidade: -parseInt(formData.quantidade),
            motivo: formData.motivo || null,
          }] as any);
      }

      toast({ title: 'Desperdício registrado com sucesso!' });
      setShowDialog(false);
      setFormData({ product_id: '', quantidade: '', motivo: '' });
      setImageFiles([]);
      setSearchProduct('');
      loadWasteRecords();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const confirmWaste = async (wasteId: string, imagePaths?: string[]) => {
    if (!confirm('Confirmar exclusão permanente deste desperdício e suas imagens?')) return;

    try {
      // Apagar imagens do storage
      if (imagePaths && imagePaths.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('desperdicios')
          .remove(imagePaths);

        if (deleteError) throw deleteError;
      }

      // Apagar registro
      const { error } = await supabase
        .from('waste_records')
        .delete()
        .eq('id', wasteId);

      if (error) throw error;

      toast({ title: 'Desperdício confirmado e apagado' });
      loadWasteRecords();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const viewImages = async (imagePaths: string[]) => {
    try {
      const urls = await Promise.all(
        imagePaths.map(async (path) => {
          const { data } = await supabase.storage
            .from('desperdicios')
            .createSignedUrl(path, 3600);
          return data?.signedUrl || '';
        })
      );
      setSelectedImages(urls.filter(url => url !== ''));
      setShowImageDialog(true);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  return (
    <Layout title="Desperdício" showBack>
      <div className="space-y-6">
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-destructive to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Desperdício
        </Button>

        {wasteRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <Trash2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum desperdício registrado</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {wasteRecords.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    {record.products && (
                      <p className="font-semibold">{record.products.nome}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {record.quantidade}
                    </p>
                    {record.motivo && (
                      <p className="text-sm">Motivo: {record.motivo}</p>
                    )}
                    {isAdmin && record.users && (
                      <p className="text-sm text-muted-foreground">
                        Por: {record.users.name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {record.image_paths && record.image_paths.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewImages(record.image_paths!)}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Ver Fotos ({record.image_paths.length})
                      </Button>
                    )}
                  </div>
                  {isAdmin && !record.confirmed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmWaste(record.id, record.image_paths || undefined)}
                      className="text-success hover:text-success"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Novo Desperdício */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Desperdício</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="pl-10"
                />
              </div>
              {products.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => selectProduct(product)}
                    >
                      <p className="font-medium">{product.nome}</p>
                      <p className="text-sm text-muted-foreground">{product.codigo_barras}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Descreva o motivo do desperdício..."
              />
            </div>
            <div className="space-y-2">
              <Label>Fotos (opcional)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              {imageFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {imageFiles.length} foto(s) selecionada(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Imagens */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fotos do Desperdício</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {selectedImages.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
