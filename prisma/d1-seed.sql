INSERT OR IGNORE INTO "User" ("id","email","name","slug","bio","offering","lookingFor","skills","optInBuilders","takesMeetings","createdAt")
VALUES
('seed_ada','ada@opentool.cafe','Ada','ada','Local models and kitchen-table hardware.','Ollama setups, eval harnesses','someone to design a landing page','python, mlx, rust',0,1,CURRENT_TIMESTAMP),
('seed_gus','gus@opentool.cafe','Gus','gus','I ship Saturday projects.','Next.js, Stripe, ugly-but-live MVPs','a hardware person for a cafe kiosk','typescript, prisma',0,0,CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Listing" ("id","number","slug","name","officialUrl","oneLiner","body","tags","claimed","offersMeetings","createdAt")
VALUES
('l1',1,'comfyui','ComfyUI','https://github.com/Comfy-Org/ComfyUI','A node graph for diffusion image models.','Open-source interface for image-generation workflows on your own machine.','local-ai,images',0,0,CURRENT_TIMESTAMP),
('l2',2,'home-assistant','Home Assistant','https://github.com/home-assistant/core','Home automation you host locally.','Local home automation. Runs on hardware you own.','home,self-hosted',0,0,CURRENT_TIMESTAMP),
('l3',3,'immich','Immich','https://github.com/immich-app/immich','Photo and video backup on your hardware.','Self-hosted photos. Google Photos shape, your disk.','photos,self-hosted',0,0,CURRENT_TIMESTAMP),
('l4',4,'ollama','Ollama','https://github.com/ollama/ollama','Run large language models locally.','Download and run open models on your machine.','local-ai,models',0,1,CURRENT_TIMESTAMP),
('l5',5,'open-webui','Open WebUI','https://github.com/open-webui/open-webui','A web interface for local models.','Browser UI in front of local models.','local-ai,self-hosted',0,0,CURRENT_TIMESTAMP),
('l6',6,'paperless-ngx','Paperless-ngx','https://github.com/paperless-ngx/paperless-ngx','Scan and search documents on your machine.','Documents stay on the box. Search them later.','documents,self-hosted',0,0,CURRENT_TIMESTAMP),
('l7',7,'penpot','Penpot','https://github.com/penpot/penpot','An open-source design tool you can host.','Design files on a host you run.','design,self-hosted',0,0,CURRENT_TIMESTAMP),
('l8',8,'transformers','Transformers','https://github.com/huggingface/transformers','The Hugging Face library for open models.','Python library for open models.','models,huggingface',0,0,CURRENT_TIMESTAMP),
('l9',9,'umami','Umami','https://github.com/umami-software/umami','Web analytics you host yourself.','Site stats without sending visitors to someone else.','analytics,self-hosted',0,0,CURRENT_TIMESTAMP),
('l10',10,'uptime-kuma','Uptime Kuma','https://github.com/louislam/uptime-kuma','A monitoring dashboard you run yourself.','Uptime checks on your own host.','monitoring,self-hosted',0,0,CURRENT_TIMESTAMP),
('l11',11,'whisper','Whisper','https://github.com/openai/whisper','Speech-to-text you can run offline.','Transcribe audio on the machine. No upload required.','models,huggingface,audio',0,0,CURRENT_TIMESTAMP),
('l12',12,'n8n','n8n','https://github.com/n8n-io/n8n','Workflow automation you can self-host.','Automations on a box you run.','automation,self-hosted',0,0,CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "Post" ("id","authorId","kind","title","body","tags","createdAt")
VALUES
('p1','seed_ada','help','Need a second pair of eyes on a local RAG box','I have Gemma on a Mini. Retrieval is messy. Looking for someone who has actually shipped local RAG, not a tutorial.','local-ai,rag',CURRENT_TIMESTAMP),
('p2','seed_gus','collab','Wanted: hardware person for a cafe kiosk','Building a physical order-ticket printer that talks to this site. I can do the web. I cannot do the serial port.','hardware,nextjs',CURRENT_TIMESTAMP),
('p3','seed_ada','service','I will stand up Ollama + Open WebUI on your LAN','One evening. You get a URL on Tailscale and a model that stays in the house.','ollama,self-hosted',CURRENT_TIMESTAMP);
