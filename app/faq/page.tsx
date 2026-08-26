import { Stage } from "@/components/stage";

export default function FaqPage() {
  return (
    <Stage label="FAQ" wide={false}>
      <h1 className="display text-4xl mb-6">FAQ</h1>
      <dl className="space-y-6">
        <div>
          <dt className="display text-xl">What is the menu?</dt>
          <dd className="text-dim mt-1">Open source tools you can order and run. That is the point of the cafe.</dd>
        </div>
        <div>
          <dt className="display text-xl">What is the board?</dt>
          <dd className="text-dim mt-1">Posts: need help, collab, services, bulletin. Not the tool list.</dd>
        </div>
        <div>
          <dt className="display text-xl">Is listing a tool free?</dt>
          <dd className="text-dim mt-1">Yes. Sign in and list a repo.</dd>
        </div>
        <div>
          <dt className="display text-xl">How do tips work?</dt>
          <dd className="text-dim mt-1">Optional. Keeps the lights on. Tip from the footer or the nav.</dd>
        </div>
      </dl>
    </Stage>
  );
}
