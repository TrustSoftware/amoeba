(() => {
  "use strict";

  const characters = [
    {
      id: "drift",
      name: "Drift",
      trait: "Steady",
      description: "Calm, deliberate, and good at finding the signal.",
      color: "#83c1bd",
      accent: "#467f7d",
      shape: "ring",
      opening: "Take a breath. We can make this smaller, clearer, and more useful.",
      respond(topic) {
        return `Let's slow it down. The useful part of “${topic}” is probably the decision underneath it. What must be true for this to work?`;
      }
    },
    {
      id: "spark",
      name: "Spark",
      trait: "Provocative",
      description: "Fast, direct, and suspicious of polite assumptions.",
      color: "#d9632f",
      accent: "#7e291d",
      shape: "spike",
      opening: "Good. Now tell me the version everyone else is being too polite to say.",
      respond(topic) {
        return `The polite version of “${topic}” is hiding the real bet. What are you afraid would be obvious if this failed?`;
      }
    },
    {
      id: "bloom",
      name: "Bloom",
      trait: "Generative",
      description: "Imaginative, warm, and interested in unexpected combinations.",
      color: "#d45150",
      accent: "#7e293d",
      shape: "flower",
      opening: "Let's treat the rough edges as material rather than defects.",
      respond(topic) {
        return `What if “${topic}” is not one idea but three ideas trying to share a coat? Separate them, then recombine the strongest two.`;
      }
    },
    {
      id: "prism",
      name: "Prism",
      trait: "Skeptical",
      description: "Analytical, precise, and unwilling to accept a weak premise.",
      color: "#252d31",
      accent: "#7b878c",
      shape: "prism",
      opening: "I will challenge the premise, not you. Start with the evidence.",
      respond(topic) {
        return `Before accepting “${topic},” separate facts, guesses, and preferences. Which claim has the weakest evidence but the biggest consequence?`;
      }
    },
    {
      id: "tide",
      name: "Tide",
      trait: "Curious",
      description: "Fluid, exploratory, and good at spotting adjacent possibilities.",
      color: "#0d6b89",
      accent: "#58a9bb",
      shape: "tide",
      opening: "There is usually another current under the first answer. Let's find it.",
      respond(topic) {
        return `There are at least two currents inside “${topic}”: what you want, and what the situation permits. Where do they actually overlap?`;
      }
    },
    {
      id: "slate",
      name: "Slate",
      trait: "Blunt",
      description: "Minimal, practical, and allergic to decorative complexity.",
      color: "#172329",
      accent: "#4d5c62",
      shape: "slate",
      opening: "Blunt version: cut the ornament and name the next move.",
      respond(topic) {
        return `Blunt version: “${topic}” is too broad to execute. Pick one owner, one deadline, and one result you can verify.`;
      }
    },
    {
      id: "fizz",
      name: "Fizz",
      trait: "Playful",
      description: "Light, mischievous, and useful when seriousness gets stuck.",
      color: "#f3cd45",
      accent: "#b16037",
      shape: "fizz",
      opening: "Excellent. Let's make it less grand and more alive.",
      respond(topic) {
        return `Make “${topic}” a tiny experiment you could try badly by tomorrow. What is the cheapest version that would still teach you something?`;
      }
    },
    {
      id: "orbit",
      name: "Orbit",
      trait: "Strategic",
      description: "Systems-minded, forward-looking, and focused on leverage.",
      color: "#9d3335",
      accent: "#eb826d",
      shape: "orbit",
      opening: "Let's map the system: incentives, constraints, and the smallest point of leverage.",
      respond(topic) {
        return `Treat “${topic}” as a system. Who benefits, who blocks it, and which single dependency controls the rest?`;
      }
    }
  ];

  const views = [...document.querySelectorAll("[data-view]")];
  const characterGrid = document.querySelector("#character-grid");
  const selectedName = document.querySelector("#selected-name");
  const selectedDescription = document.querySelector("#selected-description");
  const activeName = document.querySelector("#active-name");
  const activeTrait = document.querySelector("#active-trait");
  const activeCharacter = document.querySelector("#active-character");
  const companionSeat = document.querySelector("#companion-seat");
  const conversationLog = document.querySelector("#conversation-log");
  const homeInput = document.querySelector("#home-input");
  const castInput = document.querySelector("#cast-input");
  const conversationInput = document.querySelector("#conversation-input");
  const continueButton = document.querySelector("#continue-button");
  const soundToggle = document.querySelector("#sound-toggle");
  const aboutDialog = document.querySelector("#about-dialog");

  let selectedIndex = readNumber("amoeba-character", 0);
  let pendingThought = "";
  let conversationStarted = false;
  let soundOn = false;
  let activeRecognition = null;
  let activeMicButton = null;
  let responseTimer = null;

  function readNumber(key, fallback) {
    try {
      const value = Number.parseInt(window.localStorage.getItem(key), 10);
      return Number.isInteger(value) && value >= 0 ? value % characters.length : fallback;
    } catch {
      return fallback;
    }
  }

  function saveSelection() {
    try {
      window.localStorage.setItem("amoeba-character", String(selectedIndex));
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }

  function normalizeIndex(index) {
    return (index + characters.length) % characters.length;
  }

  function clipTopic(value, maxLength = 92) {
    const clean = value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
    if (!clean) return "this idea";
    return clean.length > maxLength ? `${clean.slice(0, maxLength - 1).trim()}…` : clean;
  }

  function svgFor(character, context = "card") {
    const id = `${character.id}-${context}`.replace(/[^a-z0-9-]/gi, "");
    const commonStart = `<svg viewBox="0 0 200 200" role="img" aria-label="${character.name} character"><defs><linearGradient id="g-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${character.color}"/><stop offset="1" stop-color="${character.accent}"/></linearGradient><radialGradient id="s-${id}" cx=".3" cy=".22" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".48" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient></defs>`;
    const end = `</svg>`;

    switch (character.shape) {
      case "ring":
        return `${commonStart}<path fill="url(#g-${id})" fill-rule="evenodd" d="M99 12c34-3 68 15 84 45 17 31 7 68-9 96-16 29-48 43-80 39-33-4-63-23-76-53-13-31-5-67 15-93C52 21 70 15 99 12Zm3 54c-17-1-31 9-36 25-5 18 1 40 15 50 14 11 36 8 47-6 12-14 15-35 7-50-7-13-18-18-33-19Z"/><path fill="url(#s-${id})" fill-rule="evenodd" d="M99 12c34-3 68 15 84 45 17 31 7 68-9 96-16 29-48 43-80 39-33-4-63-23-76-53-13-31-5-67 15-93C52 21 70 15 99 12Zm3 54c-17-1-31 9-36 25-5 18 1 40 15 50 14 11 36 8 47-6 12-14 15-35 7-50-7-13-18-18-33-19Z"/>${end}`;
      case "spike":
        return `${commonStart}<path fill="url(#g-${id})" d="m99 7 12 43 27-35-3 45 42-19-25 38 46 2-43 19 38 25-46-3 18 42-35-27-2 46-18-42-25 38 3-46-42 18 27-35-46-2 43-18-38-26 46 4-18-43 35 27Z"/><circle cx="101" cy="101" r="42" fill="url(#s-${id})" opacity=".48"/>${end}`;
      case "flower":
        return `${commonStart}<g fill="url(#g-${id})"><ellipse cx="101" cy="41" rx="27" ry="44"/><ellipse cx="101" cy="159" rx="27" ry="44"/><ellipse cx="41" cy="101" rx="44" ry="27"/><ellipse cx="159" cy="101" rx="44" ry="27"/><ellipse cx="58" cy="58" rx="26" ry="43" transform="rotate(-45 58 58)"/><ellipse cx="144" cy="144" rx="26" ry="43" transform="rotate(-45 144 144)"/><ellipse cx="144" cy="58" rx="26" ry="43" transform="rotate(45 144 58)"/><ellipse cx="58" cy="144" rx="26" ry="43" transform="rotate(45 58 144)"/></g><circle cx="101" cy="101" r="38" fill="${character.accent}"/><circle cx="90" cy="87" r="20" fill="url(#s-${id})" opacity=".66"/>${end}`;
      case "prism":
        return `${commonStart}<g fill="none" stroke="${character.color}" stroke-width="7" stroke-linejoin="round" opacity=".94"><path d="M20 135 45 45l73-27 64 48-12 91-75 29Z"/><path d="m45 45 53 141 20-168 52 139L20 135l162-69L45 45l125 112-75 29L20 135 118 18"/></g><g fill="${character.accent}" opacity=".82"><circle cx="45" cy="45" r="6"/><circle cx="118" cy="18" r="6"/><circle cx="182" cy="66" r="6"/><circle cx="170" cy="157" r="6"/><circle cx="95" cy="186" r="6"/><circle cx="20" cy="135" r="6"/></g>${end}`;
      case "tide":
        return `${commonStart}<path fill="url(#g-${id})" fill-rule="evenodd" d="M25 90c-6-35 18-69 53-78 35-9 72 5 94 34 22 29 22 69 4 100-18 31-55 50-91 43-36-7-66-38-69-74-1-9 2-18 9-25Zm63-35c-13 1-25 12-26 25-1 13 9 26 22 29 13 3 27-4 32-16 5-12 1-27-10-34-5-3-11-5-18-4Zm53 51c-9 0-17 8-18 17-1 10 7 19 17 20 9 1 18-6 20-15 2-10-5-20-15-22h-4Z"/><path d="M27 72c20-13 36-17 55-14 25 4 38 21 59 26 15 4 28 1 41-6" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="7" stroke-linecap="round"/>${end}`;
      case "slate":
        return `${commonStart}<path fill="url(#g-${id})" d="M18 158 54 35l88-22 41 106-83 70Z"/><path d="m54 35 46 154 42-176M18 158l165-39M54 35l129 84" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="4"/><path d="m76 76 47-13-9 53-29 17Z" fill="url(#s-${id})" opacity=".4"/>${end}`;
      case "fizz":
        return `${commonStart}<path fill="url(#g-${id})" d="m101 7 11 38 24-32-2 40 35-20-17 36 40-7-31 26 38 7-39 9 31 25-40-6 18 35-36-18 4 40-26-31-9 39-9-39-27 31 5-40-37 18 19-35-40 6 31-25-39-9 39-7-31-26 40 7-18-36 35 20-2-40 24 32Z"/><path fill="url(#s-${id})" d="M60 73c18-24 52-33 78-18 18 10 28 31 25 51-23-8-37-3-50 12-13 15-29 20-55 14-10-20-10-41 2-59Z" opacity=".54"/>${end}`;
      case "orbit":
      default:
        return `${commonStart}<g fill="none" stroke="url(#g-${id})" stroke-linecap="round"><path stroke-width="13" d="M21 61c27-33 66-48 104-39 42 10 67 49 58 88-10 43-56 72-99 61-38-10-64-47-57-84 7-35 43-61 78-53 33 8 54 42 44 73-9 29-42 46-70 35-24-10-37-39-25-62 11-21 39-30 58-16"/><path stroke-width="7" d="M35 151 168 40M28 103l145 31M67 26l65 151" opacity=".7"/></g><g fill="${character.accent}"><circle cx="21" cy="61" r="9"/><circle cx="168" cy="40" r="8"/><circle cx="173" cy="134" r="9"/><circle cx="132" cy="177" r="7"/><circle cx="35" cy="151" r="8"/></g>${end}`;
    }
  }

  function renderCharacterGrid() {
    characterGrid.textContent = "";

    characters.forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "character-card";
      button.dataset.characterIndex = String(index);
      button.setAttribute("role", "listitem");
      button.setAttribute("aria-pressed", String(index === selectedIndex));
      button.innerHTML = `<span class="character-figure">${svgFor(character, `card-${index}`)}</span><strong>${character.name}</strong><span>${character.trait}</span>`;
      button.addEventListener("click", () => selectCharacter(index, true));
      characterGrid.append(button);
    });

    updateCharacterUI();
  }

  function selectCharacter(index, announce = false) {
    selectedIndex = normalizeIndex(index);
    saveSelection();
    updateCharacterUI();

    if (announce) {
      setStatus(`${characters[selectedIndex].name} selected.`, document.querySelector("[data-view='cast']"));
    }
  }

  function updateCharacterUI() {
    const character = characters[selectedIndex];
    const companion = characters[normalizeIndex(selectedIndex + 1)];

    document.querySelectorAll(".character-card").forEach((card, index) => {
      const selected = index === selectedIndex;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });

    selectedName.textContent = character.name;
    selectedDescription.textContent = character.description;
    activeName.textContent = character.name;
    activeTrait.textContent = character.trait;
    activeCharacter.innerHTML = svgFor(character, "active");
    companionSeat.innerHTML = svgFor(companion, "companion");
  }

  function showView(name, options = {}) {
    const next = views.find((view) => view.dataset.view === name);
    if (!next) return;

    views.forEach((view) => {
      const active = view === next;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    });

    document.body.dataset.view = name;

    if (options.updateHash !== false) {
      const hash = name === "home" ? "" : `#${name}`;
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    window.requestAnimationFrame(() => {
      const preferredFocus = name === "conversation" ? conversationInput : next.querySelector("input, button");
      if (options.focus !== false && preferredFocus) preferredFocus.focus({ preventScroll: true });
    });
  }

  function setStatus(message, scope = document) {
    const target = scope.querySelector("[data-status]");
    if (target) target.textContent = message;
  }

  function copyThoughtToCast() {
    if (pendingThought) castInput.value = pendingThought;
  }

  function startConversation() {
    clearTimeout(responseTimer);
    updateCharacterUI();
    showView("conversation");

    if (!conversationStarted) {
      conversationStarted = true;
      conversationLog.textContent = "";
      appendMessage("assistant", characters[selectedIndex].opening);

      if (pendingThought) {
        const thought = pendingThought;
        pendingThought = "";
        window.setTimeout(() => {
          appendMessage("user", thought);
          requestResponse(thought);
        }, 260);
      }
    } else if (pendingThought) {
      const thought = pendingThought;
      pendingThought = "";
      appendMessage("user", thought);
      requestResponse(thought);
    }
  }

  function appendMessage(role, text) {
    const message = document.createElement("div");
    message.className = `message message--${role}`;

    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = role === "assistant" ? characters[selectedIndex].name : "You";

    const body = document.createElement("span");
    body.textContent = text;

    message.append(label, body);
    conversationLog.append(message);
    conversationLog.scrollTop = conversationLog.scrollHeight;

    if (role === "assistant" && soundOn) speak(text);
  }

  function appendTyping() {
    const message = document.createElement("div");
    message.className = "message message--assistant is-typing";
    message.dataset.typing = "true";
    message.setAttribute("aria-label", `${characters[selectedIndex].name} is thinking`);
    message.innerHTML = `<span class="typing-dots" aria-hidden="true"><i></i><i></i><i></i></span>`;
    conversationLog.append(message);
    conversationLog.scrollTop = conversationLog.scrollHeight;
  }

  function requestResponse(message) {
    clearTimeout(responseTimer);
    appendTyping();
    setStatus(`${characters[selectedIndex].name} is thinking...`, document.querySelector("[data-view='conversation']"));

    const delay = 520 + Math.min(message.length * 7, 760);
    responseTimer = window.setTimeout(() => {
      conversationLog.querySelector("[data-typing]")?.remove();
      const topic = clipTopic(message);
      const answer = characters[selectedIndex].respond(topic);
      appendMessage("assistant", answer);
      setStatus("Local demo response. Connect a secure backend for real AI.", document.querySelector("[data-view='conversation']"));
    }, delay);
  }

  function sendConversationMessage() {
    const message = conversationInput.value.trim();
    if (!message) {
      conversationInput.focus();
      return;
    }

    stopRecognition();
    conversationInput.value = "";
    appendMessage("user", message);
    requestResponse(message);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = selectedIndex === 1 ? 1.08 : selectedIndex === 5 ? 0.88 : 1;
    utterance.lang = document.documentElement.lang || "en";
    window.speechSynthesis.speak(utterance);
  }

  function stopRecognition() {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {
        // Recognition may already be stopping.
      }
    }
  }

  function startRecognition(button) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const form = button.closest("form");
    const input = form?.querySelector("input");
    const view = button.closest("[data-view]") || document;

    if (!Recognition || !input) {
      setStatus("Voice input is unavailable in this browser. Type instead.", view);
      input?.focus();
      return;
    }

    if (activeRecognition && activeMicButton === button) {
      stopRecognition();
      return;
    }

    stopRecognition();

    const recognition = new Recognition();
    const originalText = input.value.trim();
    activeRecognition = recognition;
    activeMicButton = button;
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      button.classList.add("is-listening");
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Stop voice input");
      setStatus("Listening... speak naturally.", view);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      input.value = [originalText, transcript.trim()].filter(Boolean).join(originalText ? " " : "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };

    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone permission was blocked. Allow it or type instead.",
        "service-not-allowed": "Voice recognition is unavailable here. Type instead.",
        "no-speech": "I did not hear anything. Try again or type instead.",
        "audio-capture": "No microphone was found. Type instead.",
        network: "Voice recognition could not reach its service. Type instead."
      };
      if (event.error !== "aborted") {
        setStatus(messages[event.error] || "Voice input stopped. Type instead if needed.", view);
      }
    };

    recognition.onend = () => {
      button.classList.remove("is-listening");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Start voice input");
      if (activeRecognition === recognition) {
        activeRecognition = null;
        activeMicButton = null;
      }
      if (input.value.trim()) {
        setStatus("Voice captured. Edit it or press send.", view);
      }
      input.focus();
    };

    try {
      recognition.start();
    } catch {
      setStatus("Voice input is already starting. Try again in a moment.", view);
    }
  }

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const destination = button.dataset.go;
      if (destination === "cast") copyThoughtToCast();
      showView(destination);
    });
  });

  document.querySelectorAll("[data-mic]").forEach((button) => {
    button.addEventListener("click", () => startRecognition(button));
  });

  document.querySelectorAll("[data-voice-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      stopRecognition();
      const input = form.querySelector("input");
      const message = input?.value.trim() || "";

      if (form.dataset.voiceForm === "home") {
        pendingThought = message;
        copyThoughtToCast();
        showView("cast");
        return;
      }

      if (form.dataset.voiceForm === "cast") {
        pendingThought = message;
        startConversation();
        return;
      }

      sendConversationMessage();
    });
  });

  continueButton.addEventListener("click", () => {
    pendingThought = castInput.value.trim();
    startConversation();
  });

  document.querySelector("#previous-character").addEventListener("click", () => {
    selectCharacter(selectedIndex - 1);
    appendMessage("assistant", `Switching perspective. ${characters[selectedIndex].opening}`);
  });

  document.querySelector("#next-character").addEventListener("click", () => {
    selectCharacter(selectedIndex + 1);
    appendMessage("assistant", `Switching perspective. ${characters[selectedIndex].opening}`);
  });

  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.querySelector("span").textContent = soundOn ? "Voice on" : "Voice off";

    if (!soundOn && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    } else if (soundOn) {
      speak(`${characters[selectedIndex].name} voice enabled.`);
    }
  });

  document.querySelector("#about-button").addEventListener("click", () => {
    if (typeof aboutDialog.showModal === "function") aboutDialog.showModal();
  });

  document.querySelector(".dialog-close").addEventListener("click", () => aboutDialog.close());

  document.querySelector("[data-dialog-go]").addEventListener("click", (event) => {
    aboutDialog.close();
    showView(event.currentTarget.dataset.dialogGo);
  });

  aboutDialog.addEventListener("click", (event) => {
    const bounds = aboutDialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) aboutDialog.close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") stopRecognition();
    if (document.body.dataset.view !== "conversation" || event.target.matches("input")) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      document.querySelector("#previous-character").click();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      document.querySelector("#next-character").click();
    }
  });

  homeInput.addEventListener("input", () => {
    pendingThought = homeInput.value.trim();
  });

  renderCharacterGrid();
  updateCharacterUI();

  const initialView = window.location.hash === "#cast" ? "cast" : "home";
  showView(initialView, { updateHash: false, focus: false });
})();
