'use client';
import ProfilePageHeader from '@/components/profile-page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle } from 'lucide-react';

const faqs = [
    { 
        question: "How do I sell an item on AfuMall?",
        answer: "To sell an item, go to the 'Shop' tab and tap the 'New Product' button. Fill in the product details, add an image, and your item will be listed for sale."
    },
    {
        question: "How does the AfuAi assistant work?",
        answer: "The AI assistant can answer your questions, analyze images, and even listen to voice messages (with the Advanced model). You can talk to it in the 'AI' tab or mention @AfuAi in a group chat."
    },
    {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard encryption and work with trusted payment processors to ensure your financial data is always safe."
    },
    {
        question: "How can I track my order?",
        answer: "Currently, order tracking is handled directly between the buyer and seller. You can message the seller from the product page to get updates on your shipment."
    }
]

export default function HelpPage() {
    return (
        <main className="h-full flex flex-col bg-secondary">
            <ProfilePageHeader title="Help & Support" />
            <div className="flex-1 overflow-y-auto p-4">
                 <div className="flex flex-col gap-8 max-w-md mx-auto">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
                        <Accordion type="single" collapsible className="w-full bg-background rounded-lg px-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className={index === faqs.length - 1 ? 'border-b-0' : ''}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                     <div>
                        <h2 className="text-lg font-semibold mb-4">Contact Us</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <Button variant="outline" size="lg" className="justify-start h-auto py-3">
                                <MessageCircle className="mr-4 h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-semibold">Live Chat</p>
                                    <p className="text-xs text-muted-foreground">Get help in real-time</p>
                                </div>
                            </Button>
                             <Button variant="outline" size="lg" className="justify-start h-auto py-3">
                                <Mail className="mr-4 h-5 w-5" />
                                <div className="text-left">
                                    <p className="font-semibold">Email Support</p>
                                    <p className="text-xs text-muted-foreground">support@afuchat.com</p>
                                </div>
                            </Button>
                        </div>
                    </div>
                 </div>
            </div>
        </main>
    );
}
