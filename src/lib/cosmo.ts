import { PLANETS } from "../data/spaceData";
import { MOONS } from "../data/moons";
import { DWARF_PLANETS } from "../data/dwarfs";
import { SATELLITES } from "../data/satellites";
import { AGENCIES } from "../data/agencies";
import { EXPERIMENTS } from "../data/experiments";

export type CosmoSection =
  | "universe"
  | "earthhub"
  | "agencies"
  | "missions"
  | "timeline"
  | "lab"
  | "cosmo"
  | "quiz";

export type CosmoAction =
  | { type: "openSection"; section: CosmoSection }
  | { type: "focusPlanet"; id: string }
  | { type: "focusMoon"; id: string }
  | { type: "focusDwarf"; id: string }
  | { type: "focusSatellite"; id: string }
  | { type: "filterAgency"; id: string }
  | { type: "startExperiment"; id: string };

type ChatTurn = { role: "user" | "assistant"; content: string };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function knowledgeDigest() {
  return JSON.stringify({
    sections: ["universe", "earthhub", "agencies", "missions", "timeline", "lab", "cosmo", "quiz"],
    planets: PLANETS.map(p => ({ id: p.id, name: p.name, fact: p.fact })),
    moons: MOONS.map(m => ({ id: m.id, name: m.name, planetId: m.planetId, fact: m.fact })),
    dwarfs: DWARF_PLANETS.map(d => ({ id: d.id, name: d.name, fact: d.fact })),
    satellites: SATELLITES.map(s => ({
      id: s.id, name: s.name, agencyId: s.agencyId, orbitClass: s.orbitClass, headline: s.headline,
    })),
    agencies: AGENCIES.map(a => ({ id: a.id, shortName: a.shortName, country: a.country })),
    experiments: EXPERIMENTS.map(e => ({ id: e.id, title: e.title })),
  });
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "openSection",
      description: "Open an app section",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string", enum: ["universe", "earthhub", "agencies", "missions", "timeline", "lab", "quiz"] },
        },
        required: ["section"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "focusPlanet",
      description: "Focus a planet in the 3D Universe view",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "focusMoon",
      description: "Focus a major moon",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "focusDwarf",
      description: "Focus a dwarf planet",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "focusSatellite",
      description: "Highlight a satellite in Earth Hub",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "filterAgency",
      description: "Filter Earth Hub by space agency id",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "startExperiment",
      description: "Open Space Lab with an experiment id",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
];

function parseArgs(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function actionFromTool(name: string, args: Record<string, string>): CosmoAction | null {
  if (name === "openSection" && args.section) return { type: "openSection", section: args.section as CosmoSection };
  if (name === "focusPlanet" && args.id) return { type: "focusPlanet", id: args.id };
  if (name === "focusMoon" && args.id) return { type: "focusMoon", id: args.id };
  if (name === "focusDwarf" && args.id) return { type: "focusDwarf", id: args.id };
  if (name === "focusSatellite" && args.id) return { type: "focusSatellite", id: args.id };
  if (name === "filterAgency" && args.id) return { type: "filterAgency", id: args.id };
  if (name === "startExperiment" && args.id) return { type: "startExperiment", id: args.id };
  return null;
}

export async function askCosmo(
  question: string,
  history: ChatTurn[],
): Promise<{ text: string; actions: CosmoAction[] }> {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) {
    throw new Error("missing_key");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are Cosmo, SpaceVerse's space guide. Answer briefly using the local catalog. Use tools to navigate the app when the user asks to see or compare something. Never invent satellite IDs — only use ids from the catalog.\n\nCATALOG:\n" +
            knowledgeDigest(),
        },
        ...history.slice(-8),
        { role: "user", content: question },
      ],
      tools: TOOLS,
      tool_choice: "auto",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err.slice(0, 200) || `groq_${res.status}`);
  }

  const data = await res.json() as {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>;
      };
    }>;
  };

  const msg = data.choices?.[0]?.message;
  const actions: CosmoAction[] = [];
  for (const call of msg?.tool_calls ?? []) {
    const name = call.function?.name ?? "";
    const args = parseArgs(call.function?.arguments ?? "{}");
    const action = actionFromTool(name, args);
    if (action) actions.push(action);
  }

  const text = (msg?.content ?? "").trim() ||
    (actions.length ? "On it — opening that in SpaceVerse." : "I couldn't form a reply. Try a suggestion chip.");

  return { text, actions };
}
