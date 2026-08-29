"use client";

import { useFormStatus } from "react-dom";
import { toggleFollow } from "@/app/actions";

function Submit({ following }: { following: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={following ? "btn btn-ghost sm:w-auto" : "btn sm:w-auto"}
      type="submit"
      disabled={pending}
    >
      {pending ? "…" : following ? "Following" : "Follow"}
    </button>
  );
}

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
      <Submit following={following} />
    </form>
  );
}
