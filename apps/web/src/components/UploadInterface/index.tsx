"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/outline";

import { useUploadContext } from "@/contexts/UploadContext";

import StepContainer from "../StepContainer";
import FormError from "../FormError";

const EXAMPLES: { title: string; slug: string }[] = [
  // {
  //   title: "Lorem",
  //   slug: "lorem",
  // },
];

const UploadInterface = () => {
  const { setNextStep, setFile, file } = useUploadContext();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showButtons, setShowButtons] = useState(false);

  const onDragOver = (e: globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(true);
  };

  const onDragLeave = (e: globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement> | globalThis.DragEvent) => {
    e.preventDefault();

    setDragActive(false);

    if (e.dataTransfer?.files.length) {
      onLocalFileUpload(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    window.addEventListener("dragover", onDragOver, false);
    window.addEventListener("dragleave", onDragLeave, false);
    window.addEventListener("drop", onDrop, false);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.addEventListener("dragleave", onDragLeave, false);
      window.removeEventListener("drop", onDrop);
    };
  });

  const onLocalFileUpload = (newFile: File) => {
    if (
      newFile.type === "application/json" ||
      newFile.type === "application/x-yaml"
    ) {
      setError(undefined);

      setFile(newFile);

      if (urlInputRef.current) {
        urlInputRef.current.value = newFile.name;
      }

      shouldShowButtons();
    } else {
      setError("File must be JSON or YAML");
    }
  };

  const onLocalFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onLocalFileUploadInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onLocalFileUpload(e.target.files[0]);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(undefined);

    const urlInput = urlInputRef.current;
    if (file) {
      return setNextStep();
    } else if (urlInput?.value && urlInput?.validity.valid) {
      let fileUrl: URL | undefined = undefined;
      let fileName: string | undefined = undefined;

      try {
        const file = new URL(urlInput?.value);
        if (
          file.pathname.endsWith(".json") ||
          file.pathname.endsWith(".yml") ||
          file.pathname.endsWith(".yaml")
        ) {
          fileUrl = file;
          fileName = file.pathname.substring(
            file.pathname.lastIndexOf("/") + 1,
          );
        } else {
          throw new Error("File must be JSON or YAML");
        }
      } catch (e) {
        console.error((e as Error).message);
        setError((e as Error).message);
      }

      if (fileUrl && fileName) {
        try {
          const response = await fetch(fileUrl);

          if (response.status !== 200) {
            throw new Error(`Could not fetch file`);
          }

          const blob = await response.blob();

          setFile(
            new File([blob], fileName, {
              type: blob.type,
            }),
          );

          setNextStep();
        } catch (e) {
          console.error((e as Error).message);
          setError((e as Error).message);
        }
      }
    }
  };

  const onClear = () => {
    setFile(undefined);

    if (urlInputRef.current) {
      urlInputRef.current.value = "";
    }

    setShowButtons(false);
  };

  const shouldShowButtons = () =>
    setShowButtons(
      !!file ||
        !!(urlInputRef.current?.value && urlInputRef.current?.value !== ""),
    );

  const onInputChange = () => {
    setError(undefined);
    shouldShowButtons();
  };

  return (
    <StepContainer step={1}>
      {dragActive && (
        <div className="absolute left-0 top-0 z-10 h-full w-full px-[10%] py-[30%]">
          <div className="flex h-full w-full items-center justify-center rounded-lg border-4 border-dashed border-blue-400 bg-[#F8FAFC]/50 backdrop-blur-[1px]">
            <div className="w-full max-w-[240px] rounded-lg bg-white px-5 py-10 text-center shadow-md">
              <DocumentIcon
                height={80}
                width={80}
                className="mx-auto mb-5 text-gray-500"
              />

              <p className="text-xl font-bold text-gray-500">
                Drop your file here
              </p>
              <p className=" text-gray-500">
                We’ll start analysing your API within a blink
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="mx-auto mb-16 max-w-lg text-center text-xl text-gray-600">
        Drop your spec file, paste a URL to it or paste your whole spec into the
        form below and we’ll analyse it.
      </p>
      <form
        className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md"
        id="upload-form"
        onSubmit={onSubmit}
      >
        <input
          type="url"
          ref={urlInputRef}
          onChange={onInputChange}
          className="w-full border-none bg-transparent pr-3 text-lg outline-none"
          placeholder="Drop your OpenAPI file or enter your OpenAPI file URL here"
          aria-label="Enter OpenAPI file URL here"
          disabled={!!file}
        />

        <input
          ref={fileInputRef}
          onChange={onLocalFileUploadInputChange}
          className="hidden"
          type="file"
          name="drag-upload"
          accept=".json,.yaml,.yml"
        />
        <div className="flex h-[44px]">
          {!file && (
            <button
              onClick={onLocalFileUploadClick}
              className="mr-2 whitespace-nowrap rounded-lg border border-gray-500 bg-transparent px-3 py-2 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Select a file
            </button>
          )}
          {file && (
            <button className="icon-button mr-2 bg-gray-500" onClick={onClear}>
              <XMarkIcon height={24} width={24} className="text-white" />
            </button>
          )}

          <button
            type="submit"
            className="icon-button bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!showButtons}
          >
            <ChevronRightIcon height={24} width={24} className="text-white" />
          </button>
        </div>
      </form>
      <FormError error={error} />
      {EXAMPLES.length > 0 && (
        <div className="flex items-center">
          <p className="mr-3 font-bold uppercase text-gray-400">Examples:</p>
          <ul className="flex flex-wrap items-center gap-3">
            {EXAMPLES.map((example) => (
              <li key={example.slug}>
                <Link
                  className="block rounded-lg bg-gray-200 p-2 font-medium text-gray-600 transition-colors hover:bg-gray-900 hover:text-white"
                  href={`/report/${example.slug}`}
                >
                  {example.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </StepContainer>
  );
};

export default UploadInterface;
