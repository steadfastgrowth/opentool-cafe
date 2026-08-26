import { CoffeeCup } from "./coffee-cup";

export function Avatar({
  name,
  src,
  size = 96,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      <div className="inline-flex flex-col items-center gap-1">
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="object-cover border-2 border-paper"
          style={{ width: size, height: size, imageRendering: "auto" }}
        />
        <CoffeeCup name={name} size={Math.max(48, Math.round(size * 0.55))} />
      </div>
    );
  }
  return <CoffeeCup name={name} size={size} />;
}
