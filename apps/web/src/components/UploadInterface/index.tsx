"use client";

import { useUploadContext } from "@/contexts/UploadContext";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { DragEvent, FormEvent, useRef, useState } from "react";

const UploadInterface = () => {
  const { step, setNextStep, setIsLoading, setFile, file } = useUploadContext();

  const urlInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showButtons, setShowButtons] = useState(false);

  const onDrag = (e: DragEvent<HTMLFormElement | HTMLDivElement>) => {
    e.preventDefault();

    if (e.type === "dragleave") {
      setDragActive(false);
    } else {
      setDragActive(true);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setError(undefined);
    setDragActive(false);

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];

      if (file.type === "application/json") {
        onFileUpload(file);

        if (urlInputRef.current) {
          urlInputRef.current.value = file.name;
        }

        shouldShowButtons();
      } else {
        setError("File must be JSON");
      }
    }
  };

  const onFileUpload = (file: File) => {
    setFile(file);
    setIsLoading(false);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(undefined);
    setIsLoading(true);

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
        setIsLoading(false);
      }

      if (fileUrl && fileName) {
        try {
          const response = await fetch(fileUrl);

          if (response.status !== 200) {
            throw new Error(`Could not fetch file`);
          }

          const blob = await response.blob();

          onFileUpload(
            new File([blob], fileName, {
              type: blob.type,
            })
          );

          setNextStep();
        } catch (e) {
          console.error((e as Error).message);
          setError((e as Error).message);
          setIsLoading(false);
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
    <div
      className={classNames(" w-full max-w-4xl ", {
        block: step === 1,
        hidden: step !== 1,
      })}
    >
      <form
        className="relative flex w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md"
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

        <div className="flex h-[44px]">
          {showButtons && (
            <>
              <button
                className="mr-2 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border-none bg-gray-300 p-0 text-white"
                onClick={onClear}
              >
                <XMarkIcon height={24} width={24} className="text-white" />
              </button>

              <button
                type="submit"
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border-none bg-gray-900 p-0"
              >
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
    </div>
  );
};

export default UploadInterface;
