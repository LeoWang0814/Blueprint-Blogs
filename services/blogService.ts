
import { Post, SiteContent } from '../types';

interface StatusItem {
  title: string;
  detail: string;
}

export interface BlogManifest {
  status: {
    building: StatusItem;
    learning: StatusItem;
    writing: StatusItem;
  };
  categories: {
    name: string;
    posts: {
      id: string;
      title: string;
      summary: string;
      date?: string;
    }[];
  }[];
}

/**
 * Robust fetcher that tries relative and absolute paths
 */
async function fetchJson<T>(filename: string): Promise<T | null> {
  const paths = [
    `myblog/${filename}`,
    `/myblog/${filename}`,
    `./myblog/${filename}`
  ];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function fetchBlogManifest(): Promise<BlogManifest | null> {
  return await fetchJson<BlogManifest>('manifest.json');
}

export async function fetchSiteContent(): Promise<SiteContent | null> {
  return await fetchJson<SiteContent>('content.json');
}

export async function fetchAllPosts(): Promise<Post[]> {
  const manifest = await fetchBlogManifest();
  if (!manifest || !manifest.categories) return [];

  const allPosts: Post[] = [];

  manifest.categories.forEach(catGroup => {
    catGroup.posts.forEach(postItem => {
      // Slug is the stable ID (used in URL and for filenames)
      const slug = postItem.id;
      const category = catGroup.name;
      const title = postItem.title;
      
      const encodedCategory = encodeURIComponent(category);
      const encodedId = encodeURIComponent(postItem.id);
      const rawUrl = `myblog/${encodedCategory}/${encodedId}.md`;

      allPosts.push({
        slug: slug,
        category: category,
        title: title,
        date: postItem.date || "Archive Entry",
        tags: [],
        summary: postItem.summary,
        content: '',
        rawUrl: rawUrl,
        path: `${category}/${postItem.id}.md`
      });
    });
  });

  return allPosts;
}

export async function fetchPostContent(category: string, id: string): Promise<Post | null> {
  try {
    const manifest = await fetchBlogManifest();
    if (!manifest) return null;

    const catData = manifest.categories.find(c => c.name === category);
    const postData = catData?.posts.find(p => p.id === id);

    if (!postData) throw new Error("Post entry not found in manifest");

    // Construct request URL using the stable ID
    const encodedCategory = encodeURIComponent(category);
    const encodedId = encodeURIComponent(id);
    const url = `myblog/${encodedCategory}/${encodedId}.md`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`File not found: ${url}`);
    
    const content = await response.text();
    return {
      slug: id,
      category: category,
      title: postData.title,
      date: postData.date || "Archive Entry",
      tags: [],
      summary: postData.summary || "",
      content: content,
      rawUrl: url,
      path: `${category}/${id}.md`
    };
  } catch (e) {
    console.error("Error fetching post content:", e);
    return null;
  }
}
