import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product } from '@/lib/types';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';

type ProductCardProps = {
  product: Product;
};

const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const firestore = getFirestore();
  
  const sellerRef = useMemoFirebase(() => {
      if (!product.sellerId) return null;
      return doc(firestore, 'users', product.sellerId);
  }, [firestore, product.sellerId]);
  
  const { data: seller } = useDoc(sellerRef);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg bg-background w-full">
      <CardHeader className="p-0">
        <Link href={`/app/mall/${product.id}`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={200}
              className="h-48 w-full object-cover"
              data-ai-hint="product image"
            />
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 text-lg font-headline">{product.name}</CardTitle>
        <p className="text-2xl font-semibold text-primary">${product.price.toFixed(2)}</p>
        <p className="mt-2 text-sm text-muted-foreground h-10 overflow-hidden">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
                <AvatarImage src={seller?.avatarUrl} alt={seller?.name} />
                <AvatarFallback>{seller?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{seller?.name}</span>
        </div>
        <Link href={`/app/mall/${product.id}`} passHref>
          <Button variant="outline" size="sm">View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
});

export default ProductCard;
