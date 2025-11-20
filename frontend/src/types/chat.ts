export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  id: string;
  title: string;
  content: string;
  category: string;
  score: number;
  metadata: {
    source: string;
    lastUpdated: string;
  };
}

export interface ChatWidgetProps {
  apiEndpoint: string;
  position?: "bottom-right" | "bottom-left";
  primaryColor?: string;
  title?: string;
}

export interface ChatResponse {
  response: string;
  sources: DocumentSource[];
  sessionId: string;
  isNewQuestion: boolean;
}
