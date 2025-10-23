import React from "react";

export function ResponseViewer({ response }) {
  if (!response) return null;
  return (
    <div className="mt-6 bg-gray-100 p-4 rounded-lg border overflow-auto max-h-96">
      <h2 className="text-lg font-semibold mb-2">Parsed Response</h2>
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}
