/** Public profile fields only. Never email, phone, hashes, or provider ids. */
export const publicPersonSelect = {
  id: true,
  slug: true,
  name: true,
  bio: true,
  avatarUrl: true,
  offering: true,
  lookingFor: true,
  skills: true,
  github: true,
  x: true,
  huggingface: true,
  linkedin: true,
  website: true,
  createdAt: true,
  founding: true,
  memberNumber: true,
  _count: { select: { followers: true, following: true, posts: true, listings: true } },
} as const;

/** Author chip on posts / desk — still no private fields. */
export const publicAuthorSelect = {
  id: true,
  slug: true,
  name: true,
  avatarUrl: true,
  offering: true,
  founding: true,
  memberNumber: true,
} as const;

export const postCardSelect = {
  id: true,
  title: true,
  body: true,
  kind: true,
  tags: true,
  createdAt: true,
  author: { select: publicAuthorSelect },
  _count: { select: { likes: true, comments: true } },
} as const;

export type PublicPerson = {
  id: string;
  slug: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  offering: string | null;
  lookingFor: string | null;
  skills: string | null;
  github: string | null;
  x: string | null;
  huggingface: string | null;
  linkedin: string | null;
  website: string | null;
  createdAt: Date;
  founding: boolean;
  memberNumber: number | null;
  _count: { followers: number; following: number; posts: number; listings: number };
};

export type PublicAuthor = {
  id: string;
  slug: string;
  name: string | null;
  avatarUrl: string | null;
  offering: string | null;
  founding: boolean;
  memberNumber: number | null;
};
