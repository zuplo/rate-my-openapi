"use client";

import useWindowSize from "@/utils/use-window-size";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
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

const getPingClassName = (severity: number) => {
  switch (severity) {
    case 0:
      return "bg-red-500";
    case 1:
      return "bg-yellow-500";
    case 2:
      return "bg-blue-500";
    case 3:
      return "bg-green-500";
  }
};

const getPingAnimationClassName = (severity: number) => {
  switch (severity) {
    case 0:
      return "bg-red-400";
    case 1:
      return "bg-yellow-400";
    case 2:
      return "bg-blue-400";
    case 3:
      return "bg-green-400";
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
  const [selectedTab, setSelectedTab] = useState("CODE");
  const [aiTabVisited, setAiTabVisited] = useState(false);

  const loadAiSuggestion = async () => {
    if (aiSuggestion) {
      return;
    }
    const aiResponse = await fetch(`${API_URL}/ai-fix/${reportName}`, {
      body: JSON.stringify({
        issue,
      }),
      headers: {
        "Content-Type": "application/json",
      },
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
    if (!aiTabVisited) {
      setAiTabVisited(true);
    }
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
            color: "rgba(254, 226, 226, 1)",
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
    // The code below will cause the hover message to show by default
    // We may or may not want to do this in the future
    windowSize.isMobile && editor.getAction("editor.action.showHover")?.run();
    await loadAiSuggestion();
  };

  return (
    <Transition.Root show={true} appear={true} as="div">
      <Dialog
        as="div"
        className="fixed inset-0 z-30 overflow-y-auto"
        onClose={() => {
          onClose(false);
        }}
      >
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <Transition.Child
            as="div"
            enter="ease-out duration-400"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="sm:inline-block sm:h-screen sm:align-middle hidden"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-400"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`sm:my-8 sm:p-6 sm:align-middle inline-block h-screen w-screen transform overflow-hidden overflow-y-auto rounded-lg bg-white px-4 pb-4 pt-4 text-left align-bottom shadow-xl transition-all md:h-[80vh] md:w-[75vw] md:max-w-[1200px]`}
            >
              <div className="sm:block z-40 -mr-2 -mt-4 inline-flex w-full justify-end">
                <button
                  type="button"
                  className={`z-40 rounded-md text-gray-400  hover:text-gray-500`}
                  onClick={() => onClose(false)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon height={24} width={24} className="z-40 h-6 w-6" />
                </button>
              </div>
              <div className="-mt-2 flex w-fit flex-col">
                <div className="font-bold md:text-lg">{issue.message}</div>
                <div className="text-xs text-gray-400">Code: {issue.code}</div>
                <div className="mb-4 mt-2">
                  {"urlPathFragment" in ruleData ? (
                    <div className="flex items-center text-blue-500 hover:text-blue-700">
                      <a
                        target="_blank"
                        className="w-fit"
                        href={`https://quobix.com/vacuum/rules/${ruleData.urlPathFragment}/${issue.code}`}
                      >
                        Additional details
                      </a>
                      <ArrowUpRightIcon height={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <div>{ruleData.description}</div>
                  )}
                </div>
              </div>
              <div className="flex h-full w-full flex-col">
                <div className="flex w-fit rounded-md rounded-b-none border">
                  <div
                    onClick={() => setSelectedTab("CODE")}
                    className={`border-r border-gray-300 px-4 py-2 font-bold hover:cursor-pointer ${
                      selectedTab === "CODE" ? "bg-gray-100" : ""
                    }`}
                  >
                    Code
                  </div>
                  <div
                    onClick={handleAiTabClick}
                    className={`relative flex px-4 py-2 font-bold hover:cursor-pointer ${
                      selectedTab === "AI" ? "bg-gray-100" : ""
                    }`}
                  >
                    AI Suggestion{" "}
                    {aiTabVisited ? null : (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingAnimationClassName(
                            issue.severity,
                          )} opacity-75`}
                        ></span>
                        <span
                          className={`relative inline-flex h-3 w-3 rounded-full ${getPingClassName(
                            issue.severity,
                          )}`}
                        ></span>
                      </span>
                    )}
                  </div>
                </div>
                {selectedTab === "AI" ? (
                  <div className="mt-4 flex w-full flex-col">
                    <div className="w-full rounded-sm border border-amber-400 bg-amber-100 px-2 py-3 font-medium text-gray-600">
                      Note: AI Suggestions are experimental. Implement with
                      care.
                    </div>
                    {aiSuggestion ? (
                      <ReactMarkdown
                        className={
                          "prose prose-code:before:content-none prose-code:after:content-none font-[helvetica, -apple-system, BlinkMacSystemFont, Roboto, Ubuntu, sans-serif] mt-4 h-full"
                        }
                        components={{
                          p({ node, children, ...props }) {
                            return (
                              <p {...props} className="font-mono">
                                {children}
                              </p>
                            );
                          },
                          li({ node, children, ...props }) {
                            return (
                              <li
                                {...props}
                                className={`my-1 font-mono marker:text-black`}
                              >
                                {children}
                              </li>
                            );
                          },
                          code({ node, children, className, ...props }) {
                            // Solution to check if code is inline https://github.com/remarkjs/react-markdown/issues/776#issuecomment-1746945470
                            const match = /language-(\w+)/.exec(
                              className || "",
                            );
                            return !match ? (
                              <code
                                className="font-light font-[ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace] rounded-[0.25rem] bg-[#f7fafc] p-[0.25rem] text-sm text-[#2a2f45]"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <Editor
                                className="my-2"
                                height="300px"
                                width="100%"
                                language={
                                  fileExtension === "json" ? "json" : "yaml"
                                }
                                value={
                                  children as string
                                } /* We expect the code to be a string */
                                options={{
                                  readOnly: true,
                                  selectionHighlight: true,
                                  renderLineHighlight: "line",
                                  scrollBeyondLastLine: false,
                                  glyphMargin: true,
                                  minimap: windowSize.isMobile
                                    ? {
                                        enabled: false,
                                      }
                                    : undefined,
                                  fontSize: windowSize.isMobile
                                    ? 10
                                    : undefined,
                                  lineNumbers: windowSize.isMobile
                                    ? "off"
                                    : undefined,
                                  // @ts-ignore - this is a valid option, but the types don't know about it
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
                      <div className="my-4 flex h-full text-lg">Loading...</div>
                    )}
                  </div>
                ) : null}
                {selectedTab === "CODE" ? (
                  <Editor
                    height="100%"
                    width="100%"
                    language={fileExtension === "json" ? "json" : "yaml"}
                    value={openapi}
                    options={{
                      readOnly: true,
                      selectionHighlight: true,
                      renderLineHighlight: "line",
                      scrollBeyondLastLine: false,
                      glyphMargin: true,
                      minimap: windowSize.isMobile
                        ? {
                            enabled: false,
                          }
                        : undefined,
                      fontSize: windowSize.isMobile ? 10 : undefined,
                      lineNumbers: windowSize.isMobile ? "off" : undefined,
                      // @ts-ignore - this is a valid option, but the types don't know about it
                      renderIndentGuides: windowSize.isMobile
                        ? false
                        : undefined,
                      folding: windowSize.isMobile ? false : undefined,
                    }}
                    onMount={onEditorDidMount}
                    line={issue.range.start.line}
                  />
                ) : null}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default IssueModal;
