"use client";

/**
 * The frosted band behind a fixed page header.
 *
 * Content scrolls underneath the header, so the header needs something
 * between it and that content. A flat fill plus a linear fade was the
 * previous answer and it read as a smear — the fill had a visible edge, and
 * the fade cut bubbles off mid-word instead of dissolving them.
 *
 * This is the progressive-blur approach instead: several stacked
 * backdrop-filter layers, each with a stronger blur than the last and each
 * masked to a band that starts higher up. Where the bands overlap the blurs
 * compound, so the frost is imperceptible at the bottom edge and heaviest
 * behind the controls at the top, with no seam anywhere. The layers are
 * decorative only — hidden from assistive tech and transparent to pointers.
 */
export default function HeaderFrost({ fixed = false }: { fixed?: boolean }) {
  return (
    <div className={`header-frost${fixed ? " header-frost--fixed" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
