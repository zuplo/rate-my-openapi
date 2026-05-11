"use client";

import useWindowSize from "@/utils/use-window-size";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowUpRight, Sparkle, Warning, X } from "@phosphor-icons/react";
import { Editor, OnMount } from "@monaco-editor/react";
import { Fragment, useState } from "react";
import { getRuleData } from "../../utils/issue-utils";
import { Issue } from "../DetailedScoreSection";
import "./IssueModal.css";
import ReactMarkdown from "react-markdown";
import { API_URL } from "@/utils/env";

type IssueModalProps = {
  issue: Issue;
  openapi: string;
  reportName: string;
  fileExtension: string;
  onClose: (isOpen: boolean) => void;
};

const getGlyphClassName = (severity: number) => {
  switch (severity) {
    case 0:
      return "errorGlyph";
    case 1:
      return "warnGlyph";
    case 2:
      return "infoGlyph";
    case 3:
      return "hintGlyph";
  }
};

const getGlyphBackgroundClassName = (severity: number) => {
  switch (severity) {
    case 0:
      return "errorGlyphBackground";
    case 1:
      return "warnGlyphBackground";
    case 2:
      return "infoGlyphBackground";
    case 3:
      return "hintGlyphBackground";
  }
};

const IssueModal = ({
  issue,
  openapi,
  reportName,
  fileExtension,
  onClose,
}: IssueModalProps) => {
  const windowSize = useWindowSize();
  const ruleData = getRuleData(issue.code);
  const [aiSuggestion, setAiSuggestion] = useState<string>();
  const [selectedTab, setSelectedTab] = useState<"CODE" | "AI">("CODE");
  const [aiTabVisited, setAiTabVisited] = useState(false);

  const loadAiSuggestion = async () => {
    if (aiSuggestion) return;
    const aiResponse = await fetch(`${API_URL}/ai-fix/${reportName}`, {
      body: JSON.stringify({ issue }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const responseMessage = await aiResponse.text();
    if (aiResponse.status !== 200) {
      console.error(
        `Error getting AI suggestion for issue ${issue.code}: ${responseMessage}`,
      );
      setAiSuggestion("Error getting AI suggestion. Please try again later.");
      return;
    }
    setAiSuggestion(responseMessage ?? "No suggestion found");
  };

  const handleAiTabClick = () => {
    if (!aiTabVisited) setAiTabVisited(true);
    setSelectedTab("AI");
  };

  const onEditorDidMount: OnMount = async (editor) => {
    editor.revealLine(issue.range.start.line - 5);
    const selection = {
      startLineNumber: issue.range.start.line + 1,
      startColumn: issue.range.start.character,
      endLineNumber: issue.range.end.line + 1,
      endColumn: issue.range.end.character,
    };
    editor.setSelection(selection);
    editor.createDecorationsCollection([
      {
        range: selection,
        options: {
          isWholeLine: true,
          className: getGlyphBackgroundClassName(issue.severity),
          hoverMessage: { value: issue.message },
          minimap: {
            color: "rgba(225, 29, 72, 0.6)",
            position: 2,
          },
          glyphMarginHoverMessage: { value: issue.message },
          glyphMarginClassName: getGlyphBackgroundClassName(issue.severity),
        },
      },
      {
        range: { ...selection, endLineNumber: selection.startLineNumber },
        options: {
          isWholeLine: true,
          glyphMarginClassName: getGlyphClassName(issue.severity),
        },
      },
    ]);
    windowSize.isMobile && editor.getAction("editor.action.showHover")?.run();
    await loadAiSuggestion();
  };

  const tabBtn = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-[7px] px-3 py-1.5 text-sm transition-colors ${
      active
        ? "bg-bg-muted font-semibold text-fg"
        : "font-medium text-fg-muted hover:text-fg"
    }`;

  return (
    <Transition.Root show={true} appear={true} as="div">
      <Dialog
        as="div"
        className="fixed inset-0 z-30 overflow-y-auto"
        onClose={() => onClose(false)}
      >
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className="fixed inset-0 transition-opacity"
              style={{ background: "rgba(0,0,0,0.45)" }}
            />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-95"
          >
            <div className="bg-bg text-fg shadow-modal relative z-40 flex h-screen w-screen transform flex-col overflow-y-auto p-5 text-left transition-all md:my-8 md:h-[80vh] md:w-[75vw] md:max-w-[1200px] md:rounded-2xl md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-fg-faint text-xs font-medium tracking-[0.05em] uppercase">
                    Issue
                  </span>
                  <h2 className="font-display text-fg text-lg leading-tight font-semibold md:text-xl">
                    {issue.message}
                  </h2>
                  <span className="text-fg-muted mt-1 font-mono text-xs">
                    {issue.code}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Close issue"
                  onClick={() => onClose(false)}
                >
                  <X size={18} weight="regular" />
                </button>
              </div>

              <div className="text-fg-secondary mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <span className="font-display text-fg block font-semibold">
                    Why is this important?
                  </span>
                  <p className="mt-1 leading-relaxed">{ruleData.description}</p>
                </div>
                {ruleData.violationExplanation && (
                  <div>
                    <span className="font-display text-fg block font-semibold">
                      Why did this violation appear?
                    </span>
                    <p className="mt-1 leading-relaxed">
                      {ruleData.violationExplanation}
                    </p>
                  </div>
                )}
                {ruleData.url && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:text-accent-hover inline-flex w-fit items-center gap-1 text-sm font-semibold transition-colors"
                    href={ruleData.url}
                  >
                    Learn more <ArrowUpRight size={14} weight="regular" />
                  </a>
                )}
              </div>

              <div className="mt-5 flex w-full flex-1 flex-col">
                <div className="border-border bg-bg inline-flex w-fit items-center gap-1 rounded-[10px] border p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTab("CODE")}
                    className={tabBtn(selectedTab === "CODE")}
                  >
                    <span>Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAiTabClick}
                    className={`${tabBtn(selectedTab === "AI")} relative`}
                  >
                    <Sparkle size={14} weight="regular" />
                    <span>AI Suggestion</span>
                    {!aiTabVisited && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="bg-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                        <span className="bg-accent relative inline-flex h-2 w-2 rounded-full" />
                      </span>
                    )}
                  </button>
                </div>

                {selectedTab === "AI" ? (
                  <div className="mt-4 flex h-full w-full flex-col">
                    <div className="border-warning-border bg-warning-bg flex items-start gap-3 rounded-xl border p-3.5 text-sm">
                      <Warning
                        size={18}
                        weight="regular"
                        className="text-warning-deep mt-0.5 shrink-0"
                      />
                      <div className="text-warning-deep">
                        <span className="font-semibold">Experimental.</span> AI
                        suggestions can be wrong — implement with care.
                      </div>
                    </div>
                    {aiSuggestion ? (
                      <ReactMarkdown
                        className="prose prose-sm text-fg-secondary prose-headings:font-display prose-headings:text-fg prose-p:text-fg-secondary prose-code:rounded prose-code:bg-bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-xs prose-code:font-normal prose-code:text-fg prose-code:before:content-none prose-code:after:content-none mt-4 max-w-none font-sans"
                        components={{
                          code({ children, className, ...props }) {
                            const match = /language-(\w+)/.exec(
                              className || "",
                            );
                            const onMount: OnMount = (editor) => {
                              const height = editor.getContentHeight();
                              editor.layout({ height, width: 100 });
                            };
                            return !match ? (
                              <code {...props}>{children}</code>
                            ) : (
                              <Editor
                                className="my-3 h-full overflow-hidden rounded-md"
                                width="100%"
                                onMount={onMount}
                                language={
                                  fileExtension === "json" ? "json" : "yaml"
                                }
                                value={children as string}
                                options={{
                                  automaticLayout: true,
                                  readOnly: true,
                                  selectionHighlight: true,
                                  renderLineHighlight: "line",
                                  scrollBeyondLastLine: false,
                                  glyphMargin: true,
                                  scrollbar: {
                                    vertical: "hidden",
                                    alwaysConsumeMouseWheel: false,
                                  },
                                  minimap: windowSize.isMobile
                                    ? { enabled: false }
                                    : undefined,
                                  fontSize: windowSize.isMobile ? 10 : 12,
                                  lineNumbers: windowSize.isMobile
                                    ? "off"
                                    : undefined,
                                  // @ts-ignore valid option, not in types
                                  renderIndentGuides: windowSize.isMobile
                                    ? false
                                    : undefined,
                                  folding: windowSize.isMobile
                                    ? false
                                    : undefined,
                                }}
                              />
                            );
                          },
                        }}
                      >
                        {aiSuggestion}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-fg-muted my-4 flex h-full text-sm">
                        Loading suggestion…
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-border mt-4 h-full min-h-[300px] flex-1 overflow-hidden rounded-md border">
                    <Editor
                      width="100%"
                      height="100%"
                      language={fileExtension === "json" ? "json" : "yaml"}
                      value={openapi}
                      options={{
                        automaticLayout: true,
                        readOnly: true,
                        selectionHighlight: true,
                        renderLineHighlight: "line",
                        scrollBeyondLastLine: false,
                        glyphMargin: true,
                        minimap: windowSize.isMobile
                          ? { enabled: false }
                          : undefined,
                        fontSize: windowSize.isMobile ? 10 : 12,
                        lineNumbers: windowSize.isMobile ? "off" : undefined,
                        // @ts-ignore valid option, not in types
                        renderIndentGuides: windowSize.isMobile
                          ? false
                          : undefined,
                        folding: windowSize.isMobile ? false : undefined,
                      }}
                      onMount={onEditorDidMount}
                      line={issue.range.start.line}
                    />
                  </div>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default IssueModal;
