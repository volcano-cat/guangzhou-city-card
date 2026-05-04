// @ts-nocheck
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChat, type UIMessage } from '@ai-sdk/react';
import api from '@/lib/axios';
import { useAuthStore, useIsLoggedIn } from '@/store/auth';

interface ChatPart {
  type: 'text';
  text: string;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, setMessages, sendMessage, isWaiting } = useChat({
    body: {
      sessionId: currentSessionId
    },
    onFinish: (message) => {
      setInput('');
    }
  });

  const loadSessions = async () => {
    try {
      const response = await api.get('/api/chat-sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('加载会话失败:', error);
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      const response = await api.get(`/api/chat-sessions/${sessionId}`);
      const session = response.data;
      setCurrentSessionId(sessionId);

      const formattedMessages = session.messages.map((msg: ChatMessage) => ({
        id: `msg-${msg.id}`,
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        parts: [{ type: 'text' as const, text: msg.content }],
        createdAt: new Date(msg.createdAt)
      }));

      setMessages(formattedMessages);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('加载会话消息失败:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await api.post('/api/chat-sessions', { title: '新对话' });
      setCurrentSessionId(response.data.id);
      setMessages([]);
      loadSessions();
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/chat-sessions/${sessionId}`);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      loadSessions();
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>('');

  useEffect(() => {
    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (currentSession) {
      setCurrentSessionTitle(currentSession.title);
    }
  }, [currentSessionId, sessions]);

  const handleSend = async () => {
    if (!input.trim() || isWaiting) return;

    const needsTitleUpdate = !currentSessionId || currentSessionTitle === '新对话';
    let sessionIdToUse = currentSessionId;

    if (!currentSessionId) {
      try {
        const response = await api.post('/api/chat-sessions', {
          title: input.substring(0, 30)
        });
        sessionIdToUse = response.data.id;
        setCurrentSessionId(sessionIdToUse);
        loadSessions();
      } catch (error) {
        console.error('创建会话失败:', error);
        return;
      }
    }

    sendMessage({ text: input }, { body: { sessionId: sessionIdToUse } });
    setInput('');

    if (needsTitleUpdate && sessionIdToUse) {
      try {
        await api.put(`/api/chat-sessions/${sessionIdToUse}`, {
          title: input.substring(0, 30)
        });
        loadSessions();
      } catch (error) {
        console.error('更新会话标题失败:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !isWaiting && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSessions();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录</h2>
          <p className="text-gray-600 mb-6">登录后即可使用 AI 聊天功能</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={createNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新对话
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  currentSessionId === session.id
                    ? 'bg-red-50 border border-red-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span className={`text-sm truncate ${
                    currentSessionId === session.id ? 'text-red-700 font-medium' : 'text-gray-700'
                  }`}>
                    {session.title}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
              智能助手
            </span>
            <h1 className="text-xl font-bold text-gray-900">AI 聊天</h1>
          </div>
        </div>

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        {message.parts.map((part, index) => {
                          if (part.type === 'text') {
                            return (
                              <div key={message.id + index} className="whitespace-pre-wrap break-words">
                                {part.text}
                              </div>
                            );
                          }
                          return null;
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

        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-3xl mx-auto">
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
                onClick={handleSend}
                disabled={!input.trim() || isWaiting}
              className="h-[60px] px-6 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWaiting ? (
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
    </div>
  );
}
