"use client";

import { Popover } from "@typeform/embed-react";
import { useEffect, useRef, useState } from "react";

export const FeedbackPopover = () => {
  const [display, setDisplay] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    // avoids some nasty nextjs errors
    setTimeout(() => {
      setDisplay(true);
    }, 100);

    // open the popover after 45 seconds
    setTimeout(() => {
      if (ref.current && !localStorage.getItem("feedbackPopover")) {
        ref.current.open();
        localStorage.setItem("feedbackPopover", "true");
      }
    }, 45000);
  }, []);

  if (!display) {
    return <></>;
  }

  return (
    <div>
      <Popover
        ref={ref}
        id="xu4XKapa"
        buttonColor="#FF00BD"
        buttonProps={{
          ariaLabel: "Typeform Button",
        }}
      />
    </div>
  );
};
