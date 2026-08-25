# Timeline contract

| Phase | Target | Maximum |
| --- | --- | --- |
| Input acknowledgement | trigger | 100ms |
| Panel closure | three panels | 360ms |
| Primary type reveal | family rail | 520ms from input |
| Link completion | category/detail links | 720ms from input |
| Close before navigation | complete overlay exit | 520ms |
| Reduced motion | all content visible | 80ms |

- Use separate open and close easing tokens.
- Stagger links by 35–45ms only when motion is allowed.
- Family swaps must occupy a stable layout box.
- Cancel scheduled navigation and callbacks on a new interaction.
- Pointer parallax range must remain under 8px and stop immediately when inactive.
