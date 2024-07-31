"use client";

const NavigateButton = ({ label, url }: { label: string; url: string }) => {
  return (
    <button
      type="button"
      className="mt-auto block rounded-md bg-fuchsia-600 p-2 font-medium text-white transition-colors hover:bg-fuchsia-500 hover:text-white"
      onClick={() => {
        window.location.href = url;
      }}
    >
      {label}
    </button>
  );
};

export default NavigateButton;
