import StepContainer from "../StepContainer";

const AnalyzingText = () => (
  <StepContainer step={1}>
    <p className="mx-auto mb-2 w-[160px] text-3xl after:inline-block after:w-0 after:animate-ellipsis after:overflow-hidden after:align-bottom after:content-['\2026']">
      Analyzing
    </p>
    <p className="mx-auto max-w-md text-center text-xl">
      Your report should be ready in a few minutes. Check your email for the
      link!
    </p>
  </StepContainer>
);

export default AnalyzingText;
