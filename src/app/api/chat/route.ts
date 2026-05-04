import { NextRequest } from "next/server";
import { streamText } from 'ai'
import { createDeepSeek } from "@ai-sdk/deepseek";
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import APIKEY from "./key";

const deepSeek = createDeepSeek({
    apiKey: APIKEY,
});

function extractTextContent(message: any): string {
    if (typeof message.content === 'string') {
        return message.content;
    }
    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text)
            .join('');
    }
    return '';
}

export async function POST(req: NextRequest) {
    try {
        const user = await authenticate(req);
        if (!user) {
            return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
        }

        const { messages, sessionId } = await req.json();

        let currentSessionId = sessionId;
        let isNewSession = false;

        if (!currentSessionId) {
            const firstUserMessage = messages.find((m: { role: string }) => m.role === 'user');
            const title = extractTextContent(firstUserMessage).substring(0, 30) || '新对话';

            const newSession = await prisma.chatSession.create({
                data: {
                    userId: user.userId,
                    title: title
                }
            });
            currentSessionId = newSession.id;
            isNewSession = true;
        }

        const userMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
        if (userMessage) {
            const content = extractTextContent(userMessage);
            if (content) {
                await prisma.chatMessage.create({
                    data: {
                        sessionId: currentSessionId,
                        role: 'user',
                        content: content
                    }
                });
            }
        }

        const result = streamText({
            model: deepSeek('deepseek-chat'),
            messages: messages.map((m: { role: string }) => ({
                role: m.role,
                content: extractTextContent(m)
            })),
            system: '你是这个广州线上城市名片系统的ai机器人客服，请根据用户的问题给出回答',
            onFinish: async (completion) => {
                await prisma.chatMessage.create({
                    data: {
                        sessionId: currentSessionId!,
                        role: 'assistant',
                        content: completion.text
                    }
                });
                await prisma.chatSession.update({
                    where: { id: currentSessionId! },
                    data: { updatedAt: new Date() }
                });
            }
        });

        const response = result.toUIMessageStreamResponse();

        if (isNewSession) {
            response.headers.set('X-Session-Id', currentSessionId.toString());
        }

        return response;
    } catch (error) {
        console.error('聊天请求失败:', error);
        return new Response(JSON.stringify({ error: '聊天请求失败', details: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
    }
}
