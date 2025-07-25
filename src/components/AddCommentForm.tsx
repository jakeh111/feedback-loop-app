"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';

interface AddCommentFormProps {
  onAddComment: (text: string) => void;
}

export function AddCommentForm({ onAddComment }: AddCommentFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddComment(text);
      setText('');
    }
  };

  return (
    <Card>
        <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Leave a comment at the current timestamp..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
              <Button type="submit" disabled={!text.trim()} className="w-full">
                Post Comment
              </Button>
            </form>
        </CardContent>
    </Card>
  );
}
