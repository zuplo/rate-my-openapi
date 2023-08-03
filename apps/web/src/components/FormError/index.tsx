import classNames from "classnames";

const FormError = ({ error }: { error?: string }) => (
  <p
    className={classNames(
      "mb-3 mt-2 text-left text-sm text-red-600 transition-[height]",
      {
        "h-[16px]": !!error,
        "h-0": !error,
      },
    )}
  >
    {error}
  </p>
);

export default FormError;
