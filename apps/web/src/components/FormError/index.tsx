import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import classNames from "classnames";

const FormError = ({ error }: { error?: string }) => {
  if (!error) {
    return <div className="h-0" aria-hidden="true" />;
  }
  return (
    <div
      role="alert"
      className={classNames(
        "border-error-border bg-error-bg text-error mt-3 flex items-start gap-2 rounded-lg border p-3 text-left text-sm",
      )}
    >
      <WarningCircle size={16} weight="regular" className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
};

export default FormError;
