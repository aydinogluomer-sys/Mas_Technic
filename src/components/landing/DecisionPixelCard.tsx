import { useRef } from "react";
import { Crosshair, Plus } from "lucide-react";
import { LANDING_MOTION } from "@/config/landing-motion";
import { useDecisionPixelTransition } from "@/hooks/useDecisionPixelTransition";

export interface DecisionItem {
  id: string;
  index: string;
  category: string;
  question: string;
  answer: string;
}

export interface DecisionPixelCardProps {
  item: DecisionItem;
  active: boolean;
  onActivate: () => void;
  reducedMotion: boolean;
}

/**
 * CNC-native adaptation of React Bits' PixelTransition interaction.
 * Source reference: DavidHDev/react-bits (MIT + Commons Clause), pinned in .references.
 */
export function DecisionPixelCard({ item, active, onActivate, reducedMotion }: DecisionPixelCardProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const answerId = `landing-faq-${item.id}`;
  const questionId = `landing-faq-question-${item.id}`;
  const pixelCount = LANDING_MOTION.decisionPixelColumns * LANDING_MOTION.decisionPixelRows;
  const simplifiedMotion = reducedMotion || !window.matchMedia("(min-width: 769px) and (min-height: 601px) and (pointer: fine)").matches;

  useDecisionPixelTransition(gridRef, { active, reducedMotion: simplifiedMotion });

  const activateFromPointer = () => {
    if (window.matchMedia("(pointer: fine)").matches) onActivate();
  };

  return (
    <article
      className="lf-decision-card"
      data-active={active ? "" : undefined}
      data-lf-reveal
      onPointerEnter={activateFromPointer}
    >
      <button
        id={questionId}
        type="button"
        aria-expanded={active}
        aria-controls={answerId}
        onClick={onActivate}
        onFocus={onActivate}
      >
        <span>{item.index}</span>
        <small>{item.category}</small>
        <strong>{item.question}</strong>
        <Plus aria-hidden="true" />
      </button>

      <div
        id={answerId}
        className="lf-decision-answer"
        role="region"
        aria-labelledby={questionId}
        hidden={!active}
      >
        <p>{item.answer}</p>
        <span aria-hidden="true"><Crosshair /> DATUM / X0 Y0</span>
      </div>

      {!simplifiedMotion && (
        <div
          ref={gridRef}
          className="lf-decision-pixels"
          aria-hidden="true"
          style={{
            gridTemplateColumns: `repeat(${LANDING_MOTION.decisionPixelColumns}, 1fr)`,
            gridTemplateRows: `repeat(${LANDING_MOTION.decisionPixelRows}, 1fr)`,
          }}
        >
          {Array.from({ length: pixelCount }, (_, index) => <i key={index} />)}
        </div>
      )}
      <i className="lf-decision-progress" aria-hidden="true" />
    </article>
  );
}
