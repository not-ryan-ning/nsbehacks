from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from fastapi.middleware.cors import CORSMiddleware
import base64
import cv2
import numpy as np
from face_detection_service import FaceDetectionService
from typing import Optional, Dict, Any

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize face detection service
face_detection = FaceDetectionService()

# Store reader data and story state globally (not ideal for large-scale apps)
story_store = {}
story_state = {
    "current_line": 0,
    "paused": False,
    "last_interaction": None,
    "story_lines": [],  # Store the story lines
    "lines_per_page": 3  # Number of lines to return per page
}


class Reader(BaseModel):
    cultural_background: str
    language: str
    age_range: str
    story_length: str
    story_type: str
    language_help: bool = False  # Optional, defaults to False


class ImageData(BaseModel):
    image: str

class StoryState(BaseModel):
    current_line: int
    attention_status: Dict[str, Any]


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}


@app.post("/upload")
def upload_image(data: ImageData):
    try:
        # Validate input
        if not data.image:
            return {"error": "No image data provided"}

        # Remove the header (if exists)
        encoded_data = data.image.split(",")[1] if "," in data.image else data.image

        try:
            # Decode Base64
            img_data = base64.b64decode(encoded_data)
        except base64.binascii.Error:
            return {"error": "Invalid base64 encoding"}

        # Convert to NumPy array
        nparr = np.frombuffer(img_data, np.uint8)
        if nparr.size == 0:
            return {"error": "Decoded image is empty"}

        # Decode to OpenCV format
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"error": "Failed to decode image. Format may be unsupported"}

        # Get image informati
        height, width = img.shape[:2]

        # Save the image with a timestamp to prevent overwrites
        import time
        timestamp = int(time.time())
        filename = f"uploaded_image_{timestamp}.jpg"
        success = cv2.imwrite(filename, img)

        if not success:
            return {"error": "Failed to save image"}

        return {
            "message": "Image successfully processed",
            "details": {
                "filename": filename,
                "dimensions": f"{width}x{height}",
                "size_bytes": len(img_data)
            }
        }

    except Exception as e:
        import traceback
        print(f"Error processing image: {str(e)}\n{traceback.format_exc()}")
        return {"error": f"Server error: {str(e)}"}


# POST: /readerdata
@app.post("/readerdata")
async def read_item(data: Reader):
    """Store reader preferences and background information for story generation.

    Args:
        data (Reader): Reader information including:
            - cultural_background (str): e.g., "Mexican", "Chinese", "Indian"
            - language (str): Target language, e.g., "Spanish", "Mandarin", "Hindi"
            - age_range (str): e.g., "5-7", "8-10", "11-13"
            - story_length (str): e.g., "short", "medium", "long"
            - story_type (str): e.g., "adventure", "fantasy", "folklore"
            - language_help (bool, optional): Whether to focus on language acquisition, defaults to False

    Returns:
        dict: Confirmation of data storage

    Example Request:
        POST /readerdata
        {
            "cultural_background": "Mexican",
            "language": "Spanish",
            "age_range": "8-10",
            "story_length": "medium",
            "story_type": "folklore",
            "language_help": true
        }

    Example Response:
        {
            "response": "200 OK"
        }
    """
    story_store["cultural_background"] = data.cultural_background
    story_store["language"] = data.language
    story_store["age_range"] = data.age_range
    story_store["story_length"] = data.story_length
    story_store["story_type"] = data.story_type
    story_store["language_help"] = data.language_help

    return {"response": "200 OK"}

