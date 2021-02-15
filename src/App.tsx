import React, { useState } from "react";

declare global {
  interface MediaTrackConstraints {
    cursor: "always" | "motion" | "never";
  }

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

async function takeScreenshot(fileName: string): Promise<void> {
  if (navigator.mediaDevices.getDisplayMedia === undefined) {
    throw new Error(
      "Browser does not support 'navigator.mediaDevices.getDisplayMedia()'"
    );
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: false,
    video: {
      cursor: "never",
    },
  });
  const { width, height } = getDimension(stream);
  const video = document.createElement("video");

  video.addEventListener(
    "canplay",
    () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d")!;
      context.drawImage(video, 0, 0, width, height);

      downloadImage(canvas.toDataURL(), fileName);

      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    },
    { once: true }
  );
  video.width = width;
  video.height = height;
  video.autoplay = true;
  video.srcObject = stream;
}

function App() {
  const [error, setError] = useState<Error>();
  const handleScreenshot = async () => {
    setError(undefined);

    try {
      await takeScreenshot("screenshot.png");
    } catch (error) {
      console.error(error);
      setError(error);
    }
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

      <div className="controls">
        {error && (
          <p className="error">
            {error.name} &rarr; {error.message}
            {error.stack && <pre>{error.stack}</pre>}
          </p>
        )}
        <p>
          <button onClick={handleScreenshot}>Take screenshot</button>
        </p>
      </div>
    </main>
  );
}

export default App;
