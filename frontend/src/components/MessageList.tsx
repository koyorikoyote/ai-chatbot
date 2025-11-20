import { useEffect, useRef } from 'react';
import { Message as MessageType } from '../types/chat';
import Message from './Message';
import styles from './MessageList.module.css';

interface MessageListProps {
    messages: MessageType[];
    isLoading?: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className={styles.messageList}>
            {messages.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Start a conversation by sending a message below.</p>
                </div>
            )}
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            {isLoading && (
                <div className={styles.typingIndicator}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
