import { DemoTryOnProvider } from "./demo";
import { IDMVTONTryOnProvider } from "./idm-vton";
import { ReplicateTryOnProvider } from "./replicate";
import { VirtualTryOnProvider } from "./types";

let providerInstance: VirtualTryOnProvider | null = null;

export function getVirtualTryOnProvider(): VirtualTryOnProvider {
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.REPLICATE_API_TOKEN;

  if (isDemoMode) {
    if (!providerInstance || providerInstance.name !== "demo") {
      providerInstance = new DemoTryOnProvider();
    }
    return providerInstance;
  }

  // When REPLICATE_API_TOKEN is present, use mask-conditioned IDM-VTON
  if (!providerInstance || providerInstance.name !== "idm-vton") {
    providerInstance = new IDMVTONTryOnProvider();
  }
  return providerInstance;
}
