import AnalyzingText from "@/components/AnalyzingText";
import EmailInput from "@/components/EmailInput";
import FileUpload from "@/components/FileUpload";
import { UploadContextProvider } from "@/contexts/UploadContext";
import { useState } from "react";

const HomePage = () => (
  <main className="flex h-[calc(100%-64px)] w-full flex-col items-center justify-center">
    <UploadContextProvider>
      <FileUpload />
      <EmailInput />
      <AnalyzingText />
    </UploadContextProvider>
  </main>
);

export default HomePage;
