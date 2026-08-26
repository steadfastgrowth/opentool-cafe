import NextLink from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextLink>;

/** Cafe default: open in a new tab. Pass target="_self" to stay here. */
export function Link({ target = "_blank", rel, ...props }: Props) {
  const blank = target === "_blank";
  const nextRel = blank
    ? ["noopener", "noreferrer", rel].filter(Boolean).join(" ")
    : rel;
  return <NextLink {...props} target={target} rel={nextRel} />;
}

export default Link;
