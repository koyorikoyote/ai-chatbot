import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './components/ChatWidget';
import { ChatWidgetProps } from './types/chat';
import './index.css';

interface WidgetConfig extends ChatWidgetProps {
    containerId?: string;
}

class ChatWidgetInitializer {
    private root: ReactDOM.Root | null = null;
    private container: HTMLElement | null = null;
    private shadowRoot: ShadowRoot | null = null;

    init(config: WidgetConfig): void {
        if (this.root) {
            console.warn('ChatWidget is already initialized');
            return;
        }

        const {
            apiEndpoint,
            position = 'bottom-right',
            primaryColor = '#007bff',
            title = 'Chat Support',
            containerId = 'chat-widget-container',
        } = config;

        // Create container element
        this.container = document.createElement('div');
        this.container.id = containerId;
        document.body.appendChild(this.container);

        // Use Shadow DOM to isolate styles
        this.shadowRoot = this.container.attachShadow({ mode: 'open' });

        // Create a root element inside shadow DOM
        const shadowContainer = document.createElement('div');
        shadowContainer.id = 'shadow-root';
        this.shadowRoot.appendChild(shadowContainer);

        // Inject styles into shadow DOM
        const styleElement = document.createElement('style');
        styleElement.textContent = this.getIsolatedStyles();
        this.shadowRoot.appendChild(styleElement);

        // Mount React component
        this.root = ReactDOM.createRoot(shadowContainer);
        this.root.render(
            <React.StrictMode>
                <ChatWidget
                    apiEndpoint={apiEndpoint}
                    position={position}
                    primaryColor={primaryColor}
                    title={title}
                />
            </React.StrictMode>
        );
    }

    destroy(): void {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }

        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }

        this.shadowRoot = null;
    }

    private getIsolatedStyles(): string {
        return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      #shadow-root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    }
}

// Create global instance
const chatWidgetInstance = new ChatWidgetInitializer();

// Expose to window object
declare global {
    interface Window {
        ChatWidget: {
            init: (config: WidgetConfig) => void;
            destroy: () => void;
        };
    }
}

window.ChatWidget = {
    init: (config: WidgetConfig) => chatWidgetInstance.init(config),
    destroy: () => chatWidgetInstance.destroy(),
};

export default chatWidgetInstance;
