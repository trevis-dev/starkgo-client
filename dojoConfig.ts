import manifest from "./starkgo/manifests/dev/manifest.json";
import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: "http://localhost:8080"
});
