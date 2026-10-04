window.MAP_DATA = {
  source: {
    title: "Note 123.pdf",
    file: "./Note%20123.pdf",
    transcript: "./note_123_extracted.txt",
    pages: 32,
    note: "Source nodes and anchors are derived from the PDF transcript. Reference lenses are kept separate."
  },
  project: {
    title: "Existential Puzzle Mapper",
    purpose: "A static exploratory website for mapping a philosophical, spiritual, existential, and communication puzzle without forcing it into one final structure.",
    method: "The project keeps four layers separate: PDF-derived source anchors, map nodes and relations, external reference lenses, and optional next-step actions.",
    principles: [
      "Preserve the original data before interpreting it.",
      "Allow multiple directions to remain open at the same time.",
      "Treat references as lenses, not authorities over the source.",
      "Prefer small testable moves when the total map becomes suspect.",
      "Keep grounding and ordinary reality in view while exploring abstract or spiritual material."
    ],
    sections: [
      {
        title: "Map",
        role: "Interactive graph for navigating nodes, relations, nearby routes, and custom added pieces."
      },
      {
        title: "Scenarios",
        role: "Branching explanations that preserve different assumptions and risks."
      },
      {
        title: "Objectives",
        role: "Possible outcomes such as preserving the data, improving transmission, finding a field, or building an artifact."
      },
      {
        title: "Next Steps",
        role: "Optional action paths. These are not source claims or final answers."
      },
      {
        title: "Pattern Lab",
        role: "Experimental pattern candidates for future non-standard data sets and mapping methods."
      },
      {
        title: "Term Key",
        role: "A glossary for project vocabulary, map technology, metrics, and conceptual terms."
      },
      {
        title: "Sources",
        role: "Separated shelves for PDF anchors and outside reference lenses."
      }
    ],
    separation: [
      {
        label: "Source anchor",
        definition: "A claim or theme traceable to the PDF transcript."
      },
      {
        label: "Map node",
        definition: "A working piece of the puzzle, relation, barrier, lens, process, risk, or outcome."
      },
      {
        label: "Reference lens",
        definition: "An outside comparison framework used cautiously and separately."
      },
      {
        label: "Next step",
        definition: "An optional continuation move for exploring, testing, or building from the map."
      },
      {
        label: "Pattern set",
        definition: "A speculative data pattern to test later. It is a collection lens, not a source claim."
      },
      {
        label: "Term key",
        definition: "A descriptive glossary that defines how the project is using its own technical and conceptual language."
      }
    ]
  },
  termKey: [
    {
      category: "Project Layers",
      terms: [
        {
          term: "Source anchor",
          definition: "A theme, claim, or moment traced back to the PDF transcript.",
          usedFor: "Keeping the original material visible before interpretation.",
          not: "Not an outside reference, final answer, or new theory."
        },
        {
          term: "Reference lens",
          definition: "An outside framework used for comparison, such as monomyth, apophatic theology, or signal theory.",
          usedFor: "Testing resemblance and contrast.",
          not: "Not proof that the puzzle belongs to that framework."
        },
        {
          term: "Scenario",
          definition: "A possible explanatory branch with assumptions, moves, risks, and outcomes.",
          usedFor: "Keeping multiple directions open.",
          not: "Not a prediction or commitment."
        },
        {
          term: "Objective",
          definition: "A possible aim or outcome the project could work toward.",
          usedFor: "Turning exploration into possible action.",
          not: "Not the only valid purpose of the map."
        },
        {
          term: "Next step",
          definition: "A small optional continuation move.",
          usedFor: "Continuing without needing a total answer first.",
          not: "Not a conclusion or doctrine."
        }
      ]
    },
    {
      category: "Map Technology",
      terms: [
        {
          term: "Node",
          definition: "A piece of the puzzle: concept, barrier, process, risk, objective, or outcome.",
          usedFor: "Giving one idea a stable handle on the graph.",
          not: "Not necessarily a settled belief."
        },
        {
          term: "Edge",
          definition: "A relation between two nodes.",
          usedFor: "Showing how pieces pressure, explain, resemble, or lead to each other.",
          not: "Not proof of causality."
        },
        {
          term: "Route",
          definition: "A path through related nodes from the selected piece toward nearby processes or outcomes.",
          usedFor: "Finding possible movement without forcing a single path.",
          not: "Not a prescribed sequence."
        },
        {
          term: "Provenance ring",
          definition: "The map's circular layout: the core signal sits in the centre, then source puzzles and barriers, then reference lenses, then moves, outcomes, and risks, with added pieces outermost.",
          usedFor: "Making distance from the centre mean distance from the PDF source, while pieces within a ring sit near what they connect to.",
          not: "Not a ranking of importance, a required sequence, or a single final structure."
        },
        {
          term: "Layer",
          definition: "A node type that can be shown or hidden, such as barrier, lens, process, risk, or outcome.",
          usedFor: "Filtering the map by function.",
          not: "Not a hierarchy of importance."
        },
        {
          term: "Custom piece",
          definition: "A user-added node stored in browser local storage.",
          usedFor: "Adding new puzzle fragments without editing the source PDF.",
          not: "Not part of the original PDF-derived data."
        }
      ]
    },
    {
      category: "Metrics",
      terms: [
        {
          term: "Map fit",
          definition: "An editorial rating of how closely a pattern or answer-vector connects to the existing map: unassessed, tentative, moderate, or strong.",
          usedFor: "Ranking what currently stands out.",
          not: "Not proof, probability, revelation, or empirical confidence."
        },
        {
          term: "Entry count",
          definition: "The number of actual future observations logged for a pattern.",
          usedFor: "Separating evidence collected later from current map-fit estimates.",
          not: "Not the same as editorial map fit."
        },
        {
          term: "Map links",
          definition: "The number of existing graph nodes a pattern directly touches.",
          usedFor: "Showing how much of the current map a pattern connects to.",
          not: "Not evidence that the pattern is true."
        },
        {
          term: "Answer signal",
          definition: "A possible answer-vector that combines map-fit and emerging patterns.",
          usedFor: "Balancing the search for an answer with observation of recurring structures.",
          not: "Not a final answer."
        },
        {
          term: "Disconfirming detail",
          definition: "A detail that weakens, complicates, or challenges a pattern.",
          usedFor: "Keeping the map honest.",
          not: "Not something to delete because it is inconvenient."
        }
      ]
    },
    {
      category: "Core Puzzle Terms",
      terms: [
        {
          term: "Signal",
          definition: "The important existential content trying to cross into shared understanding.",
          usedFor: "Naming the thing that feels difficult to transmit.",
          not: "Not automatically a complete message or doctrine."
        },
        {
          term: "Reset effect",
          definition: "A conversational or interpretive collapse where the strange logic gets lost and the exchange returns to ordinary categories.",
          usedFor: "Tracking failed transmission.",
          not: "Not necessarily intentional resistance."
        },
        {
          term: "Preemptive classification",
          definition: "When the listener or framework categorizes the point before it arrives intact.",
          usedFor: "Naming one major distortion mechanism.",
          not: "Not all classification; some temporary labels can help."
        },
        {
          term: "Remainder",
          definition: "The unresolved piece that remains after accepted religious or philosophical answers are already acknowledged.",
          usedFor: "Keeping inquiry open without denying central truth.",
          not: "Not necessarily a rival truth."
        },
        {
          term: "Third stance",
          definition: "A position that refuses both the dominant structure and collapse into no structure.",
          usedFor: "Finding movement outside a false binary.",
          not: "Not a guaranteed solution."
        }
      ]
    },
    {
      category: "Pattern Families",
      terms: [
        {
          term: "Signal Residue",
          definition: "The fragment that survives after communication fails.",
          usedFor: "Collecting what remains useful after reset or distortion.",
          not: "Not proof that the whole message was understood."
        },
        {
          term: "Shadow Options",
          definition: "Hidden alternatives excluded by the apparent framing of the problem.",
          usedFor: "Finding moves outside false binaries.",
          not: "Not one single option; it is a family of possible options."
        },
        {
          term: "Attractor Basins",
          definition: "Recurring interpretive grooves the inquiry falls into, such as monomyth, pathology, counter-mythology, or formlessness.",
          usedFor: "Tracking repeated pulls that shape interpretation.",
          not: "Not one basin and not necessarily a deliberate trap."
        },
        {
          term: "Contradiction Knot",
          definition: "A tension where multiple claims resist each other but each protects something important.",
          usedFor: "Preserving productive paradox instead of cutting it too early.",
          not: "Not every contradiction; some contradictions are just errors."
        },
        {
          term: "Negative-Space Trace",
          definition: "The outline of the puzzle made visible by what cannot be accurately named or reduced.",
          usedFor: "Mapping absence, failed labels, and careful negation.",
          not: "Not vagueness for its own sake."
        }
      ]
    },
    {
      category: "Process Safeguards",
      terms: [
        {
          term: "Grounded containment",
          definition: "Keeping inquiry connected to ordinary life, health, counsel, sleep, work, and relationships.",
          usedFor: "Preventing the map from becoming totalizing or destabilizing.",
          not: "Not dismissal of the puzzle."
        },
        {
          term: "Pressure testing",
          definition: "Comparing a framework or pattern against exact source anchors and noting where it breaks.",
          usedFor: "Testing fit without premature belief.",
          not: "Not debunking by default."
        },
        {
          term: "Pattern candidate",
          definition: "A recurring shape worth collecting before deciding what it means.",
          usedFor: "Exploration before explanation.",
          not: "Not a confirmed law."
        },
        {
          term: "Non-standard set",
          definition: "A data collection structure organized around unusual relations like absence, residue, recursion, threshold, or contradiction.",
          usedFor: "Catching patterns ordinary notes may miss.",
          not: "Not evidence until entries are collected."
        },
        {
          term: "Constructive artifact",
          definition: "A map, essay, dialogue, protocol, or tool that externalizes the puzzle enough to inspect and revise.",
          usedFor: "Moving from private pressure to shared work.",
          not: "Not required to solve the whole puzzle."
        }
      ]
    }
  ],
  types: [
    "core",
    "barrier",
    "puzzle",
    "lens",
    "process",
    "objective",
    "outcome",
    "risk",
    "custom"
  ],
  nodes: [
    {
      id: "signal",
      label: "Untransmitted existential signal",
      type: "core",
      domain: "communication",
      weight: 9,
      summary: "The central experience is that something important cannot cross into shared understanding intact.",
      source: ["p1", "p6", "p9"],
      questions: [
        "What must remain intact for the signal to still be the signal?",
        "Which parts become distorted first?"
      ]
    },
    {
      id: "classification",
      label: "Preemptive classification",
      type: "barrier",
      domain: "communication",
      weight: 8,
      summary: "People and frameworks translate the point into familiar categories before the point arrives.",
      source: ["p1", "p6", "p21"],
      questions: [
        "Which labels erase the thing rather than clarify it?",
        "Can categories be used as temporary handles without becoming cages?"
      ]
    },
    {
      id: "reset",
      label: "Reset effect",
      type: "barrier",
      domain: "communication",
      weight: 8,
      summary: "Conversation appears to restart or lose the strange logic before it can be received.",
      source: ["p2", "p6", "p21"],
      questions: [
        "Does the reset happen in the speaker, the listener, the language, or the relation?",
        "What survives the reset?"
      ]
    },
    {
      id: "seed",
      label: "Seed disappointment",
      type: "core",
      domain: "impact",
      weight: 6,
      summary: "Even successful transmission may only plant a brief thought before ordinary routine resumes.",
      source: ["p2", "p7", "p13"],
      questions: [
        "Is a seed failure, success, or the only scale available?",
        "What conditions would let a seed stay alive?"
      ]
    },
    {
      id: "purpose",
      label: "God-handed puzzle",
      type: "puzzle",
      domain: "spiritual",
      weight: 9,
      summary: "The puzzle is experienced as purposeful and possibly given by God, not merely invented by the mind.",
      source: ["p3", "p4", "p27"],
      questions: [
        "What data belongs to the puzzle itself?",
        "What would count as faithful work on the puzzle?"
      ]
    },
    {
      id: "remainder",
      label: "Accepted truth plus remainder",
      type: "puzzle",
      domain: "spiritual",
      weight: 9,
      summary: "Central religious truth is accepted, yet something remains unresolved beside it.",
      source: ["p4", "p10", "p16", "p27"],
      questions: [
        "Is the remainder a second answer, a hidden implication, or an excess that resists answers?",
        "How can the accepted truth remain central without closing inquiry too early?"
      ]
    },
    {
      id: "humility",
      label: "Humility intelligence paradox",
      type: "puzzle",
      domain: "self",
      weight: 6,
      summary: "Insight can feel self-disqualifying because wisdom is linked to humility and pride is suspect.",
      source: ["p3", "p7", "p10"],
      questions: [
        "When does confidence serve the work rather than the ego?",
        "What form of humility still permits precise thought?"
      ]
    },
    {
      id: "collaborators",
      label: "Missing collaborative field",
      type: "core",
      domain: "social",
      weight: 8,
      summary: "There is a need for people who can sustain attention, test pieces, and create without immediate reduction.",
      source: ["p3", "p7", "p16", "p22"],
      questions: [
        "What qualities define a workable circle?",
        "How small can the first collaborative field be?"
      ]
    },
    {
      id: "society_attention",
      label: "Attention failure",
      type: "barrier",
      domain: "social",
      weight: 7,
      summary: "Collective attention appears oriented away from testing disruptive ideas long enough to learn from them.",
      source: ["p3", "p4", "p21", "p26"],
      questions: [
        "Which social incentives make the field collapse?",
        "What container can hold attention longer?"
      ]
    },
    {
      id: "wilderness",
      label: "Wilderness after answer",
      type: "lens",
      domain: "spiritual",
      weight: 8,
      summary: "A biblical-style pattern where the main answer is already held, yet the person remains in testing and incompletion.",
      source: ["p5", "p8", "p17", "p18"],
      questions: [
        "Is endurance the task, or is wilderness only the setting?",
        "What manna-equivalent appears daily but does not solve the whole puzzle?"
      ]
    },
    {
      id: "monomyth",
      label: "Monomyth map",
      type: "lens",
      domain: "mythic",
      weight: 7,
      summary: "Call, road of trials, boon, and return give structure, but the fit may become misleading.",
      source: ["p5", "p8", "p9", "p14"],
      questions: [
        "Is the puzzle the call, the trial, the boon, the return, or outside the sequence?",
        "Where does this map clarify, and where does it overwrite?"
      ]
    },
    {
      id: "gatekeepers",
      label: "Non-invertible deception",
      type: "puzzle",
      domain: "mythic",
      weight: 9,
      summary: "Gatekeepers or Archon-like structures may be deceptive, but that does not make the opposite claim true.",
      source: ["p10", "p12", "p13", "p14", "p20"],
      questions: [
        "What remains after rejecting both the figure and its mirror-opposite?",
        "Is the deception in the enemy, the frame, or the demand to choose?"
      ]
    },
    {
      id: "map_suspect",
      label: "Map-making becomes suspect",
      type: "risk",
      domain: "method",
      weight: 8,
      summary: "The form of structured path itself may be implicated, leaving no clean replacement map.",
      source: ["p25", "p26", "p28"],
      questions: [
        "What kind of orientation is not yet a total map?",
        "Can local moves be made without granting the whole map authority?"
      ]
    },
    {
      id: "dichotomy",
      label: "Misleading dichotomy",
      type: "barrier",
      domain: "method",
      weight: 9,
      summary: "The field presents a false binary: accept the dominant structure or have no coherent direction.",
      source: ["p29", "p30", "p31"],
      questions: [
        "What third stance avoids both surrender to the old structure and collapse into nothing?",
        "How does the binary recreate the corner?"
      ]
    },
    {
      id: "third_stance",
      label: "Third stance",
      type: "process",
      domain: "method",
      weight: 8,
      summary: "Precise attention to the residual puzzle without requiring a complete alternative plot first.",
      source: ["p30", "p31"],
      questions: [
        "What can be observed before a theory is chosen?",
        "Which practice stabilizes the third stance?"
      ]
    },
    {
      id: "apophatic",
      label: "Apophatic remainder",
      type: "lens",
      domain: "reference",
      weight: 7,
      summary: "Negative theology treats positive statements as provisional before what exceeds formulation.",
      source: ["p16", "p17"],
      questions: [
        "Is the remainder a clue or an excess created by finitude?",
        "What should be named only by negation?"
      ]
    },
    {
      id: "dark_night",
      label: "Dark night",
      type: "lens",
      domain: "reference",
      weight: 6,
      summary: "Spiritual faculties and prior maps are stripped, making direction feel unreliable after real orientation.",
      source: ["p18", "p19"],
      questions: [
        "Which faculties have gone dark?",
        "What attachments to previous clarity may be blocking the next form?"
      ]
    },
    {
      id: "signal_model",
      label: "Signal distortion model",
      type: "lens",
      domain: "information",
      weight: 8,
      summary: "Channel capacity, noise, encoding, and error correction explain why only fragments may survive transmission.",
      source: ["p20", "p21", "p22"],
      questions: [
        "What is the channel, and what is the noise?",
        "Can the group build error-correcting shared language?"
      ]
    },
    {
      id: "holy_fool",
      label: "Holy fool pattern",
      type: "lens",
      domain: "social",
      weight: 5,
      summary: "Insight can be publicly unintelligible when the surrounding field cannot receive it in stable form.",
      source: ["p21", "p22"],
      questions: [
        "When is unintelligibility a cost of fidelity rather than a badge of truth?",
        "What protects the carrier from isolation becoming the whole identity?"
      ]
    },
    {
      id: "piece_archive",
      label: "Piece archive",
      type: "process",
      domain: "method",
      weight: 6,
      summary: "Collect fragments, failed formulations, analogies, contradictions, and surviving seeds without forcing closure.",
      source: ["p23", "p27", "p31"],
      questions: [
        "Which pieces repeat across contexts?",
        "Which pieces only appear after a failed explanation?"
      ]
    },
    {
      id: "pressure_test",
      label: "Pressure testing",
      type: "process",
      domain: "method",
      weight: 7,
      summary: "Compare each framework against exact puzzle elements and mark where it holds or shears off.",
      source: ["p23", "p24"],
      questions: [
        "What does the lens explain cleanly?",
        "What does the lens force, erase, or overdramatize?"
      ]
    },
    {
      id: "shared_protocol",
      label: "Shared reference protocol",
      type: "objective",
      domain: "social",
      weight: 7,
      summary: "Build a small language and test routine that lets collaborators handle the puzzle without premature closure.",
      source: ["p7", "p16", "p21", "p22"],
      questions: [
        "What rules keep the group from reducing too quickly?",
        "What artifact proves shared attention happened?"
      ]
    },
    {
      id: "next_question",
      label: "Coherent next question",
      type: "outcome",
      domain: "method",
      weight: 7,
      summary: "The immediate win may be a better next question rather than a complete answer.",
      source: ["p28", "p29", "p31"],
      questions: [
        "Which question opens movement without pretending to solve the whole field?",
        "Can the question be answered by observation instead of ideology?"
      ]
    },
    {
      id: "constructive_artifact",
      label: "Constructive artifact",
      type: "outcome",
      domain: "creation",
      weight: 6,
      summary: "A map, essay, conversation protocol, group practice, or tool that externalizes the puzzle enough to work on it.",
      source: ["p3", "p7", "p23"],
      questions: [
        "What can be built that carries the puzzle without resolving it falsely?",
        "What artifact could another person interact with productively?"
      ]
    },
    {
      id: "closed_loop",
      label: "Closed loop paralysis",
      type: "risk",
      domain: "method",
      weight: 7,
      summary: "Suspicion of every structure can trap attention in a loop where no move feels legitimate.",
      source: ["p25", "p26", "p30"],
      questions: [
        "Which move remains valid even under suspicion?",
        "What counts as enough grounding to proceed?"
      ]
    },
    {
      id: "overmythologizing",
      label: "Counter-mythology drift",
      type: "risk",
      domain: "mythic",
      weight: 6,
      summary: "Rejecting one structure can produce a mirror mythology that repeats the same trap with new labels.",
      source: ["p20", "p27"],
      questions: [
        "Is this a new observation or only an inverted old plot?",
        "What evidence would make the frame revise itself?"
      ]
    },
    {
      id: "grounding",
      label: "Grounded containment",
      type: "process",
      domain: "self",
      weight: 6,
      summary: "Keep the inquiry connected to ordinary health, counsel, work, sleep, and relationships so the map remains usable.",
      source: ["p5", "p9"],
      questions: [
        "What practices keep the puzzle from consuming the whole field?",
        "Who can offer wise correction without flattening the question?"
      ]
    },
    {
      id: "pattern_lab",
      label: "Pattern lab",
      type: "process",
      domain: "method",
      weight: 7,
      summary: "A future-facing workbench for finding non-standard patterns across the puzzle without treating them as final explanations.",
      source: ["future-pattern"],
      questions: [
        "Which recurring shape is present before any theory names it?",
        "Can a pattern be useful while remaining provisional?"
      ]
    },
    {
      id: "nonstandard_sets",
      label: "Non-standard pattern sets",
      type: "objective",
      domain: "method",
      weight: 7,
      summary: "Candidate data structures that track residues, interference, contradictions, phase changes, and avoided regions instead of only linear arguments.",
      source: ["future-pattern"],
      questions: [
        "What would a non-standard set collect that ordinary notes miss?",
        "Which set could produce a surprising next question?"
      ]
    },
    {
      id: "anomaly_log",
      label: "Anomaly log",
      type: "process",
      domain: "evidence",
      weight: 6,
      summary: "A record of moments that do not fit the current maps: resets, sudden clarity, repeated phrases, blocked explanations, and unexpected openings.",
      source: ["future-pattern"],
      questions: [
        "What repeats across anomalies without being forced?",
        "Which anomaly weakens the current map most?"
      ]
    },
    {
      id: "negative_space",
      label: "Negative-space map",
      type: "process",
      domain: "method",
      weight: 6,
      summary: "A map of avoided claims, missing categories, silences, failed analogies, and explanations that create distortion when named directly.",
      source: ["future-pattern"],
      questions: [
        "What is absent in every attempted explanation?",
        "Where does not-saying preserve more accuracy than saying?"
      ]
    }
  ],
  edges: [
    { from: "signal", to: "classification", label: "is distorted by", kind: "barrier", strength: 3 },
    { from: "classification", to: "reset", label: "produces", kind: "mechanic", strength: 3 },
    { from: "reset", to: "seed", label: "leaves only", kind: "outcome", strength: 2 },
    { from: "signal", to: "purpose", label: "may be carried as", kind: "interpretation", strength: 2 },
    { from: "purpose", to: "remainder", label: "creates tension with", kind: "tension", strength: 3 },
    { from: "remainder", to: "apophatic", label: "resembles", kind: "lens", strength: 2 },
    { from: "remainder", to: "wilderness", label: "resembles", kind: "lens", strength: 3 },
    { from: "remainder", to: "dark_night", label: "partly resembles", kind: "lens", strength: 2 },
    { from: "purpose", to: "humility", label: "pressures", kind: "tension", strength: 2 },
    { from: "humility", to: "grounding", label: "needs", kind: "process", strength: 2 },
    { from: "collaborators", to: "shared_protocol", label: "requires", kind: "objective", strength: 3 },
    { from: "society_attention", to: "collaborators", label: "makes scarce", kind: "barrier", strength: 2 },
    { from: "signal_model", to: "shared_protocol", label: "suggests", kind: "process", strength: 3 },
    { from: "signal_model", to: "classification", label: "explains", kind: "lens", strength: 3 },
    { from: "monomyth", to: "gatekeepers", label: "contains", kind: "mythic", strength: 2 },
    { from: "gatekeepers", to: "map_suspect", label: "leads to", kind: "tension", strength: 3 },
    { from: "map_suspect", to: "dichotomy", label: "hardens into", kind: "risk", strength: 3 },
    { from: "dichotomy", to: "third_stance", label: "is loosened by", kind: "process", strength: 3 },
    { from: "third_stance", to: "piece_archive", label: "starts with", kind: "process", strength: 2 },
    { from: "piece_archive", to: "pressure_test", label: "feeds", kind: "process", strength: 2 },
    { from: "pressure_test", to: "next_question", label: "yields", kind: "outcome", strength: 3 },
    { from: "shared_protocol", to: "constructive_artifact", label: "can produce", kind: "outcome", strength: 2 },
    { from: "constructive_artifact", to: "collaborators", label: "attracts or filters", kind: "social", strength: 2 },
    { from: "map_suspect", to: "closed_loop", label: "risks", kind: "risk", strength: 3 },
    { from: "gatekeepers", to: "overmythologizing", label: "risks", kind: "risk", strength: 2 },
    { from: "holy_fool", to: "collaborators", label: "names isolation around", kind: "lens", strength: 1 },
    { from: "wilderness", to: "grounding", label: "asks for endurance through", kind: "process", strength: 2 },
    { from: "apophatic", to: "third_stance", label: "supports", kind: "method", strength: 2 },
    { from: "closed_loop", to: "grounding", label: "is checked by", kind: "process", strength: 2 },
    { from: "piece_archive", to: "pattern_lab", label: "feeds", kind: "method", strength: 2 },
    { from: "pattern_lab", to: "nonstandard_sets", label: "develops", kind: "method", strength: 3 },
    { from: "pattern_lab", to: "anomaly_log", label: "collects through", kind: "method", strength: 2 },
    { from: "pattern_lab", to: "negative_space", label: "also maps", kind: "method", strength: 2 },
    { from: "anomaly_log", to: "signal_model", label: "tests against", kind: "evidence", strength: 2 },
    { from: "negative_space", to: "apophatic", label: "borrows discipline from", kind: "lens", strength: 2 },
    { from: "nonstandard_sets", to: "next_question", label: "may generate", kind: "outcome", strength: 2 },
    { from: "seed", to: "constructive_artifact", label: "can be stabilized as", kind: "outcome", strength: 1 }
  ],
  sourceAnchors: [
    {
      id: "p1",
      pages: "1-2",
      title: "Opening communication barrier",
      note: "An important existential signal cannot cross into shared understanding before it is reduced or reset.",
      nodes: ["signal", "classification", "reset"]
    },
    {
      id: "p2",
      pages: "2-3",
      title: "Seed and routine",
      note: "Even successful transmission may only plant a small seed before routine resumes.",
      nodes: ["seed", "signal"]
    },
    {
      id: "p3",
      pages: "3-5",
      title: "God-handed puzzle",
      note: "Religious truth is accepted, yet a distinct puzzle or remainder still presses for attention.",
      nodes: ["purpose", "remainder", "wilderness"]
    },
    {
      id: "p4",
      pages: "8-9",
      title: "Monomyth as provisional lens",
      note: "Call, trial, boon, and return can orient inquiry but should not become a final map.",
      nodes: ["monomyth", "pressure_test"]
    },
    {
      id: "p5",
      pages: "10-14",
      title: "Gatekeepers and Archons",
      note: "The barrier figures can be deceptive without making the opposite claim automatically true.",
      nodes: ["gatekeepers", "map_suspect", "overmythologizing"]
    },
    {
      id: "p6",
      pages: "15-23",
      title: "Alternative structures",
      note: "Apophatic, wilderness, dark night, residual Gnostic, signal, and holy-fool patterns each explain only part of the field.",
      nodes: ["apophatic", "wilderness", "dark_night", "signal_model", "holy_fool"]
    },
    {
      id: "p7",
      pages: "24-28",
      title: "The corner",
      note: "If the available plot is itself suspect, the desire for a new direction can become trapped.",
      nodes: ["map_suspect", "closed_loop", "third_stance"]
    },
    {
      id: "p8",
      pages: "29-31",
      title: "Misleading dichotomy",
      note: "The false choice is between accepting the old structure and having no coherent direction.",
      nodes: ["dichotomy", "third_stance", "next_question"]
    }
  ],
  references: [
    {
      id: "ref_plato",
      title: "Plato, Republic, Book VII",
      category: "reference lens",
      use: "Allegory of the cave as a model of mediated reality, partial release, and difficulty communicating the outside back inside.",
      nodeIds: ["signal", "classification"]
    },
    {
      id: "ref_campbell",
      title: "Joseph Campbell, The Hero with a Thousand Faces",
      category: "reference lens",
      use: "Monomyth vocabulary: call, threshold, trials, boon, and return. Useful only as a provisional structure here.",
      nodeIds: ["monomyth", "pressure_test"]
    },
    {
      id: "ref_john_cross",
      title: "John of the Cross, Dark Night of the Soul",
      category: "reference lens",
      use: "Spiritual stripping and unreliable faculties after a real orientation has already been given.",
      nodeIds: ["dark_night", "grounding"]
    },
    {
      id: "ref_dionysius",
      title: "Pseudo-Dionysius, Mystical Theology",
      category: "reference lens",
      use: "Apophatic or negative theology: the ultimate is approached through negation where positive concepts fail.",
      nodeIds: ["apophatic", "remainder"]
    },
    {
      id: "ref_shannon",
      title: "Claude Shannon, A Mathematical Theory of Communication",
      category: "reference lens",
      use: "Channel capacity, signal, noise, encoding, and error correction as a non-mythic model of transmission failure.",
      nodeIds: ["signal_model", "shared_protocol"]
    },
    {
      id: "ref_gnostic",
      title: "Classical Gnostic Archon motifs",
      category: "reference lens",
      use: "Useful as a comparison for controlling or distorting structures, but risky if it becomes a total counter-mythology.",
      nodeIds: ["gatekeepers", "overmythologizing"]
    }
  ],
  scenarios: [
    {
      id: "scenario_frame_deception",
      title: "The structure is part of the deception",
      premise: "The available heroic or adversarial plot may orient attention away from the actual puzzle.",
      assumptions: [
        "The deception is not solved by simple inversion.",
        "Some friction remains after the named gatekeepers are bracketed.",
        "Local observations are more trustworthy than total plot claims."
      ],
      moves: [
        "Collect exact moments when the old plot pulls interpretation too quickly.",
        "Mark what the plot explains and what it makes invisible.",
        "Use the third stance before choosing another frame."
      ],
      risks: [
        "Closed loop paralysis.",
        "Counter-mythology drift.",
        "Loss of any practical next move."
      ],
      outcomes: ["third_stance", "next_question", "piece_archive"]
    },
    {
      id: "scenario_channel",
      title: "The main problem is channel design",
      premise: "The puzzle may be difficult because the receiving channel cannot preserve enough of the signal.",
      assumptions: [
        "Misunderstanding is structural, not only personal.",
        "Small seeds can be improved by better encoding.",
        "A shared protocol may reduce reset effects."
      ],
      moves: [
        "Define forbidden reductions and allowed provisional labels.",
        "Create a glossary of terms that remain unstable.",
        "Test one piece with one trustworthy listener."
      ],
      risks: [
        "Over-translating the spiritual dimension.",
        "Optimizing communication while avoiding the deeper question."
      ],
      outcomes: ["shared_protocol", "constructive_artifact", "collaborators"]
    },
    {
      id: "scenario_wilderness",
      title: "The puzzle is wilderness work",
      premise: "The accepted answer remains true while the remaining task is endurance, fidelity, and careful attention.",
      assumptions: [
        "The absence of a new map is not automatically failure.",
        "Daily provision may matter more than dramatic passage.",
        "The puzzle is worked through without replacing the central truth."
      ],
      moves: [
        "Name what must be obeyed today rather than solved today.",
        "Separate endurance data from despair data.",
        "Bring the question to a grounded spiritual advisor without demanding total agreement."
      ],
      risks: [
        "Passive waiting.",
        "Romanticizing isolation.",
        "Confusing exhaustion with revelation."
      ],
      outcomes: ["grounding", "next_question", "remainder"]
    },
    {
      id: "scenario_collaborative",
      title: "The missing piece is a field",
      premise: "The puzzle may require more than one mind because single-person inquiry collapses into loops.",
      assumptions: [
        "The group is not for validation only.",
        "The first field can be very small.",
        "Shared attention needs a protocol before it needs agreement."
      ],
      moves: [
        "Define the minimum viable circle.",
        "Use a one-page map as the first shared artifact.",
        "Ask collaborators to mark distortions rather than solve everything."
      ],
      risks: [
        "Choosing people who flatten the puzzle.",
        "Choosing people who amplify instability.",
        "Mistaking intensity for insight."
      ],
      outcomes: ["collaborators", "shared_protocol", "constructive_artifact"]
    },
    {
      id: "scenario_apophatic",
      title: "The remainder cannot be directly named",
      premise: "The missing thing may be real but distorted by positive formulation too early.",
      assumptions: [
        "Unknowing can be a disciplined relation, not mere vagueness.",
        "Negation may preserve the shape better than explanation.",
        "The goal is not to compete with accepted truth."
      ],
      moves: [
        "List what the puzzle is not.",
        "Mark which statements become false when made too explicit.",
        "Build from constraints instead of claims."
      ],
      risks: [
        "Endless abstraction.",
        "Avoiding testable contact with life.",
        "Turning silence into a new authority claim."
      ],
      outcomes: ["apophatic", "third_stance", "piece_archive"]
    }
  ],
  nextStepDefinitions: [
    {
      term: "Next step",
      definition: "A possible continuation move. It is not a conclusion, doctrine, diagnosis, or final interpretation."
    },
    {
      term: "Direction",
      definition: "The style of inquiry the step uses, such as analytic, relational, spiritual, empirical, creative, or grounding."
    },
    {
      term: "Map focus",
      definition: "The existing nodes this step touches first. Clicking a step moves the graph to one of those nodes."
    },
    {
      term: "Separation rule",
      definition: "Source anchors come from the PDF, reference lenses are external comparisons, and next steps are optional actions."
    }
  ],
  nextSteps: [
    {
      id: "step_source_pass",
      title: "Run a source-only pass",
      mode: "analytic",
      tempo: "slow",
      orientation: "Rebuild the map using only claims traceable to the PDF before adding new theories or references.",
      whyDifferent: "This protects the original puzzle from being overwritten by explanation.",
      actions: [
        "Open the source anchors and write one plain sentence for each.",
        "Tag every sentence as data, inference, question, or pressure point.",
        "Remove or bracket anything that is only a reference lens."
      ],
      nodeIds: ["piece_archive", "pressure_test", "remainder"]
    },
    {
      id: "step_dichotomy_fork",
      title: "Fork the false binary",
      mode: "logical",
      tempo: "focused",
      orientation: "Map options that are neither accepting the dominant structure nor collapsing into no structure.",
      whyDifferent: "This works directly on the misleading dichotomy rather than choosing one of its poles.",
      actions: [
        "Create three branches labeled old structure, no structure, and third stance.",
        "List what each branch explains, hides, and demands.",
        "Add a fourth branch only if it avoids simple inversion."
      ],
      nodeIds: ["dichotomy", "third_stance", "map_suspect"]
    },
    {
      id: "step_transmission_test",
      title: "Test one transmission",
      mode: "relational",
      tempo: "small",
      orientation: "Choose one bounded piece and attempt to communicate it to one carefully chosen listener.",
      whyDifferent: "This treats the barrier as a channel problem that can be tested in lived conversation.",
      actions: [
        "Choose one node, not the whole puzzle.",
        "Ask the listener to repeat what they heard before offering correction.",
        "Record where classification, reset, or seed effects appear."
      ],
      nodeIds: ["signal", "classification", "reset", "seed"]
    },
    {
      id: "step_negative_map",
      title: "Make a negative map",
      mode: "apophatic",
      tempo: "careful",
      orientation: "Map what the puzzle is not, which claims distort it, and which statements become false too early.",
      whyDifferent: "This does not try to solve by adding a new positive theory.",
      actions: [
        "Write ten not-this statements.",
        "Separate helpful negations from defensive vagueness.",
        "Keep only negations that preserve contact with the source anchors."
      ],
      nodeIds: ["apophatic", "remainder", "third_stance"]
    },
    {
      id: "step_collaborative_field",
      title: "Prototype a tiny field",
      mode: "collaborative",
      tempo: "experimental",
      orientation: "Build a very small circle or exchange format that can hold the inquiry without rushing closure.",
      whyDifferent: "This assumes the missing piece may be a field of attention rather than a private answer.",
      actions: [
        "Define three requirements for a collaborator.",
        "Share only one artifact or map branch.",
        "Ask for distortions, missing pieces, and stronger questions rather than agreement."
      ],
      nodeIds: ["collaborators", "shared_protocol", "constructive_artifact"]
    },
    {
      id: "step_scenario_tree",
      title: "Build a scenario tree",
      mode: "strategic",
      tempo: "branching",
      orientation: "Turn the scenarios into branches with assumptions, tests, risks, and possible outcomes.",
      whyDifferent: "This keeps multiple futures alive instead of searching for the single right framework.",
      actions: [
        "Create one branch for each scenario.",
        "Add what would confirm, weaken, or transform that scenario.",
        "Mark which outcomes would be constructive, neutral, or dangerous."
      ],
      nodeIds: ["next_question", "constructive_artifact", "closed_loop"]
    },
    {
      id: "step_pattern_log",
      title: "Keep a pattern log",
      mode: "empirical",
      tempo: "daily",
      orientation: "Track real instances of reset, classification, seed, clarity, collapse, and useful questions.",
      whyDifferent: "This gathers evidence before expanding the metaphysical or mythic interpretation.",
      actions: [
        "Log one concrete event per day for a week.",
        "Use short tags rather than long interpretation.",
        "Review only after enough entries exist to show a pattern."
      ],
      nodeIds: ["reset", "classification", "seed", "signal_model"]
    },
    {
      id: "step_pattern_lab",
      title: "Start a pattern set",
      mode: "non-standard",
      tempo: "iterative",
      orientation: "Track one unusual recurrence pattern without deciding yet whether it is spiritual, psychological, social, or informational.",
      whyDifferent: "This treats repeated forms as data before translating them into a known framework.",
      actions: [
        "Choose one candidate pattern from Pattern Lab.",
        "Collect five examples using the same fields each time.",
        "Mark what the pattern predicts, fails to explain, or changes in the map."
      ],
      nodeIds: ["pattern_lab", "nonstandard_sets", "anomaly_log"]
    },
    {
      id: "step_artifact_route",
      title: "Make a public-facing artifact",
      mode: "creative",
      tempo: "constructive",
      orientation: "Turn the map into a short essay, dialogue, visual diagram, conversation protocol, or question index.",
      whyDifferent: "This tests whether the puzzle can survive outside the immediate inner state.",
      actions: [
        "Choose one format and one intended reader.",
        "Keep source, interpretation, and references visually separate.",
        "Revise based on where the artifact causes confusion or recognition."
      ],
      nodeIds: ["constructive_artifact", "shared_protocol", "signal"]
    },
    {
      id: "step_reference_pressure",
      title: "Pressure-test external lenses",
      mode: "comparative",
      tempo: "bounded",
      orientation: "Use references only as lenses, then mark exactly where each lens fits and where it shears off.",
      whyDifferent: "This permits outside material without letting it become the controlling map.",
      actions: [
        "Pick one reference lens at a time.",
        "Score it against source anchors rather than against mood or resonance.",
        "Write the cost of using that lens too strongly."
      ],
      nodeIds: ["pressure_test", "monomyth", "apophatic", "signal_model"]
    },
    {
      id: "step_grounding_review",
      title: "Add a grounding review",
      mode: "containment",
      tempo: "regular",
      orientation: "Keep the inquiry connected to health, counsel, ordinary obligations, sleep, and relational reality.",
      whyDifferent: "This protects the exploration from becoming totalizing or self-consuming.",
      actions: [
        "Define warning signs that the map is becoming less useful.",
        "Choose one grounded person or practice that can interrupt closed loops.",
        "Review whether the process is creating clarity, stability, and better action."
      ],
      nodeIds: ["grounding", "closed_loop", "humility"]
    }
  ],
  patternDefinitions: [
    {
      term: "Pattern candidate",
      definition: "A recurring shape worth collecting. It is not yet an explanation or belief."
    },
    {
      term: "Non-standard set",
      definition: "A data set organized around relations like absence, interference, recursion, thresholds, residue, or contradiction."
    },
    {
      term: "Disconfirming case",
      definition: "An example that weakens or complicates a pattern. It should be preserved rather than edited away."
    },
    {
      term: "Future status",
      definition: "These sets are scaffolds for later observation and can be merged, discarded, or renamed."
    },
    {
      term: "Map fit",
      definition: "Editorial categories: Unassessed = no assigned rationale; Tentative = a possible connection needing examples; Moderate = several relevant connections with open gaps; Strong = direct connections across several central concepts. These categories describe conceptual relevance, not measured confidence or probability."
    },
    {
      term: "Entry count",
      definition: "Actual logged examples. It starts at zero because no future pattern observations have been collected yet."
    }
  ],
  patternSets: [
    {
      id: "pattern_residue",
      title: "Signal Residue",
      family: "transmission",
      status: "ready to collect",
      metrics: {
        fitLabel: "Strong",
        entries: 0,
        mapLinks: 4,
        basis: "Strong match to signal, reset, seed, and anomaly tracking."
      },
      premise: "After a failed explanation, something still remains: a phrase, discomfort, image, question, or partial recognition.",
      collects: [
        "What survived the reset",
        "What the listener repeated back",
        "What felt distorted but not erased",
        "Whether a later seed appeared"
      ],
      patternQuestions: [
        "Does the residue point closer to the real signal than the full explanation did?",
        "Which fragments keep returning across different conversations?"
      ],
      mapFocus: ["signal", "reset", "seed", "anomaly_log"]
    },
    {
      id: "pattern_interference",
      title: "Interference Field",
      family: "social attention",
      status: "future test",
      metrics: {
        fitLabel: "Moderate",
        entries: 0,
        mapLinks: 4,
        basis: "Good fit to classification pressure, attention failure, channel noise, and shared protocol."
      },
      premise: "Some ideas may fail not because of content, but because attention fields around them introduce noise, category pressure, or routine collapse.",
      collects: [
        "Social setting and listener role",
        "First category imposed on the idea",
        "Where attention drifted",
        "What stabilized attention, if anything"
      ],
      patternQuestions: [
        "Which contexts amplify distortion?",
        "What conditions reduce the interference without simplifying the idea?"
      ],
      mapFocus: ["classification", "society_attention", "signal_model", "shared_protocol"]
    },
    {
      id: "pattern_contradiction_knot",
      title: "Contradiction Knot",
      family: "logic",
      status: "ready to collect",
      metrics: {
        fitLabel: "Strong",
        entries: 0,
        mapLinks: 4,
        basis: "Currently the strongest fit: dichotomy, third stance, remainder, and non-invertible barrier all depend on held tension."
      },
      premise: "Some pieces are held together by tension rather than agreement, and cutting the tension may lose the actual shape.",
      collects: [
        "The two or more claims that seem mutually resistant",
        "What each claim protects",
        "What disappears if one side wins",
        "Whether the knot opens a third stance"
      ],
      patternQuestions: [
        "Is this a contradiction, a paradox, or a false forced choice?",
        "What becomes visible only when the tension is preserved?"
      ],
      mapFocus: ["dichotomy", "third_stance", "remainder", "gatekeepers"]
    },
    {
      id: "pattern_threshold_shift",
      title: "Threshold Shift",
      family: "state change",
      status: "future test",
      metrics: {
        fitLabel: "Tentative",
        entries: 0,
        mapLinks: 4,
        basis: "Plausible but less demonstrated; needs time-based observations before it should rank higher."
      },
      premise: "The map may change suddenly when enough pieces accumulate, even if no single piece appears decisive.",
      collects: [
        "Pieces present before the shift",
        "Immediate trigger",
        "What became easier to think",
        "What became harder or suspect afterward"
      ],
      patternQuestions: [
        "Are there detectable preconditions for clarity?",
        "Does the shift produce better action or only stronger intensity?"
      ],
      mapFocus: ["piece_archive", "next_question", "grounding", "constructive_artifact"]
    },
    {
      id: "pattern_negative_space",
      title: "Negative-Space Trace",
      family: "apophatic",
      status: "ready to collect",
      metrics: {
        fitLabel: "Moderate",
        entries: 0,
        mapLinks: 4,
        basis: "Fits apophatic remainder and map-suspicion, but needs examples of accurate non-naming."
      },
      premise: "The puzzle may be outlined by what cannot be said, what should not be reduced, and what disappears under direct naming.",
      collects: [
        "Failed names",
        "Too-easy explanations",
        "Accurate negations",
        "Silences that preserve the shape"
      ],
      patternQuestions: [
        "What is consistently absent from every available structure?",
        "Which negations sharpen the map rather than making it vague?"
      ],
      mapFocus: ["negative_space", "apophatic", "remainder", "map_suspect"]
    },
    {
      id: "pattern_attractor",
      title: "Attractor Basins",
      family: "recursion",
      status: "future test",
      metrics: {
        fitLabel: "Strong",
        entries: 0,
        mapLinks: 4,
        basis: "Strong current fit to repeated fallback into several basins: monomyth, closed-loop paralysis, and counter-mythology."
      },
      premise: "Inquiry may repeatedly fall back into a few familiar basins: monomyth, pathology, orthodoxy-only closure, counter-mythology, or formless paralysis.",
      collects: [
        "Which basin the thought falls into",
        "What pulled it there",
        "What was lost on arrival",
        "What helped it exit"
      ],
      instances: [
        "Monomyth basin: everything becomes call, trial, boon, return.",
        "Pathology basin: everything becomes disorder language before the actual point is heard.",
        "Orthodoxy-only closure basin: accepted religious truth is used to close the residual puzzle too early.",
        "Counter-mythology basin: rejecting one frame produces an inverted rival mythology.",
        "Formlessness basin: suspicion of all structure collapses into no usable next move.",
        "Over-analysis basin: mapping replaces contact, action, or prayerful discernment."
      ],
      patternQuestions: [
        "Which attractor is strongest in a given moment?",
        "Can the map create escape ramps without creating another basin?"
      ],
      mapFocus: ["monomyth", "closed_loop", "overmythologizing", "pattern_lab"]
    },
    {
      id: "pattern_echo_delta",
      title: "Echo Delta",
      family: "comparison",
      status: "future test",
      metrics: {
        fitLabel: "Tentative",
        entries: 0,
        mapLinks: 4,
        basis: "Useful future method, but it requires repeated wording samples that are not yet collected."
      },
      premise: "Compare repeated statements over time and track the delta: what changes, what repeats, and what becomes more precise.",
      collects: [
        "Original phrasing",
        "Later phrasing",
        "Stable core",
        "Changed implication"
      ],
      patternQuestions: [
        "Is the inquiry clarifying or circling?",
        "Which words become more accurate after repeated attempts?"
      ],
      mapFocus: ["piece_archive", "pressure_test", "next_question", "constructive_artifact"]
    },
    {
      id: "pattern_shadow_option",
      title: "Shadow Options",
      family: "decision space",
      status: "ready to collect",
      metrics: {
        fitLabel: "Strong",
        entries: 0,
        mapLinks: 4,
        basis: "Very strong fit to the misleading dichotomy and the search for non-binary next vectors."
      },
      premise: "False binaries hide options that are not yet structured enough to feel legitimate.",
      collects: [
        "The apparent two options",
        "The excluded third or fourth option",
        "Why the hidden option feels illegitimate",
        "What small action could test it"
      ],
      instances: [
        "Use structure locally without trusting it globally.",
        "Map the distortion pattern instead of choosing a worldview.",
        "Collect observations before deciding which type of explanation is valid.",
        "Treat the answer as a protocol or practice rather than a proposition.",
        "Build a small collaborative field before trying to solve the whole puzzle.",
        "Preserve a negative-space boundary instead of naming a positive theory too early."
      ],
      patternQuestions: [
        "Which option is excluded by the framing itself?",
        "Can a hidden option become a test without becoming a new total map?"
      ],
      mapFocus: ["dichotomy", "third_stance", "next_question", "nonstandard_sets"]
    }
  ],
  patternDatasetTemplate: {
    title: "Future Pattern Entry",
    fields: [
      "date_or_context",
      "pattern_set_id",
      "observed_event",
      "trigger_or_conditions",
      "signal_fragment",
      "distortion_or_absence",
      "related_nodes",
      "confidence_low_medium_high",
      "disconfirming_detail",
      "next_question"
    ],
    rule: "Keep entries small and comparable. Record disconfirming details with the same care as confirming ones."
  },
  answerSignals: {
    note: "These are provisional answer-vectors. Map fit is an editorial judgment of conceptual relevance: Tentative needs examples, Moderate has relevant connections with open gaps, and Strong connects several central concepts directly. Every vector currently has zero logged observations; its evidence remains uncollected.",
    vectors: [
      {
        id: "answer_third_stance",
        title: "The answer may be a disciplined third stance",
        fitLabel: "Strong",
        entries: 0,
        linkedPatterns: 3,
        claim: "The immediate answer is not a rival worldview but a stable method for refusing the false choice between the old structure and formlessness.",
        supports: ["Contradiction Knot", "Shadow Options", "Negative-Space Trace"],
        wouldRaise: "Logged examples where the third stance produces a sharper question or practical move.",
        wouldLower: "Examples where the third stance only delays action or becomes another closed loop."
      },
      {
        id: "answer_transmission",
        title: "The answer may be a transmission protocol",
        fitLabel: "Strong",
        entries: 0,
        linkedPatterns: 2,
        claim: "A major part of the puzzle may be solved by designing better channels: smaller pieces, cleaner terms, listener feedback, and error correction.",
        supports: ["Signal Residue", "Interference Field"],
        wouldRaise: "Repeated cases where better encoding reduces reset or classification.",
        wouldLower: "Cases where perfect communication still leaves the central remainder untouched."
      },
      {
        id: "answer_pattern_method",
        title: "The answer may emerge from pattern collection",
        fitLabel: "Moderate",
        entries: 0,
        linkedPatterns: 4,
        claim: "The project may need to collect non-standard patterns before any single answer becomes visible.",
        supports: ["Signal Residue", "Contradiction Knot", "Attractor Basins", "Shadow Options"],
        wouldRaise: "Five or more entries that reveal a repeated structure not already captured by standard frames.",
        wouldLower: "Entries that scatter without recurrence after careful logging."
      },
      {
        id: "answer_constructive_field",
        title: "The answer may require a constructed field",
        fitLabel: "Moderate",
        entries: 0,
        linkedPatterns: 2,
        claim: "The missing piece may be a collaborative field or artifact that can hold attention longer than an ordinary conversation.",
        supports: ["Interference Field", "Threshold Shift"],
        wouldRaise: "A collaborator or artifact that consistently preserves the signal better than private reflection.",
        wouldLower: "Attempts at collaboration that amplify distortion or instability."
      },
      {
        id: "answer_apophatic_limit",
        title: "The answer may involve disciplined non-naming",
        fitLabel: "Moderate",
        entries: 0,
        linkedPatterns: 2,
        claim: "Some of the answer may be preserved by mapping boundaries, absences, and distortions rather than asserting a full positive theory.",
        supports: ["Negative-Space Trace", "Contradiction Knot"],
        wouldRaise: "Negations that repeatedly sharpen the inquiry without making it vague.",
        wouldLower: "Negations that become evasive, unfalsifiable, or disconnected from source anchors."
      }
    ]
  },
  objectives: [
    {
      id: "obj_preserve",
      title: "Preserve the data",
      definition: "Keep the exact puzzle elements visible before interpreting them through any one framework.",
      firstMoves: [
        "Write one sentence for each source anchor.",
        "Tag each sentence as data, inference, lens, or risk.",
        "Reject any explanation that erases a source anchor too soon."
      ],
      signals: [
        "The map can hold contradiction without collapse.",
        "A new reader can distinguish source from lens."
      ],
      risks: ["closed_loop"],
      nodeIds: ["piece_archive", "pressure_test", "dichotomy"]
    },
    {
      id: "obj_transmit",
      title: "Improve transmission",
      definition: "Design a way to communicate pieces without immediate reset or reduction.",
      firstMoves: [
        "Pick one listener and one piece.",
        "State the piece without naming a total theory.",
        "Ask the listener what they heard before correcting anything."
      ],
      signals: [
        "Less premature classification.",
        "A listener can ask a sharper next question."
      ],
      risks: ["classification", "reset"],
      nodeIds: ["signal_model", "shared_protocol", "seed"]
    },
    {
      id: "obj_find_field",
      title: "Find a workable field",
      definition: "Locate or create a small group that can sustain the inquiry without flattening it.",
      firstMoves: [
        "Define three qualities required in a collaborator.",
        "Share only a bounded artifact first.",
        "Track whether the exchange increases clarity or only intensity."
      ],
      signals: [
        "People can hold uncertainty without rushing closure.",
        "The group produces artifacts, not only resonance."
      ],
      risks: ["society_attention", "overmythologizing"],
      nodeIds: ["collaborators", "constructive_artifact", "shared_protocol"]
    },
    {
      id: "obj_next_vector",
      title: "Find the next vector",
      definition: "Generate one valid next question or test that does not depend on accepting the dominant plot.",
      firstMoves: [
        "Choose the tightest corner: structure, alternative, or next step.",
        "Ask what can be observed locally.",
        "Turn that observation into a small test."
      ],
      signals: [
        "The next move is concrete.",
        "The move does not require total certainty."
      ],
      risks: ["map_suspect", "closed_loop"],
      nodeIds: ["third_stance", "next_question", "grounding"]
    },
    {
      id: "obj_build",
      title: "Make an artifact",
      definition: "Externalize the puzzle into something inspectable: map, essay, protocol, dialogue, or index.",
      firstMoves: [
        "Export this map after adding new pieces.",
        "Write a one-page version for a real reader.",
        "Separate original claims, questions, and references."
      ],
      signals: [
        "The artifact survives outside the immediate state of mind.",
        "It can be revised without losing the core signal."
      ],
      risks: ["overmythologizing", "classification"],
      nodeIds: ["constructive_artifact", "piece_archive", "pressure_test"]
    }
  ]
};
