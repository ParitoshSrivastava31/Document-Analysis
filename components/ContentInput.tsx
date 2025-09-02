// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

// interface ContentInputProps {
//   onAnalyze: (content: string, type: "url" | "text" | "pdf") => void;
//   disabled: boolean;
// }

// export default function ContentInput({
//   onAnalyze,
//   disabled,
// }: ContentInputProps) {
//   const [activeTab, setActiveTab] = useState<"url" | "text" | "pdf">("url");
//   const [content, setContent] = useState("");
//   const [file, setFile] = useState<File | null>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (activeTab === "pdf" && file) {
//       onAnalyze(file.name, "pdf");
//     } else if (content.trim()) {
//       onAnalyze(content.trim(), activeTab);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile && selectedFile.type === "application/pdf") {
//       setFile(selectedFile);
//     }
//   };

//   return (
//     <Card className="p-6">
//       <div className="space-y-4">
//         {/* Tab Navigation */}
//         <div className="flex space-x-2 border-b">
//           {(["url", "text", "pdf"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 font-medium capitalize transition-colors ${
//                 activeTab === tab
//                   ? "border-b-2 border-blue-500 text-blue-600"
//                   : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               {tab === "url" ? "URL" : tab.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {activeTab === "url" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Article URL
//               </label>
//               <Input
//                 type="url"
//                 placeholder="https://example.com/article"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 className="w-full"
//               />
//             </div>
//           )}

//           {activeTab === "text" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Article Text
//               </label>
//               <textarea
//                 placeholder="Paste your article text here..."
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 rows={8}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
//           )}

//           {activeTab === "pdf" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 PDF File
//               </label>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 onChange={handleFileChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//               {file && (
//                 <p className="mt-2 text-sm text-gray-600">
//                   Selected: {file.name}
//                 </p>
//               )}
//             </div>
//           )}

//           <Button
//             type="submit"
//             disabled={disabled || (!content.trim() && !file)}
//             className="w-full"
//           >
//             {disabled ? "Analyzing..." : "Analyze"}
//           </Button>
//         </form>

//         <div className="text-xs text-gray-500 space-y-1">
//           <p>• URL: Fetches and analyzes web articles</p>
//           <p>• Text: Analyzes pasted content directly</p>
//           <p>• PDF: Extracts and analyzes PDF documents</p>
//         </div>
//       </div>
//     </Card>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X, FileText } from "lucide-react";

interface SourceInput {
  id: string;
  type: "url" | "text" | "pdf";
  content: string;
  file?: File;
}

interface ContentInputProps {
  onAnalyze: (sources: SourceInput[]) => void;
  disabled: boolean;
}

export default function ContentInput({
  onAnalyze,
  disabled,
}: ContentInputProps) {
  const [sources, setSources] = useState<SourceInput[]>([
    { id: "1", type: "url", content: "" },
  ]);

  const addSource = () => {
    setSources([
      ...sources,
      {
        id: Date.now().toString(),
        type: "url",
        content: "",
      },
    ]);
  };

  const removeSource = (id: string) => {
    if (sources.length > 1) {
      setSources(sources.filter((source) => source.id !== id));
    }
  };

  const updateSource = (id: string, field: keyof SourceInput, value: any) => {
    setSources(
      sources.map((source) =>
        source.id === id ? { ...source, [field]: value } : source
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validSources = sources.filter(
      (source) => source.content.trim() || source.file
    );
    if (validSources.length > 0) {
      onAnalyze(validSources);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Compare Sources</h2>
          <Button
            onClick={addSource}
            variant="outline"
            size="sm"
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Source
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sources.map((source, index) => (
            <div key={source.id} className="border rounded-lg p-4 relative">
              {sources.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSource(source.id)}
                  className="absolute top-2 right-2"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Source {index + 1}
                </span>
                <div className="flex space-x-1">
                  {(["url", "text", "pdf"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateSource(source.id, "type", type)}
                      className={`px-2 py-1 text-xs rounded ${
                        source.type === type
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      disabled={disabled}
                    >
                      {type === "url" ? "URL" : type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {source.type === "url" && (
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={source.content}
                  onChange={(e) =>
                    updateSource(source.id, "content", e.target.value)
                  }
                  disabled={disabled}
                />
              )}

              {source.type === "text" && (
                <textarea
                  placeholder="Paste article text here..."
                  value={source.content}
                  onChange={(e) =>
                    updateSource(source.id, "content", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={disabled}
                />
              )}

              {source.type === "pdf" && (
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateSource(source.id, "file", file);
                        updateSource(source.id, "content", file.name);
                      }
                    }}
                    className="w-full"
                    disabled={disabled}
                  />
                  {source.file && (
                    <p className="mt-2 text-sm text-gray-600 flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {source.file.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={
              disabled || sources.every((s) => !s.content.trim() && !s.file)
            }
            className="w-full"
          >
            {disabled
              ? "Analyzing..."
              : `Compare ${sources.length} Source${
                  sources.length > 1 ? "s" : ""
                }`}
          </Button>
        </form>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Add multiple sources to compare claims and identify consensus</p>
          <p>
            • The system will identify consistent and contradictory information
          </p>
          <p>• Works with URLs, text, and PDFs</p>
        </div>
      </div>
    </Card>
  );
}
