import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

const API_BASE_URL = 'http://127.0.0.1:8000';

const WebcamCapture = ({ onAttentionChange }) => {
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const captureIntervalRef = useRef(null);

    const monitorAttention = async (imageSrc) => {
        try {
            const response = await fetch(`${API_BASE_URL}/monitor-attention`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageSrc
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            onAttentionChange(data);
        } catch (error) {
            console.error('Error monitoring attention:', error);
        }
    };

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            monitorAttention(imageSrc);
        }
    };

    useEffect(() => {
        if (isCapturing) {
            captureIntervalRef.current = setInterval(capture, 1000); // Capture every second
        } else if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
        }

        return () => {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
        };
    }, [isCapturing]);

    useEffect(() => {
        setIsCapturing(true);
        return () => setIsCapturing(false);
    }, []);

    return (
        <div className="relative">
            <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                style={{ opacity: 0.01 }}
                className="absolute top-0 right-0"
                videoConstraints={{
                    width: 320,
                    height: 240,
                    facingMode: "user"
                }}
            />
        </div>
    );
};

export default WebcamCapture;