import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessageData {
  id: string;
  nickname: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onReport?: (id: string) => void;
}

export const ChatMessage = ({ message, onReport }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 group",
      message.isOwn && "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center flex-shrink-0 text-xs font-bold">
        {message.nickname.charAt(0).toUpperCase()}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 max-w-[280px]",
        message.isOwn && "flex flex-col items-end"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-primary">
            {message.nickname}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        
        <div className={cn(
          "relative px-4 py-2.5 rounded-2xl text-sm",
          message.isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-secondary text-foreground rounded-tl-sm"
        )}>
          <p>{message.message}</p>
          
          {/* Report button */}
          {!message.isOwn && onReport && (
            <button
              onClick={() => onReport(message.id)}
              className="absolute -right-2 -top-2 p-1.5 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
            >
              <Flag className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
