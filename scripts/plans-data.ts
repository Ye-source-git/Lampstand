// Reading plan seed data. The four "existing" plans preserve their original id,
// title, blurb, and day-by-day book/chapter selections from the prototype so that
// existing users' plan_progress rows (keyed by plan_id + 0-based day_index) stay
// meaningful after migrating from hardcoded TypeScript to the database — only the
// devotional/reflection layer is new. Six short topical plans are new additions.

export type PlanDaySeed = {
  label: string;
  book: string;
  chapter: number;
  devotional: string;
  reflection: string;
  guidedPrayer?: string;
};

export type PlanSeed = {
  id: string;
  title: string;
  blurb: string;
  category: string;
  tags: string[];
  sortOrder: number;
  days: PlanDaySeed[];
};

export const PLANS: PlanSeed[] = [
  {
    id: "begin",
    title: "Where to Begin",
    blurb: "Seven short readings for anyone opening the Bible for the first time — no background assumed.",
    category: "starter",
    tags: ["new to the bible", "beginner"],
    sortOrder: 1,
    days: [
      {
        label: "Creation", book: "Genesis", chapter: 1,
        devotional: "The Bible opens not with an argument for God’s existence but with an act: God speaking the world into being, calling it good, again and again. However you read the days that follow, this chapter’s claim is simple and large — that the universe has a maker who delights in what he’s made, and that includes you.",
        reflection: "What does it change to imagine the world — and yourself — as something spoken into being on purpose, not by accident?",
      },
      {
        label: "A shepherd’s song", book: "Psalms", chapter: 23,
        devotional: "Ancient shepherds led rather than drove their flocks, walking ahead so the sheep could follow a voice they trusted. This psalm has comforted people in hospital rooms and war zones for three thousand years because it doesn’t promise an easy path — only a present guide, even through the valley.",
        reflection: "Where in your life right now could you use the reminder that you’re being led, not abandoned?",
      },
      {
        label: "The Word made flesh", book: "John", chapter: 1,
        devotional: "John doesn’t start his account of Jesus with a birth story but with eternity: “In the beginning was the Word.” The claim is startling — that the same voice that spoke creation into being in Genesis 1 became a person you could sit across a table from.",
        reflection: "What’s one thing you’d want to ask, if the claim that God became knowable in a person turned out to be true?",
      },
      {
        label: "Three lost things", book: "Luke", chapter: 15,
        devotional: "Three stories in a row — a lost sheep, a lost coin, a lost son — all ending the same way: someone throws a party, because what was lost has been found. Jesus told these stories to people who’d been written off by respectable religion, and the point was pointed: nobody’s too far gone to be searched for.",
        reflection: "Is there a part of your own story you’ve assumed puts you outside the search? What would it mean if it didn’t?",
      },
      {
        label: "The Beatitudes", book: "Matthew", chapter: 5,
        devotional: "The Beatitudes turn ordinary expectations upside down: blessed are the poor in spirit, the mourning, the meek — not the impressive but the honest. It’s less a checklist to achieve than a description of the kind of people God draws close to.",
        reflection: "Which of these “blesseds” feels most true to where you actually are right now?",
      },
      {
        label: "God so loved the world", book: "John", chapter: 3,
        devotional: "John 3:16 is probably the most quoted verse in the Bible, quoted so often it can stop meaning anything. Read slowly: not condemnation, but love; not for the deserving, but for the world; not a reward for belief, but eternal life offered freely.",
        reflection: "What would it look like to actually receive this as good news, rather than something you already know?",
      },
      {
        label: "Nothing can separate us", book: "Romans", chapter: 8,
        devotional: "Paul ends this chapter with a list — death, life, angels, powers, height, depth — daring anyone to name something strong enough to separate a person from God’s love. It reads like a man convinced, against every circumstance of his own hard life, that the conclusion is settled.",
        reflection: "What’s the thing you’d add to Paul’s list — the thing that feels most likely to separate you from love? Sit with the possibility that it isn’t strong enough either.",
      },
    ],
  },
  {
    id: "jesus",
    title: "The Life of Jesus",
    blurb: "Fourteen days through Luke’s account — birth, teaching, friendship, death, and resurrection.",
    category: "life-of-jesus",
    tags: ["jesus", "gospels"],
    sortOrder: 2,
    days: [
      {
        label: "An announcement", book: "Luke", chapter: 1,
        devotional: "Luke opens like a careful historian, not a storyteller — he says he’s investigated everything and writes it “in order” for a friend named Theophilus. Then, in the same chapter, an angel tells a young woman she’ll carry God’s own presence into the world, and she simply says yes.",
        reflection: "Mary’s response was consent, not certainty. Where might “yes” be possible for you even without full clarity?",
      },
      {
        label: "A birth in Bethlehem", book: "Luke", chapter: 2,
        devotional: "No palace, no announcement to the powerful — the birth Christians celebrate every December happened in an overflow room, first told to shepherds working the night shift. Luke seems to want readers to notice who gets the news first.",
        reflection: "Who in your own life or world tends to get overlooked, and what would it mean that God shows up for them first?",
      },
      {
        label: "Preparation", book: "Luke", chapter: 3,
        devotional: "John the Baptist’s message was blunt: change direction, and let your life show it. He wasn’t interested in religious performance — when soldiers and tax collectors asked what to do, he gave them concrete, unglamorous instructions about honesty and fairness.",
        reflection: "If someone asked John’s question — “what should I do?” — about one specific area of your life, what would the honest answer be?",
      },
      {
        label: "Testing and calling", book: "Luke", chapter: 4,
        devotional: "Before any public ministry, Jesus spends forty days alone in the wilderness, tested at his most vulnerable — hungry, isolated, offered shortcuts to power. He answers every temptation with scripture he clearly knows by heart.",
        reflection: "What’s your version of the wilderness — the place where you’re tested when no one’s watching?",
      },
      {
        label: "First followers", book: "Luke", chapter: 5,
        devotional: "Simon Peter is a professional fisherman told by a carpenter to try again after a fruitless night. He objects, then obeys anyway — “because you say so” — and the boat nearly sinks under the catch. His response isn’t triumph but sudden awareness of his own smallness.",
        reflection: "Is there something you’ve been reluctant to try again, even though you’ve already “tried that”?",
      },
      {
        label: "A new way to live", book: "Luke", chapter: 6,
        devotional: "Love your enemies. Bless those who curse you. Give without expecting return. Jesus states his ethic plainly, and it’s still, two thousand years later, one of the hardest teachings to actually live rather than just admire.",
        reflection: "Who is the hardest person for you to extend this kind of love to right now?",
      },
      {
        label: "Parables and storms", book: "Luke", chapter: 8,
        devotional: "In the same chapter, Jesus tells a story about seeds landing on different soils and then calms an actual storm with a word, leaving his disciples asking “who is this?” Luke seems to be building toward that exact question.",
        reflection: "What kind of “soil” do you think your own life is right now for the things you’re hearing or reading?",
      },
      {
        label: "Who do you say I am?", book: "Luke", chapter: 9,
        devotional: "Jesus asks his disciples directly: who do you say I am? Peter’s answer — “God’s Messiah” — is immediately followed by Jesus explaining that this will mean suffering, not triumph. The confession and the cost arrive in the same breath.",
        reflection: "If you were asked the same question today, in your own words, how would you answer it?",
      },
      {
        label: "The good Samaritan", book: "Luke", chapter: 10,
        devotional: "A religious expert asks who counts as his neighbor, expecting a tidy answer. Jesus responds with a story where the hero is a Samaritan — a member of a group his Jewish audience despised — who stops for a stranger that two religious men had already passed by.",
        reflection: "Who is the “Samaritan” in your own assumptions — someone you might not expect to be shown as the example of love?",
      },
      {
        label: "Lost and found", book: "Luke", chapter: 15,
        devotional: "A father runs — undignified, in that culture — to meet a son who’d wasted everything, before the son even finishes his rehearsed apology. The waiting itself is the point.",
        reflection: "Is there someone you’re waiting for, or someone who might be waiting for you to come back?",
      },
      {
        label: "Zacchaeus and a colt", book: "Luke", chapter: 19,
        devotional: "Zacchaeus, a wealthy tax collector everyone despised, climbs a tree just to see Jesus. Jesus invites himself to dinner at his house — to the crowd’s outrage — and Zacchaeus responds by giving away half of what he owns.",
        reflection: "What would genuine, visible change look like in your own life if you took this story seriously?",
      },
      {
        label: "The last supper", book: "Luke", chapter: 22,
        devotional: "At what he knows is his last meal with his closest friends, Jesus takes bread and wine and reframes them as his own body and blood, given away. Even knowing what’s coming — betrayal from one at the table — he still shares the meal.",
        reflection: "What does it mean that this moment of institution happens in the middle of imperfect, even betraying, company?",
      },
      {
        label: "The cross", book: "Luke", chapter: 23,
        devotional: "Luke doesn’t soften the crucifixion — the mockery, the physical agony, the darkness at midday. And in the middle of it, Jesus forgives the men executing him and promises paradise to a criminal dying next to him.",
        reflection: "Sit with the fact that forgiveness, in this story, comes before anyone asks for it.",
      },
      {
        label: "The empty tomb", book: "Luke", chapter: 24,
        devotional: "The women who go to anoint Jesus’ body find an empty tomb instead, and are asked a question that echoes through the rest of the book: “why do you look for the living among the dead?” Luke’s account, remarkably, credits women as the first witnesses and evangelists.",
        reflection: "What in your own life have you been looking for in the wrong place?",
      },
    ],
  },
  {
    id: "psalms",
    title: "Songs for Hard Days",
    blurb: "Seven psalms people have leaned on for three thousand years — for grief, fear, and hope.",
    category: "topical",
    tags: ["comfort", "hard days", "psalms"],
    sortOrder: 3,
    days: [
      {
        label: "The shepherd", book: "Psalms", chapter: 23,
        devotional: "Grief and fear rarely respond to being told to stop; this psalm doesn’t argue you out of the valley, it just insists you’re not walking through it alone.",
        reflection: "What would it mean today to trust you’re being led rather than left?",
        guidedPrayer: "You don’t have to talk yourself out of how hard today is. Just ask to feel the presence this psalm describes — not a fix, a companion. “I’m in the valley. Walk it with me.”",
      },
      {
        label: "Light and stronghold", book: "Psalms", chapter: 27,
        devotional: "David names his fear plainly — armies, war, enemies — and then makes a request that has nothing to do with safety: to dwell in God’s presence, to gaze on his beauty. Courage here isn’t the absence of fear but a stronger desire held alongside it.",
        reflection: "What’s the fear you’re naming today, and what’s the deeper desire you’re holding alongside it?",
        guidedPrayer: "Say the fear out loud, specifically, instead of leaving it vague. Then ask for what David asked for — not that the fear disappears, but nearness.",
      },
      {
        label: "Taste and see", book: "Psalms", chapter: 34,
        devotional: "Tradition connects this psalm to one of David’s lowest, most humiliating moments — feigning madness to survive. Out of that specific low place comes an invitation: “taste and see that the LORD is good.” Not an abstract claim, an experiential one.",
        reflection: "Has there been a hard season in your life that later became a place you could point back to and say something good happened there?",
        guidedPrayer: "Don’t ask God to prove himself in the abstract today — ask for one small, concrete good you could actually notice, so you can taste it and not just believe it.",
      },
      {
        label: "Why so downcast?", book: "Psalms", chapter: 42,
        devotional: "The psalmist is honest almost to the point of discomfort — tears for food, a soul “downcast” and “disturbed,” longing like a deer for water it can’t find. And in the middle of that honesty, he preaches to his own soul: “put your hope in God.”",
        reflection: "What would it look like to be this honest about where you actually are today?",
        guidedPrayer: "Try what the psalmist does: talk to your own soul instead of just feeling what it feels. Name how downcast you actually are, then say his line back to yourself — “put your hope in God.”",
      },
      {
        label: "A very present help", book: "Psalms", chapter: 46,
        devotional: "Written for a people facing real upheaval — mountains falling into the sea, nations in uproar — this psalm doesn’t deny the chaos. It insists, in the middle of it, “God is our refuge and strength, a very present help.”",
        reflection: "What’s shaking in your life right now that you need a fixed point for?",
        guidedPrayer: "Name whatever feels like it’s shaking right now, specifically. Ask to know God not as a rescue arriving later, but as a present help, here, in the middle of it.",
      },
      {
        label: "Under his wings", book: "Psalms", chapter: 91,
        devotional: "The imagery here is tender rather than triumphant — a bird sheltering its young under its wings. Traditions read this psalm’s promises in different ways, but its core comfort — being covered, not exposed — has held up across very different readers’ hard days.",
        reflection: "What does it mean to you to picture being sheltered rather than merely surviving?",
        guidedPrayer: "Picture the image instead of just reading it — covered, sheltered, not exposed. Ask for that specific kind of protection today.",
      },
      {
        label: "Searched and known", book: "Psalms", chapter: 139,
        devotional: "David marvels that he can’t go anywhere — not heaven, not the depths, not the far side of the sea — without God already there. Being fully known, in this psalm, isn’t a threat; it’s the ground of being fully loved.",
        reflection: "Is there a part of yourself you’ve assumed is too hidden or too much to be known and still loved?",
        guidedPrayer: "Bring the part of yourself you’d normally keep back, and let it be known instead of hidden. “You already see this. Let me believe you love me anyway.”",
      },
    ],
  },
  {
    id: "story",
    title: "The Big Story in 30 Days",
    blurb: "One chapter a day, Genesis to Revelation — the whole arc of the Bible in a month.",
    category: "whole-bible",
    tags: ["overview", "whole bible"],
    sortOrder: 4,
    days: [
      { label: "Creation", book: "Genesis", chapter: 1, devotional: "The story starts with a good world, made on purpose, by a God who calls it good again and again.", reflection: "What would it mean to see today — and yourself — as fundamentally good, not fundamentally flawed?" },
      { label: "The fall", book: "Genesis", chapter: 3, devotional: "The first rupture: trust breaks, blame starts, and humanity’s story becomes one of hiding from the God who still comes looking.", reflection: "Where do you find yourself hiding today — from God, from others, or from yourself?" },
      { label: "A promise to Abram", book: "Genesis", chapter: 12, devotional: "God’s response to a broken world isn’t punishment but a promise: through one ordinary man, Abram, all the families of the earth will be blessed.", reflection: "What would it look like to trust a promise whose fulfillment you might never see completed?" },
      { label: "Joseph sold", book: "Genesis", chapter: 37, devotional: "Joseph’s brothers, driven by jealousy, sell him into slavery — a betrayal that could have ended the story right there.", reflection: "Is there a betrayal in your own life still shaping how the story feels to you?" },
      { label: "Joseph forgives", book: "Genesis", chapter: 45, devotional: "Years later, with power to punish the brothers who betrayed him, Joseph instead weeps and forgives: “you meant evil, but God meant it for good.”", reflection: "What would it take for you to imagine your own hardest chapter being used for good?" },
      { label: "The burning bush", book: "Exodus", chapter: 3, devotional: "God speaks from a bush that burns without being consumed, sending a reluctant, stammering Moses to demand freedom for an enslaved people.", reflection: "What excuse would you give if God asked you to do something far bigger than you feel equipped for?" },
      { label: "Through the sea", book: "Exodus", chapter: 14, devotional: "Trapped between Pharaoh’s army and the sea, Israel watches the water part — deliverance arriving at the last possible moment, not before.", reflection: "Where in your life are you waiting for a way through that hasn’t opened yet?" },
      { label: "Ten words", book: "Exodus", chapter: 20, devotional: "At Sinai, freed slaves receive not just liberty but law — commandments meant to shape a free people into a just community.", reflection: "Which of the Ten Commandments feels most relevant to a choice in front of you today?" },
      { label: "Hear, O Israel", book: "Deuteronomy", chapter: 6, devotional: "The Shema — “hear, O Israel, the LORD is one” — becomes the core confession of Jewish faith, paired with a command to love God with everything and teach it constantly to children.", reflection: "What are you actively passing on to the next generation, in word or example?" },
      { label: "Be strong and courageous", book: "Joshua", chapter: 1, devotional: "As Israel prepares to enter a land full of uncertainty, God’s repeated instruction to Joshua isn’t a strategy but a posture: be strong and courageous.", reflection: "What situation in front of you needs that same repeated word — be strong and courageous?" },
      { label: "A shepherd king chosen", book: "1 Samuel", chapter: 16, devotional: "While Samuel looks for a king among impressive older brothers, God chooses the overlooked youngest, a shepherd boy: “man looks at the outward appearance, but the LORD looks at the heart.”", reflection: "Where have you been evaluating yourself — or someone else — only by outward appearance?" },
      { label: "A house forever", book: "2 Samuel", chapter: 7, devotional: "God makes David an audacious promise: an everlasting house, a throne established forever — a promise later generations would read as pointing toward the Messiah.", reflection: "What promise are you holding onto that requires trusting a timeline longer than your own life?" },
      { label: "Fire on Carmel", book: "1 Kings", chapter: 18, devotional: "Elijah, alone against 450 prophets of Baal, calls down fire on a soaked altar — a dramatic, public vindication after being badly outnumbered.", reflection: "Where do you feel outnumbered right now, and what would it mean to still show up?" },
      { label: "A child is born", book: "Isaiah", chapter: 9, devotional: "In the middle of political turmoil, Isaiah promises a child who will be called Wonderful Counselor, Mighty God, Prince of Peace — hope spoken into genuine darkness.", reflection: "What darkness in your own life or world do you most need this kind of hope spoken into?" },
      { label: "The suffering servant", book: "Isaiah", chapter: 53, devotional: "A servant who is “pierced for our transgressions,” who suffers not for his own wrongdoing but for others’ — Jewish and Christian tradition read this passage differently, but both recognize its weight.", reflection: "What does it mean to you that suffering, in this passage, isn’t meaningless?" },
      { label: "A new covenant", book: "Jeremiah", chapter: 31, devotional: "After national catastrophe, Jeremiah promises something new: a covenant written not on stone but on the heart, where knowing God is no longer secondhand.", reflection: "What would it mean for faith to be written on your heart rather than just something you know about?" },
      { label: "The lions’ den", book: "Daniel", chapter: 6, devotional: "Daniel keeps praying openly even after a law is passed specifically to trap him for it, and survives a night in a den of lions.", reflection: "What practice or conviction of yours would you keep even if it cost you something to keep it visible?" },
      { label: "A runaway prophet", book: "Jonah", chapter: 1, devotional: "Told to preach mercy to Israel’s enemies in Nineveh, Jonah runs the opposite direction instead — a prophet who’d rather flee than extend the grace he knows God offers.", reflection: "Is there a person or group you’d rather avoid than see shown mercy?" },
      { label: "What does the Lord require?", book: "Micah", chapter: 6, devotional: "Micah distills the whole burden of religious obligation into one memorable line: act justly, love mercy, walk humbly with your God.", reflection: "Which of the three — justice, mercy, humility — is hardest for you to practice consistently?" },
      { label: "A birth in Bethlehem", book: "Luke", chapter: 2, devotional: "The story arrives at its center: God born not in power but in poverty, first announced to shepherds working a night shift.", reflection: "What does it mean that the most significant birth in this story happened somewhere so unremarkable?" },
      { label: "The Beatitudes", book: "Matthew", chapter: 5, devotional: "Jesus opens his most famous teaching by blessing the poor in spirit, the mourning, the meek — not the impressive, the honest.", reflection: "Which of these blessings feels most true to where you actually are today?" },
      { label: "Seeds and soil", book: "Mark", chapter: 4, devotional: "A farmer scatters seed on path, rock, thorns, and good soil — Jesus’ explanation makes clear the story isn’t really about farming, but about how we receive what we hear.", reflection: "Which soil sounds most like your own heart lately?" },
      { label: "Lazarus", book: "John", chapter: 11, devotional: "Jesus weeps at his friend Lazarus’s tomb, even knowing he’s about to raise him — grief and hope existing together, not one replacing the other.", reflection: "Is there space in your own faith for grief and hope to coexist, rather than one canceling the other?" },
      { label: "The cross", book: "Luke", chapter: 23, devotional: "Even while being executed, Jesus forgives those killing him and promises paradise to a criminal dying beside him.", reflection: "What would it mean to extend forgiveness before it’s even requested?" },
      { label: "Resurrection", book: "Luke", chapter: 24, devotional: "The women arrive at the tomb expecting a body and find it empty instead — the story’s central, world-altering surprise.", reflection: "What in your life have you assumed was final that might not be?" },
      { label: "The Spirit comes", book: "Acts", chapter: 2, devotional: "At Pentecost, the Spirit arrives with wind and fire, and a scattered group of frightened disciples becomes a movement speaking across every language present.", reflection: "Where do you sense a need for new courage or new language in your own life?" },
      { label: "No separation", book: "Romans", chapter: 8, devotional: "Paul closes his argument with a list of everything that might separate a person from God’s love — and declares none of it strong enough.", reflection: "What’s the thing you’d add to Paul’s list — and can you believe it isn’t strong enough either?" },
      { label: "The greatest of these", book: "1 Corinthians", chapter: 13, devotional: "Written not for weddings but for a quarreling church, Paul’s description of love — patient, kind, not envious — is a mirror as much as an ideal.", reflection: "Read the list again slowly — which quality is hardest for you to practice this week?" },
      { label: "The mind of Christ", book: "Philippians", chapter: 2, devotional: "Paul quotes what may be the earliest Christian hymn: Christ, though equal with God, emptied himself, taking the nature of a servant — humility as the very shape of divine love.", reflection: "Where is humility being asked of you right now?" },
      { label: "All things new", book: "Revelation", chapter: 21, devotional: "The story ends not with escape from the world but with heaven coming down to earth, and God himself wiping away every tear.", reflection: "What tear would you most want wiped away, and can you hold onto the hope that it will be?" },
    ],
  },
  {
    id: "anxiety",
    title: "When You’re Anxious",
    blurb: "Five days on facing worry honestly — not by denying it, but by placing it somewhere.",
    category: "topical",
    tags: ["anxiety", "fear", "peace", "worry"],
    sortOrder: 5,
    days: [
      { label: "An invitation to bring it", book: "Philippians", chapter: 4, devotional: "Paul writes this letter from prison, yet tells a worried church: don’t be anxious about anything, but present every request to God, and let peace guard your hearts.", reflection: "Name one specific anxious thought and try turning it into an actual request, out loud or in writing.", guidedPrayer: "Before you move on, name the specific thing you’re anxious about — not “everything,” but the one thing sitting heaviest right now. Bring that exact thing to God, in whatever words come. If you want a starting point: “This is what I’m carrying today. I don’t know what to do with it, so I’m handing it to you.”" },
      { label: "Birds and flowers", book: "Matthew", chapter: 6, devotional: "Jesus points to birds fed without farming and flowers clothed without weaving, then asks: won’t your Father do at least as much for you?", reflection: "What worry are you carrying today that you could consciously hand over, even just for today?", guidedPrayer: "Look at something ordinary near you — a plant, the light outside, your own hands — sustained without straining. Ask God to help you believe you’re held with at least that much care. No need for eloquence; even “help me believe this” is enough." },
      { label: "A fixed point", book: "Psalms", chapter: 46, devotional: "Written for people facing real upheaval — mountains falling into the sea — this psalm doesn’t deny the chaos, it insists on a fixed point within it: God is our refuge and strength.", reflection: "What’s shaking in your life right now that you need a fixed point for?", guidedPrayer: "Picture whatever feels unstable in your life right now — the “mountains falling into the sea” version of your week. Instead of asking God to fix it immediately, ask him to be the fixed point inside it. Sit with that for a moment before you move on." },
      { label: "Casting it on him", book: "1 Peter", chapter: 5, devotional: "Peter’s instruction is almost physical: cast all your anxiety on him, because he cares for you. Not manage it alone, not suppress it — cast it, hand it off.", reflection: "What would it actually look like, today, to hand this off rather than carry it alone?", guidedPrayer: "Cast is a physical word — throwing something down, not carrying it anymore. Picture the anxiety you’ve been holding and imagine setting it down at God’s feet, on purpose, instead of picking it back up. Silently, or say it plainly: “I’m not managing this alone. It’s yours.”" },
      { label: "A different peace", book: "John", chapter: 14, devotional: "Facing his own arrest and death, Jesus tells his closest friends: let not your hearts be troubled, my peace I give you, not as the world gives.", reflection: "What’s the difference, for you, between the peace the world offers and the peace this verse describes?", guidedPrayer: "This isn’t the absence of trouble — Jesus said it the night before his arrest. Ask for that specific kind of peace: not that the hard thing disappears, but that it doesn’t get the last word over your heart today." },
    ],
  },
  {
    id: "grief",
    title: "Grief and Hope",
    blurb: "Five days for loss — scripture that takes sorrow seriously without rushing past it.",
    category: "topical",
    tags: ["grief", "loss", "comfort", "death"],
    sortOrder: 6,
    days: [
      { label: "Close to the brokenhearted", book: "Psalms", chapter: 34, devotional: "Tradition connects this psalm to one of David’s lowest moments, and still it insists: the LORD is close to the brokenhearted, and saves those who are crushed in spirit.", reflection: "Where do you feel brokenhearted today, and can you imagine God as close rather than distant from it?", guidedPrayer: "You don’t need to perform strength today. Ask simply to feel God as close, not distant, in exactly the brokenness you’re carrying." },
      { label: "Jesus weeps", book: "John", chapter: 11, devotional: "Jesus weeps at his friend Lazarus’s tomb, even knowing he’s about to raise him. Grief isn’t skipped, even when hope is coming.", reflection: "Give yourself permission today to feel the loss fully, without rushing to the hopeful part.", guidedPrayer: "Give yourself the same permission Jesus gave himself at that tomb: don’t move to hope too fast. Let the loss be as sad as it is, before you ask for anything else." },
      { label: "New every morning", book: "Lamentations", chapter: 3, devotional: "In the middle of five poems mourning a destroyed city, one verse turns unexpectedly toward hope: his mercies are new every morning; great is your faithfulness.", reflection: "What would it mean to expect mercy new tomorrow morning, even in the middle of grief today?", guidedPrayer: "You don’t have to feel hopeful tonight. Ask only for tomorrow morning — that whatever meets you then would be genuinely new." },
      { label: "Rod and staff", book: "Psalms", chapter: 23, devotional: "Even walking through the valley of the shadow of death, the psalmist doesn’t walk alone — a presence goes with him, rod and staff for comfort.", reflection: "Who or what has been your “rod and staff” — the thing that’s comforted you — in this loss?", guidedPrayer: "Think of what’s actually comforted you in this loss — a person, a memory — and thank God for it specifically, by name." },
      { label: "Every tear", book: "Revelation", chapter: 21, devotional: "The story’s ending isn’t escape from sorrow but God himself, present, wiping away every tear — grief taken seriously enough to be personally addressed.", reflection: "What would it mean to you for your own grief to be seen and personally addressed, not just resolved in general?", guidedPrayer: "Ask for what this verse actually promises — not that grief disappears, but that it’s seen, personally. “This tear. Not tears in general — this one.”" },
    ],
  },
  {
    id: "doubt",
    title: "Wrestling With Doubt",
    blurb: "Five days for honest questions — scripture that makes room for doubt instead of shaming it.",
    category: "topical",
    tags: ["doubt", "questions", "faith", "unbelief"],
    sortOrder: 7,
    days: [
      { label: "Help my unbelief", book: "Mark", chapter: 9, devotional: "A desperate father asks Jesus to help if he can, and Jesus turns the question back: “if you can”? Everything is possible. The father’s honest reply — “I do believe; help me overcome my unbelief” — becomes the prayer of everyone who’s ever doubted.", reflection: "Can you pray this father’s exact words today, doubt and belief held together?", guidedPrayer: "Pray the father’s exact words, even if they feel contradictory: “I believe — help my unbelief.” You don’t need to resolve the tension before you pray it." },
      { label: "Thomas asks for evidence", book: "John", chapter: 20, devotional: "Thomas refuses to believe the resurrection without seeing for himself, and Jesus doesn’t rebuke him for asking — he shows up and offers the evidence Thomas needs.", reflection: "What would it look like for you to bring your specific doubts honestly, rather than hiding them?", guidedPrayer: "Bring your actual doubt, specifically, instead of a vague unease. Ask directly for what would help — you’re not asking too much." },
      { label: "Longing like a deer", book: "Psalms", chapter: 42, devotional: "The psalmist is remarkably honest about spiritual dryness — his soul downcast, longing for God like a deer panting for water it can’t find.", reflection: "Is there a season of spiritual dryness you’ve been afraid to admit, even to yourself?", guidedPrayer: "If it’s been dry for you lately, say that plainly instead of performing a feeling you don’t have. “I don’t feel close to you right now. I’d like to.”" },
      { label: "How long?", book: "Habakkuk", chapter: 1, devotional: "Habakkuk opens his short book by arguing with God directly — how long will you let injustice go unanswered? Scripture makes room for this kind of question, not just tidy answers.", reflection: "What’s the question you’ve been afraid was too irreverent to actually ask God?", guidedPrayer: "Ask the question you’ve been afraid was too irreverent to ask out loud. Habakkuk’s book is proof the relationship survives the question." },
      { label: "Ask for wisdom", book: "James", chapter: 1, devotional: "James writes to a scattered, struggling community that wisdom is available simply by asking — and that even in trials, something is being built, if we let the process do its work.", reflection: "What if the doubting itself were part of the process, not a failure of it?", guidedPrayer: "Simply ask — for wisdom, for clarity, for whatever you actually need — without first proving you deserve an answer." },
    ],
  },
  {
    id: "forgiveness",
    title: "Learning to Forgive",
    blurb: "Five days on letting go — for a specific hurt you haven’t known what to do with.",
    category: "topical",
    tags: ["forgiveness", "reconciliation", "anger"],
    sortOrder: 8,
    days: [
      { label: "Seventy-seven times", book: "Matthew", chapter: 18, devotional: "Peter asks how many times he must forgive — seven? Jesus answers seventy-seven, then tells a story about a servant forgiven an enormous debt who refuses to forgive a small one owed to him.", reflection: "Is there a debt — real or emotional — you’re holding onto that’s smaller than what you’ve already been forgiven?", guidedPrayer: "Picture the specific hurt you’re holding, then picture what you’ve already been forgiven that’s larger. Ask for help holding the two side by side." },
      { label: "Joseph forgives", book: "Genesis", chapter: 45, devotional: "Joseph, with full power to punish the brothers who sold him into slavery, instead weeps and forgives: “you meant evil, but God meant it for good.”", reflection: "What would it take for you to imagine your worst betrayal being redeemed rather than just endured?", guidedPrayer: "You don’t have to see the good yet. Ask for what Joseph eventually had: the ability to imagine this isn’t the end of the story." },
      { label: "Father, forgive them", book: "Luke", chapter: 23, devotional: "Even while being executed unjustly, Jesus forgives the people killing him — “Father, forgive them, they don’t know what they’re doing.”", reflection: "Is there someone whose wrong against you might, at least in part, come from not fully understanding what they did?", guidedPrayer: "Say the person’s name, then Jesus’ words, even if you don’t fully mean them yet: “Father, forgive them.” Ask for the wanting to come, if it isn’t there." },
      { label: "As the Lord forgave you", book: "Colossians", chapter: 3, devotional: "Paul instructs a young church to bear with one another and forgive as the Lord forgave them — not because the wrong didn’t matter, but because they’d been shown the same grace.", reflection: "What grace have you received that might make it possible to extend grace to someone else?", guidedPrayer: "Remember one specific thing you’ve been forgiven for — something real. Ask for help extending even a fraction of that grace to this person." },
      { label: "Before the sun goes down", book: "Ephesians", chapter: 4, devotional: "Paul pairs a striking command — don’t let the sun go down on your anger — with tenderness and forgiveness as the actual alternative to bitterness.", reflection: "Is there anger you’ve been carrying past its useful life? What would it take to set it down today?", guidedPrayer: "Ask honestly whether this anger is still doing anything useful, or if it’s become just weight. You don’t have to set it all down today — just ask for help starting." },
    ],
  },
  {
    id: "gratitude",
    title: "A Grateful Heart",
    blurb: "Five days practicing thanksgiving — a discipline more than a feeling.",
    category: "topical",
    tags: ["gratitude", "joy", "contentment", "thanksgiving"],
    sortOrder: 9,
    days: [
      { label: "Enter with thanksgiving", book: "Psalms", chapter: 100, devotional: "A short psalm of pure thanksgiving: enter his gates with thanksgiving, his courts with praise — gratitude as the doorway into worship, not an afterthought to it.", reflection: "Name three specific things — not general categories — you’re grateful for today.", guidedPrayer: "Start with three specific things, not categories — not “family” but one thing someone in your family actually did this week." },
      { label: "In all circumstances", book: "1 Thessalonians", chapter: 5, devotional: "Paul’s instruction is deceptively simple and hard: give thanks in all circumstances. Not for every circumstance, but within them.", reflection: "What’s one hard circumstance right now where you could still find something to be thankful within?", guidedPrayer: "Think of the hardest thing you’re facing, and instead of thanking God for it, look for one thing within it you can still be thankful for." },
      { label: "The one who came back", book: "Luke", chapter: 17, devotional: "Ten men with leprosy are healed, and only one — a Samaritan, an outsider — comes back to say thank you. Jesus notices the nine who didn’t.", reflection: "Is there a good thing in your life you’ve stopped noticing because it became familiar?", guidedPrayer: "Notice something good you’ve stopped noticing because it’s become ordinary, and say thank you for it like it’s new again." },
      { label: "The secret of contentment", book: "Philippians", chapter: 4, devotional: "Paul, writing from prison, says he’s learned the secret of contentment in any and every situation — a learned skill, not a natural gift.", reflection: "What would it mean for contentment to be something you practice, rather than something you’re waiting to feel?", guidedPrayer: "Ask for contentment as a skill you’re building, not a feeling you’re waiting to arrive. “Teach me to be okay here, today — not once things change.”" },
      { label: "Do not forget", book: "Psalms", chapter: 103, devotional: "David lists specific things not to forget — forgiveness, healing, redemption, love, satisfaction — preaching gratitude to his own soul like a discipline.", reflection: "What’s on your own list of things not to forget, the next time you feel discouraged?", guidedPrayer: "Make your own short list — two or three specific things God has done — and speak it to yourself the way David did." },
    ],
  },
  {
    id: "waiting",
    title: "When You’re Waiting",
    blurb: "Five days for uncertain seasons — when the answer or the change hasn’t come yet.",
    category: "topical",
    tags: ["waiting", "uncertainty", "patience"],
    sortOrder: 10,
    days: [
      { label: "Wait for the Lord", book: "Psalms", chapter: 27, devotional: "David, naming real fear and real enemies, ends with an instruction to himself: wait for the LORD; be strong and take heart, and wait for the LORD.", reflection: "What are you waiting for right now, and what would it mean to wait with strength rather than just enduring?", guidedPrayer: "Ask for strength inside the waiting, not just an end to it. “Help me wait like someone taking heart, not just holding on.”" },
      { label: "A promise decades in the making", book: "Genesis", chapter: 12, devotional: "God’s promise to Abram — land, descendants, blessing — would take decades to even begin fulfilling, and Abram never saw its full completion in his lifetime.", reflection: "What promise are you holding that might outlast your own timeline for it?", guidedPrayer: "You may not see this resolved on your timeline. Ask for the kind of trust that doesn’t require seeing the ending." },
      { label: "Renewed strength", book: "Isaiah", chapter: 40, devotional: "Those who wait for the LORD will renew their strength, soar like eagles, run and not grow weary — waiting reframed not as passive delay but as a source of strength.", reflection: "How might your current waiting be building something in you, even if you can’t see it yet?", guidedPrayer: "Instead of asking only for the waiting to end, ask for what this verse promises inside it — renewed strength, right now." },
      { label: "Wait quietly", book: "Lamentations", chapter: 3, devotional: "In the middle of grief over a destroyed city, the writer concludes: it is good to wait quietly for the salvation of the LORD.", reflection: "What would “waiting quietly” — without frantic control — look like for you this week?", guidedPrayer: "Notice where you’ve been trying to force an outcome instead of waiting for it. Ask for what this verse names: quiet, not passivity." },
      { label: "Groaning in hope", book: "Romans", chapter: 8, devotional: "Paul describes creation itself as waiting, groaning, in eager expectation — waiting isn’t a sign something’s wrong, it’s built into the shape of hope itself.", reflection: "Can you hold your current waiting as a sign of hope rather than a sign of delay or failure?", guidedPrayer: "Let today’s waiting be read as a sign of hope, not failure. “This isn’t proof you’ve forgotten me — it’s proof I’m still expecting something.”" },
    ],
  },
];
