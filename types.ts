export interface PostMetadata {
  title: string;
  date?: string;
  tags?: string[];
  summary?: string;
  cover?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  category: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  rawUrl: string;
  path: string;
}

export interface CategoryInfo {
  name: string;
  count: number;
}

export interface SiteContent {
  personalInfo: {
    name: string;
    initials: string;
    email: string;
    githubUrl: string;
    githubUsername: string;
    websiteUrl: string;
    profilePictureUrl: string;
    siteSubtitle: string;
    footerDescription: string;
  };
  home: {
    heroBadge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    recentLogsTitle: string;
    contactDescription: string;
  };
  archive: {
    badge: string;
    title: string;
    description: string;
  };
  about: {
    badge: string;
    titlePrimary: string;
    titleSecondary: string;
    subtitle: string;
    bioTitle: string;
    bioParagraphs: string[];
    quote: string;
    quoteAuthor: string;
    ctaTitle: string;
    ctaDescription: string;
  };
}