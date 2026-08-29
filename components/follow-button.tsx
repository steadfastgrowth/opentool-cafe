import { toggleFollow } from "@/app/actions";

export function FollowButton({
  slug,
  following,
}: {
  slug: string;
  following: boolean;
}) {
  return (
    <form action={toggleFollow} className="follow-form">
      <input type="hidden" name="slug" value={slug} />
      <button className={following ? "btn btn-ghost follow-btn" : "btn follow-btn"} type="submit">
        {following ? "Following" : "Follow"}
      </button>
    </form>
  );
}
