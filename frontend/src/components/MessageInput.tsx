import { useState, KeyboardEvent } from 'react';
import styles from './MessageInput.module.css';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled: boolean;
    placeholder?: string;
}

const MessageInput = ({ onSend, disabled, placeholder = 'Type your message...' }: MessageInputProps) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.inputContainer}>
            <input
                type="text"
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled}
            />
            <button
                className={styles.sendButton}
                onClick={handleSend}
                disabled={disabled || !input.trim()}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2 10L18 2L10 18L8 11L2 10Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </div>
    );
};

export default MessageInput;
