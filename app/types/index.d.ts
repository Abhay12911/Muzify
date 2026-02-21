interface Video {
    id: string;
    type: string;
    url: string;
    extractedId: string;
    title: string;
    smallImg: string;
    bigImg: string;
    active: boolean;
    userId: string;
    upvotes: number;
    haveUpvoted: boolean;
    spaceId:string
  }

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
