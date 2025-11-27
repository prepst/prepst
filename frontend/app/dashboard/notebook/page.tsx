"use client";

import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notebook } from "lucide-react";

export default function NotebookPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Ensure iframe loads properly
    if (iframeRef.current) {
      iframeRef.current.src = "https://dev-integration-1.emergent.host/";
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-full h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Notebook className="w-8 h-8" />
          Notebook
        </h1>
        <p className="text-gray-600">
          Interactive notebook environment for your work
        </p>
      </div>

      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Notebook Environment</CardTitle>
          <CardDescription>Your notebook is loaded below</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            src="https://dev-integration-1.emergent.host/"
            className="w-full h-full border-0"
            title="Notebook"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </CardContent>
      </Card>
    </div>
  );
}
