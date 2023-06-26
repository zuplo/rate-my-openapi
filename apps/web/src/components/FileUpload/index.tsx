import classNames from "classnames";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

const FileUpload = ({ setNextStep }: { setNextStep: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);

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
      onFileUpload(e.dataTransfer.files);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFileUpload(e.target.files);
    }
  };

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = () => setNextStep();

  const onFileUpload = (files: FileList) => {
    console.log(files.length);

    onSubmit();
  };

  const onUrlInputSubmit = () => {
    console.log(urlInputRef.current?.value);

    onSubmit();
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
      <div className="flex flex-nowrap gap-3">
        <input
          type="url"
          ref={urlInputRef}
          className="w-full rounded border border-gray-300 bg-gray-200 px-3"
          placeholder="Or enter OpenAPI file URL here"
          aria-label="Or enter OpenAPI file URL here"
        />
        <button onClick={onUrlInputSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default FileUpload;
