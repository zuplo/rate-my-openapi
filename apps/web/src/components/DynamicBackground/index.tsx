import classNames from "classnames";

const DynamicBackground = ({ score = -1 }) => (
  <div
    role="presentation"
    className={classNames(
      "pointer-events-none fixed inset-0 -z-10 opacity-40 transition-opacity",
    )}
    style={{
      background:
        score >= 80
          ? "radial-gradient(circle at 25% -10%, var(--color-success-bg), transparent 45%), radial-gradient(circle at 110% 75%, var(--color-success-bg), transparent 55%)"
          : score >= 50
            ? "radial-gradient(circle at 25% -10%, var(--color-warning-bg), transparent 45%), radial-gradient(circle at 110% 75%, var(--color-warning-bg), transparent 55%)"
            : score >= 0
              ? "radial-gradient(circle at 25% -10%, var(--color-error-bg), transparent 45%), radial-gradient(circle at 110% 75%, var(--color-error-bg), transparent 55%)"
              : "radial-gradient(circle at 25% -10%, var(--color-accent-light), transparent 45%), radial-gradient(circle at 110% 75%, var(--color-accent-light), transparent 55%)",
    }}
  />
);

export default DynamicBackground;
