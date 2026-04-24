import { useState, useEffect } from 'react';
import { ChatWidgetProps, Message } from '../types/chat';
import ChatButton from './ChatButton.tsx';
import ChatDialog from './ChatDialog.tsx';
import { sendMessageStream, ApiError } from '../utils/api';
import { retrieveSession, storeSession } from '../utils/sessionStorage';

const ChatWidget = ({
    apiEndpoint,
    position = 'bottom-right',
    primaryColor = '#007bff',
    title = 'Chat Support'
}: ChatWidgetProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load session ID from localStorage on initialization
    useEffect(() => {
        const storedSessionId = retrieveSession();
        if (storedSessionId) {
            setSessionId(storedSessionId);
        }
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (content: string) => {
        setIsLoading(true);
        setError(null);

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        const assistantId = (Date.now() + 1).toString();
        setMessages((prev) => [
            ...prev,
            userMessage,
            {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            },
        ]);

        try {
            await sendMessageStream(
                apiEndpoint,
                { message: content, sessionId },
                {
                    onChunk: (text) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? { ...m, content: m.content + text }
                                    : m
                            )
                        );
                    },
                    onDone: (meta) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? { ...m, sources: meta.sources }
                                    : m
                            )
                        );
                        setSessionId(meta.sessionId);
                        storeSession(meta.sessionId);
                    },
                }
            );
        } catch (err) {
            setMessages((prev) =>
                prev.filter((m) => !(m.id === assistantId && m.content === ''))
            );
            console.error('Chat stream failed:', err);
            if (err instanceof ApiError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message || 'Something went wrong. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'fixed', [position.split('-')[1]]: '20px', bottom: '20px', zIndex: 9999 }}>
            {!isOpen && <ChatButton isOpen={isOpen} onClick={handleToggle} />}
            {isOpen && (
                <ChatDialog
                    messages={messages}
                    isLoading={isLoading}
                    onClose={handleClose}
                    onSendMessage={handleSendMessage}
                    title={title}
                    primaryColor={primaryColor}
                    error={error}
                />
            )}
        </div>
    );
};

export default ChatWidget;
