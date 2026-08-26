import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function HelpPage() {
  return (
    <Stage label="Help" wide={false}>
      <h1 className="display text-4xl mb-4">Help</h1>
      <ul className="space-y-3 text-lg">
        <li>
          <Link href="/join">Join</Link> with email or GitHub.
        </li>
        <li>
          Browse the <Link href="/find">menu</Link> for tools.
        </li>
        <li>
          Pin something on the <Link href="/board">board</Link>.
        </li>
        <li>
          List a repo from <Link href="/list">list a tool</Link>.
        </li>
        <li>
          Stuck? Leave a note on the <Link href="/tip">tip</Link> page, or post on the board.
        </li>
      </ul>
    </Stage>
  );
}
