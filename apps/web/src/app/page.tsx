import AnalyzingText from "@/components/AnalyzingText";
import DynamicBackground from "@/components/DynamicBackground";
import EmailInput from "@/components/EmailInput";
import UploadInterface from "@/components/UploadInterface";

import { UploadContextProvider } from "@/contexts/UploadContext";

const HomePage = () => (
  <div className="mx-4 flex flex-col items-center justify-center md:mx-0 md:mt-10">
    <h2 className="mb-12 mt-4 max-w-3xl text-center text-5xl font-bold md:mb-16 md:mt-0 md:text-7xl">
      Upload your OpenAPI.
      <br />
      We rate it.
    </h2>
    <UploadContextProvider>
      <div className="grid w-full max-w-4xl grid-cols-1">
        <UploadInterface />
        <EmailInput />
        <AnalyzingText />
      </div>
    </UploadContextProvider>
    <DynamicBackground />
  </div>
);

export default HomePage;
