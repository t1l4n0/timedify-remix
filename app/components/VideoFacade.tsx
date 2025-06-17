import { useState } from "react";
import { Button, Box } from "@shopify/polaris";
import { PlayIcon } from "@shopify/polaris-icons";

interface VideoFacadeProps {
  videoId: string;
  videoType: "youtube" | "loom";
  title: string;
  loomSid?: string;
}

export default function VideoFacade({ videoId, videoType, title, loomSid }: VideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playVideo = () => {
    setIsPlaying(true);
  };
  
  if (isPlaying) {
    if (videoType === "youtube") {
      return (
        <Box padding="400">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={`YouTube video player: ${title}`}
            width="100%"
            height="315"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </Box>
      );
    } else if (videoType === "loom") {
      return (
        <Box padding="400">
          <iframe 
            src={`https://www.loom.com/embed/${videoId}?sid=${loomSid}&autoplay=1`}
            title={`Loom video player: ${title}`}
            width="100%" 
            height="315"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </Box>
      );
    }
  }
  
  return (
    <Box
      padding="800"
      background="bg-subdued"
      borderRadius="200"
      borderWidth="025"
      borderColor="border"
      style={{ cursor: "pointer", textAlign: "center" }}
      onClick={playVideo}
    >
      <Button icon={PlayIcon} onClick={playVideo}>
        {title}
      </Button>
    </Box>
  );
}
