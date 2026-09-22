import {
  TryOnProgressUpdate,
  TryOnRequest,
  TryOnResponse,
  VirtualTryOnProvider,
} from "./types";

export class ReplicateTryOnProvider implements VirtualTryOnProvider {
  name = "replicate";
  private apiToken: string;
  private modelVersion: string;

  constructor(
    apiToken?: string,
    modelVersion: string = "c871bb9b046607b680486fa513fb29e873879a2485bed8d4134ae0886184f822" // IDM-VTON
  ) {
    this.apiToken = apiToken || process.env.REPLICATE_API_TOKEN || "";
    this.modelVersion = modelVersion;
  }

  async generateTryOn(
    request: TryOnRequest,
    onProgress?: (update: TryOnProgressUpdate) => void
  ): Promise<TryOnResponse> {
    const startTime = Date.now();

    if (!this.apiToken) {
      throw new Error(
        "REPLICATE_API_TOKEN is not configured. Falling back to Demo Provider."
      );
    }

    onProgress?.({
      stage: "analyzing",
      message: "Submitting request to neural inference engine",
      percent: 15,
    });

    // Map categories to model input categories
    const categoryMapping: Record<string, string> = {
      tops: "upper_body",
      outerwear: "upper_body",
      knitwear: "upper_body",
      tailoring: "upper_body",
      dresses: "dresses",
      bottoms: "lower_body",
    };

    const garType = categoryMapping[request.garmentCategory] || "upper_body";

    // Call Replicate Predictions API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: this.modelVersion,
        input: {
          human_img: request.personImage,
          garm_img: request.garmentImage,
          garment_des: request.productName || "high-end apparel",
          category: garType,
          crop: false,
          denoise_steps: 30,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Replicate API error: ${response.status} — ${err}`);
    }

    let prediction = await response.json();
    const requestId = prediction.id;

    onProgress?.({
      stage: "segmenting",
      message: "Segmenting garment and subject pose",
      percent: 45,
    });

    // Poll until completed or timeout (max 45 seconds)
    const pollStart = Date.now();
    while (
      prediction.status === "starting" ||
      prediction.status === "processing"
    ) {
      if (Date.now() - pollStart > 45000) {
        throw new Error("Virtual try-on model generation timed out (45s).");
      }

      await new Promise((r) => setTimeout(r, 1500));

      onProgress?.({
        stage: "synthesizing",
        message: "Synthesizing garment drape & realistic transfer",
        percent: 75,
      });

      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!pollRes.ok) {
        throw new Error(`Failed to poll status: ${pollRes.statusText}`);
      }

      prediction = await pollRes.json();
    }

    if (prediction.status === "failed") {
      throw new Error(prediction.error || "Inference failed on model server.");
    }

    onProgress?.({
      stage: "finalizing",
      message: "Refining 4K render output",
      percent: 95,
    });

    const outputUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    const processingTimeMs = Date.now() - startTime;

    onProgress?.({
      stage: "completed",
      message: "Garment transfer complete",
      percent: 100,
    });

    return {
      requestId,
      status: "completed",
      resultImage: outputUrl,
      processingTimeMs,
      provider: "replicate",
      model: "idm-vton",
    };
  }
}
