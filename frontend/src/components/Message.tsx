import { Message as MessageType } from '../types/chat';
import styles from './Message.module.css';

interface MessageProps {
    message: MessageType;
}

const Message = ({ message }: MessageProps) => {
    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSourceClick = (source: string) => {
        console.log('Source clicked:', source);
    };

    return (
        <div className={`${styles.message} ${styles[message.role]}`}>
            <div className={styles.bubble}>
                <div className={styles.content}>{message.content}</div>
                <div className={styles.timestamp}>{formatTime(message.timestamp)}</div>
                {message.sources && message.sources.length > 0 && (
                    <div className={styles.sources}>
                        <div className={styles.sourcesTitle}>Sources:</div>
                        {message.sources.map((source, index) => (
                            <div
                                key={index}
                                className={styles.source}
                                onClick={() => handleSourceClick(source.title)}
                            >
                                <span className={styles.sourceTitle}>{source.title}</span>
                                <span className={styles.sourceScore}>
                                    {(source.score * 100).toFixed(0)}% match
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;