# GET: /story (Generate the story using stored data)
@app.post("/monitor-attention")
async def monitor_attention(data: ImageData):
    """Process webcam frame to monitor reader's attention using face detection.

    Args:
        data (ImageData): Image data containing:
            - image (str): Base64 encoded image string from webcam

    Returns:
        dict: Attention status and story state

    Example Request:
        POST /monitor-attention
        {
            "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        }

    Example Response:
        {
            "attention_status": {
                "is_attentive": true,
                "time_without_face": 0
            },
            "story_state": {
                "current_line": 6,
                "paused": false
            }
        }

    Notes:
        - Story will pause if no face is detected for 10 seconds
        - Base64 image should include the full string including data URI
    """
    try:
        # Process the frame with face detection service
        img_data = base64.b64decode(data.image.split(",")[1] if "," in data.image else data.image)
        attention_status = face_detection.process_frame(img_data)

        # Update story state based on attention status
        if not attention_status["is_attentive"]:
            story_state["paused"] = True

        return {
            "attention_status": attention_status,
            "story_state": {
                "current_line": story_state["current_line"],
                "paused": story_state["paused"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/story-state")
def get_story_state():
    return story_state

@app.post("/resume-story")
def resume_story():
    story_state["paused"] = False
    face_detection.reset_attention_status()
    return story_state

@app.get("/story")
def generate_story():
    """Generate a new story based on stored reader preferences.

    Returns:
        dict: Story generation status and pagination information

    Example Response (Success):
        {
            "message": "Story generated successfully",
            "total_pages": 5,
            "total_lines": 15,
            "lines_per_page": 3
        }

    Example Response (Error):
        {
            "error": "No reader data available. Please submit data first."
        }

    Notes:
        - Requires reader data to be set via /readerdata first
        - Story is split into pages of 3 lines each
        - Story is generated in the reader's target language
        - Content is tailored to reader's cultural background
    """
    if not story_store:
        return {"error": "No reader data available. Please submit data first."}

    # Reset story state
    story_state["current_line"] = 0
    story_state["paused"] = False
    face_detection.reset_attention_status()

    # Build the story prompt based on reader preferences
    base_prompt = (
        f"The reader is from {story_store['cultural_background']}, is {story_store['age_range']}, "
        f"and desires a story of {story_store['story_type']} of length {story_store['story_length']}. "
        f"Generate an engaging folklore story in {story_store['language']}."
    )

    # Add language acquisition goal if language_help is enabled
    if story_store.get('language_help', False):
        base_prompt += f" The goal is to help with language acquisition using the reader's background and this story."

    story_prompt = base_prompt + " Split it into clear sentences. Do not include \n tags."

    client = genai.Client(api_key="API KEY")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[story_prompt])

    if response.text:
        # Split by both English period and Chinese sentence-ending punctuation marks
        # 。: Chinese period
        # ．: Full-width period
        # ｡: Half-width ideographic full stop
        import re

        # First replace all sentence-ending punctuation with a common delimiter
        text_with_common_delim = re.sub(r'[.。．｡]', '<SPLIT>', response.text)

        # Split and clean the sentences
        story_state["story_lines"] = [line.strip() for line in text_with_common_delim.split('<SPLIT>') if line.strip()]
        total_pages = len(story_state["story_lines"]) // story_state["lines_per_page"]
        if len(story_state["story_lines"]) % story_state["lines_per_page"] > 0:
            total_pages += 1

        return {
            "message": "Story generated successfully",
            "total_pages": total_pages,
            "total_lines": len(story_state["story_lines"]),
            "lines_per_page": story_state["lines_per_page"]
        }

    return {"error": "Failed to generate story"}

@app.get("/next-page/{page_number}")
def get_next_page(page_number: int):
    """Retrieve a specific page of the story with pagination information.

    Args:
        page_number (int): Zero-based page index to retrieve

    Returns:
        dict: Page content and navigation information

    Example Request:
        GET /next-page/0

    Example Response (Normal):
        {
            "lines": [
                "Once upon a time in a small Mexican village,",
                "there lived a clever girl named María,",
                "who loved to tell stories to her friends."
            ],
            "page": 0,
            "total_pages": 5,
            "has_next": true,
            "has_previous": false
        }

    Example Response (Paused):
        {
            "paused": true,
            "current_line": 3,
            "message": "Story is paused due to lack of attention"
        }

    Example Response (Error):
        {
            "error": "Page number out of range"
        }

    Notes:
        - Pages are zero-indexed
        - Each page contains up to 3 lines
        - Story will pause if attention is lost
        - Navigation info includes previous/next page availability
    """
    if not story_state["story_lines"]:
        return {"error": "No story has been generated yet"}

    if story_state["paused"]:
        return {
            "paused": True,
            "current_line": story_state["current_line"],
            "message": "Story is paused due to lack of attention"
        }

    start_idx = page_number * story_state["lines_per_page"]
    end_idx = start_idx + story_state["lines_per_page"]

    if start_idx >= len(story_state["story_lines"]):
        return {"error": "Page number out of range"}

    current_lines = story_state["story_lines"][start_idx:end_idx]
    story_state["current_line"] = end_idx

    total_pages = len(story_state["story_lines"]) // story_state["lines_per_page"]
    if len(story_state["story_lines"]) % story_state["lines_per_page"] > 0:
        total_pages += 1

    return {
        "lines": current_lines,
        "page": page_number,
        "total_pages": total_pages,
        "has_next": end_idx < len(story_state["story_lines"]),
        "has_previous": page_number > 0
    }

    return {"data": response.text}
