import React from "react";

declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }
}

function getDimension(stream: MediaStream): { width: number; height: number } {
  const tracks = stream.getVideoTracks();
  let width = 0;
  let height = 0;

  tracks.forEach((track) => {
    const settings = track.getSettings();

    width = Math.max(width, settings.width || 0);
    height = Math.max(height, settings.height || 0);
  });

  return { width, height };
}

function downloadImage(data: string, fileName: string): void {
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  a.click();
}

function App() {
  const handleScreenshot = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia();
    const { width, height } = getDimension(stream);
    const video = document.createElement("video");
    const handlePlay = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d")!;
      context.drawImage(video, 0, 0, width, height);

      downloadImage(canvas.toDataURL(), "screenshot.png");

      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      video.removeEventListener("canplay", handlePlay);
    };

    video.addEventListener("canplay", handlePlay);
    video.width = width;
    video.height = height;
    video.autoplay = true;
    video.srcObject = stream;
  };

  return (
    <main>
      <h1>Web Screenshot</h1>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis
        reprehenderit nam nesciunt distinctio asperiores fuga officia veniam
        odit perspiciatis ullam, dignissimos, quasi earum. Hic consectetur
        architecto perferendis iste vel commodi.
      </p>

      <p className="controls">
        <button onClick={handleScreenshot}>Take screenshot</button>
      </p>
    </main>
  );
}

export default App;
