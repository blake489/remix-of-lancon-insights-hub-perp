import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages, Message } from '@/hooks/useMessages';
import { MessageList } from '@/components/inbox/MessageList';
import { MessageDetail } from '@/components/inbox/MessageDetail';
import { ComposeDialog } from '@/components/inbox/ComposeDialog';
import { toast } from 'sonner';
import { Inbox as InboxIcon, Send, PenSquare, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Inbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ recipientId: string; recipientName: string; subject: string } | undefined>();

  const { inbox, sent, unreadCount, isLoading, deleteMessage } = useMessages();

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleReply = () => {
    if (selectedMessage && selectedMessage.sender_profile) {
      setReplyTo({
        recipientId: selectedMessage.sender_id,
        recipientName: selectedMessage.sender_profile.display_name || 'Unknown',
        subject: selectedMessage.subject,
      });
      setComposeOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    try {
      await deleteMessage.mutateAsync(selectedMessage.id);
      toast.success('Message deleted');
      setSelectedMessage(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleNewMessage = () => {
    setReplyTo(undefined);
    setComposeOpen(true);
  };

  const currentMessages = activeTab === 'inbox' ? inbox : sent;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Inbox
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <Button onClick={handleNewMessage}>
            <PenSquare className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>

        <Card className="h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Sidebar */}
            <div
              className={cn(
                'w-full md:w-80 lg:w-96 border-r border-border flex flex-col',
                selectedMessage && 'hidden md:flex'
              )}
            >
              <CardHeader className="pb-2">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'inbox' | 'sent'); setSelectedMessage(null); }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inbox" className="gap-2">
                      <InboxIcon className="h-4 w-4" />
                      Inbox
                      {unreadCount > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                          {unreadCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="gap-2">
                      <Send className="h-4 w-4" />
                      Sent
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <MessageList
                      messages={currentMessages}
                      selectedId={selectedMessage?.id || null}
                      onSelect={handleSelectMessage}
                      type={activeTab}
                    />
                  )}
                </ScrollArea>
              </CardContent>
            </div>

            {/* Message Detail */}
            <div
              className={cn(
                'flex-1 flex flex-col',
                !selectedMessage && 'hidden md:flex'
              )}
            >
              {selectedMessage ? (
                <MessageDetail
                  message={selectedMessage}
                  type={activeTab}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onBack={() => setSelectedMessage(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Select a message to read</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        replyTo={replyTo}
      />
    </DashboardLayout>
  );
}
