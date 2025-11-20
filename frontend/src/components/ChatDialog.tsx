import { Message } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './ChatDialog.module.css';

interface ChatDialogProps {
    messages: Message[];
    isLoading: boolean;
    onClose: () => void;
    onSendMessage: (message: string) => void;
    title?: string;
    primaryColor?: string;
    error?: string | null;
}

const ChatDialog = ({
    messages,
    isLoading,
    onClose,
    onSendMessage,
    title = 'Chat Support',
    primaryColor = '#007bff',
    error,
}: ChatDialogProps) => {
    return (
        <div className={styles.dialog}>
            <div className={styles.header} style={{ backgroundColor: primaryColor }}>
                <h3 className={styles.title}>{title}</h3>
                <button className={styles.closeButton} onClick={onClose} aria-label="Close chat">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M15 5L5 15M5 5L15 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>
            <div className={styles.content}>
                <MessageList messages={messages} isLoading={isLoading} />
                {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className={styles.footer}>
                <MessageInput onSend={onSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default ChatDialog;
