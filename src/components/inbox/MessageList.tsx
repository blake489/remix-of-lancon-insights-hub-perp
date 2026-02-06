import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Message } from '@/hooks/useMessages';
import { Mail, MailOpen } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  selectedId: string | null;
  onSelect: (message: Message) => void;
  type: 'inbox' | 'sent';
}

export function MessageList({ messages, selectedId, onSelect, type }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">
          {type === 'inbox' ? 'No messages in your inbox' : 'No sent messages'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {messages.map((message) => {
        const profile = type === 'inbox' ? message.sender_profile : message.recipient_profile;
        const displayName = profile?.display_name || 'Unknown User';
        const initials = displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <button
            key={message.id}
            onClick={() => onSelect(message)}
            className={cn(
              'w-full text-left p-4 hover:bg-muted/50 transition-colors',
              selectedId === message.id && 'bg-muted',
              !message.is_read && type === 'inbox' && 'bg-primary/5'
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm truncate',
                      !message.is_read && type === 'inbox' ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {type === 'inbox' ? displayName : `To: ${displayName}`}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(message.created_at), 'MMM d')}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  {!message.is_read && type === 'inbox' && (
                    <Badge variant="default" className="h-5 text-[10px] px-1.5">
                      New
                    </Badge>
                  )}
                  <span
                    className={cn(
                      'text-sm truncate',
                      !message.is_read && type === 'inbox'
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {message.subject}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {message.content}
                </p>
              </div>

              <div className="shrink-0 mt-1">
                {message.is_read || type === 'sent' ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground/50" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
