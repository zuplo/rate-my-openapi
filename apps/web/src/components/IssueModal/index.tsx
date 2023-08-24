"use client";

import useWindowSize from "@/utils/use-window-size";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Editor, OnMount } from "@monaco-editor/react";
import { Fragment } from "react";
import { getRuleData } from "../../utils/issue-utils";
import { Issue } from "../DetailedScoreSection";
import "./IssueModal.css";

type IssueModalProps = {
  issue: Issue;
  openapi: string;
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
  fileExtension,
  onClose,
}: IssueModalProps) => {
  const windowSize = useWindowSize();
  const ruleData = getRuleData(issue.code);

  const onEditorDidMount: OnMount = (editor) => {
    editor.revealLine(issue.range.start.line - 5);
    const selection = {
      startLineNumber: issue.range.start.line,
      startColumn: issue.range.start.character,
      endLineNumber: issue.range.end.line,
      endColumn: issue.range.end.character,
    };
    editor.setSelection(selection);
    editor.createDecorationsCollection([
      {
        range: selection,
        options: {
          isWholeLine: true,
          blockClassName: getGlyphBackgroundClassName(issue.severity),
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
              className={`sm:my-8 sm:p-6 sm:align-middle inline-block h-screen w-screen transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-4 text-left align-bottom shadow-xl transition-all md:h-[80vh] md:w-[75vw] md:max-w-[1200px]`}
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
              <Editor
                // className="hidden lg:block"
                height="100%"
                width="100%"
                language={fileExtension === "json" ? "json" : "yaml"}
                value={openapi}
                options={{
                  readOnly: true,
                  selectionHighlight: true,
                  renderLineHighlight: "line",
                  glyphMargin: true,
                  minimap: windowSize.isMobile
                    ? {
                        enabled: false,
                      }
                    : undefined,
                  fontSize: windowSize.isMobile ? 10 : undefined,
                  lineNumbers: windowSize.isMobile ? "off" : undefined,
                  // @ts-ignore - this is a valid option, but the types don't know about it
                  renderIndentGuides: windowSize.isMobile ? false : undefined,
                  folding: windowSize.isMobile ? false : undefined,
                }}
                onMount={onEditorDidMount}
                line={issue.range.start.line}
              />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default IssueModal;
