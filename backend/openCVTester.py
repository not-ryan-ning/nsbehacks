import cv2
import numpy as np
from deepface import DeepFace
import time
from collections import Counter

# Open webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

emotion_list = []  # Store detected emotions
start_time = time.time()  # Track emotion aggregation time
no_face_count = 0  # Track how many times face disappears
last_fidget_time = 0  # Last time a fidget alert was triggered (cooldown)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Error: Could not capture frame.")
        break

    # Convert to grayscale for better face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(100, 100))

    if len(faces) == 0:
        no_face_count += 1
        print(f"⚠️ Face not detected! (Count: {no_face_count})")
    else:
        no_face_count = 0  # Reset fidget count when face is detected

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]  # Crop the detected face

        try:
            # Analyze face for emotion
            result = DeepFace.analyze(face, actions=['emotion'], enforce_detection=False)
            dominant_emotion = result[0]["dominant_emotion"]
            emotion_list.append(dominant_emotion)  # Store detected emotion

            print(f"🧐 Detected Emotion: {dominant_emotion}")

            # Draw a rectangle around the face
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, dominant_emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        except Exception as e:
            print(f"DeepFace error: {e}")

    # Show webcam feed
    cv2.imshow("Emotion & Fidget Detection", frame)

    # Aggregate and print dominant emotion every 5 seconds
    if time.time() - start_time >= 5:
        if emotion_list:
            most_common_emotion = Counter(emotion_list).most_common(1)[0][0]
            print(f"✅ Aggregated Emotion (last 5s): {most_common_emotion}")
            emotion_list = []  # Reset emotion tracking for the next 5 seconds
        start_time = time.time()  # Reset time

    # If face disappears 10+ times and at least 1 min passed since last fidget alert
    if no_face_count >= 10 and (time.time() - last_fidget_time) > 10:
        print("🚨 Child is fidgeting! Adjusting story difficulty.")
        no_face_count = 0  # Reset fidget counter
        last_fidget_time = time.time()  # Update last triggered fidget time

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
