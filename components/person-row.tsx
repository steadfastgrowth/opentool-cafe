import { Link } from "@/components/link";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";
import type { PublicPerson } from "@/lib/person";

export function PersonRow({
  person,
  following,
  meId,
}: {
  person: Pick<PublicPerson, "id" | "slug" | "name" | "bio" | "avatarUrl" | "_count">;
  following: boolean;
  meId: string | null;
}) {
  const showFollow = Boolean(meId && meId !== person.id);
  return (
    <div className="person-row ticket p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
      <div className="flex gap-3 items-start min-w-0 flex-1">
        <Link href={`/u/${person.slug}`} className="no-underline shrink-0">
          <Avatar name={person.name || person.slug} src={person.avatarUrl} size={56} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/u/${person.slug}`} className="display text-xl font-semibold no-underline">
            {person.name || person.slug}
          </Link>
          <p className="font-mono text-[11px] text-mark">@{person.slug}</p>
          {person.bio ? <p className="text-sm mt-1 text-dim line-clamp-2">{person.bio}</p> : null}
          <p className="font-mono text-[11px] text-dim mt-2">
            {person._count.followers} followers · {person._count.posts} posts
          </p>
        </div>
      </div>
      {showFollow ? (
        <div className="person-follow w-full sm:w-auto shrink-0 sm:self-start [&_.btn]:!w-full sm:[&_.btn]:!w-auto">
          <FollowButton slug={person.slug} following={following} />
        </div>
      ) : null}
    </div>
  );
}
