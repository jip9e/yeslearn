import { resolveCopilotBearer } from "../src/lib/auth/providers/githubCopilot";
import { writeFileSync } from "fs";

(async () => {
  try {
    const auth = await resolveCopilotBearer();
    const res = await fetch("https://api.individual.githubcopilot.com/models", {
      headers: {
        Authorization: `Bearer ${auth.bearerToken}`,
        Accept: "application/json",
        "Copilot-Integration-Id": "vscode-chat",
        "Editor-Version": "vscode/1.99.0",
        "Editor-Plugin-Version": "copilot-chat/0.26.0",
      },
    });
    console.log("Status:", res.status);
    const data = await res.json();
    
    // Save full response to a file
    writeFileSync("/workspaces/yeslearn/models-output.json", JSON.stringify(data, null, 2));
    console.log("Saved to models-output.json");

    if (Array.isArray(data)) {
      data.forEach((m: any) => {
        console.log(`  ${m.id}  →  ${m.name || "(no name)"}  [${m.version || ""}]`);
      });
      console.log(`\nTotal: ${data.length} models`);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    writeFileSync("/workspaces/yeslearn/models-output.json", JSON.stringify({ error: e.message }, null, 2));
    console.error("Error:", e.message);
  }
})();
