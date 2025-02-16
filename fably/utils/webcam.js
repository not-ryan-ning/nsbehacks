import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Image from "next/image";

const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [lastImage, setLastImage] = useState(null);

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setLastImage(imageSrc);
            onCapture(imageSrc); // Returns base64 image
        }
    };

    return (
        <div className="relative">
            <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                style={{ opacity: 0.01 }}
                className="absolute top-0 right-0"
            />
            {lastImage && (
                    <Image
                        src={lastImage}
                        alt="Last capture"
                        width={160}
                        height={120}
                    />
                )}
        </div>
    );
};

export default WebcamCapture;