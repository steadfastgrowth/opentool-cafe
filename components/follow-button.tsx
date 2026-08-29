import { toggleFollow } from "@/app/actions";

export function FollowButton({
  slug,
  following,
}: {
  slug: string;
  following: boolean;
}) {
  return (
    <form action={toggleFollow}>
      <input type="hidden" name="slug" value={slug} />
      <button className={following ? "btn btn-ghost sm:w-auto" : "btn sm:w-auto"} type="submit">
        {following ? "Following" : "Follow"}
      </button>
    </form>
  );
}
