import { useEffect, useRef } from "react";

const SKILLS = [
  ".NET",
  "C#",
  "ASP.NET",
  "VB.NET",
  "Web API",
  "REST",
  "WCF",
  "SQL Server",
  "T-SQL",
  "Oracle",
  "Angular",
  "Azure",
  "AWS",
  "DevOps",
  "JavaScript",
  "HTML",
  "CSS",
  "Git",
  "LINQ",
  "SSIS",
  "JSON",
  "SOAP",
  "IIS",
  "MS Fabric",
  "Agile",
] as const;

const MAX_LIVE = 2000;
const COOLDOWN_MS = 95;
const MIN_MOVE_PX = 14;
const GROUND_PAD = 0;
const FLOOR_DWELL_MS = 7000;

type CardEl = HTMLDivElement & {
  _fadeTimer?: ReturnType<typeof setTimeout> | null;
  _fallAnim?: Animation | null;
  _landed?: boolean;
};

function pickSkill(): string {
  return SKILLS[(Math.random() * SKILLS.length) | 0];
}

export function useSkillCards() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const layer = layerRef.current;
    if (!layer) return;
    const mount: HTMLDivElement = layer;

    const live: CardEl[] = [];
    let inFlight = 0;
    let zBase = 1;
    let lastSpawn = 0;
    let lastX = -9999;
    let lastY = -9999;

    function removeCard(card: CardEl) {
      if (card._fadeTimer) {
        clearTimeout(card._fadeTimer);
        card._fadeTimer = null;
      }
      if (card._fallAnim?.cancel) {
        try {
          card._fallAnim.cancel();
        } catch {
          /* ignore */
        }
        card._fallAnim = null;
        if (!card._landed) {
          inFlight = Math.max(0, inFlight - 1);
        }
      }
      const i = live.indexOf(card);
      if (i !== -1) live.splice(i, 1);
      card.remove();
    }

    function trimLive() {
      while (live.length > MAX_LIVE) {
        let victim: CardEl | null = null;
        for (let i = 0; i < live.length; i++) {
          if (!live[i]._landed) {
            victim = live[i];
            break;
          }
        }
        if (victim) removeCard(victim);
        else break;
      }
    }

    function spawn(clientX: number, clientY: number) {
      const card = document.createElement("div") as CardEl;
      card.className = "skill-card";
      card.textContent = pickSkill();
      card.style.left = `${clientX}px`;
      card.style.top = `${clientY}px`;
      card.style.bottom = "auto";
      card.style.transform = "translate(-50%, -50%)";
      card.style.zIndex = String(++zBase);
      card._landed = false;

      const r0 = (Math.random() - 0.5) * 14;
      const r1 = r0 + (Math.random() - 0.5) * 22;

      mount.appendChild(card);
      live.push(card);
      trimLive();

      const rect = card.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const driftX = (Math.random() - 0.5) * 100;
      const endX = Math.round(Math.min(w - 32, Math.max(32, clientX + driftX)));

      inFlight += 1;

      const landCenterY = h - GROUND_PAD - rect.height / 2;
      const dX = endX - clientX;
      const dY = landCenterY - clientY;
      const dist = Math.sqrt(dX * dX + dY * dY);
      const duration = Math.min(1600, Math.max(380, 320 + dist * 0.85));

      const keyframes: Keyframe[] = [
        {
          transform: `translate(-50%, -50%) translate(0px, 0px) rotate(${r0}deg)`,
          filter: "brightness(1.02)",
        },
        {
          transform: `translate(-50%, -50%) translate(${dX}px, ${dY}px) rotate(${r1}deg)`,
          filter: "brightness(1)",
        },
      ];

      const anim = card.animate(keyframes, {
        duration,
        easing: "cubic-bezier(0.34, 0.02, 0.55, 1)",
        fill: "forwards",
      });
      card._fallAnim = anim;

      anim.finished
        .then(() => {
          card._fallAnim = null;
          inFlight = Math.max(0, inFlight - 1);
          card._landed = true;
          card.style.top = "auto";
          card.style.bottom = `${GROUND_PAD}px`;
          card.style.left = `${endX}px`;
          card.style.transform = `translateX(-50%) rotate(${r1}deg)`;
          card.style.filter = "";
          try {
            anim.cancel();
          } catch {
            /* ignore */
          }

          function startFloorDwell() {
            card._fadeTimer = window.setTimeout(() => {
              card._fadeTimer = null;
              card.classList.add("skill-card--fading");
              window.setTimeout(() => removeCard(card), 800);
            }, FLOOR_DWELL_MS);
          }
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(startFloorDwell);
            });
          });
        })
        .catch(() => {
          /* fall cancelled */
        });
    }

    function onMove(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const dist = Math.hypot(x - lastX, y - lastY);
      if (now - lastSpawn < COOLDOWN_MS && dist < MIN_MOVE_PX) return;
      if (dist < MIN_MOVE_PX && now - lastSpawn < COOLDOWN_MS * 2) return;
      lastSpawn = now;
      lastX = x;
      lastY = y;
      spawn(x, y);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      while (live.length) {
        removeCard(live[0]);
      }
    };
  }, []);

  return layerRef;
}
