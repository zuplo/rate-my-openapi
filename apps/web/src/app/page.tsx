const HomePage = () => {
  return (
    <main className="flex h-[calc(100%-64px)] w-full flex-col items-center justify-center">
      <div className="max-w-[450px]">
        <h2 className="mb-2 text-center text-xl">
          Upload your OpenAPI file and we&apos;ll review it for you
        </h2>
        <div className="mb-6 flex flex-col items-center rounded border border-gray-300 bg-gray-200 p-4 py-24">
          <label className="mb-4 block" htmlFor="drag-upload">
            Drag your OpenAPI file here to upload
          </label>
          <input className="hidden" type="file" name="drag-upload" />
          <button>choose file</button>
        </div>
        <div className="flex flex-nowrap gap-3">
          <input
            type="url"
            className="w-full rounded border border-gray-300 bg-gray-200 px-3"
            placeholder="Or enter OpenAPI file URL here"
            aria-label="Or enter OpenAPI file URL here"
          />
          <button>Submit</button>
        </div>
      </div>

      <div className="max-w-[450px]">
        <label htmlFor="email" className="mb-3 block text-xl">
          Enter your email address so we can send your report when it&apos;s
          ready
        </label>
        <div className="flex flex-nowrap gap-3">
          <input
            type="url"
            className="w-full rounded border border-gray-300 bg-gray-200 px-3"
          />
          <button>Submit</button>
        </div>
      </div>

      <div>
        <p className="mx-auto mb-2 w-[155px] text-3xl after:inline-block after:w-0 after:animate-ellipsis after:overflow-hidden after:align-bottom after:content-['\2026']">
          Analyzing
        </p>
        <p className="text-center text-xl">
          Your report should be ready in a few minutes
        </p>
      </div>
    </main>
  );
};

export default HomePage;
