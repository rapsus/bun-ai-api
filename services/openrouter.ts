import { OpenRouter } from "@openrouter/sdk";
import type { AIService, ChatMessage } from '../types';

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || ''
});

export const openrouterService: AIService = {
    name: 'OpenRouter',
    async chat(messages: ChatMessage[]) {
        const response = await openrouter.chat.send({
            chatGenerationParams: {
                model: 'qwen-3-235b-a22b-instruct-2507',
                messages: messages as any,
                stream: true,
                // CAMBIO CLAVE: de max_tokens a maxTokens
                maxTokens: 20000, 
                temperature: 0.7,
                // Si usaras top_p, aquí sería topP
            }
        });
        
        return (async function*() {
            // Usamos 'as any' para el iterador porque los tipos del SDK 
            // a veces tienen problemas para reconocer el generador asíncrono
            const stream = response as any;

            for await (const chunk of stream) {
                const content = chunk.choices?.[0]?.delta?.content || '';
                if (content) {
                    yield content;
                }
            }
        })();
    }
}