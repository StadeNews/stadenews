import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminCrown, UserBadge } from "./UserBadge";

export interface ChatMessageData {
  id: string;
  nickname: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
  isAdmin?: boolean;
  badgeLevel?: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onReport?: (id: string) => void;
}

export const ChatMessage = ({ message, onReport }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-2 md:gap-3 group",
      message.isOwn && "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold",
          message.isAdmin 
            ? "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900" 
            : "bg-gradient-to-br from-primary/50 to-accent/50"
        )}>
          {message.nickname.charAt(0).toUpperCase()}
        </div>
        {message.isAdmin && (
          <div className="absolute -top-1 -right-1">
            <AdminCrown size="sm" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 max-w-[240px] md:max-w-[320px] lg:max-w-[400px]",
        message.isOwn && "flex flex-col items-end"
      )}>
        <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
          <span className={cn(
            "text-xs md:text-sm font-medium flex items-center gap-1",
            message.isAdmin ? "text-amber-500" : "text-primary"
          )}>
            {message.isAdmin && <AdminCrown size="sm" />}
            {message.nickname}
          </span>
          {message.badgeLevel && message.badgeLevel > 0 && (
            <UserBadge type="commenter" level={message.badgeLevel} size="sm" />
          )}
          <span className="text-[10px] md:text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        
        <div className={cn(
          "relative px-3 py-2 md:px-4 md:py-2.5 rounded-2xl text-sm",
          message.isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : message.isAdmin
            ? "bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-foreground rounded-tl-sm border border-amber-500/30"
            : "bg-secondary text-foreground rounded-tl-sm"
        )}>
          <p className="break-words">{message.message}</p>
          
          {/* Report button */}
          {!message.isOwn && onReport && (
            <button
              onClick={() => onReport(message.id)}
              className="absolute -right-2 -top-2 p-1 md:p-1.5 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
            >
              <Flag className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
