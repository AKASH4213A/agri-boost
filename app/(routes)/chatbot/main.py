import fitz  # PyMuPDF
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from google.cloud import vision

# --- FastAPI App Initialization ---
app = FastAPI(title="AgriBoost Data Processing API")


# Yeh aapki Vercel website ka URL hai
origins = [
    "https://agri-boost.vercel.app",
    "http://localhost:3000", # Yeh local testing ke liye hai
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Sirf in URLs se request allow karo
    allow_credentials=True,
    allow_methods=["*"],         # Saare methods (GET, POST, etc.) allow karo
    allow_headers=["*"],         # Saare headers allow karo
)

# (Pydantic Models yahan same rahenge)
# ...

# --- MODIFIED: Unified Soil Report Parsing Function (PDF & Image) ---
def parse_soil_report(file_content: bytes, file_type: str) -> dict:
    """
    Yeh function PDF ya image file se text extract karta hai aur soil parameters dhoondhta hai.
    """
    extracted_data = {}
    full_text = ""

    try:
        if file_type == "application/pdf":
            # PDF parsing logic
            pdf_document = fitz.open(stream=file_content, filetype="pdf")
            full_text = "".join(page.get_text() for page in pdf_document)
        elif file_type.startswith("image/"):
            # Image OCR logic using Google Cloud Vision API
            client = vision.ImageAnnotatorClient()
            image = vision.Image(content=file_content)
            response = client.document_text_detection(image=image) # Full text detection for better OCR

            if response.full_text_annotation:
                full_text = response.full_text_annotation.text
            else:
                raise ValueError("No text detected in the image.")
            
            if response.error.message:
                raise Exception(response.error.message)
                
        else:
            raise ValueError("Unsupported soil report file type.")

        # Regular expressions to find soil parameters in the extracted text
        # NOTE: Yeh patterns generic hain. Aapko asli reports ke format ke hisaab se adjust karna pad sakta hai.
        patterns = {
            "pH": r"pH\s*[:\-–]?\s*(\d+\.?\d*)",
            "Organic Carbon (%)": r"Organic Carbon(?: \(OC\))?\s*[:\-–]?\s*(\d+\.?\d*)",
            "Nitrogen (kg/ha)": r"Nitrogen \(N\)\s*[:\-–]?\s*(\d+\.?\d*)",
            "Phosphorus (kg/ha)": r"Phosphorus \(P\)\s*[:\-–]?\s*(\d+\.?\d*)",
            "Potassium (kg/ha)": r"Potassium \(K\)\s*[:\-–]?\s*(\d+\.?\d*)"
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                extracted_data[key] = float(match.group(1))
            else:
                extracted_data[key] = None

    except Exception as e:
        print(f"Error parsing soil report ({file_type}): {e}")
        # Agar parsing mein error aaye, to saari values None set kar do
        return {key: None for key in patterns.keys()}
        
    return extracted_data


# --- Image Analysis Function (No change here) ---
def analyze_crop_image(file_content: bytes) -> dict:
  
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=file_content)

        label_response = client.label_detection(image=image)
        labels = [{"label": label.description, "score": round(label.score, 2)} for label in label_response.label_annotations]

        object_response = client.object_localization(image=image)
        objects = [{"object": obj.name, "confidence": round(obj.score, 2)} for obj in object_response.localized_object_annotations]

        if label_response.error.message or object_response.error.message:
            raise Exception(label_response.error.message or object_response.error.message)

        return {
            "detected_labels": labels,
            "detected_objects": objects,
            "error": None
        }
    except Exception as e:
        print(f"Error analyzing image with Google Vision API: {e}")
        return {"detected_labels": [], "detected_objects": [], "error": str(e)}

# --- MODIFIED: API Endpoint ---
@app.post("/analyze-farm-data/")
async def analyze_farm_data(
    # Form fields (pehle jaise hi hain)
    village_city: str = Form(...),
    state: str = Form(...),
    land_size_acres: float = Form(...),
    soil_type: str = Form(...),
    crop_type: str = Form(...),
    target_yield_quintals_per_acre: float = Form(...),
    budget_rs: int = Form(...),
    irrigation_method: str = Form(...),
    fertilizer_use: str = Form(...),
    previous_yield_quintals_per_acre: Optional[float] = Form(None),
    current_pest_issues: Optional[str] = Form(None),

    # NEW/MODIFIED: Soil Report File (can be PDF or Image)
    soil_report_file: UploadFile = File(...),
    # Crop Image (still optional and separate)
    crop_image: Optional[UploadFile] = File(None) 
):
    """
    Yeh API endpoint form data, soil report (PDF ya Image), aur optional crop image leta hai.
    Sabhi files ko process karta hai, aur sabhi data ko combine karke JSON mein return karta hai.
    """
    # Validate Soil Report File Type
    allowed_soil_report_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if soil_report_file.content_type not in allowed_soil_report_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid soil report file type. Please upload a PDF, JPEG, PNG, or JPG image."
        )

    # Read Soil Report File content
    soil_report_content = await soil_report_file.read()
    
    # MODIFIED: Call the unified parsing function
    extracted_soil_data = parse_soil_report(soil_report_content, soil_report_file.content_type)

    # Crop Image Processing (same as before)
    image_analysis_results = None
    if crop_image:
        if not crop_image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid crop image file type. Please upload an image.")
        image_content = await crop_image.read()
        image_analysis_results = analyze_crop_image(image_content)

    # Combine all data
    combined_data = {
        "form_data": {
            "location_land_details": {"village_city": village_city, "state": state, "land_size_acres": land_size_acres, "soil_type": soil_type},
            "crop_information": {"crop_type": crop_type, "previous_yield_quintals_per_acre": previous_yield_quintals_per_acre, "target_yield_quintals_per_acre": target_yield_quintals_per_acre, "budget_rs": budget_rs},
            "farming_practices": {"irrigation_method": irrigation_method, "fertilizer_use": fertilizer_use, "current_pest_issues": current_pest_issues}
        },
        "soil_report_data": extracted_soil_data,
        "image_analysis_results": image_analysis_results 
    }

    return combined_data

# Yeh line local server start karne ke liye hai (optional)
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)