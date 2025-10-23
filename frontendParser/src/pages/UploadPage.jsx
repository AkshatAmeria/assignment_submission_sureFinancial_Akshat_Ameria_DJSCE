

import React, { useState } from "react";
import UploadArea from "../components/Upload/UploadArea";
import { ResponseViewer } from "../components/Upload/ResponseViewer";
import TransactionPieAndTable from "../components/Graphs/TransactionPieAndTable";

// export default function UploadPage() {
//   const [mode, setMode] = useState("single");
//   const [parsedResults, setParsedResults] = useState([]);

//   const handleParsedResults = (response) => {
//     if (!response) return setParsedResults([]);

//     // --- Normalize backend response ---
//     if (mode === "single") {
//       // single file → backend may return an object directly
//       const result = response?.extracted ? response : response?.results?.[0];
//       setParsedResults(result ? [result] : []);
//     } else if (mode === "multiple") {
//       // multiple → expect array
//       if (Array.isArray(response.results)) {
//         setParsedResults(response.results);
//       } else if (Array.isArray(response)) {
//         setParsedResults(response);
//       } else {
//         setParsedResults([]);
//       }
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto mt-10 p-6">
//       <UploadArea mode={mode} setMode={setMode} onFilesParsed={handleParsedResults} />

//       {parsedResults.length === 0 ? (
//         <p className="text-center text-gray-500 mt-6">
//           Upload one or more PDF statements to see insights.
//         </p>
//       ) : (
//         parsedResults.map((item, index) => (
//           <div
//             key={index}
//             className="mt-10 p-6 bg-gray-50 rounded-2xl shadow-inner border border-gray-200"
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-indigo-700 text-center">
//               🏦 {item.bank || "Unknown Bank"} — {item.filename || `Statement ${index + 1}`}
//             </h2>

//             {/* Summary Info Boxes */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//               {item.extracted?.cardholder && (
//                 <SummaryBox label="Cardholder" value={item.extracted.cardholder} />
//               )}
//               {item.extracted?.statementDate && (
//                 <SummaryBox label="Statement Date" value={item.extracted.statementDate} />
//               )}
//               {item.extracted?.dueDate && (
//                 <SummaryBox label="Due Date" value={item.extracted.dueDate} />
//               )}
//               {item.extracted?.totalDue && (
//                 <SummaryBox label="Total Due" value={`₹${item.extracted.totalDue}`} />
//               )}
//               {item.extracted?.minDue && (
//                 <SummaryBox label="Min. Due" value={`₹${item.extracted.minDue}`} />
//               )}
//             </div>

//             {/* Optional JSON viewer */}
//             <div className="mt-6">
//               <ResponseViewer response={item} />
//             </div>

//             {/* Chart + Transactions */}
//             <TransactionPieAndTable
//               categoryData={item.insights?.insights?.category_breakdown}
//               transactions={item.extracted?.transactions}
//               unusualCharges={item.insights?.insights?.unusual_charges}
//             />
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// function SummaryBox({ label, value }) {
//   return (
//     <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
//       <span className="text-gray-500 text-sm">{label}</span>
//       <span className="text-lg font-semibold">{value}</span>
//     </div>
//   );
// }





export default function UploadPage() {
  const [mode, setMode] = useState("single");
  const [parsedResults, setParsedResults] = useState([]);

  const handleParsedResults = (response) => {
    if (!response) return setParsedResults([]);

    if (mode === "single") {
      const result = response?.extracted ? response : response?.results?.[0];
      setParsedResults(result ? [result] : []);
    } else if (mode === "multiple") {
      if (Array.isArray(response.results)) {
        setParsedResults(response.results);
      } else if (Array.isArray(response)) {
        setParsedResults(response);
      } else {
        setParsedResults([]);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <UploadArea mode={mode} setMode={setMode} onFilesParsed={handleParsedResults} />

      {parsedResults.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">
          Upload one or more PDF statements to see insights.
        </p>
      ) : (
        parsedResults.map((item, index) => (
          <div
            key={index}
            className="mt-10 p-6 bg-gray-50 rounded-2xl shadow-inner border border-gray-200"
          >
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700 text-center">
              🏦 {item.bank || "Unknown Bank"} — {item.filename || `Statement ${index + 1}`}
            </h2>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {item.extracted?.cardholder && (
                <SummaryBox label="Cardholder" value={item.extracted.cardholder} />
              )}
              {item.extracted?.statementDate && (
                <SummaryBox label="Statement Date" value={item.extracted.statementDate} />
              )}
              {item.extracted?.dueDate && (
                <SummaryBox label="Due Date" value={item.extracted.dueDate} />
              )}
              {item.extracted?.totalDue && (
                <SummaryBox label="Total Due" value={`₹${item.extracted.totalDue}`} />
              )}
              {item.extracted?.minDue && (
                <SummaryBox label="Min. Due" value={`₹${item.extracted.minDue}`} />
              )}


                
  {item.insights?.insights?.quantitative_summary_metrics?.averageTransactionSize && (
    <SummaryBox
      label="Avg. Transaction Size"
      value={`₹${item.insights.insights.quantitative_summary_metrics.averageTransactionSize}`}
    />
  )}
  {item.insights?.insights?.quantitative_summary_metrics?.highestSpendingCategory && (
    <SummaryBox
      label={`Highest Spending: ${item.insights.insights.quantitative_summary_metrics.highestSpendingCategory.name}`}
      value={`₹${item.insights.insights.quantitative_summary_metrics.highestSpendingCategory.amount}`}
    />
  )}
            </div>

           
            {item.insights?.insights?.summary && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">📄 Summary</h3>
                <p className="text-gray-600">{item.insights.insights.summary}</p>
              </div>
            )}

             {item.insights?.insights?.recommendations && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">✨ recommendations</h3>
                <p className="text-gray-600">{item.insights.insights.recommendations}</p>
              </div>
            )}

           
            <div className="mt-6">
              <ResponseViewer response={item} />
            </div>

            
            <TransactionPieAndTable
              categoryData={item.insights?.insights?.category_breakdown}
              transactions={item.extracted?.transactions}
              unusualCharges={item.insights?.insights?.unusual_charges}
            />
          </div>
        ))
      )}
    </div>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
