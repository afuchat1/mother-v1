'use client';
import { useState, useTransition, useContext } from 'react';
import Image from 'next/image';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { generateImage } from '@/ai/flows/image-generation-flow';
import { useToast } from '@/hooks/use-toast';
import { AppContext } from '@/lib/context.tsx';
import { useRouter } from 'next/navigation';

function ImagineTab() {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, startGeneration] = useTransition();
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!prompt) return;
        startGeneration(async () => {
            try {
                const result = await generateImage({ prompt });
                if (result.imageUrl) {
                    setGeneratedImage(result.imageUrl);
                }
            } catch (error: any) {
                let title = 'Image Generation Failed';
                let description = error.message || 'Could not generate image.';

                if (error.message && error.message.includes('billed users')) {
                    title = 'Billing Required';
                    description = 'The Imagen API is only accessible to billed users at this time.';
                } else if (error.message && error.message.includes('429')) {
                    title = 'API Quota Exceeded';
                    description = 'You have exceeded your free tier limit for the AI model.';
                }
                
                 toast({
                    variant: 'destructive',
                    title: title,
                    description: description,
                });
            }
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full">
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-secondary/50 p-4">
                {isGenerating ? (
                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p>Generating your masterpiece...</p>
                    </div>
                ) : generatedImage ? (
                    <Image src={generatedImage} alt={prompt} width={512} height={512} className="object-contain max-w-full max-h-full rounded-lg" />
                ) : (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground mb-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                        <p className="text-muted-foreground">Your generated image will appear here.</p>
                    </div>
                )}
            </div>
             <div className="flex gap-2">
                <Input 
                    placeholder="A cat astronaut on Mars..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="h-12"
                />
                <Button onClick={handleGenerate} disabled={isGenerating || !prompt} className="h-12">
                    {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
            </div>
        </div>
    );
}


export default function AiChatPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        return <p>Loading AI Chat...</p>;
    }
    
    return (
        <main className="flex h-full flex-col overflow-hidden bg-background">
            <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-bold font-headline">AfuAi Assistant</h1>
                    <p className="text-xs text-muted-foreground">Ask anything, or get creative!</p>
                </div>
                <div className="w-10"></div>
            </header>
            
            <AiChatHandler />
        </main>
    );
}
