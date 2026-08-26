import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const listings = [
  {
    number: 1,
    slug: "comfyui",
    name: "ComfyUI",
    officialUrl: "https://github.com/Comfy-Org/ComfyUI",
    oneLiner: "A node graph for diffusion image models.",
    body: "Open-source interface for image-generation workflows on your own machine.",
    tags: "local-ai,images",
  },
  {
    number: 2,
    slug: "home-assistant",
    name: "Home Assistant",
    officialUrl: "https://github.com/home-assistant/core",
    oneLiner: "Home automation you host locally.",
    body: "Local home automation. Runs on hardware you own.",
    tags: "home,self-hosted",
  },
  {
    number: 3,
    slug: "immich",
    name: "Immich",
    officialUrl: "https://github.com/immich-app/immich",
    oneLiner: "Photo and video backup on your hardware.",
    body: "Self-hosted photos. Google Photos shape, your disk.",
    tags: "photos,self-hosted",
  },
  {
    number: 4,
    slug: "ollama",
    name: "Ollama",
    officialUrl: "https://github.com/ollama/ollama",
    oneLiner: "Run large language models locally.",
    body: "Download and run open models on your machine.",
    tags: "local-ai,models",
    offersMeetings: true,
  },
  {
    number: 5,
    slug: "open-webui",
    name: "Open WebUI",
    officialUrl: "https://github.com/open-webui/open-webui",
    oneLiner: "A web interface for local models.",
    body: "Browser UI in front of local models.",
    tags: "local-ai,self-hosted",
  },
  {
    number: 6,
    slug: "paperless-ngx",
    name: "Paperless-ngx",
    officialUrl: "https://github.com/paperless-ngx/paperless-ngx",
    oneLiner: "Scan and search documents on your machine.",
    body: "Documents stay on the box. Search them later.",
    tags: "documents,self-hosted",
  },
  {
    number: 7,
    slug: "penpot",
    name: "Penpot",
    officialUrl: "https://github.com/penpot/penpot",
    oneLiner: "An open-source design tool you can host.",
    body: "Design files on a host you run.",
    tags: "design,self-hosted",
  },
  {
    number: 8,
    slug: "transformers",
    name: "Transformers",
    officialUrl: "https://github.com/huggingface/transformers",
    oneLiner: "The Hugging Face library for open models.",
    body: "Python library for open models.",
    tags: "models,huggingface",
  },
  {
    number: 9,
    slug: "umami",
    name: "Umami",
    officialUrl: "https://github.com/umami-software/umami",
    oneLiner: "Web analytics you host yourself.",
    body: "Site stats without sending visitors to someone else.",
    tags: "analytics,self-hosted",
  },
  {
    number: 10,
    slug: "uptime-kuma",
    name: "Uptime Kuma",
    officialUrl: "https://github.com/louislam/uptime-kuma",
    oneLiner: "A monitoring dashboard you run yourself.",
    body: "Uptime checks on your own host.",
    tags: "monitoring,self-hosted",
  },
  {
    number: 11,
    slug: "whisper",
    name: "Whisper",
    officialUrl: "https://github.com/openai/whisper",
    oneLiner: "Speech-to-text you can run offline.",
    body: "Transcribe audio on the machine. No upload required.",
    tags: "models,huggingface,audio",
  },
  {
    number: 12,
    slug: "n8n",
    name: "n8n",
    officialUrl: "https://github.com/n8n-io/n8n",
    oneLiner: "Workflow automation you can self-host.",
    body: "Automations on a box you run.",
    tags: "automation,self-hosted",
  },
];

async function main() {
  for (const row of listings) {
    await prisma.listing.upsert({
      where: { slug: row.slug },
      update: {
        name: row.name,
        officialUrl: row.officialUrl,
        oneLiner: row.oneLiner,
        body: row.body,
        tags: row.tags,
        number: row.number,
        offersMeetings: Boolean(row.offersMeetings),
      },
      create: {
        number: row.number,
        slug: row.slug,
        name: row.name,
        officialUrl: row.officialUrl,
        oneLiner: row.oneLiner,
        body: row.body,
        tags: row.tags,
        offersMeetings: Boolean(row.offersMeetings),
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
