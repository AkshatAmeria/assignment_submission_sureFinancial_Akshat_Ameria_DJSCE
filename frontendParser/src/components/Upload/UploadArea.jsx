import React, { useState, useRef } from "react";
import { uploadPDFs } from "../../utils/api.js";

export default function UploadArea({ mode, setMode, onFilesParsed }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const MAX_FILES = 10;

  const handleFiles = (inputFiles) => {
    const arr = Array.from(inputFiles).filter((f) => f.type === "application/pdf");
    if (mode === "single" && arr.length > 1) setFiles([arr[0]]);
    else if (mode === "multiple") {
      const merged = [...files, ...arr].slice(0, MAX_FILES);
      setFiles(merged);
    } else setFiles(arr.slice(0, 1));
  };

  const handleSubmit = async () => {
    setError(null);
    if (files.length === 0) return setError("Please upload at least one PDF.");

    setLoading(true);
    try {
      const result = await uploadPDFs(mode, files);
      onFilesParsed(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Upload Credit Card Statements
      </h2>

      
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            mode === "single"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setMode("single")}
        >
          Single
        </button>
        <button
          className={`px-5 py-2 rounded-lg font-medium transition-all ${
            mode === "multiple"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setMode("multiple")}
        >
          Multiple (up to 10)
        </button>
      </div>

      
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple={mode === "multiple"}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <p className="text-lg text-gray-700 mb-2 font-medium">
          Drag & Drop your PDF files here
        </p>
        <p className="text-sm text-gray-500">or click to browse from your computer</p>
      </div>

     
      {files.length > 0 && (
        <ul className="mt-6 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-100 p-3 rounded-lg text-gray-800 text-base"
            >
              <span className="truncate w-3/4">{f.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      
      {error && <div className="text-red-600 mt-4 text-sm text-center">{error}</div>}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all disabled:opacity-60"
        >
          {loading ? "Parsing..." : "Parse PDFs"}
        </button>
      </div>
    </div>
  );
}
