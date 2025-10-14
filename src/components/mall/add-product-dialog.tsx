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
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type AddProductDialogProps = {
  children: React.ReactNode;
};

export default function AddProductDialog({ children }: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!firestore) return;
    if (name && description && price && user) {
      const productsCollectionRef = collection(firestore, 'afuMallListings');
      
      const newProductPayload = {
        name,
        description,
        price: parseFloat(price),
        sellerId: user.uid,
        imageUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/600/400`, // Placeholder
        // @ts-ignore
        createdAt: serverTimestamp(),
      };

      addDocumentNonBlocking(productsCollectionRef, newProductPayload);
      
      toast({
        title: 'Product Listed!',
        description: `${name} is now available in the AfuMall.`,
      });

      // Reset fields and close dialog
      setName('');
      setDescription('');
      setPrice('');
      setIsOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Missing information',
            description: 'Please fill out all fields.',
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full">
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
            <Textarea id="description" placeholder="Describe your product" className='peer pt-2' value={description} onChange={(e) => setDescription(e.target.value)} />
             <Label htmlFor="description" className='top-2 peer-focus:top-2 peer-placeholder-shown:top-1/2'>
              Description
            </Label>
          </div>
          <div className="relative">
            <Input id="price" type="number" placeholder="e.g. 49.99" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Label htmlFor="price">
              Price ($)
            </Label>
          </div>
           <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture" className='relative !-translate-y-0 !scale-100 !top-0 !p-0'>
              Image
            </Label>
            <Input id="picture" type="file" className="h-auto p-0 border-none file:h-10 file:px-3 file:py-2 file:rounded-md file:border file:border-input"/>
          </div>
        </div>
        <DialogFooter className="flex-row">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="w-full">Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
