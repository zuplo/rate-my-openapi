"use client";

import classNames from "classnames";
import { useInView } from "react-intersection-observer";

const AnimatedScore = ({
  score,
  id,
  className,
}: {
  score: number;
  id: string;
  className?: string;
}) => {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <>
      <div
        ref={ref}
        className={classNames(className, {
          [`animated-counter-${id}`]: inView,
        })}
      />
      <style jsx>{`
        @property --num-${id} {
          syntax: "<integer>";
          initial-value: 0;
          inherits: false;
        }
        .animated-counter-${id} {
          animation-name: ${id}-counter;
          animation-duration: 1000ms;
          animation-timing-function: ease;
          animation-fill-mode: forwards;
          counter-reset: num-${id} var(--num-${id});
        }
        .animated-counter-${id}::after {
          content: counter(num-${id});
        }
        @keyframes ${id}-counter {
          from {
            --num-${id}: 0;
          }
          to {
            --num-${id}: ${score};
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedScore;
