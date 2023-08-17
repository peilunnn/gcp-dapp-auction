import axios from "axios";

const beGenerateAIArtUrl = process.env.REACT_APP_BE_GENERATE_AI_ART_URL;

export function generateAIArt(
  prompt,
  setImage,
  setGenerateLoading,
  enqueueSnackbar
) {

  if (prompt.trim() === "") {
    enqueueSnackbar("Please provide a prompt", {
      variant: "error",
    });
    return;
  }

  const data = {
    prompt: prompt,
    sampleCount: 1,
  };

  axios
    .post(beGenerateAIArtUrl, data)
    .then((response) => {
      const image = response.data.predictions.map((prediction) => {
        const buffer = Buffer.from(prediction.bytesBase64Encoded, "base64");
        const blob = new Blob([buffer.buffer], { type: "image/png" });
        return URL.createObjectURL(blob);
      });

      setImage(image);
      setGenerateLoading(false);
      enqueueSnackbar("Successfully generated AI art", {
        variant: "success",
      });
    })
    .catch((error) => {
      console.log("Error generating AI art:", error);
      enqueueSnackbar("Prompt violates our policies", {
        variant: "error",
      });
      setGenerateLoading(false);
    });
}
