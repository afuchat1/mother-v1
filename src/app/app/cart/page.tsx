'use client';
import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppContext } from '@/lib/context.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        return <p>Loading cart...</p>;
    }

    const { cart, removeFromCart, clearCart } = context;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    if (cart.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-secondary p-4 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold font-headline mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Button asChild>
                    <Link href="/app/mall">Start Shopping</Link>
                </Button>
            </div>
        );
    }
    
    return (
        <main className="flex-1 bg-secondary">
            <div className="p-4">
                <h1 className="text-3xl font-bold font-headline mb-6">Your Cart</h1>
                <div className="flex flex-col gap-8">
                    <div>
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y">
                                    {cart.map(item => (
                                        <li key={item.product.id} className="flex items-center gap-4 p-4">
                                            <Image 
                                                src={item.product.imageUrl} 
                                                alt={item.product.name}
                                                width={80}
                                                height={80}
                                                className="rounded-md object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.product.name}</h3>
                                                <p className="text-sm text-muted-foreground">by {item.product.seller?.name || 'Unknown seller'}</p>
                                                <p className="font-bold text-primary mt-1">${item.product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <p className="font-semibold">x {item.quantity}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                         <Button variant="outline" onClick={clearCart} className="mt-4">
                            <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                        </Button>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full font-bold" onClick={() => router.push('/app/checkout')}>
                                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
