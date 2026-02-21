export type Stream = {
  id: string;
  url: string;
  extractedId: string;
  title: string;
  smallImage: string;
  largeImage: string;
  upvotes: { id: string; userId: string; streamId: string }[];
  user: { id: string; name: string | null };
};
