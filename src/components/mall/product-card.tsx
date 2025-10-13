import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product } from '@/lib/types';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={200}
          className="h-48 w-full object-cover"
          data-ai-hint="product image"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 text-lg font-headline">{product.name}</CardTitle>
        <p className="text-2xl font-semibold text-primary">${product.price.toFixed(2)}</p>
        <p className="mt-2 text-sm text-muted-foreground h-10 overflow-hidden">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
                <AvatarImage src={product.seller.avatarUrl} alt={product.seller.name} />
                <AvatarFallback>{product.seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{product.seller.name}</span>
        </div>
        <Button variant="outline" size="sm">View</Button>
      </CardFooter>
    </Card>
  );
}
