// ------------ NEW CODE -----------------------//
//-------> OLD CODE IS STILL AT BOTTOM SECTION ---------//



"use in client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileText, X, CheckCircle } from "lucide-react";
import AppHeader from "@/app/_components/AppHeader";

// NEW: Import the Zustand store
import { useUploadStore } from "@/lib/store";

// ... Stepper component (No change here) ...

const UploadPage = () => {
  const t = useTranslations("crop-analysis.upload");
  const [uploadedFile, setUploadedFile] = useState < File | null > (null); // MODIFIED: State for a single file
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // NEW: Get the function to set the file in our store ("digital tray")
  const setSoilReportFile = useUploadStore((state) => state.setSoilReportFile);

  // This function will handle the selected file
  const processFile = (file) => {
    if (file) {
      setUploadedFile(file); // Update UI to show the selected file
      setSoilReportFile(file); // NEW: Save the file to our Zustand store ("digital tray")
      simulateUpload();
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // MODIFIED: handleDrop to process a single file and save to store
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const file = Array.from(e.dataTransfer.files).find(f => allowedTypes.includes(f.type));
    processFile(file);
  }, [setSoilReportFile]);

  // MODIFIED: handleFileSelect to process a single file and save to store
  const handleFileSelect = useCallback((e) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const file = Array.from(e.target.files || []).find(f => allowedTypes.includes(f.type));
    processFile(file);
  }, [setSoilReportFile]);

  const simulateUpload = () => {
    // ... (This function remains the same) ...
  };

  // MODIFIED: To remove the single file
  const removeFile = () => {
    setUploadedFile(null);
    setSoilReportFile(null); // NEW: Also remove from the store
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* ... Header and Stepper (No change) ... */}
      <AppHeader>{/* ... */}</AppHeader>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* ... Stepper Component ... */}

          <Card className="mb-6 sm:mb-8 border-neutral-200 dark:border-neutral-700">
            {/* ... CardHeader ... */}
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div
                // ... className and drag-drop handlers
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* ... Upload Icon and text ... */}
                <input
                  type="file"
                  // MODIFIED: Accept images as well
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <Button asChild /* ... */ >
                  <label htmlFor="file-input" className="cursor-pointer">
                    {t("dropzone.browseButton")}
                  </label>
                </Button>
                {/* ... supported formats text ... */}
              </div>

              {/* ... Upload Progress Bar (No change) ... */}
            </CardContent>
          </Card>

          {/* MODIFIED: Uploaded Files List to show only one file */}
          {uploadedFile && (
            <Card className="mb-6 sm:mb-8 border-neutral-200 dark:border-neutral-700">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                 <CardTitle className="flex items-center text-base sm:text-lg text-neutral-900 dark:text-white">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-2 flex-shrink-0" />
                  <span className="break-words">
                    {t("uploadedFiles.title", { count: 1 })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 gap-2 sm:gap-3">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                        {uploadedFile.name}
                      </p>
                      {/* ... file size ... */}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            {/* ... Back to Home button ... */}
            
            {/* MODIFIED: "Next Step" button now depends on `uploadedFile` state */}
            {uploadedFile && (
              <Button size="lg" asChild /* ... */ >
                <Link href="/crop-analysis/questionnaire">
                  {t("buttons.continueToQuestionnaire")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

//////// ------- PREVIOUS CODE ------------------/////////

// "use client";
// import { useState, useCallback } from "react";
// import Link from "next/link";
// import { useTranslations } from "next-intl";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { ArrowLeft, Upload, FileText, X, CheckCircle } from "lucide-react";
// import AppHeader from "@/app/_components/AppHeader";

// // Simple stepper for progress indication
// const Stepper = ({ activeIndex }: { activeIndex: number }) => {
//   const t = useTranslations("crop-analysis.upload.stepper");
//   const steps = [
//     { label: t("step1") },
//     { label: t("step2") },
//     { label: t("step3") },
//   ];
//   return (
//     <div className="mb-6 md:mb-8">
//       {/* Desktop/Tablet Stepper */}
//       <div className="hidden sm:block">
//         <div className="flex items-center justify-between mb-4">
//           {steps.map((step, idx) => (
//             <div
//               key={step.label}
//               className={`flex items-center space-x-2 ${
//                 idx > activeIndex ? "opacity-50" : ""
//               }`}
//             >
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
//                   idx === activeIndex
//                     ? "bg-gradient-to-br from-primary-500 to-secondary-600 text-white"
//                     : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
//                 }`}
//               >
//                 {idx + 1}
//               </div>
//               <span
//                 className={`font-semibold text-sm md:text-base ${
//                   idx === activeIndex
//                     ? "text-primary-600 dark:text-primary-400"
//                     : "text-neutral-500 dark:text-neutral-400"
//                 }`}
//               >
//                 {step.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
      
//       {/* Mobile Stepper */}
//       <div className="sm:hidden">
//         <div className="flex items-center justify-center mb-3">
//           <div className="flex items-center space-x-2">
//             <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-primary-500 to-secondary-600 text-white">
//               {activeIndex + 1}
//             </div>
//             <span className="font-semibold text-primary-600 dark:text-primary-400">
//               {steps[activeIndex].label}
//             </span>
//           </div>
//         </div>
//         <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 mb-3">
//           Step {activeIndex + 1} of {steps.length}
//         </div>
//       </div>
      
//       <Progress
//         value={((activeIndex + 1) / steps.length) * 100}
//         className="h-2"
//       />
//     </div>
//   );
// };

// const UploadPage = () => {
//   const t = useTranslations("crop-analysis.upload");
//   const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   // Handlers for drag & drop
//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const files = Array.from(e.dataTransfer.files).filter(
//       (file) => file.type === "application/pdf"
//     );
//     if (files.length > 0) {
//       setUploadedFiles((prev) => [...prev, ...files]);
//       simulateUpload();
//     }
//   }, []);

//   const handleFileSelect = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const files = Array.from(e.target.files || []).filter(
//         (file) => file.type === "application/pdf"
//       );
//       if (files.length > 0) {
//         setUploadedFiles((prev) => [...prev, ...files]);
//         simulateUpload();
//       }
//     },
//     []
//   );

//   const simulateUpload = () => {
//     setUploadProgress(0);
//     const interval = setInterval(() => {
//       setUploadProgress((prev) => {
//         if (prev >= 100) {
//           clearInterval(interval);
//           return 100;
//         }
//         return prev + 10;
//       });
//     }, 200);
//   };

//   const removeFile = (index: number) => {
//     setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="min-h-screen bg-white dark:bg-neutral-900">
//       {/* Header, navigation, branding */}
//       <AppHeader>
//         <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
//           <div className="flex items-center justify-center">
//             <div className="flex items-center space-x-2">
//               <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
//                 <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//               </div>
//               <div className="flex-1 flex justify-center">
//                 <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
//                   {t("pageTitle")}
//                 </h1>
//               </div>
//             </div>
//           </div>
//         </div>
//       </AppHeader>

//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Stepper Component */}
//           <Stepper activeIndex={0} />

//           {/* Upload Card */}
//           <Card className="mb-6 sm:mb-8 border-neutral-200 dark:border-neutral-700">
//             <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
//               <CardTitle className="text-xl sm:text-2xl text-neutral-900 dark:text-white">
//                 {t("card.title")}
//               </CardTitle>
//               <CardDescription className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
//                 {t("card.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
//               <div
//                 className={`border-2 border-dashed rounded-lg p-6 sm:p-8 md:p-12 text-center transition-all duration-300 ${
//                   isDragOver
//                     ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-105"
//                     : "border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
//                 }`}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//               >
//                 <Upload className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-neutral-400 dark:text-neutral-500 mx-auto mb-3 sm:mb-4" />
//                 <h3 className="text-lg sm:text-xl font-semibold mb-2 text-neutral-900 dark:text-white px-2">
//                   {t("dropzone.title")}
//                 </h3>
//                 <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6 px-2">
//                   {t("dropzone.subtitle")}
//                 </p>
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="hidden"
//                   id="file-input"
//                 />
//                 <Button
//                   size="lg"
//                   asChild
//                   className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white w-full sm:w-auto"
//                 >
//                   <label htmlFor="file-input" className="cursor-pointer">
//                     {t("dropzone.browseButton")}
//                   </label>
//                 </Button>
//                 <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-3 sm:mt-4 px-2">
//                   {t("dropzone.supportedFormats")}
//                 </p>
//               </div>

//               {uploadProgress > 0 && uploadProgress < 100 && (
//                 <div className="mt-4 sm:mt-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
//                       {t("uploadProgress.uploading")}
//                     </span>
//                     <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
//                       {t("uploadProgress.percentage", { percent: uploadProgress })}
//                     </span>
//                   </div>
//                   <Progress value={uploadProgress} className="h-2" />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Uploaded Files List */}
//           {uploadedFiles.length > 0 && (
//             <Card className="mb-6 sm:mb-8 border-neutral-200 dark:border-neutral-700">
//               <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
//                 <CardTitle className="flex items-center text-base sm:text-lg text-neutral-900 dark:text-white">
//                   <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success mr-2 flex-shrink-0" />
//                   <span className="break-words">
//                     {t("uploadedFiles.title", { count: uploadedFiles.length })}
//                   </span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
//                 <div className="space-y-2 sm:space-y-3">
//                   {uploadedFiles.map((file, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-3 sm:p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 gap-2 sm:gap-3"
//                     >
//                       <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
//                         <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
//                         <div className="min-w-0 flex-1">
//                           <p className="font-medium text-sm sm:text-base text-neutral-900 dark:text-white truncate">
//                             {file.name}
//                           </p>
//                           <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
//                             {t("uploadedFiles.fileSize", { size: (file.size / 1024 / 1024).toFixed(2)  })}
//                           </p>
//                         </div>
//                       </div>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeFile(index)}
//                         className="hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
//             <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto">
//               <Link href="/">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 {t("buttons.backToHome")}
//               </Link>
//             </Button>
            
//             {/* Next Step Button */}
//             {uploadedFiles.length > 0 && (
//               <Button
//                 size="lg"
//                 className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
//                 asChild
//               >
//                 <Link href="/crop-analysis/questionnaire">
//                   {t("buttons.continueToQuestionnaire")}
//                 </Link>
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadPage;