"use client";

import { useUploadContext } from "@/contexts/UploadContext";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import StepContainer from "../StepContainer";
import Link from "next/link";

const EXAMPLES = [
  {
    title: "Lorem",
    slug: "lorem",
  },
  {
    title: "Ipsum",
    slug: "ipsum",
  },
  {
    title: "Consectetur",
    slug: "consectetur",
  },
  {
    title: "Adipiscing",
    slug: "adipiscing",
  },
];

const UploadInterface = () => {
  const { setNextStep, setFile, file } = useUploadContext();

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showButtons, setShowButtons] = useState(false);

  const onDragOver = (e: globalThis.DragEvent) => e.preventDefault();

  const onDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>) => {
    e.preventDefault();

    if (e.type === "dragleave") {
      setDragActive(false);
    } else {
      setDragActive(true);
    }
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
    window.addEventListener("drop", onDrop, false);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  });

  const onLocalFileUpload = (newFile: File) => {
    if (newFile.type === "application/json") {
      setError(undefined);

      setFile(newFile);

      if (urlInputRef.current) {
        urlInputRef.current.value = newFile.name;
      }

      shouldShowButtons();
    } else {
      setError("File must be JSON");
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
        if (file.pathname.endsWith(".json")) {
          fileUrl = file;
          fileName = file.pathname.substring(
            file.pathname.lastIndexOf("/") + 1
          );
        } else {
          throw new Error("File must be JSON");
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
            })
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
        !!(urlInputRef.current?.value && urlInputRef.current?.value !== "")
    );

  return (
    <StepContainer step={1}>
      <p className="mx-auto mb-16 max-w-lg text-center text-xl text-gray-600">
        Drop your spec file, paste a URL to it or paste your whole spec into the
        form below and we’ll analyse it.
      </p>
      <form
        className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md"
        id="upload-form"
        onDragEnter={onDrag}
        onSubmit={onSubmit}
      >
        <input
          type="url"
          ref={urlInputRef}
          onChange={shouldShowButtons}
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
          accept=".json"
        />
        <div className="flex h-[44px]">
          {showButtons && (
            <>
              <button className="icon-button bg-gray-300" onClick={onClear}>
                <XMarkIcon height={24} width={24} className="text-white" />
              </button>

              <button type="submit" className="icon-button bg-gray-900">
                <ChevronRightIcon
                  height={24}
                  width={24}
                  className="text-white"
                />
              </button>
            </>
          )}
        </div>

        {dragActive && (
          <div
            className="absolute inset-0 h-full w-full"
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          />
        )}
      </form>
      <p className="mt-2 h-[16px] text-left text-sm text-red-600">{error}</p>
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
          <li>
            <button
              onClick={onLocalFileUploadClick}
              className="rounded-lg border border-gray-400 bg-transparent p-2 font-medium text-gray-600 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
            >
              Upload an OpenAPI spec
            </button>
          </li>
        </ul>
      </div>
    </StepContainer>
  );
};

export default UploadInterface;
