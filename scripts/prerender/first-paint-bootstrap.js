const startup = document.getElementById("inspection-startup");
let started = false;
const start = () => {
  if (started) return;
  started = true;
  clearTimeout(deadline);
  removeEventListener("pointerdown", start);
  removeEventListener("keydown", start);
  for (const original of startup.content.children) {
    const node = document.createElement(original.tagName.toLowerCase());
    for (const attribute of original.attributes) node.setAttribute(attribute.name, attribute.value);
    node.textContent = original.textContent;
    document.head.appendChild(node);
  }
  startup.remove();
};
// A hidden tab or failed image cannot hold startup indefinitely. Native links
// work before adoption; an interaction accelerates boot without consuming it.
const deadline = setTimeout(start, 2500);
addEventListener("pointerdown", start, { once: true, passive: true });
addEventListener("keydown", start, { once: true });
const image = document.querySelector(".tl-part-stage img");
const painted = () => requestAnimationFrame(() => requestAnimationFrame(start));
if (image?.decode) image.decode().catch(() => undefined).then(painted);
else painted();
