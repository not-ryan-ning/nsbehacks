import cv2
import numpy as np
from deepface import DeepFace
import time
from collections import Counter
from threading import Lock

class FaceDetectionService:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        self.last_face_detection_time = time.time()
        self.lock = Lock()
        self.attention_status = {
            "is_attentive": True,
            "last_emotion": None,
            "time_without_face": 0
        }
    
    def process_frame(self, frame_data):
        """Process a frame and return attention status"""
        with self.lock:
            try:
                # Convert base64 to image
                nparr = np.frombuffer(frame_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    return self.attention_status
                
                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Detect faces
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100)
                )
                
                current_time = time.time()
                
                if len(faces) == 0:
                    # No face detected
                    self.attention_status["time_without_face"] = current_time - self.last_face_detection_time
                    if self.attention_status["time_without_face"] >= 10:
                        self.attention_status["is_attentive"] = False
                else:
                    # Face detected
                    self.last_face_detection_time = current_time
                    self.attention_status["time_without_face"] = 0
                    self.attention_status["is_attentive"] = True
                    
                    # Analyze the first detected face
                    x, y, w, h = faces[0]
                    face = frame[y:y+h, x:x+w]
                    
                    try:
                        # Analyze face for emotion
                        result = DeepFace.analyze(face, actions=['emotion'], enforce_detection=False)
                        self.attention_status["last_emotion"] = result[0]["dominant_emotion"]
                    except Exception as e:
                        print(f"Emotion detection error: {str(e)}")
                
                return self.attention_status
                
            except Exception as e:
                print(f"Frame processing error: {str(e)}")
                return self.attention_status
    
    def reset_attention_status(self):
        """Reset the attention status"""
        with self.lock:
            self.attention_status = {
                "is_attentive": True,
                "last_emotion": None,
                "time_without_face": 0
            }
            self.last_face_detection_time = time.time()
