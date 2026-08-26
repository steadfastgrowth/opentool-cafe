import { Stage } from "@/components/stage";

export default function AboutPage() {
  return (
    <Stage label="About" wide={false}>
      <h1 className="display text-4xl mb-4">About</h1>
      <p className="text-lg leading-relaxed mb-4">
        Open Tool Cafe is a place to share and download open source tools, and to sit with other founders and
        builders.
      </p>
      <p className="text-dim leading-relaxed">
        The menu is the tools. The board is posts. No ranking, no junk feed. Welcome to open tool cafe, can I take
        your order?
      </p>
    </Stage>
  );
}
