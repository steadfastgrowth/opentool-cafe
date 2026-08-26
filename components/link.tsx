import NextLink from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof NextLink>;

function hrefIsExternal(href: Props["href"]) {
  const raw = typeof href === "string" ? href : href?.pathname || "";
  if (typeof href === "string") {
    return /^(https?:|\/\/|mailto:|tel:)/i.test(href);
  }
  if (href && typeof href === "object" && "protocol" in href && href.protocol) {
    return true;
  }
  return /^(https?:|\/\/|mailto:|tel:)/i.test(raw);
}

/** External URLs open in a new tab. Internal cafe paths stay here. */
export function Link({ href, target, rel, ...props }: Props) {
  const external = hrefIsExternal(href);
  const nextTarget = target ?? (external ? "_blank" : undefined);
  const nextRel =
    nextTarget === "_blank" ? ["noopener", "noreferrer", rel].filter(Boolean).join(" ") : rel;
  return <NextLink href={href} {...props} target={nextTarget} rel={nextRel} />;
}

export default Link;
