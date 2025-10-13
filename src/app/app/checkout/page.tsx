'use client';

import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) {
        return <p>Loading...</p>
    }

    const { cart, clearCart } = context;

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handlePlaceOrder = () => {
        // In a real app, this would process payment.
        alert('Order placed successfully! (This is a demo)');
        clearCart();
        router.push('/app/mall');
    }

    return (
        <main className="flex-1 bg-secondary">
             <header className="flex items-center gap-2 bg-background p-2 sticky top-0 z-10 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="">
                    <ArrowLeft />
                </Button>
                <h1 className="text-xl font-bold font-headline">Checkout</h1>
             </header>
             <div className="p-4">
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping & Payment</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid gap-4">
                                    <h3 className="font-semibold">Shipping Address</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className='relative'>
                                            <Input id="first-name" placeholder="John" />
                                            <Label htmlFor="first-name">First Name</Label>
                                        </div>
                                         <div className='relative'>
                                            <Input id="last-name" placeholder="Doe" />
                                            <Label htmlFor="last-name">Last Name</Label>
                                        </div>
                                    </div>
                                    <div className='relative'>
                                        <Input id="address" placeholder="123 Main St" />
                                        <Label htmlFor="address">Address</Label>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                         <div className='relative'>
                                            <Input id="city" placeholder="Anytown" />
                                            <Label htmlFor="city">City</Label>
                                        </div>
                                         <div className='relative'>
                                            <Input id="state" placeholder="CA" />
                                            <Label htmlFor="state">State</Label>
                                        </div>
                                         <div className='relative'>
                                            <Input id="zip" placeholder="12345" />
                                            <Label htmlFor="zip">Zip Code</Label>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-4">
                                     <h3 className="font-semibold">Payment Information</h3>
                                     <div className='relative'>
                                        <Input id="card-number" placeholder="**** **** **** 1234" />
                                        <Label htmlFor="card-number">Card Number</Label>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                         <div className='relative'>
                                            <Input id="expiry" placeholder="MM/YY" />
                                            <Label htmlFor="expiry">Expiry Date</Label>
                                        </div>
                                         <div className='relative'>
                                            <Input id="cvc" placeholder="123" />
                                            <Label htmlFor="cvc">CVC</Label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                         <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {cart.map(item => (
                                        <li key={item.product.id} className="flex justify-between">
                                            <span>{item.product.name} x{item.quantity}</span>
                                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Separator />
                                <div className="space-y-2">
                                     <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Taxes</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Button className="w-full font-bold" onClick={handlePlaceOrder}>
                                    <CreditCard className="mr-2 h-5 w-5" /> Place Order
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}
