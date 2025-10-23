import React from "react";

export default function ModeSelector({ mode, setMode }) {
  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => setMode("single")}
        className={`px-3 py-1 rounded-lg border ${
          mode === "single"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        Single
      </button>
      <button
        onClick={() => setMode("multiple")}
        className={`px-3 py-1 rounded-lg border ${
          mode === "multiple"
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        Multiple (up to 10)
      </button>
    </div>
  );
}
