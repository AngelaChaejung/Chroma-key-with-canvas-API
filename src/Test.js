import React, { useEffect, useRef } from "react";
import "./App.css"; // You can create a separate CSS file for styling or include styles directly in the component using styled-components, etc.
import { styled } from "styled-components";

const VideoProcessor = () => {
  const videoRef = useRef(null);
  const c1Ref = useRef(null);
  const c2Ref = useRef(null);

  useEffect(() => {
    // Get user media (webcam stream)
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const c1 = c1Ref.current;
    const ctx1 = c1.getContext("2d");
    const c2 = c2Ref.current;
    const ctx2 = c2.getContext("2d");

    const timerCallback = () => {
      // Apply chroma key effect (simple green screen effect)
      ctx1.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, c1.width, c1.height);
      const imageData = ctx1.getImageData(0, 0, c1.width, c1.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Check if the pixel color is green (you can adjust the range of green color here)
        if (g > 100 && r < 80 && b < 80) {
          // Set alpha channel to 0 (transparent) for green pixels
          data[i + 3] = 0;
        }
      }
      ctx2.putImageData(imageData, 0, 0);

      setTimeout(timerCallback, 33); // 33ms for ~30fps
    };

    video.addEventListener("play", () => {
      timerCallback();
    });

    // Clean up the event listener when component unmounts
    return () => {
      video.removeEventListener("play", () => {
        timerCallback();
      });
    };
  }, []);

  return (
    <div>
      <video id="video" ref={videoRef} autoPlay controls crossOrigin="anonymous"></video>
      <div>
        <canvas id="c1" ref={c1Ref} width="400" height="300" style={{ display: "none" }}></canvas>
        <StContainer>
          <StBgImg> </StBgImg>
          <StCanvas id="c2" ref={c2Ref} width="400" height="300"></StCanvas>
        </StContainer>
      </div>
    </div>
  );
};

export default VideoProcessor;

const StBgImg = styled.div`
  position: absolute;
  width: 400px;
  height: 300px;
  background-image: url("https://as2.ftcdn.net/v2/jpg/02/73/70/73/1000_F_273707368_pkdLW0q5RK1IKGLEKyvmi7FU8Ccw4cok.jpg");
  background-size: cover;
  z-index: 1;
`;
const StContainer = styled.div`
  width: 400px;
  height: 300px;
`;
const StCanvas = styled.canvas`
  position: absolute;
  z-index: 2;
  width: 400px;
  height: 300px;
`;
