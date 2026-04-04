import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// youtube-search-api scrapes YouTube's web interface — no API key needed
// @ts-ignore — no types for this package
import youtubesearchapi from "youtube-search-api";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json([], { status: 403 });
  }

  // Extract the search query from ?q=...
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  try {
    // GetListByKeyword(query, withPlaylist, limit)
    // false = don't include playlists, 5 = max 5 results
    const data = await youtubesearchapi.GetListByKeyword(q, false, 5);

    // Filter out channels (they have no videoId to play)
    // Map to a clean shape the client can use
    const videos = (data.items ?? [])
      .filter((item: any) => item.type !== "channel" && item.id)
      .map((item: any) => ({
        videoId: item.id,
        title: item.title ?? "Unknown",
        // thumbnails array is sorted smallest→largest; pick the last for best quality
        thumbnail: item.thumbnail?.thumbnails?.at(-1)?.url ?? "",
      }));

    return NextResponse.json(videos);
  } catch {
    // YouTube scraping can fail intermittently — return empty rather than error
    return NextResponse.json([]);
  }
}
