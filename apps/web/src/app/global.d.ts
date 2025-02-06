declare namespace JSX {
  interface IntrinsicElements {
    "zuplo-banner": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      mode?: "dark" | "light";
    };
  }
}
