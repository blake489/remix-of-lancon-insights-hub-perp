import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PdfUploadFieldProps {
  label: string;
  required?: boolean;
  value: string | null; // storage path
  onChange: (path: string | null) => void;
  projectId?: string; // used as folder prefix
}

export function PdfUploadField({ label, required, value, onChange, projectId }: PdfUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileName = value ? value.split('/').pop() : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB');
      return;
    }

    setError(null);
    setUploading(true);

    const folder = projectId || 'new';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}_${safeName}`;

    // Remove old file if replacing
    if (value) {
      await supabase.storage.from('project-documents').remove([value]);
    }

    const { error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(path, file, { upsert: true });

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    onChange(path);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async () => {
    if (value) {
      await supabase.storage.from('project-documents').remove([value]);
    }
    onChange(null);
  };

  const handleView = () => {
    if (!value) return;
    const { data } = supabase.storage.from('project-documents').getPublicUrl(value);
    window.open(data.publicUrl, '_blank');
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleUpload}
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <button
            type="button"
            onClick={handleView}
            className="text-sm text-primary underline underline-offset-2 truncate hover:text-primary/80"
          >
            {fileName}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto shrink-0"
            onClick={handleRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start gap-2 text-muted-foreground", error && "border-destructive")}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="h-4 w-4" /> Choose PDF</>
          )}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
