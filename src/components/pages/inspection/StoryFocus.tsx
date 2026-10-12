import { useState } from "react";

export type StoryChoice = { label: string; body: string };

/** The native buttons change emphasis; every authored paragraph remains in DOM. */
export function StoryFocus({ title, items }: { title: string; items: StoryChoice[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="inspection-focus" aria-label={title}>
      <p className="shell-eyebrow">{title}</p>
      <div className="inspection-controls" role="group" aria-label={title}>
        {items.map((item, index) => (
          <button type="button" key={item.label} aria-pressed={active === index} onClick={() => setActive(index)}>{item.label}</button>
        ))}
      </div>
      <dl className="inspection-focus-records">
        {items.map((item, index) => (
          <div key={item.label} data-active={active === index || undefined}>
            <dt>{item.label}</dt><dd>{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
