'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/types';

type AddProductDialogProps = {
  children: React.ReactNode;
  onAddProduct: (product: Omit<Product, 'id' | 'seller' | 'imageUrl'>) => void;
};

export default function AddProductDialog({ children, onAddProduct }: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (name && description && price) {
      onAddProduct({
        name,
        description,
        price: parseFloat(price),
      });
      // Reset fields and close dialog
      setName('');
      setDescription('');
      setPrice('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className='font-headline'>List a New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add your product to AfuMall.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 pt-4">
          <div className="relative">
            <Input id="name" placeholder="e.g. Handmade Leather Bag" value={name} onChange={(e) => setName(e.target.value)} />
            <Label htmlFor="name">
              Name
            </Label>
          </div>
          <div className="relative">
            <Textarea id="description" placeholder="Describe your product" className='peer' value={description} onChange={(e) => setDescription(e.target.value)} />
             <Label htmlFor="description" className='-translate-y-3 top-3 peer-placeholder-shown:top-1/2'>
              Description
            </Label>
          </div>
          <div className="relative">
            <Input id="price" type="number" placeholder="e.g. 49.99" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Label htmlFor="price">
              Price ($)
            </Label>
          </div>
           <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture" className='relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto'>
              Image
            </Label>
            <Input id="picture" type="file" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
