import AnalyzingText from "@/components/AnalyzingText";
import DynamicBackground from "@/components/DynamicBackground";
import EmailInput from "@/components/EmailInput";
import UploadInterface from "@/components/UploadInterface";

import { UploadContextProvider } from "@/contexts/UploadContext";
import { PageBox } from "@/components/PageBox";

const HomePage = () => (
  <div className="mx-4 flex flex-col items-center justify-center md:mx-0 md:mt-10">
    <h2 className="mb-12 mt-4 max-w-3xl text-center text-5xl font-bold md:mb-16 md:mt-0 md:text-7xl">
      We rate your OpenAPl
    </h2>
    <UploadContextProvider>
      <div className="grid w-full max-w-4xl grid-cols-1">
        <UploadInterface />
        <EmailInput />
        <AnalyzingText />
      </div>
      <div className="mb-4 grid grid-cols-3 gap-10">
        <PageBox>
          <h3 className="text-lg font-medium">Use CLI</h3>
          <p>
            Use our CLI in your favorite IDE to get real-time feedback on your
            OpenAPI doc.
          </p>
          <pre className="whitespace-pre-wrap rounded-md bg-gray-100 p-2 font-mono text-xs">
            <code>
              <span>npx rmoa lint </span>
              <span style={{ color: "rgb(54, 172, 170)" }}>--filename</span>
              <span> </span>
              <span style={{ color: "rgb(227, 17, 108)" }}>
                &quot;file&quot;
              </span>
              <span style={{ color: "rgb(54, 172, 170)" }}> --api-key </span>
              <span style={{ color: "rgb(227, 17, 108)" }}>
                &quot;****&quot;
              </span>
            </code>
          </pre>
        </PageBox>
        <PageBox>
          <h3 className="text-lg font-medium">Use our GitHub Action</h3>
          <p>
            Use the github action to block builds that don&apos;t meet your
            standards and get automated reports on every commit.
          </p>
          <pre className="whitespace-pre-wrap rounded-md bg-gray-100 p-2 font-mono text-xs">
            <code>{`steps:
  - uses: actions/checkout@v4
  - uses: zuplo/rmoa-action@v1
    with:
      filepath: './my-api.json'
      apikey: \${{ secrets.RMOA_API_KEY }}`}</code>
          </pre>
        </PageBox>
        <PageBox>
          <h3 className="text-lg font-medium">Use our API</h3>
          <p>
            Build your own integration to ratemyopenapi with our API - get a
            free API key and check out the docs.
          </p>
          <div className="grid place-items-center">
            {/* TODO quick hack to get this image in */}
            <img
              src="data:image/png;base64,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"
              width={150}
            />
          </div>
        </PageBox>
      </div>
    </UploadContextProvider>
    <DynamicBackground />
  </div>
);

export default HomePage;
