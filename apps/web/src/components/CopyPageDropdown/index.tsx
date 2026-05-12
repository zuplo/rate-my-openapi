"use client";

import { Menu, Transition } from "@headlessui/react";
import {
  ArrowSquareOut,
  CaretDown,
  Check,
  Copy,
  Link as LinkIcon,
  WarningCircle,
} from "@phosphor-icons/react";
import classNames from "classnames";
import { Fragment, useState } from "react";

type CopyState = "idle" | "copied" | "error";

const ClaudeMark = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    fillRule="evenodd"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="#D97757"
      d="m4.709 15.955 4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 0 1-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312z"
    />
  </svg>
);

const ChatGPTMark = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 320 320"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="currentColor"
      d="M297.06 130.97a79.712 79.712 0 0 0-6.85-65.48c-17.46-30.4-52.56-46.04-86.84-38.68A79.747 79.747 0 0 0 143.24 0C108.2-.08 77.11 22.48 66.33 55.82a79.754 79.754 0 0 0-53.31 38.67c-17.59 30.32-13.58 68.54 9.92 94.54a79.712 79.712 0 0 0 6.85 65.48c17.46 30.4 52.56 46.04 86.84 38.68a79.687 79.687 0 0 0 60.13 26.8c35.06.09 66.16-22.49 76.94-55.86a79.754 79.754 0 0 0 53.31-38.67c17.57-30.32 13.55-68.51-9.94-94.51zM176.78 299.08a59.77 59.77 0 0 1-38.39-13.88c.49-.26 1.34-.73 1.89-1.07l63.72-36.8a10.36 10.36 0 0 0 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zM47.94 244.05a59.71 59.71 0 0 1-7.15-40.18c.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83L129.87 266c-28.69 16.52-65.33 6.7-81.92-21.95zM31.17 104.96c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91L118.44 224c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94a59.94 59.94 0 0 1-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8a10.375 10.375 0 0 0-10.47 0l-77.79 44.92V92c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22a59.95 59.95 0 0 1 7.15 40.1zm-168.51 55.43-26.94-15.55a.943.943 0 0 1-.52-.74V80.86c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07L116 72.67a10.344 10.344 0 0 0-5.24 9.06l-.04 89.79zM125.35 140 160 119.99l34.65 20V180L160 200l-34.65-20z"
    />
  </svg>
);

const buildLLMPrompt = (mdUrl: string, title: string) =>
  `Please review the OpenAPI rating report for "${title}" at ${mdUrl}. Summarize the score, the main issues, and concrete next steps to improve the spec.`;

const CopyPageDropdown = ({
  reportId,
  title,
}: {
  reportId: string;
  title: string;
}) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [linkState, setLinkState] = useState<CopyState>("idle");

  const getPageUrl = () => window.location.origin + `/report/${reportId}`;
  const getMarkdownUrl = () =>
    window.location.origin + `/report/${reportId}.md`;

  const flash = (
    setter: (s: CopyState) => void,
    next: CopyState,
    ms = 2000,
  ) => {
    setter(next);
    setTimeout(() => setter("idle"), ms);
  };

  const handleCopyPage = async () => {
    try {
      const res = await fetch(`/report/${reportId}.md`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      flash(setCopyState, "copied");
    } catch (err) {
      console.error("Failed to copy page markdown", err);
      flash(setCopyState, "error", 3000);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPageUrl());
      flash(setLinkState, "copied");
    } catch (err) {
      console.error("Failed to copy link", err);
      flash(setLinkState, "error", 3000);
    }
  };

  const handleOpenMarkdown = () => {
    window.open(getMarkdownUrl(), "_blank", "noopener,noreferrer");
  };

  const handleUseInClaude = () => {
    const prompt = buildLLMPrompt(getMarkdownUrl(), title);
    window.open(
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleUseInChatGPT = () => {
    const prompt = buildLLMPrompt(getMarkdownUrl(), title);
    window.open(
      `https://chatgpt.com/?q=${encodeURIComponent(prompt)}&hints=search`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
        ? "Couldn’t copy"
        : "Copy page";

  const CopyIcon =
    copyState === "copied"
      ? Check
      : copyState === "error"
        ? WarningCircle
        : Copy;

  return (
    <div className="inline-flex items-stretch">
      <button
        type="button"
        onClick={handleCopyPage}
        disabled={copyState === "copied"}
        className={classNames(
          "btn btn-outlined rounded-r-none border-r-0",
          copyState === "copied" && "text-success",
          copyState === "error" && "text-error",
        )}
        title="Copy this report as Markdown"
      >
        <CopyIcon size={16} weight="regular" />
        <span>{copyLabel}</span>
      </button>
      <Menu as="div" className="relative">
        <Menu.Button
          aria-label="More page actions"
          className="btn btn-outlined btn-icon rounded-l-none"
        >
          <CaretDown size={16} weight="regular" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Menu.Items className="border-border bg-bg shadow-pop absolute right-0 z-20 mt-2 w-64 origin-top-right overflow-hidden rounded-lg border p-1.5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={classNames(
                    "text-fg-secondary flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active && "bg-bg-muted text-fg",
                  )}
                >
                  {linkState === "copied" ? (
                    <Check
                      size={16}
                      weight="regular"
                      className="text-success"
                    />
                  ) : linkState === "error" ? (
                    <WarningCircle
                      size={16}
                      weight="regular"
                      className="text-error"
                    />
                  ) : (
                    <LinkIcon size={16} weight="regular" />
                  )}
                  <span>
                    {linkState === "copied"
                      ? "Link copied"
                      : linkState === "error"
                        ? "Couldn’t copy link"
                        : "Copy link to page"}
                  </span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleOpenMarkdown}
                  className={classNames(
                    "text-fg-secondary flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active && "bg-bg-muted text-fg",
                  )}
                >
                  <ArrowSquareOut size={16} weight="regular" />
                  <span>Open Markdown page</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleUseInClaude}
                  className={classNames(
                    "text-fg-secondary flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active && "bg-bg-muted text-fg",
                  )}
                >
                  <ClaudeMark />
                  <span>Use in Claude</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleUseInChatGPT}
                  className={classNames(
                    "text-fg-secondary flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active && "bg-bg-muted text-fg",
                  )}
                >
                  <ChatGPTMark />
                  <span>Use in ChatGPT</span>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default CopyPageDropdown;
