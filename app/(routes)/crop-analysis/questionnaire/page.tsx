// --------- NEW CODE ----------//
// ------------ THE PREVIOUS ONE IS STILL AT BOTTOM (COMMENTED)----//

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, MapPin, Wheat, Droplets, Loader2 } from "lucide-react"; // NEW: Import Loader2 for loading spinner
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import AppHeader from "@/app/_components/AppHeader";
// NEW: Import the router for navigation and the Zustand store to get files
import { useRouter } from "next/navigation";
import { useUploadStore } from "@/lib/store";

const QuestionnairePage = () => {
  const t = useTranslations("crop-analysis.questionnaire");
  const router = useRouter(); // NEW: Initialize router
  
  // NEW: Get the uploaded file(s) from our "digital tray" (Zustand store)
  const { soilReportFile, cropImageFile } = useUploadStore();

  const [currentStep, setCurrentStep] = useState(1);

  // MODIFIED: formData state keys are renamed to match the backend API
  const [formData, setFormData] = useState({
    village_city: "", // location -> village_city
    state: "",
    crop_type: "", // cropType -> crop_type
    land_size_acres: "", // landSize -> land_size_acres
    irrigation_method: "", // irrigationMethod -> irrigation_method
    fertilizer_use: "", // fertilizerUse -> fertilizer_use
    current_pest_issues: "", // pestIssues -> current_pest_issues
    soil_type: "", // soilType -> soil_type
    previous_yield_quintals_per_acre: "", // previousYield -> previous_yield_quintals_per_acre
    target_yield_quintals_per_acre: "", // targetYield -> target_yield_quintals_per_acre
    budget_rs: "", // budget -> budget_rs
    // "additionalInfo" is not sent to the backend in this version
  });
  
  // NEW: Add state for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 4;
  const progressValue = (currentStep / totalSteps) * 100;

  // MODIFIED: Update function to work with the new state keys
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // NEW: This is the main function to send data to the backend
  const handleSubmit = async () => {
    if (!soilReportFile) {
      setError("Soil report file is missing. Please go back and upload it.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Create the "digital box" (FormData)
    const apiFormData = new FormData();

    // 2. Pack the form data into the box
    for (const key in formData) {
      apiFormData.append(key, formData[key]);
    }
    
    // 3. Pack the files from the "tray" into the box
    apiFormData.append('soil_report_file', soilReportFile);
    if (cropImageFile) {
      apiFormData.append('crop_image', cropImageFile);
    }

    try {
      // 4. Send the box to the backend API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/analyze-farm-data/"; // Fallback for local dev
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: apiFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const results = await response.json();
      
      // Save the results to the browser's memory for the next page
      sessionStorage.setItem('analysisResults', JSON.stringify(results));
      
      // Navigate to the results page
      router.push('/crop-analysis/result');

    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Stop loading on error
    }
  };


  const renderStep = () => {
    // MODIFIED: All `value` and `onChange` props need to be updated to use the new state keys
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>{/* ... */}</CardHeader>
            <CardContent>
              {/* Example of a modified input */}
              <Input
                id="location"
                placeholder={t("step1.fields.location.placeholder")}
                value={formData.village_city}
                onChange={(e) => updateFormData("village_city", e.target.value)}
                // ...
              />
              {/* Make sure to update ALL inputs in all steps similarly */}
              {/* e.g., for landSize: value={formData.land_size_acres} and updateFormData("land_size_acres", ...) */}
            </CardContent>
          </Card>
        );
      // ... Cases 2, 3, and 4 with their inputs updated to use the correct formData keys ...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader>{/* ... Header ... */}</AppHeader>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* ... Your progress bars and other UI ... */}

          {/* Current Step Content */}
          <div className="mb-6 sm:mb-8">{renderStep()}</div>
          
          {/* NEW: Display API error if it exists */}
          {error && (
            <div className="text-center text-red-500 mb-4 p-3 bg-red-50 rounded-md">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {/* MODIFIED: Navigation buttons now handle the loading state and submit logic */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              // ... className
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("buttons.previous")}
            </Button>
            
            <Button variant="ghost" /* ... */ >
              <Link href="/crop-analysis/upload" /* ... */ >
                {t("buttons.backToUpload")}
              </Link>
            </Button>

            {currentStep === totalSteps ? (
              // MODIFIED: Submit button now triggers the API call instead of being a Link
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto order-1 sm:order-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    {t("buttons.submit")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              // MODIFIED: Next button is disabled while loading
              <Button
                size="lg"
                onClick={nextStep}
                disabled={isLoading}
                className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto order-1 sm:order-3"
              >
                {t("buttons.next")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;








// "use client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { ArrowLeft, ArrowRight, MapPin, Wheat, Droplets } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";
// import { useTranslations } from "next-intl";
// import AppHeader from "@/app/_components/AppHeader";

// const QuestionnairePage = () => {
//   const t = useTranslations("crop-analysis.questionnaire");
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     location: "",
//     state: "",
//     cropType: "",
//     landSize: "",
//     irrigationMethod: "",
//     fertilizerUse: "",
//     pestIssues: "",
//     soilType: "",
//     previousYield: "",
//     targetYield: "",
//     budget: "",
//     additionalInfo: "",
//   });

//   const totalSteps = 4;
//   const progressValue = (currentStep / totalSteps) * 100;

//   const updateFormData = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const nextStep = () => {
//     if (currentStep < totalSteps) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <Card>
//             <CardHeader className="px-4 sm:px-6">
//               <CardTitle className="flex items-center text-xl sm:text-2xl">
//                 <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary flex-shrink-0" />
//                 <span className="break-words">{t("step1.title")}</span>
//               </CardTitle>
//               <CardDescription className="text-base sm:text-lg">
//                 {t("step1.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="location" className="text-sm sm:text-base font-medium">
//                     {t("step1.fields.location.label")}
//                   </Label>
//                   <Input
//                     id="location"
//                     placeholder={t("step1.fields.location.placeholder")}
//                     value={formData.location}
//                     onChange={(e) => updateFormData("location", e.target.value)}
//                     className="h-10 sm:h-12 text-sm sm:text-base"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state" className="text-sm sm:text-base font-medium">
//                     {t("step1.fields.state.label")}
//                   </Label>
//                   <Select
//                     value={formData.state}
//                     onValueChange={(value) => updateFormData("state", value)}
//                   >
//                     <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
//                       <SelectValue placeholder={t("step1.fields.state.placeholder")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="punjab">{t("step1.fields.state.options.punjab")}</SelectItem>
//                       <SelectItem value="haryana">{t("step1.fields.state.options.haryana")}</SelectItem>
//                       <SelectItem value="uttar-pradesh">{t("step1.fields.state.options.uttarPradesh")}</SelectItem>
//                       <SelectItem value="maharashtra">{t("step1.fields.state.options.maharashtra")}</SelectItem>
//                       <SelectItem value="gujarat">{t("step1.fields.state.options.gujarat")}</SelectItem>
//                       <SelectItem value="rajasthan">{t("step1.fields.state.options.rajasthan")}</SelectItem>
//                       <SelectItem value="other">{t("step1.fields.state.options.other")}</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="landSize" className="text-sm sm:text-base font-medium">
//                     {t("step1.fields.landSize.label")}
//                   </Label>
//                   <Input
//                     id="landSize"
//                     type="number"
//                     placeholder={t("step1.fields.landSize.placeholder")}
//                     value={formData.landSize}
//                     onChange={(e) => updateFormData("landSize", e.target.value)}
//                     className="h-10 sm:h-12 text-sm sm:text-base"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="soilType" className="text-sm sm:text-base font-medium">
//                     {t("step1.fields.soilType.label")}
//                   </Label>
//                   <Select
//                     value={formData.soilType}
//                     onValueChange={(value) => updateFormData("soilType", value)}
//                   >
//                     <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
//                       <SelectValue placeholder={t("step1.fields.soilType.placeholder")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="clay">{t("step1.fields.soilType.options.clay")}</SelectItem>
//                       <SelectItem value="sandy">{t("step1.fields.soilType.options.sandy")}</SelectItem>
//                       <SelectItem value="loamy">{t("step1.fields.soilType.options.loamy")}</SelectItem>
//                       <SelectItem value="silty">{t("step1.fields.soilType.options.silty")}</SelectItem>
//                       <SelectItem value="mixed">{t("step1.fields.soilType.options.mixed")}</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 2:
//         return (
//           <Card>
//             <CardHeader className="px-4 sm:px-6">
//               <CardTitle className="flex items-center text-xl sm:text-2xl">
//                 <Wheat className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-crop-green flex-shrink-0" />
//                 <span className="break-words">{t("step2.title")}</span>
//               </CardTitle>
//               <CardDescription className="text-base sm:text-lg">
//                 {t("step2.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="cropType" className="text-sm sm:text-base font-medium">
//                     {t("step2.fields.cropType.label")}
//                   </Label>
//                   <Select
//                     value={formData.cropType}
//                     onValueChange={(value) => updateFormData("cropType", value)}
//                   >
//                     <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
//                       <SelectValue placeholder={t("step2.fields.cropType.placeholder")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="wheat">{t("step2.fields.cropType.options.wheat")}</SelectItem>
//                       <SelectItem value="rice">{t("step2.fields.cropType.options.rice")}</SelectItem>
//                       <SelectItem value="corn">{t("step2.fields.cropType.options.corn")}</SelectItem>
//                       <SelectItem value="cotton">{t("step2.fields.cropType.options.cotton")}</SelectItem>
//                       <SelectItem value="sugarcane">{t("step2.fields.cropType.options.sugarcane")}</SelectItem>
//                       <SelectItem value="soybeans">{t("step2.fields.cropType.options.soybeans")}</SelectItem>
//                       <SelectItem value="vegetables">{t("step2.fields.cropType.options.vegetables")}</SelectItem>
//                       <SelectItem value="fruits">{t("step2.fields.cropType.options.fruits")}</SelectItem>
//                       <SelectItem value="other">{t("step2.fields.cropType.options.other")}</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="previousYield"
//                     className="text-sm sm:text-base font-medium"
//                   >
//                     {t("step2.fields.previousYield.label")}
//                   </Label>
//                   <Input
//                     id="previousYield"
//                     placeholder={t("step2.fields.previousYield.placeholder")}
//                     value={formData.previousYield}
//                     onChange={(e) =>
//                       updateFormData("previousYield", e.target.value)
//                     }
//                     className="h-10 sm:h-12 text-sm sm:text-base"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="targetYield"
//                     className="text-sm sm:text-base font-medium"
//                   >
//                     {t("step2.fields.targetYield.label")}
//                   </Label>
//                   <Input
//                     id="targetYield"
//                     placeholder={t("step2.fields.targetYield.placeholder")}
//                     value={formData.targetYield}
//                     onChange={(e) =>
//                       updateFormData("targetYield", e.target.value)
//                     }
//                     className="h-10 sm:h-12 text-sm sm:text-base"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="budget" className="text-sm sm:text-base font-medium">
//                     {t("step2.fields.budget.label")}
//                   </Label>
//                   <Input
//                     id="budget"
//                     type="number"
//                     placeholder={t("step2.fields.budget.placeholder")}
//                     value={formData.budget}
//                     onChange={(e) => updateFormData("budget", e.target.value)}
//                     className="h-10 sm:h-12 text-sm sm:text-base"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 3:
//         return (
//           <Card>
//             <CardHeader className="px-4 sm:px-6">
//               <CardTitle className="flex items-center text-xl sm:text-2xl">
//                 <Droplets className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />
//                 <span className="break-words">{t("step3.title")}</span>
//               </CardTitle>
//               <CardDescription className="text-base sm:text-lg">
//                 {t("step3.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="irrigationMethod"
//                     className="text-sm sm:text-base font-medium"
//                   >
//                     {t("step3.fields.irrigationMethod.label")}
//                   </Label>
//                   <Select
//                     value={formData.irrigationMethod}
//                     onValueChange={(value) =>
//                       updateFormData("irrigationMethod", value)
//                     }
//                   >
//                     <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
//                       <SelectValue placeholder={t("step3.fields.irrigationMethod.placeholder")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="drip">{t("step3.fields.irrigationMethod.options.drip")}</SelectItem>
//                       <SelectItem value="sprinkler">{t("step3.fields.irrigationMethod.options.sprinkler")}</SelectItem>
//                       <SelectItem value="flood">{t("step3.fields.irrigationMethod.options.flood")}</SelectItem>
//                       <SelectItem value="furrow">{t("step3.fields.irrigationMethod.options.furrow")}</SelectItem>
//                       <SelectItem value="rainfed">{t("step3.fields.irrigationMethod.options.rainfed")}</SelectItem>
//                       <SelectItem value="mixed">{t("step3.fields.irrigationMethod.options.mixed")}</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label
//                     htmlFor="fertilizerUse"
//                     className="text-sm sm:text-base font-medium"
//                   >
//                     {t("step3.fields.fertilizerUse.label")}
//                   </Label>
//                   <Select
//                     value={formData.fertilizerUse}
//                     onValueChange={(value) =>
//                       updateFormData("fertilizerUse", value)
//                     }
//                   >
//                     <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
//                       <SelectValue placeholder={t("step3.fields.fertilizerUse.placeholder")} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="organic">{t("step3.fields.fertilizerUse.options.organic")}</SelectItem>
//                       <SelectItem value="chemical">{t("step3.fields.fertilizerUse.options.chemical")}</SelectItem>
//                       <SelectItem value="mixed">{t("step3.fields.fertilizerUse.options.mixed")}</SelectItem>
//                       <SelectItem value="minimal">{t("step3.fields.fertilizerUse.options.minimal")}</SelectItem>
//                       <SelectItem value="none">{t("step3.fields.fertilizerUse.options.none")}</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="pestIssues" className="text-sm sm:text-base font-medium">
//                   {t("step3.fields.pestIssues.label")}
//                 </Label>
//                 <Textarea
//                   id="pestIssues"
//                   placeholder={t("step3.fields.pestIssues.placeholder")}
//                   value={formData.pestIssues}
//                   onChange={(e) => updateFormData("pestIssues", e.target.value)}
//                   className="min-h-20 sm:min-h-24 text-sm sm:text-base"
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 4:
//         return (
//           <Card>
//             <CardHeader className="px-4 sm:px-6">
//               <CardTitle className="text-xl sm:text-2xl">
//                 {t("step4.title")}
//               </CardTitle>
//               <CardDescription className="text-base sm:text-lg">
//                 {t("step4.description")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="additionalInfo"
//                   className="text-sm sm:text-base font-medium"
//                 >
//                   {t("step4.fields.additionalInfo.label")}
//                 </Label>
//                 <Textarea
//                   id="additionalInfo"
//                   placeholder={t("step4.fields.additionalInfo.placeholder")}
//                   value={formData.additionalInfo}
//                   onChange={(e) =>
//                     updateFormData("additionalInfo", e.target.value)
//                   }
//                   className="min-h-24 sm:min-h-32 text-sm sm:text-base"
//                 />
//               </div>

//               <div className="bg-accent p-4 sm:p-6 rounded-lg">
//                 <h4 className="font-semibold text-base sm:text-lg text-accent-foreground mb-3">
//                   {t("step4.summary.title")}
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
//                   <div className="space-y-2">
//                     <p className="break-words">
//                       <strong>{t("step4.summary.location")}:</strong> {formData.location},{" "}
//                       {formData.state}
//                     </p>
//                     <p>
//                       <strong>{t("step4.summary.landSize")}:</strong> {formData.landSize} {t("step4.summary.acres")}
//                     </p>
//                     <p>
//                       <strong>{t("step4.summary.cropType")}:</strong> {formData.cropType}
//                     </p>
//                     <p>
//                       <strong>{t("step4.summary.soilType")}:</strong> {formData.soilType}
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <p>
//                       <strong>{t("step4.summary.irrigation")}:</strong> {formData.irrigationMethod}
//                     </p>
//                     <p>
//                       <strong>{t("step4.summary.fertilizerUse")}:</strong> {formData.fertilizerUse}
//                     </p>
//                     <p>
//                       <strong>{t("step4.summary.targetYield")}:</strong> {formData.targetYield}
//                     </p>
//                     <p className="break-words">
//                       <strong>{t("step4.summary.budget")}:</strong> ₹{formData.budget}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <AppHeader>
//         {/* Header */}
//         <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
//           <div className="flex items-center justify-center">
//             <div className="flex items-center space-x-2">
//               <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-lg flex items-center justify-center">
//                 <Wheat className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
//               </div>
//               <h1 className="text-xl sm:text-2xl font-bold text-foreground">
//                 {t("pageTitle")}
//               </h1>
//             </div>
//           </div>
//         </div>
//       </AppHeader>

//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Progress Steps - Desktop/Tablet */}
//           <div className="mb-6 sm:mb-8 hidden sm:block">
//             <div className="flex items-center justify-between mb-4">
//               <div className="flex items-center space-x-2 opacity-50">
//                 <div className="w-8 h-8 bg-crop-green rounded-full flex items-center justify-center bg-primary-400 text-white font-semibold">
//                   ✓
//                 </div>
//                 <span className="text-green-800 font-semibold text-sm md:text-base">
//                   {t("stepper.uploadComplete")}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
//                   2
//                 </div>
//                 <span className="font-semibold text-primary text-sm md:text-base">
//                   {t("stepper.fillQuestionnaire")}
//                 </span>
//               </div>
//               <div className="flex items-center space-x-2 opacity-50">
//                 <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-semibold">
//                   3
//                 </div>
//                 <span className="text-muted-foreground text-sm md:text-base">{t("stepper.getResults")}</span>
//               </div>
//             </div>
//             <Progress value={66} className="h-2" />
//           </div>

//           {/* Progress Steps - Mobile */}
//           <div className="mb-4 sm:hidden">
//             <div className="flex items-center justify-center mb-3">
//               <div className="flex items-center space-x-2">
//                 <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
//                   2
//                 </div>
//                 <span className="font-semibold text-primary">
//                   {t("stepper.fillQuestionnaire")}
//                 </span>
//               </div>
//             </div>
//             <div className="text-center text-xs text-muted-foreground mb-3">
//               Step 2 of 3
//             </div>
//             <Progress value={66} className="h-2" />
//           </div>

//           {/* Step Progress */}
//           <div className="mb-4 sm:mb-6">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs sm:text-sm font-medium text-foreground">
//                 {t("progress.stepOf", { current: currentStep, total: totalSteps })}
//               </span>
//               <span className="text-xs sm:text-sm text-muted-foreground">
//                 {t("progress.percentComplete", { percent: Math.round(progressValue) })}
//               </span>
//             </div>
//             <Progress value={progressValue} className="h-2" />
//           </div>

//           {/* Current Step Content */}
//           <div className="mb-6 sm:mb-8">{renderStep()}</div>

//           {/* Navigation - Mobile Stack */}
//           <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
//             <Button
//               variant="outline"
//               size="lg"
//               onClick={prevStep}
//               disabled={currentStep === 1}
//               className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto order-2 sm:order-1"
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               {t("buttons.previous")}
//             </Button>
//             <Button variant="ghost" size="lg" asChild className="w-full sm:w-auto order-3 sm:order-2">
//               <Link href="/crop-analysis/upload" className="text-sm sm:text-base">
//                 {t("buttons.backToUpload")}
//               </Link>
//             </Button>
//             {currentStep === totalSteps ? (
//               <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto order-1 sm:order-3" asChild>
//                 <Link href="/crop-analysis/result">
//                   {t("buttons.submit")}
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </Link>
//               </Button>
//             ) : (
//               <Button
//                 size="lg"
//                 onClick={nextStep}
//                 className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto order-1 sm:order-3"
//               >
//                 {t("buttons.next")}
//                 <ArrowRight className="w-4 h-4 ml-2" />
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuestionnairePage;