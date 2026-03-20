'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, sendMessage } = useChat({
        onFinish: () => {
            setInput('');
        }
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
                sendMessage({ text: input });
                setInput(''); // 发送后立即清空输入框
                setIsGenerating(true);
            }
        }
    };

    // 优化滚动逻辑，只在消息完成时滚动
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.done) {
            return; // 如果是正在生成的消息，不滚动
        }
        setIsGenerating(false);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm mb-2">
                                智能助手
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900">AI 聊天</h1>
                        </div>
                        <div className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">随时为您解答问题</p>
                </div>

                <div className="h-[600px] overflow-y-auto p-6">
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <div className="bg-red-50 rounded-full p-6 mb-4">
                                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">开始对话</h2>
                                <p className="text-gray-500">输入您的问题，我会尽力帮助您</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                >
                                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                                            message.role === 'user' 
                                                ? 'bg-red-500' 
                                                : 'bg-gray-600'
                                        }`}>
                                            {message.role === 'user' ? '你' : 'AI'}
                                        </div>
                                        
                                        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`rounded-lg px-4 py-3 shadow-sm ${
                                                message.role === 'user'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                                            }`}>
                                                {message.parts.map((part, index) => {
                                                    switch (part.type) {
                                                        case 'text':
                                                            return (
                                                                <div key={message.id + index} className='whitespace-pre-wrap break-words'>
                                                                    {part.text}
                                                                </div>
                                                            );
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="请输入你的问题... (按 Enter 发送，Shift + Enter 换行)"
                                className="w-full min-h-[60px] max-h-[200px] resize-none rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all shadow-sm p-3"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (input.trim()) {
                                    sendMessage({ text: input });
                                    setInput(''); // 发送后立即清空输入框
                                    setIsGenerating(true);
                                }
                            }}
                            disabled={!input.trim() || isGenerating}
                            className="h-[60px] px-6 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
