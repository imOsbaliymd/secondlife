export interface Author {
  id: string;
  name: string;
  avatar: string; // URL
  bio: string;
}

export interface Domain {
  id: string;
  name: string;
  color: string; // Helper for UI styling
}

export interface Article {
  id: string;
  title: string;
  content: string; // Markdown or plain text
  authorId: string;
  domainIds: string[];
  publishDate: string; // ISO String
  status: 'draft' | 'published';
  keyPoints: [string, string, string]; // Exactly 3 points
  summary: string;
  coverImage?: string;
}

// Helper type for the form
export type ArticleFormData = Omit<Article, 'id' | 'publishDate'> & {
  id?: string;
  publishDate?: string;
};