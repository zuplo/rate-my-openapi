import AnalyzingText from "@/components/AnalyzingText";
import DynamicBackground from "@/components/DynamicBackground";
import EmailInput from "@/components/EmailInput";
import UploadInterface from "@/components/UploadInterface";
import { UploadContextProvider } from "@/contexts/UploadContext";
import { PageBox } from "@/components/PageBox";
import NavigateButton from "@/components/NavigateButton";

const gitHubActionCodeSample = `- uses: zuplo/rmoa-action@v1
    with:
      filepath: './my-api.json'
      apikey: \${{ secrets.API_KEY }}`;

const HomePage = () => (
  <div className="mx-4 mt-10 flex flex-col items-center justify-center md:mx-0 md:mt-8">
    <h2 className="xl:mb-20 xl:text-7xl mb-10 mt-4 max-w-3xl text-center text-4xl font-bold md:mb-14 md:mt-0 md:text-6xl">
      We rate your OpenAPI
    </h2>
    <UploadContextProvider>
      <div className="grid w-full max-w-4xl grid-cols-1">
        <UploadInterface />
        <EmailInput />
        <AnalyzingText />
      </div>
    </UploadContextProvider>
    <div className="mb-4 grid gap-10 md:grid-cols-3">
      <PageBox>
        <h3 className="text-lg font-medium">Use the CLI</h3>
        <p>
          Perfect for developers who prefer working from the command line or
          need to integrate quality checks into their development workflow.
        </p>
        <pre className="mt-auto whitespace-pre-wrap rounded-md bg-gray-100 px-2 py-6 font-mono text-xs">
          <code>
            <span>npx rmoa lint </span>
            <span style={{ color: "rgb(54, 172, 170)" }}>--filename</span>
            <span> </span>
            <span style={{ color: "rgb(227, 17, 108)" }}>
              &quot;api.json&quot;
            </span>
            <span style={{ color: "rgb(54, 172, 170)" }}> --api-key </span>
            <span style={{ color: "rgb(227, 17, 108)" }}>&quot;****&quot;</span>
          </code>
        </pre>

        <NavigateButton
          label={"Get started"}
          url={"https://www.npmjs.com/package/rmoa"}
        />
      </PageBox>

      <PageBox>
        <h3 className="text-lg font-medium">Use our GitHub Action</h3>
        <p>
          Seamlessly integrates with your repository to run on Pull Requests and
          Pushes to ensure continuous quality monitoring and feedback.
        </p>
        <pre className="mt-auto whitespace-pre-wrap rounded-md bg-gray-100 p-2 font-mono text-xs">
          <code>{gitHubActionCodeSample}</code>
        </pre>

        <NavigateButton
          label={"Learn more"}
          url={"https://github.com/marketplace/actions/rate-my-openapi-action"}
        />
      </PageBox>

      <PageBox>
        <h3 className="text-lg font-medium">Use our API</h3>
        <p>
          Great option for those developers that want to build their own tools
          or their own integration to Rate My OpenAPI.
        </p>
        <div className="grid place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/build-crane-logo.png"
            width={130}
            alt="Build your tools with the API"
          />
        </div>

        <NavigateButton
          label={"View docs"}
          url={"https://api.ratemyopenapi.com/docs"}
        />
      </PageBox>
    </div>

    <DynamicBackground />
  </div>
);

export default HomePage;
