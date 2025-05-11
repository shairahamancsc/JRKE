
"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';

interface MarkdownDisplayProps {
  markdownContent: string;
}

export function MarkdownDisplay({ markdownContent }: MarkdownDisplayProps) {
  return (
    <Card className="mt-6 shadow-lg">
      <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-6 text-foreground bg-card rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
