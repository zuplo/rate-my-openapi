import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import StepContainer from "../StepContainer";

const AnalyzingText = () => (
  <StepContainer step={3}>
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
      <span className="bg-accent-light text-accent grid h-10 w-10 place-items-center rounded-full">
        <EnvelopeSimple size={20} weight="regular" />
      </span>
      <h3 className="font-display text-fg text-base font-semibold">
        Report on the way
      </h3>
      <p className="text-fg-muted text-sm">
        Your report should be ready in just a moment. Check your email for the
        link.
      </p>
    </div>
  </StepContainer>
);

export default AnalyzingText;
