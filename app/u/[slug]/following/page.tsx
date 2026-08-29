import { FollowList } from "@/components/follow-list";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FollowList slug={slug} direction="following" />;
}
