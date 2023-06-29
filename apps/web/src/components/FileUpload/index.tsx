import classNames from "classnames";
import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";

const FileUpload = ({ setNextStep }: { setNextStep: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (e.type === "dragleave") {
      setDragActive(false);
    } else {
      setDragActive(true);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDragActive(false);

    if (e.dataTransfer.files.length) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = () => setNextStep();

  const onFileUpload = (file: File) => {
    console.log(file);

    onSubmit();
  };

  const onUrlInputSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urlInput = urlInputRef.current;
    if (urlInput?.value && urlInput?.validity.valid) {
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

          onFileUpload(
            new File([blob], fileName, {
              type: blob.type,
            })
          );
        } catch (e) {
          console.error((e as Error).message);
          setError((e as Error).message);
        }
      }
    }
  };

  return (
    <div className="max-w-[450px]">
      <h2 className="mb-2 text-center text-xl">
        Upload your OpenAPI file and we&apos;ll review it for you
      </h2>
      <div
        onDragEnter={onDrag}
        className={classNames(
          "relative mb-6 flex flex-col items-center rounded border  p-4 py-24",
          {
            "border-gray-300 bg-gray-200": !dragActive,
            "border-gray-400 bg-gray-300": dragActive,
          }
        )}
      >
        <label className="mb-4 block" htmlFor="drag-upload">
          Drag your OpenAPI file here to upload
        </label>
        <input
          ref={fileInputRef}
          onChange={onChange}
          className="hidden"
          type="file"
          name="drag-upload"
          accept=".json"
        />
        <button onClick={onClick}>choose file</button>
        {dragActive && (
          <div
            className="absolute inset-0 h-full w-full"
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
          />
        )}
      </div>
      <form className="flex flex-nowrap gap-3" onSubmit={onUrlInputSubmit}>
        <input
          type="url"
          ref={urlInputRef}
          className="w-full rounded border border-gray-300 bg-gray-200 px-3"
          placeholder="Or enter OpenAPI file URL here"
          aria-label="Or enter OpenAPI file URL here"
        />
        <button>Submit</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
