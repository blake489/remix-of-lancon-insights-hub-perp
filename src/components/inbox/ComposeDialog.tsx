import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMessages, useUsers } from '@/hooks/useMessages';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    recipientId: string;
    recipientName: string;
    subject: string;
  };
}

export function ComposeDialog({ open, onOpenChange, replyTo }: ComposeDialogProps) {
  const [recipientId, setRecipientId] = useState(replyTo?.recipientId || '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [content, setContent] = useState('');

  const { sendMessage } = useMessages();
  const { data: users, isLoading: usersLoading } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId || !subject.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await sendMessage.mutateAsync({
        recipientId,
        subject: subject.trim(),
        content: content.trim(),
      });

      toast.success('Message sent successfully');
      setRecipientId('');
      setSubject('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select recipient..." />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                ) : users?.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No users available</div>
                ) : (
                  users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.display_name || 'Unknown User'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendMessage.isPending}>
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
