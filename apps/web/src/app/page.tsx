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
  <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-12 px-6">
    <section className="flex w-full max-w-3xl flex-col items-center gap-4 pt-4 text-center md:pt-10">
      <span className="tag tag-accent is-caps">OpenAPI Quality Checker</span>
      <h1 className="font-display text-fg text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
        We rate your OpenAPI
      </h1>
      <p className="text-fg-muted max-w-xl text-balance md:text-[15px]">
        Upload a spec or paste a URL and we&apos;ll grade documentation,
        completeness, SDK readiness and security in under a minute.
      </p>
    </section>

    <UploadContextProvider>
      <div className="grid w-full max-w-2xl grid-cols-1">
        <UploadInterface />
        <EmailInput />
        <AnalyzingText />
      </div>
    </UploadContextProvider>

    <section className="grid w-full gap-6 md:grid-cols-3">
      <PageBox>
        <h3 className="font-display text-fg text-base font-semibold">
          Use the CLI
        </h3>
        <p className="text-fg-muted text-sm">
          For developers who prefer the command line or need quality checks in
          their dev workflow.
        </p>
        <pre className="border-border bg-bg-subtle mt-auto overflow-x-auto rounded-md border px-3 py-3 font-mono text-xs leading-relaxed whitespace-pre">
          <code>
            <span className="text-fg">npx rmoa lint </span>
            <span className="text-info">--filename</span>
            <span> </span>
            <span className="text-accent">&quot;api.json&quot;</span>
            <br />
            <span className="text-info"> --api-key </span>
            <span className="text-accent">&quot;****&quot;</span>
          </code>
        </pre>
        <NavigateButton
          label="Get started"
          url="https://www.npmjs.com/package/rmoa"
          variant="primary"
        />
      </PageBox>

      <PageBox>
        <h3 className="font-display text-fg text-base font-semibold">
          Use our GitHub Action
        </h3>
        <p className="text-fg-muted text-sm">
          Integrate with any repo to run on Pull Requests and pushes for
          continuous quality monitoring.
        </p>
        <pre className="border-border bg-bg-subtle text-fg mt-auto overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre">
          <code>{gitHubActionCodeSample}</code>
        </pre>
        <NavigateButton
          label="Learn more"
          url="https://github.com/marketplace/actions/rate-my-openapi-action"
        />
      </PageBox>

      <PageBox>
        <h3 className="font-display text-fg text-base font-semibold">
          Use our API
        </h3>
        <p className="text-fg-muted text-sm">
          Build your own tools and integrations on top of Rate My OpenAPI.
        </p>
        <div className="bg-bg-subtle mt-auto grid place-items-center rounded-md py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/build-crane-logo.png"
            width={120}
            alt="Build your tools with the API"
          />
        </div>
        <NavigateButton
          label="View docs"
          url="https://api.ratemyopenapi.com/docs"
        />
      </PageBox>
    </section>

    <DynamicBackground />
  </div>
);

export default HomePage;
