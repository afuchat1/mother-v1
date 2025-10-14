'use client';
import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AppContext } from '@/lib/context.tsx';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const context = useContext(AppContext);
  const { productId } = params;
  const firestore = useFirestore();

  const productRef = doc(firestore, 'afuMallListings', productId as string);
  const { data: product, isLoading } = useDoc<Product>(productRef);

  if (!context) {
    return <p>Loading...</p>
  }
  const { addToCart } = context;

  if (isLoading) {
    return <div className="flex flex-col h-full items-center justify-center bg-secondary"><p>Loading product...</p></div>
  }

  if (!product) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-secondary">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const { name, description, price, imageUrl, seller } = product;

  return (
    <div className="flex flex-col h-full bg-secondary">
       <header className="flex items-center gap-2 bg-background p-2 sticky top-0 z-10 border-b shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="">
                <ArrowLeft />
            </Button>
            <h2 className="font-semibold font-headline text-lg">Product Details</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-8">
            <div className="p-0">
              <Image
                src={imageUrl}
                alt={name}
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-t-lg"
                data-ai-hint="product image"
              />
            </div>
            <div className="p-4 flex flex-col">
              <h1 className="text-3xl font-bold font-headline mb-2">{name}</h1>
              {seller && (
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                  <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-muted-foreground">{seller.name}</span>
              </div>
              )}
              <p className="text-4xl font-bold text-primary mb-6">${price.toFixed(2)}</p>
              
              <CardContent className="p-6 bg-secondary/50 rounded-lg flex-grow mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
              </CardContent>

              <div className="flex flex-col gap-4">
                <Button size="lg" className="font-bold" onClick={() => addToCart(product)}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline">
                   <MessageSquare className="mr-2 h-5 w-5" />
                  Message Seller
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
