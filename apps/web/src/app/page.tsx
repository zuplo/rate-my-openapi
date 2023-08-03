import AnalyzingText from "@/components/AnalyzingText";
import EmailInput from "@/components/EmailInput";
import UploadInterface from "@/components/UploadInterface";

import { UploadContextProvider } from "@/contexts/UploadContext";

const HomePage = () => (
  <main className="flex w-full flex-col items-center justify-center py-4">
    <h2 className="mb-6 max-w-2xl text-center text-5xl font-bold md:mb-16 md:text-7xl">
      Rate & improve your API in a blink
    </h2>
    <AnalyzingText />
    <UploadContextProvider>
      <div className="grid w-full max-w-4xl grid-cols-1">
        <UploadInterface />
        <EmailInput />
        <AnalyzingText />
      </div>
    </UploadContextProvider>
  </main>
);

export default HomePage;
