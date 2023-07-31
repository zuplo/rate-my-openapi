import AnalyzingText from "@/components/AnalyzingText";
import EmailInput from "@/components/EmailInput";
import UploadInterface from "@/components/UploadInterface";
import { UploadContextProvider } from "@/contexts/UploadContext";

const HomePage = () => (
  <main className="flex h-full min-h-[800px] w-full flex-col items-center justify-center">
    <h2 className="mb-16 max-w-2xl text-center text-5xl font-bold md:text-7xl">
      Rate & improve your API in a blink
    </h2>
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
