const duaSearchInput = document.getElementById("dua-search");
const duaList = document.getElementById("dua-list");
const duaStatus = document.getElementById("dua-status");
const duaCategoryRow = document.getElementById("dua-category-row");
const duaFavoritesToggle = document.getElementById("dua-favorites-toggle");

const duaFavoritesStorageKey = "nooriva-dua-favorites";

const duas = [
  {
    id: "taawwuz",
    title: "Ta'awwuz",
    category: "daily",
    keywords: ["quran", "protection", "shaytan", "audhubillah", "auzubillah", "aoodhubillah", "taawuz", "taawwuz"],
    arabic: "Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù Ù…ÙÙ†ÙŽ Ø§Ù„Ø´ÙŽÙ‘ÙŠÙ’Ø·ÙŽØ§Ù†Ù Ø§Ù„Ø±ÙŽÙ‘Ø¬ÙÙŠÙ…Ù",
    transliteration: "A'udhu billahi minash-shaytanir-rajim.",
    english: "I seek protection in Allah from Shaytan, the rejected one.",
  },
  {
    id: "tasmiyah",
    title: "Tasmiyah",
    category: "daily",
    keywords: ["bismillah", "bismilah", "basmala", "mercy", "beginning"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø§Ù„Ø±ÙŽÙ‘Ø­Ù’Ù…Ù°Ù†Ù Ø§Ù„Ø±ÙŽÙ‘Ø­ÙÙŠÙ…Ù",
    transliteration: "Bismillahir Rahmanir Rahim.",
    english: "In the name of Allah, the Most Affectionate, the Most Merciful.",
  },
  {
    id: "kalimah-tayyibah",
    title: "Kalimah Tayyibah",
    category: "iman",
    keywords: ["shahadah", "faith", "declaration"],
    arabic: "Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯ÙŒ Ø±ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "La ilaha illallah Muhammadur Rasulullah.",
    english: "There is none worthy of worship besides Allah. Muhammad is the Messenger of Allah.",
  },
  {
    id: "before-eating",
    title: "Before eating",
    category: "daily",
    keywords: ["food", "meal", "eat"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¨ÙŽØ±ÙŽÙƒÙŽØ©Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "Bismillahi wa 'ala barakatillah.",
    english: "In the name of Allah and with the blessings of Allah.",
  },
  {
    id: "after-eating",
    title: "After eating",
    category: "daily",
    keywords: ["food", "meal", "thanks"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ø§Ù„ÙŽÙ‘Ø°ÙÙŠ Ø£ÙŽØ·Ù’Ø¹ÙŽÙ…ÙŽÙ†ÙŽØ§ ÙˆÙŽØ³ÙŽÙ‚ÙŽØ§Ù†ÙŽØ§ ÙˆÙŽØ¬ÙŽØ¹ÙŽÙ„ÙŽÙ†ÙŽØ§ Ù…ÙÙ†ÙŽ Ø§Ù„Ù’Ù…ÙØ³Ù’Ù„ÙÙ…ÙÙŠÙ†ÙŽ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana minal-muslimin.",
    english: "All praises are due to Allah who has given us food and drink and who has made us Muslims.",
  },
  {
    id: "before-sleep",
    title: "Before sleeping",
    category: "daily",
    keywords: ["sleep", "night", "bed"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¨ÙØ§Ø³Ù’Ù…ÙÙƒÙŽ Ø£ÙŽÙ…ÙÙˆØªÙ ÙˆÙŽØ£ÙŽØ­Ù’ÙŠÙŽØ§",
    transliteration: "Allahumma bismika amutu wa ahya.",
    english: "O Allah, with Your name I die and I live.",
  },
  {
    id: "after-waking",
    title: "After waking up",
    category: "daily",
    keywords: ["sleep", "morning", "wake"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ø§Ù„ÙŽÙ‘Ø°ÙÙŠ Ø£ÙŽØ­Ù’ÙŠÙŽØ§Ù†ÙŽØ§ Ø¨ÙŽØ¹Ù’Ø¯ÙŽ Ù…ÙŽØ§ Ø£ÙŽÙ…ÙŽØ§ØªÙŽÙ†ÙŽØ§ ÙˆÙŽØ¥ÙÙ„ÙŽÙŠÙ’Ù‡Ù Ø§Ù„Ù†ÙÙ‘Ø´ÙÙˆØ±Ù",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    english: "All praises are due to Allah who has given us life after taking it away, and to Him is our raising.",
  },
  {
    id: "welcoming-someone",
    title: "When welcoming someone",
    category: "social",
    keywords: ["welcome", "guest"],
    arabic: "Ø£ÙŽÙ‡Ù’Ù„Ù‹Ø§ ÙˆÙŽÙ‘Ø³ÙŽÙ‡Ù’Ù„Ù‹Ø§ ÙˆÙŽÙ‘Ù…ÙŽØ±Ù’Ø­ÙŽØ¨Ù‹Ø§",
    transliteration: "Ahlan wa sahlan wa marhaban.",
    english: "Welcome. May you be at ease and comfortable.",
  },
  {
    id: "greeting-muslim",
    title: "When greeting a Muslim",
    category: "social",
    keywords: ["salam", "greeting"],
    arabic: "Ø§ÙŽÙ„Ø³ÙŽÙ‘Ù„ÙŽØ§Ù…Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’ÙƒÙÙ…Ù’ ÙˆÙŽØ±ÙŽØ­Ù’Ù…ÙŽØ©Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¨ÙŽØ±ÙŽÙƒÙŽØ§ØªÙÙ‡Ù",
    transliteration: "As-salamu 'alaykum wa rahmatullahi wa barakatuh.",
    english: "Peace be upon you and the mercy of Allah and His blessings.",
  },
  {
    id: "reply-greeting",
    title: "Reply to a Muslim greeting",
    category: "social",
    keywords: ["salam", "reply", "greeting"],
    arabic: "ÙˆÙŽØ¹ÙŽÙ„ÙŽÙŠÙ’ÙƒÙÙ…Ù Ø§Ù„Ø³ÙŽÙ‘Ù„ÙŽØ§Ù…Ù ÙˆÙŽØ±ÙŽØ­Ù’Ù…ÙŽØ©Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¨ÙŽØ±ÙŽÙƒÙŽØ§ØªÙÙ‡Ù",
    transliteration: "Wa 'alaykumus-salam wa rahmatullahi wa barakatuh.",
    english: "And peace be upon you and the mercy of Allah and His blessings.",
  },
  {
    id: "before-toilet",
    title: "Before entering the toilet",
    category: "daily",
    keywords: ["toilet", "bathroom"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¥ÙÙ†ÙÙ‘ÙŠ Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙÙƒÙŽ Ù…ÙÙ†ÙŽ Ø§Ù„Ù’Ø®ÙØ¨ÙØ«Ù ÙˆÙŽØ§Ù„Ù’Ø®ÙŽØ¨ÙŽØ§Ø¦ÙØ«Ù",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith.",
    english: "O Allah, I seek protection in You from filth and male and female devils.",
  },
  {
    id: "after-toilet",
    title: "After leaving the toilet",
    category: "daily",
    keywords: ["toilet", "bathroom"],
    arabic: "ØºÙÙÙ’Ø±ÙŽØ§Ù†ÙŽÙƒÙŽØŒ Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ø§Ù„ÙŽÙ‘Ø°ÙÙŠ Ø£ÙŽØ°Ù’Ù‡ÙŽØ¨ÙŽ Ø¹ÙŽÙ†ÙÙ‘ÙŠ Ø§Ù„Ù’Ø£ÙŽØ°ÙŽÙ‰ ÙˆÙŽØ¹ÙŽØ§ÙÙŽØ§Ù†ÙÙŠ",
    transliteration: "Ghufranaka, alhamdu lillahil-ladhi adh-haba 'annil-adha wa 'afani.",
    english: "I seek Your pardon. All praises are due to Allah who has taken away from me discomfort and granted me relief.",
  },
  {
    id: "thanking-someone",
    title: "When thanking someone",
    category: "social",
    keywords: ["thanks", "gratitude"],
    arabic: "Ø¬ÙŽØ²ÙŽØ§ÙƒÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø®ÙŽÙŠÙ’Ø±Ù‹Ø§",
    transliteration: "Jazakallahu khayran.",
    english: "May Allah reward you well.",
  },
  {
    id: "intend-something",
    title: "When intending to do something",
    category: "daily",
    keywords: ["inshaallah", "intention"],
    arabic: "Ø¥ÙÙ†Ù’ Ø´ÙŽØ§Ø¡ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "In sha' Allah.",
    english: "If Allah wills.",
  },
  {
    id: "good-news",
    title: "Upon hearing good news",
    category: "daily",
    keywords: ["good news", "gratitude", "happy"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡ÙØŒ Ù…ÙŽØ§ Ø´ÙŽØ§Ø¡ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "Alhamdu lillah, ma sha' Allah.",
    english: "All praises are due to Allah, just as Allah willed.",
  },
  {
    id: "after-milk",
    title: "After drinking milk",
    category: "daily",
    keywords: ["milk", "drink"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¨ÙŽØ§Ø±ÙÙƒÙ’ Ù„ÙŽÙ†ÙŽØ§ ÙÙÙŠÙ‡Ù ÙˆÙŽØ²ÙØ¯Ù’Ù†ÙŽØ§ Ù…ÙÙ†Ù’Ù‡Ù",
    transliteration: "Allahumma barik lana fihi wa zidna minhu.",
    english: "O Allah, bless us in it and increase it for us.",
  },
  {
    id: "ascending",
    title: "While ascending",
    category: "travel",
    keywords: ["climbing", "up"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù",
    transliteration: "Allahu Akbar.",
    english: "Allah is the Greatest.",
  },
  {
    id: "descending",
    title: "While descending",
    category: "travel",
    keywords: ["down", "descent"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "SubhanAllah.",
    english: "Glory be to Allah.",
  },
  {
    id: "kalimah-shahadah",
    title: "Kalimah Shahadah",
    category: "iman",
    keywords: ["faith", "declaration", "shahadah", "ashhadu", "la ilaha illallah"],
    arabic: "Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù’ Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ­Ù’Ø¯ÙŽÙ‡Ù Ù„ÙŽØ§ Ø´ÙŽØ±ÙÙŠÙƒÙŽ Ù„ÙŽÙ‡Ù ÙˆÙŽØ£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†ÙŽÙ‘ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù‹Ø§ Ø¹ÙŽØ¨Ù’Ø¯ÙÙ‡Ù ÙˆÙŽØ±ÙŽØ³ÙÙˆÙ„ÙÙ‡Ù",
    transliteration: "Ashhadu an la ilaha illallahu wahdahu la sharika lahu wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
    english: "I bear witness that there is none worthy of worship besides Allah alone. He has no partner and I bear witness that Muhammad is His servant and Messenger.",
  },
  {
    id: "kalimah-tamjeed",
    title: "Kalimah Tamjeed",
    category: "iman",
    keywords: ["dhikr", "praise", "glory"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù ÙˆÙŽÙ„ÙŽØ§ Ø­ÙŽÙˆÙ’Ù„ÙŽ ÙˆÙŽÙ„ÙŽØ§ Ù‚ÙÙˆÙŽÙ‘Ø©ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù Ø§Ù„Ù’Ø¹ÙŽÙ„ÙÙŠÙÙ‘ Ø§Ù„Ù’Ø¹ÙŽØ¸ÙÙŠÙ…Ù",
    transliteration: "SubhanAllahi walhamdu lillahi wa la ilaha illallahu wallahu akbar, wa la hawla wa la quwwata illa billahil 'aliyyil 'azim.",
    english: "Glory be to Allah, all praises are due to Allah, there is none worthy of worship besides Allah, Allah is the Greatest, and there is no might and no power except from Allah the Most High, the Magnificent.",
  },
  {
    id: "after-water",
    title: "After drinking water",
    category: "daily",
    keywords: ["water", "drink"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ø§Ù„ÙŽÙ‘Ø°ÙÙŠ Ø³ÙŽÙ‚ÙŽØ§Ù†ÙŽØ§ Ø¹ÙŽØ°Ù’Ø¨Ù‹Ø§ ÙÙØ±ÙŽØ§ØªÙ‹Ø§ Ø¨ÙØ±ÙŽØ­Ù’Ù…ÙŽØªÙÙ‡Ù ÙˆÙŽÙ„ÙŽÙ…Ù’ ÙŠÙŽØ¬Ù’Ø¹ÙŽÙ„Ù’Ù‡Ù Ù…ÙÙ„Ù’Ø­Ù‹Ø§ Ø£ÙØ¬ÙŽØ§Ø¬Ù‹Ø§ Ø¨ÙØ°ÙÙ†ÙÙˆØ¨ÙÙ†ÙŽØ§",
    transliteration: "Alhamdu lillahil-ladhi saqana 'adhban furatan birahmatihi wa lam yaj'alhu milhan ujajan bidhunubina.",
    english: "All praises are due to Allah who has given us sweet water to drink and did not make it bitter because of our sins.",
  },
  {
    id: "increase-knowledge",
    title: "For increasing knowledge",
    category: "knowledge",
    keywords: ["study", "school", "learn"],
    arabic: "Ø±ÙŽØ¨ÙÙ‘ Ø²ÙØ¯Ù’Ù†ÙÙŠ Ø¹ÙÙ„Ù’Ù…Ù‹Ø§",
    transliteration: "Rabbi zidni 'ilma.",
    english: "O my Lord, increase my knowledge.",
  },
  {
    id: "durood-shareef",
    title: "Durood Shareef",
    category: "salah",
    keywords: ["durood", "salawat", "prophet"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ ØµÙŽÙ„ÙÙ‘ Ø¹ÙŽÙ„ÙŽÙ‰ Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¢Ù„Ù Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙˆÙŽØ¨ÙŽØ§Ø±ÙÙƒÙ’ ÙˆÙŽØ³ÙŽÙ„ÙÙ‘Ù…Ù’",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin wa barik wa sallim.",
    english: "O Allah, send blessings upon our Master Muhammad and upon the family of our Master Muhammad, and send blessings and peace upon them.",
  },
  {
    id: "boarding-transport",
    title: "On boarding transport",
    category: "travel",
    keywords: ["car", "journey", "transport"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡ÙØŒ Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø§Ù„ÙŽÙ‘Ø°ÙÙŠ Ø³ÙŽØ®ÙŽÙ‘Ø±ÙŽ Ù„ÙŽÙ†ÙŽØ§ Ù‡Ù°Ø°ÙŽØ§ ÙˆÙŽÙ…ÙŽØ§ ÙƒÙÙ†ÙŽÙ‘Ø§ Ù„ÙŽÙ‡Ù Ù…ÙÙ‚Ù’Ø±ÙÙ†ÙÙŠÙ†ÙŽ ÙˆÙŽØ¥ÙÙ†ÙŽÙ‘Ø§ Ø¥ÙÙ„ÙŽÙ‰ Ø±ÙŽØ¨ÙÙ‘Ù†ÙŽØ§ Ù„ÙŽÙ…ÙÙ†Ù’Ù‚ÙŽÙ„ÙØ¨ÙÙˆÙ†ÙŽ",
    transliteration: "Alhamdu lillah, subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun.",
    english: "All praises are due to Allah. Glory be to Him who has caused this to be under our control though we were unable to control it. Surely we will return to our Lord.",
  },
  {
    id: "prophet-mentioned",
    title: "When the Prophet's name is mentioned",
    category: "social",
    keywords: ["prophet", "salawat"],
    arabic: "ØµÙŽÙ„ÙŽÙ‘Ù‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù ÙˆÙŽØ³ÙŽÙ„ÙŽÙ‘Ù…ÙŽ",
    transliteration: "Sallallahu 'alayhi wa sallam.",
    english: "May Allah send blessings and peace upon him.",
  },
  {
    id: "after-sneeze",
    title: "After you sneeze",
    category: "daily",
    keywords: ["sneeze", "health"],
    arabic: "Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù",
    transliteration: "Alhamdu lillah.",
    english: "All praises are due to Allah.",
  },
  {
    id: "hear-sneeze",
    title: "When you hear someone sneeze",
    category: "social",
    keywords: ["sneeze", "reply"],
    arabic: "ÙŠÙŽØ±Ù’Ø­ÙŽÙ…ÙÙƒÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "Yarhamukallah.",
    english: "May Allah have mercy on you.",
  },
  {
    id: "sneezer-reply",
    title: "The sneezer's reply",
    category: "social",
    keywords: ["sneeze", "reply"],
    arabic: "ÙŠÙŽÙ‡Ù’Ø¯ÙÙŠÙƒÙÙ…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙŠÙØµÙ’Ù„ÙØ­Ù Ø¨ÙŽØ§Ù„ÙŽÙƒÙÙ…Ù’",
    transliteration: "Yahdikumullahu wa yuslihu balakum.",
    english: "May Allah guide you and correct your affairs.",
  },
  {
    id: "mirror",
    title: "When looking into a mirror",
    category: "daily",
    keywords: ["mirror", "character"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø£ÙŽÙ†Ù’ØªÙŽ Ø­ÙŽØ³ÙŽÙ‘Ù†Ù’ØªÙŽ Ø®ÙŽÙ„Ù’Ù‚ÙÙŠ ÙÙŽØ­ÙŽØ³ÙÙ‘Ù†Ù’ Ø®ÙÙ„ÙÙ‚ÙÙŠ",
    transliteration: "Allahumma anta hassanta khalqi fa hassin khuluqi.",
    english: "O Allah, You have made my body beautiful, so beautify my character as well.",
  },
  {
    id: "seek-forgiveness",
    title: "When seeking Allah's forgiveness",
    category: "protection",
    keywords: ["astaghfirullah", "astagfirullah", "istighfar", "istigfar", "forgiveness"],
    arabic: "Ø£ÙŽØ³Ù’ØªÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙŽ",
    transliteration: "Astaghfirullah.",
    english: "I seek Allah's forgiveness.",
  },
  {
    id: "imaan-mujmal",
    title: "Imaan-e-Mujmal",
    category: "iman",
    keywords: ["faith", "belief"],
    arabic: "Ø¢Ù…ÙŽÙ†Ù’ØªÙ Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù ÙƒÙŽÙ…ÙŽØ§ Ù‡ÙÙˆÙŽ Ø¨ÙØ£ÙŽØ³Ù’Ù…ÙŽØ§Ø¦ÙÙ‡Ù ÙˆÙŽØµÙÙÙŽØ§ØªÙÙ‡Ù ÙˆÙŽÙ‚ÙŽØ¨ÙÙ„Ù’ØªÙ Ø¬ÙŽÙ…ÙÙŠØ¹ÙŽ Ø£ÙŽØ­Ù’ÙƒÙŽØ§Ù…ÙÙ‡Ù",
    transliteration: "Amantu billahi kama huwa bi asma'ihi wa sifatihi wa qabiltu jami'a ahkamihi.",
    english: "I believe in Allah as He is understood by His names and attributes, and I accept all His orders.",
  },
  {
    id: "kalimah-tawheed",
    title: "Kalimah Tawheed",
    category: "iman",
    keywords: ["faith", "tawheed", "la ilaha illallah"],
    arabic: "Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ­Ù’Ø¯ÙŽÙ‡Ù Ù„ÙŽØ§ Ø´ÙŽØ±ÙÙŠÙƒÙŽ Ù„ÙŽÙ‡Ù Ù„ÙŽÙ‡Ù Ø§Ù„Ù’Ù…ÙÙ„Ù’ÙƒÙ ÙˆÙŽÙ„ÙŽÙ‡Ù Ø§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù ÙŠÙØ­Ù’ÙŠÙÙŠ ÙˆÙŽÙŠÙÙ…ÙÙŠØªÙ Ø¨ÙÙŠÙŽØ¯ÙÙ‡Ù Ø§Ù„Ù’Ø®ÙŽÙŠÙ’Ø±Ù ÙˆÙŽÙ‡ÙÙˆÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ ÙƒÙÙ„ÙÙ‘ Ø´ÙŽÙŠÙ’Ø¡Ù Ù‚ÙŽØ¯ÙÙŠØ±ÙŒ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, yuhyi wa yumit, biyadihil-khayr, wa huwa 'ala kulli shay'in qadir.",
    english: "There is none worthy of worship besides Allah alone. He has no partner. His is the kingdom and for Him is all praise. He gives life and causes death. In His hand is all good and He has power over everything.",
  },
  {
    id: "forget-bismillah",
    title: "When you forget Bismillah before eating",
    category: "daily",
    keywords: ["food", "bismillah", "eat"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙÙÙŠ Ø£ÙŽÙˆÙŽÙ‘Ù„ÙÙ‡Ù ÙˆÙŽØ¢Ø®ÙØ±ÙÙ‡Ù",
    transliteration: "Bismillahi fi awwalihi wa akhirih.",
    english: "In the name of Allah in its beginning and its end.",
  },
  {
    id: "shaking-hands",
    title: "While shaking hands",
    category: "social",
    keywords: ["handshake", "forgiveness"],
    arabic: "ÙŠÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù„ÙŽÙ†ÙŽØ§ ÙˆÙŽÙ„ÙŽÙƒÙÙ…Ù’",
    transliteration: "Yaghfirullahu lana wa lakum.",
    english: "May Allah forgive us and you.",
  },
  {
    id: "conveyed-salam",
    title: "When salam is conveyed",
    category: "social",
    keywords: ["salam", "message"],
    arabic: "Ø¹ÙŽÙ„ÙŽÙŠÙ’ÙƒÙŽ ÙˆÙŽØ¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù Ø§Ù„Ø³ÙŽÙ‘Ù„ÙŽØ§Ù…Ù ÙˆÙŽØ±ÙŽØ­Ù’Ù…ÙŽØ©Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¨ÙŽØ±ÙŽÙƒÙŽØ§ØªÙÙ‡Ù",
    transliteration: "Alayka wa 'alayhis-salamu wa rahmatullahi wa barakatuh.",
    english: "Peace be upon you and him and the mercy of Allah and His blessings.",
  },
  {
    id: "entering-masjid",
    title: "When entering the masjid",
    category: "masjid",
    keywords: ["mosque", "masjid"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø§ÙÙ’ØªÙŽØ­Ù’ Ù„ÙÙŠ Ø£ÙŽØ¨Ù’ÙˆÙŽØ§Ø¨ÙŽ Ø±ÙŽØ­Ù’Ù…ÙŽØªÙÙƒÙŽ",
    transliteration: "Allahumma iftah li abwaba rahmatik.",
    english: "O Allah, open for me the doors of Your mercy.",
  },
  {
    id: "leaving-masjid",
    title: "When leaving the masjid",
    category: "masjid",
    keywords: ["mosque", "masjid"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¥ÙÙ†ÙÙ‘ÙŠ Ø£ÙŽØ³Ù’Ø£ÙŽÙ„ÙÙƒÙŽ Ù…ÙÙ†Ù’ ÙÙŽØ¶Ù’Ù„ÙÙƒÙŽ",
    transliteration: "Allahumma inni as'aluka min fadlik.",
    english: "O Allah, verily I ask You from Your bounties.",
  },
  {
    id: "itikaf",
    title: "For Sunnat-e-Itikaaf",
    category: "masjid",
    keywords: ["itikaf", "masjid", "intention"],
    arabic: "Ù†ÙŽÙˆÙŽÙŠÙ’ØªÙ Ø³ÙÙ†ÙŽÙ‘Ø©ÙŽ Ø§Ù„Ù’Ø§ÙØ¹Ù’ØªÙÙƒÙŽØ§ÙÙ Ù„ÙÙ„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰",
    transliteration: "Nawaytu sunnatal i'tikafi lillahi ta'ala.",
    english: "I intended to make Sunnat-e-Itikaaf for the sake of Allah Ta'ala.",
  },
  {
    id: "farewell",
    title: "When we say farewell to someone",
    category: "social",
    keywords: ["farewell", "travel"],
    arabic: "ÙÙÙŠ Ø£ÙŽÙ…ÙŽØ§Ù†Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙÙÙŠ Ø£ÙŽÙ…ÙŽØ§Ù†Ù Ø§Ù„Ø±ÙŽÙ‘Ø³ÙÙˆÙ„Ù ØµÙŽÙ„ÙŽÙ‘Ù‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù ÙˆÙŽØ³ÙŽÙ„ÙŽÙ‘Ù…ÙŽ",
    transliteration: "Fi amanillahi wa fi amanir-rasuli sallallahu 'alayhi wa sallam.",
    english: "Go in Allah's protection and with the Prophet's protection.",
  },
  {
    id: "difficulty",
    title: "When facing a problem or difficulty",
    category: "protection",
    keywords: ["difficulty", "problem", "stress"],
    arabic: "Ø­ÙŽØ³Ù’Ø¨ÙÙ†ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ†ÙØ¹Ù’Ù…ÙŽ Ø§Ù„Ù’ÙˆÙŽÙƒÙÙŠÙ„Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ØªÙŽÙˆÙŽÙƒÙŽÙ‘Ù„Ù’Ù†ÙŽØ§",
    transliteration: "Hasbunallahu wa ni'mal-wakil wa 'alallahi tawakkalna.",
    english: "Allah is enough for us and He is the best helper, and upon Allah do we rely.",
  },
  {
    id: "wudhu-niyyah",
    title: "Niyyah for wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu", "niyyah"],
    arabic: "Ù†ÙŽÙˆÙŽÙŠÙ’ØªÙ Ø£ÙŽÙ†Ù’ Ø£ÙŽØªÙŽÙˆÙŽØ¶ÙŽÙ‘Ø£ÙŽ Ù„ÙØ±ÙŽÙÙ’Ø¹Ù Ø§Ù„Ù’Ø­ÙŽØ¯ÙŽØ«Ù ÙˆÙŽØ§Ø³Ù’ØªÙØ¨ÙŽØ§Ø­ÙŽØ©Ù Ø§Ù„ØµÙŽÙ‘Ù„ÙŽØ§Ø©Ù ÙˆÙŽØªÙŽÙ‚ÙŽØ±ÙÙ‘Ø¨Ù‹Ø§ Ø¥ÙÙ„ÙŽÙ‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰",
    transliteration: "Nawaytu an atawadda'a liraf'il-hadathi wastibahatis-salati wa taqarruban ilallahi ta'ala.",
    english: "I intended to perform wudhu to purify from impurity, to establish prayer, and to obtain nearness of Allah Ta'ala.",
  },
  {
    id: "before-wudhu",
    title: "Before making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù",
    transliteration: "Bismillahi walhamdu lillah.",
    english: "In the name of Allah and all praises are due to Allah.",
  },
  {
    id: "while-wudhu",
    title: "While making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø§ØºÙ’ÙÙØ±Ù’ Ù„ÙÙŠ Ø°ÙŽÙ†Ù’Ø¨ÙÙŠ ÙˆÙŽÙˆÙŽØ³ÙÙ‘Ø¹Ù’ Ù„ÙÙŠ ÙÙÙŠ Ø¯ÙŽØ§Ø±ÙÙŠ ÙˆÙŽØ¨ÙŽØ§Ø±ÙÙƒÙ’ Ù„ÙÙŠ ÙÙÙŠ Ø±ÙØ²Ù’Ù‚ÙÙŠ",
    transliteration: "Allahummaghfir li dhanbi wa wassi' li fi dari wa barik li fi rizqi.",
    english: "O Allah, forgive my sin, give me abundance in my home, and grant me blessings in my sustenance.",
  },
  {
    id: "after-wudhu",
    title: "After making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø§Ø¬Ù’Ø¹ÙŽÙ„Ù’Ù†ÙÙŠ Ù…ÙÙ†ÙŽ Ø§Ù„ØªÙŽÙ‘ÙˆÙŽÙ‘Ø§Ø¨ÙÙŠÙ†ÙŽ ÙˆÙŽØ§Ø¬Ù’Ø¹ÙŽÙ„Ù’Ù†ÙÙŠ Ù…ÙÙ†ÙŽ Ø§Ù„Ù’Ù…ÙØªÙŽØ·ÙŽÙ‡ÙÙ‘Ø±ÙÙŠÙ†ÙŽ",
    transliteration: "Allahummaj'alni minat-tawwabina waj'alni minal-mutatahhirin.",
    english: "O Allah, make me among those who repent and among those who are clean and pure.",
  },
  {
    id: "imaan-mufassal",
    title: "Imaan-e-Mufassal",
    category: "iman",
    keywords: ["faith", "belief", "angels", "books"],
    arabic: "Ø¢Ù…ÙŽÙ†Ù’ØªÙ Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ…ÙŽÙ„ÙŽØ§Ø¦ÙÙƒÙŽØªÙÙ‡Ù ÙˆÙŽÙƒÙØªÙØ¨ÙÙ‡Ù ÙˆÙŽØ±ÙØ³ÙÙ„ÙÙ‡Ù ÙˆÙŽØ§Ù„Ù’ÙŠÙŽÙˆÙ’Ù…Ù Ø§Ù„Ù’Ø¢Ø®ÙØ±Ù ÙˆÙŽØ§Ù„Ù’Ù‚ÙŽØ¯Ù’Ø±Ù Ø®ÙŽÙŠÙ’Ø±ÙÙ‡Ù ÙˆÙŽØ´ÙŽØ±ÙÙ‘Ù‡Ù Ù…ÙÙ†ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰ ÙˆÙŽØ§Ù„Ù’Ø¨ÙŽØ¹Ù’Ø«Ù Ø¨ÙŽØ¹Ù’Ø¯ÙŽ Ø§Ù„Ù’Ù…ÙŽÙˆÙ’ØªÙ",
    transliteration: "Amantu billahi wa mala'ikatihi wa kutubihi wa rusulihi wal-yawmil-akhiri wal-qadri khayrihi wa sharrihi minallahi ta'ala wal-ba'thi ba'dal-mawt.",
    english: "I believe in Allah, His angels, His books, His messengers, the Last Day, destiny - the good and the bad thereof - which is from Allah, and the raising after death.",
  },
  {
    id: "for-parents",
    title: "Dua for parents",
    category: "family",
    keywords: ["mother", "father", "parents"],
    arabic: "Ø±ÙŽØ¨ÙÙ‘ Ø§Ø±Ù’Ø­ÙŽÙ…Ù’Ù‡ÙÙ…ÙŽØ§ ÙƒÙŽÙ…ÙŽØ§ Ø±ÙŽØ¨ÙŽÙ‘ÙŠÙŽØ§Ù†ÙÙŠ ØµÙŽØºÙÙŠØ±Ù‹Ø§",
    transliteration: "Rabbir hamhuma kama rabbayani saghira.",
    english: "O my Lord, have mercy upon them as they both nourished me when I was small.",
  },
  {
    id: "radd-e-kufr",
    title: "Kalimah Radd-e-Kufr",
    category: "protection",
    keywords: ["kufr", "protection", "faith"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¥ÙÙ†ÙÙ‘ÙŠ Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙÙƒÙŽ Ù…ÙÙ†Ù’ Ø£ÙŽÙ†Ù’ Ø£ÙØ´Ù’Ø±ÙÙƒÙŽ Ø¨ÙÙƒÙŽ Ø´ÙŽÙŠÙ’Ø¦Ù‹Ø§ ÙˆÙŽØ£ÙŽÙ†ÙŽØ§ Ø£ÙŽØ¹Ù’Ù„ÙŽÙ…Ù Ø¨ÙÙ‡Ù ÙˆÙŽØ£ÙŽØ³Ù’ØªÙŽØºÙ’ÙÙØ±ÙÙƒÙŽ Ù„ÙÙ…ÙŽØ§ Ù„ÙŽØ§ Ø£ÙŽØ¹Ù’Ù„ÙŽÙ…Ù Ø¨ÙÙ‡Ù ØªÙØ¨Ù’ØªÙ Ø¹ÙŽÙ†Ù’Ù‡Ù ÙˆÙŽØªÙŽØ¨ÙŽØ±ÙŽÙ‘Ø£Ù’ØªÙ Ù…ÙÙ†ÙŽ Ø§Ù„Ù’ÙƒÙÙÙ’Ø±Ù ÙˆÙŽØ§Ù„Ø´ÙÙ‘Ø±Ù’ÙƒÙ ÙˆÙŽØ§Ù„Ù’Ù…ÙŽØ¹ÙŽØ§ØµÙÙŠ ÙƒÙÙ„ÙÙ‘Ù‡ÙŽØ§ ÙˆÙŽØ£ÙŽØ³Ù’Ù„ÙŽÙ…Ù’ØªÙ ÙˆÙŽØ¢Ù…ÙŽÙ†Ù’ØªÙ ÙˆÙŽØ£ÙŽÙ‚ÙÙˆÙ„Ù Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯ÙŒ Ø±ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "Allahumma inni a'udhu bika min an ushrika bika shay'an wa ana a'lamu bih, wa astaghfiruka lima la a'lamu bih, tubtu 'anhu wa tabarra'tu minal-kufri wash-shirki wal-ma'asi kulliha, wa aslamtu wa amantu wa aqulu la ilaha illallah Muhammadur Rasulullah.",
    english: "O Allah, I seek protection in You from knowingly joining any partner with You, and I seek Your forgiveness for that which I do not know. I repent, free myself from disbelief, shirk and all sins, submit to Your will, believe, and declare that there is none worthy of worship besides Allah and Muhammad is the Messenger of Allah.",
  },
  {
    id: "drought",
    title: "At the time of drought",
    category: "protection",
    keywords: ["rain", "drought"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø§Ø³Ù’Ù‚ÙÙ†ÙŽØ§ØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø£ÙŽØºÙØ«Ù’Ù†ÙŽØ§",
    transliteration: "Allahummasqina, Allahumma aghithna.",
    english: "O Allah, quench us. O Allah, let it rain upon us.",
  },
  {
    id: "entering-house",
    title: "When entering your house",
    category: "home",
    keywords: ["home", "house", "enter"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¥ÙÙ†ÙÙ‘ÙŠ Ø£ÙŽØ³Ù’Ø£ÙŽÙ„ÙÙƒÙŽ Ø®ÙŽÙŠÙ’Ø±ÙŽ Ø§Ù„Ù’Ù…ÙŽÙˆÙ’Ù„ÙŽØ¬Ù ÙˆÙŽØ®ÙŽÙŠÙ’Ø±ÙŽ Ø§Ù„Ù’Ù…ÙŽØ®Ù’Ø±ÙŽØ¬Ù Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ„ÙŽØ¬Ù’Ù†ÙŽØ§ ÙˆÙŽØ¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø®ÙŽØ±ÙŽØ¬Ù’Ù†ÙŽØ§ ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø±ÙŽØ¨ÙÙ‘Ù†ÙŽØ§ ØªÙŽÙˆÙŽÙƒÙŽÙ‘Ù„Ù’Ù†ÙŽØ§",
    transliteration: "Allahumma inni as'aluka khayral-mawlaji wa khayral-makhraji, bismillahi walajna wa bismillahi kharajna wa 'alallahi rabbina tawakkalna.",
    english: "O Allah, I ask You the blessing of entering the house and the blessing of leaving the house. In the name of Allah we enter and in the name of Allah we leave and upon Allah our Lord do we rely.",
  },
  {
    id: "leaving-house",
    title: "When leaving your house",
    category: "home",
    keywords: ["home", "house", "leave"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ØªÙŽÙˆÙŽÙƒÙŽÙ‘Ù„Ù’ØªÙ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ„ÙŽØ§ Ø­ÙŽÙˆÙ’Ù„ÙŽ ÙˆÙŽÙ„ÙŽØ§ Ù‚ÙÙˆÙŽÙ‘Ø©ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù",
    transliteration: "Bismillahi tawakkaltu 'alallah wa la hawla wa la quwwata illa billah.",
    english: "In the name of Allah I leave, and I rely upon Allah, and there is no might and no power except from Allah.",
  },
  {
    id: "bidding-farewell",
    title: "When bidding farewell to someone",
    category: "social",
    keywords: ["farewell", "travel"],
    arabic: "Ø£ÙŽØ³Ù’ØªÙŽÙˆÙ’Ø¯ÙØ¹Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙŽ Ø¯ÙÙŠÙ†ÙŽÙƒÙŽ ÙˆÙŽØ£ÙŽÙ…ÙŽØ§Ù†ÙŽØªÙŽÙƒÙŽ ÙˆÙŽØ®ÙŽÙˆÙŽØ§ØªÙÙŠÙ…ÙŽ Ø¹ÙŽÙ…ÙŽÙ„ÙÙƒÙŽ",
    transliteration: "Astawdi'ullaha dinaka wa amanataka wa khawatima 'amalik.",
    english: "I give in trust to Allah your religion, your belongings and the result of your deeds.",
  },
  {
    id: "fever",
    title: "Dua for fever",
    category: "healing",
    keywords: ["fever", "illness", "healing"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø§Ù„Ù’ÙƒÙŽØ¨ÙÙŠØ±Ù Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù Ø§Ù„Ù’Ø¹ÙŽØ¸ÙÙŠÙ…Ù Ù…ÙÙ†Ù’ Ø´ÙŽØ±ÙÙ‘ ÙƒÙÙ„ÙÙ‘ Ø¹ÙØ±Ù’Ù‚Ù Ù†ÙŽØ¹ÙŽÙ‘Ø§Ø±Ù ÙˆÙŽÙ…ÙÙ†Ù’ Ø´ÙŽØ±ÙÙ‘ Ø­ÙŽØ±ÙÙ‘ Ø§Ù„Ù†ÙŽÙ‘Ø§Ø±Ù",
    transliteration: "Bismillahil-kabir, a'udhu billahil-'azim min sharri kulli 'irqin na''arin wa min sharri harrin-nar.",
    english: "In the name of Allah, the Great. I seek protection in Allah the Magnificent from the evil of every spurting vein and from the evil of the heat of the fire.",
  },
  {
    id: "takbeer",
    title: "Takbeer",
    category: "salah",
    keywords: ["salah", "prayer", "takbir"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù",
    transliteration: "Allahu Akbar.",
    english: "Allah is the Greatest.",
  },
  {
    id: "thanaa",
    title: "Thanaa",
    category: "salah",
    keywords: ["salah", "prayer", "opening"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽÙƒÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ ÙˆÙŽØ¨ÙØ­ÙŽÙ…Ù’Ø¯ÙÙƒÙŽ ÙˆÙŽØªÙŽØ¨ÙŽØ§Ø±ÙŽÙƒÙŽ Ø§Ø³Ù’Ù…ÙÙƒÙŽ ÙˆÙŽØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰ Ø¬ÙŽØ¯ÙÙ‘ÙƒÙŽ ÙˆÙŽÙ„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ ØºÙŽÙŠÙ’Ø±ÙÙƒÙŽ",
    transliteration: "Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghayruk.",
    english: "Glory be to You O Allah and all praises are due to You, blessed is Your name, high is Your greatness and there is none worthy of worship besides You.",
  },
  {
    id: "ruku",
    title: "Tasbeeh of ruku'",
    category: "salah",
    keywords: ["ruku", "salah", "prayer"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø±ÙŽØ¨ÙÙ‘ÙŠÙŽ Ø§Ù„Ù’Ø¹ÙŽØ¸ÙÙŠÙ…Ù",
    transliteration: "Subhana Rabbiyal 'Azim.",
    english: "Glory be to my Lord, the Magnificent.",
  },
  {
    id: "rising-ruku",
    title: "When rising from ruku'",
    category: "salah",
    keywords: ["ruku", "salah", "prayer"],
    arabic: "Ø³ÙŽÙ…ÙØ¹ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù„ÙÙ…ÙŽÙ†Ù’ Ø­ÙŽÙ…ÙØ¯ÙŽÙ‡ÙØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø±ÙŽØ¨ÙŽÙ‘Ù†ÙŽØ§ ÙˆÙŽÙ„ÙŽÙƒÙŽ Ø§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù",
    transliteration: "Sami'Allahu liman hamidah. Allahumma Rabbana wa lakal-hamd.",
    english: "Allah has heard the servant who has praised Him. O Allah our Lord, all praises are due to You.",
  },
  {
    id: "sajdah",
    title: "Tasbeeh in sajdah",
    category: "salah",
    keywords: ["sajdah", "sujud", "salah"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø±ÙŽØ¨ÙÙ‘ÙŠÙŽ Ø§Ù„Ù’Ø£ÙŽØ¹Ù’Ù„ÙŽÙ‰",
    transliteration: "Subhana Rabbiyal A'la.",
    english: "Glory be to my Lord, the Most High.",
  },
  {
    id: "tashahhud",
    title: "Tashahhud",
    category: "salah",
    keywords: ["tashahhud", "salah", "prayer"],
    arabic: "Ø§Ù„ØªÙŽÙ‘Ø­ÙÙŠÙŽÙ‘Ø§ØªÙ Ù„ÙÙ„Ù‘Ù°Ù‡Ù ÙˆÙŽØ§Ù„ØµÙŽÙ‘Ù„ÙŽÙˆÙŽØ§ØªÙ ÙˆÙŽØ§Ù„Ø·ÙŽÙ‘ÙŠÙÙ‘Ø¨ÙŽØ§ØªÙØŒ Ø§Ù„Ø³ÙŽÙ‘Ù„ÙŽØ§Ù…Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’ÙƒÙŽ Ø£ÙŽÙŠÙÙ‘Ù‡ÙŽØ§ Ø§Ù„Ù†ÙŽÙ‘Ø¨ÙÙŠÙÙ‘ ÙˆÙŽØ±ÙŽØ­Ù’Ù…ÙŽØ©Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¨ÙŽØ±ÙŽÙƒÙŽØ§ØªÙÙ‡ÙØŒ Ø§Ù„Ø³ÙŽÙ‘Ù„ÙŽØ§Ù…Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù†ÙŽØ§ ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¹ÙØ¨ÙŽØ§Ø¯Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø§Ù„ØµÙŽÙ‘Ø§Ù„ÙØ­ÙÙŠÙ†ÙŽØŒ Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù’ Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†ÙŽÙ‘ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù‹Ø§ Ø¹ÙŽØ¨Ù’Ø¯ÙÙ‡Ù ÙˆÙŽØ±ÙŽØ³ÙÙˆÙ„ÙÙ‡Ù",
    transliteration: "At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu 'alayna wa 'ala 'ibadillahis-salihin, ashhadu an la ilaha illallah wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
    english: "All prayers and worship offered through words, actions and wealth are due to Allah. Peace be upon you O Prophet and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is none worthy of worship besides Allah and I bear witness that Muhammad is His servant and messenger.",
  },
  {
    id: "durood-ibrahim",
    title: "Durood-e-Ibrahim",
    category: "salah",
    keywords: ["durood", "salah", "salawat"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ ØµÙŽÙ„ÙÙ‘ Ø¹ÙŽÙ„ÙŽÙ‰ Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¢Ù„Ù Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙƒÙŽÙ…ÙŽØ§ ØµÙŽÙ„ÙŽÙ‘ÙŠÙ’ØªÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ø¥ÙØ¨Ù’Ø±ÙŽØ§Ù‡ÙÙŠÙ…ÙŽ ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¢Ù„Ù Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ø¥ÙØ¨Ù’Ø±ÙŽØ§Ù‡ÙÙŠÙ…ÙŽ Ø¥ÙÙ†ÙŽÙ‘ÙƒÙŽ Ø­ÙŽÙ…ÙÙŠØ¯ÙŒ Ù…ÙŽØ¬ÙÙŠØ¯ÙŒ. Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¨ÙŽØ§Ø±ÙÙƒÙ’ Ø¹ÙŽÙ„ÙŽÙ‰ Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¢Ù„Ù Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ù…ÙØ­ÙŽÙ…ÙŽÙ‘Ø¯Ù ÙƒÙŽÙ…ÙŽØ§ Ø¨ÙŽØ§Ø±ÙŽÙƒÙ’ØªÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ø¥ÙØ¨Ù’Ø±ÙŽØ§Ù‡ÙÙŠÙ…ÙŽ ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ø¢Ù„Ù Ø³ÙŽÙŠÙÙ‘Ø¯ÙÙ†ÙŽØ§ Ø¥ÙØ¨Ù’Ø±ÙŽØ§Ù‡ÙÙŠÙ…ÙŽ Ø¥ÙÙ†ÙŽÙ‘ÙƒÙŽ Ø­ÙŽÙ…ÙÙŠØ¯ÙŒ Ù…ÙŽØ¬ÙÙŠØ¯ÙŒ",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin kama sallayta 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahima innaka Hamidum Majid. Allahumma barik 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin kama barakta 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahima innaka Hamidum Majid.",
    english: "O Allah, send blessings upon our Master Muhammad and upon the family of our Master Muhammad as You sent blessings upon our Master Ibrahim and upon the family of our Master Ibrahim. Surely, You are Praiseworthy and Most High.",
  },
  {
    id: "after-durood-ibrahim",
    title: "After Durood-e-Ibrahim",
    category: "salah",
    keywords: ["forgiveness", "salah", "prayer"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…ÙŽÙ‘ Ø¥ÙÙ†ÙÙ‘ÙŠ Ø¸ÙŽÙ„ÙŽÙ…Ù’ØªÙ Ù†ÙŽÙÙ’Ø³ÙÙŠ Ø¸ÙÙ„Ù’Ù…Ù‹Ø§ ÙƒÙŽØ«ÙÙŠØ±Ù‹Ø§ ÙˆÙŽØ¥ÙÙ†ÙŽÙ‘Ù‡Ù Ù„ÙŽØ§ ÙŠÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ø°ÙÙ‘Ù†ÙÙˆØ¨ÙŽ Ø¥ÙÙ„ÙŽÙ‘Ø§ Ø£ÙŽÙ†Ù’ØªÙŽ ÙÙŽØ§ØºÙ’ÙÙØ±Ù’ Ù„ÙÙŠ Ù…ÙŽØºÙ’ÙÙØ±ÙŽØ©Ù‹ Ù…ÙÙ†Ù’ Ø¹ÙÙ†Ù’Ø¯ÙÙƒÙŽ ÙˆÙŽØ§Ø±Ù’Ø­ÙŽÙ…Ù’Ù†ÙÙŠ Ø¥ÙÙ†ÙŽÙ‘ÙƒÙŽ Ø£ÙŽÙ†Ù’ØªÙŽ Ø§Ù„Ù’ØºÙŽÙÙÙˆØ±Ù Ø§Ù„Ø±ÙŽÙ‘Ø­ÙÙŠÙ…Ù",
    transliteration: "Allahumma inni zalamtu nafsi zulman kathira wa innahu la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika warhamni innaka antal-Ghafurur-Rahim.",
    english: "O Allah, I have wronged myself greatly and nobody forgives sins except You. Forgive me and have mercy upon me. Surely, You are the Most Forgiver and the Most Merciful.",
  },
  {
    id: "after-adhan",
    title: "Dua after adhan",
    category: "masjid",
    keywords: ["adhan", "azaan", "call to prayer"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø±Ø¨ Ù‡Ø°Ù‡ Ø§Ù„Ø¯Ø¹ÙˆØ© Ø§Ù„ØªØ§Ù…Ø© ÙˆØ§Ù„ØµÙ„Ø§Ø© Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø¢Øª Ø³ÙŠØ¯Ù†Ø§ Ù…Ø­Ù…Ø¯Ø§Ù‹ Ø§Ù„ÙˆØ³ÙŠÙ„Ø© ÙˆØ§Ù„ÙØ¶ÙŠÙ„Ø© ÙˆØ§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø±ÙÙŠØ¹Ø© ÙˆØ§Ø¨Ø¹Ø«Ù‡ Ù…Ù‚Ø§Ù…Ø§Ù‹ Ù…Ø­Ù…ÙˆØ¯Ø§Ù‹ Ø§Ù„Ø°ÙŠ ÙˆØ¹Ø¯ØªÙ‡ ÙˆØ§Ø±Ø²Ù‚Ù†Ø§ Ø´ÙØ§Ø¹ØªÙ‡ ÙŠÙˆÙ… Ø§Ù„Ù‚ÙŠØ§Ù…Ø© Ø¥Ù†Ùƒ Ù„Ø§ ØªØ®Ù„Ù Ø§Ù„Ù…ÙŠØ¹Ø§Ø¯",
    transliteration: "Allahumma rabba hadhihid-da'watit-tammah was-salatil-qa'imah ati sayyidina Muhammadanil-wasilata wal-fadilah wad-darajatar-rafi'ah wab'athhu maqamam mahmudanilladhi wa'adtah warzuqna shafa'atahu yawmal-qiyamah innaka la tukhliful-mi'ad.",
    english: "O Allah, Lord of this perfect call and established prayer, grant our Master Muhammad the Waseelah, excellence and the highest rank, raise him to the praised station You promised him, and grant us his intercession on the Day of Judgement. Surely You do not break Your promise.",
  },
  {
    id: "before-niyyah-salah",
    title: "Before making niyyah for salah",
    category: "salah",
    keywords: ["niyyah", "intention", "salah"],
    arabic: "Ø¥Ù†ÙŠ ÙˆØ¬Ù‡Øª ÙˆØ¬Ù‡ÙŠ Ù„Ù„Ø°ÙŠ ÙØ·Ø± Ø§Ù„Ø³Ù…ÙˆØ§Øª ÙˆØ§Ù„Ø£Ø±Ø¶ Ø­Ù†ÙŠÙØ§Ù‹ ÙˆÙ…Ø§ Ø£Ù†Ø§ Ù…Ù† Ø§Ù„Ù…Ø´Ø±ÙƒÙŠÙ†",
    transliteration: "Inni wajjahtu wajhiya lilladhi fataras-samawati wal-arda hanifan wa ma ana minal-mushrikin.",
    english: "Verily, I have firmly turned my face towards Him Who created the heavens and the earth, and I am not among those who associate partners with Allah.",
  },
  {
    id: "after-salam",
    title: "Dua after salam",
    category: "salah",
    keywords: ["after prayer", "salam", "salah"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø£Ù†Øª Ø§Ù„Ø³Ù„Ø§Ù… ÙˆÙ…Ù†Ùƒ Ø§Ù„Ø³Ù„Ø§Ù… ØªØ¨Ø§Ø±ÙƒØª ÙŠØ§ Ø°Ø§ Ø§Ù„Ø¬Ù„Ø§Ù„ ÙˆØ§Ù„Ø¥ÙƒØ±Ø§Ù…",
    transliteration: "Allahumma antas-salam wa minkas-salam tabarakta ya dhal-jalali wal-ikram.",
    english: "O Allah, You are Peace and from You comes peace. Blessed are You, O Lord of Majesty and Generosity.",
  },
  {
    id: "dua-qunoot",
    title: "Dua-e-Qunoot",
    category: "salah",
    keywords: ["qunoot", "witr", "salah", "allahumma inna nasta inuka", "nastaeenuka", "nasta inuka"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø¥Ù†Ø§ Ù†Ø³ØªØ¹ÙŠÙ†Ùƒ ÙˆÙ†Ø³ØªØºÙØ±Ùƒ ÙˆÙ†Ø¤Ù…Ù† Ø¨Ùƒ ÙˆÙ†ØªÙˆÙƒÙ„ Ø¹Ù„ÙŠÙƒ ÙˆÙ†Ø«Ù†ÙŠ Ø¹Ù„ÙŠÙƒ Ø§Ù„Ø®ÙŠØ± ÙˆÙ†Ø´ÙƒØ±Ùƒ ÙˆÙ„Ø§ Ù†ÙƒÙØ±Ùƒ ÙˆÙ†Ø®Ù„Ø¹ ÙˆÙ†ØªØ±Ùƒ Ù…Ù† ÙŠÙØ¬Ø±Ùƒ Ø§Ù„Ù„Ù‡Ù… Ø¥ÙŠØ§Ùƒ Ù†Ø¹Ø¨Ø¯ ÙˆÙ„Ùƒ Ù†ØµÙ„ÙŠ ÙˆÙ†Ø³Ø¬Ø¯ ÙˆØ¥Ù„ÙŠÙƒ Ù†Ø³Ø¹Ù‰ ÙˆÙ†Ø­ÙØ¯ ÙˆÙ†Ø±Ø¬Ùˆ Ø±Ø­Ù…ØªÙƒ ÙˆÙ†Ø®Ø´Ù‰ Ø¹Ø°Ø§Ø¨Ùƒ Ø¥Ù† Ø¹Ø°Ø§Ø¨Ùƒ Ø¨Ø§Ù„ÙƒÙØ§Ø± Ù…Ù„Ø­Ù‚",
    transliteration: "Allahumma inna nasta'inuka wa nastaghfiruka wa nu'minu bika wa natawakkalu 'alayka wa nuthni 'alaykal-khayr wa nashkuruka wa la nakfuruk wa nakhla'u wa natruku man yafjuruk. Allahumma iyyaka na'budu wa laka nusalli wa nasjudu wa ilayka nas'a wa nahfid wa narju rahmataka wa nakhsha 'adhabaka inna 'adhabaka bil-kuffari mulhiq.",
    english: "O Allah, we seek help from You, seek forgiveness from You, believe in You and rely on You. We praise You in the best way, thank You and do not show ingratitude. We separate ourselves from those who disobey You. O Allah, You alone we worship, to You we pray and prostrate, towards You we strive and hasten. We hope for Your mercy and fear Your punishment. Surely Your punishment overtakes the disbelievers.",
  },
  {
    id: "dua-for-fasting",
    title: "Dua for fasting",
    category: "daily",
    keywords: ["fasting", "sawm", "roza", "sehri"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø£ØµÙˆÙ… ØºØ¯Ø§Ù‹ Ù„Ùƒ ÙØ§ØºÙØ± Ù„ÙŠ Ù…Ø§ Ù‚Ø¯Ù…Øª ÙˆÙ…Ø§ Ø£Ø®Ø±Øª",
    transliteration: "Allahumma asumu ghadan laka faghfir li ma qaddamtu wa ma akhkhartu.",
    english: "O Allah, I am fasting for You in the coming day, so forgive my past and future sins.",
  },
  {
    id: "when-breaking-fast",
    title: "Dua when breaking fast",
    category: "daily",
    keywords: ["iftar", "fasting", "roza"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ù„Ùƒ ØµÙ…Øª ÙˆØ¨Ùƒ Ø¢Ù…Ù†Øª ÙˆØ¹Ù„Ù‰ Ø±Ø²Ù‚Ùƒ Ø£ÙØ·Ø±Øª ÙØªÙ‚Ø¨Ù„ Ù…Ù†ÙŠ",
    transliteration: "Allahumma laka sumtu wa bika amantu wa 'ala rizqika aftartu fataqabbal minni.",
    english: "O Allah, I fasted for You, believed in You, and with the provision You gave me I break my fast. Accept it from me.",
  },
  {
    id: "when-seeing-masjid",
    title: "When you see a masjid",
    category: "masjid",
    keywords: ["masjid", "mosque", "durood"],
    arabic: "Ø§Ù„ØµÙ„Ø§Ø© ÙˆØ§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„ÙŠÙƒ ÙŠØ§ Ø±Ø³ÙˆÙ„ Ø§Ù„Ù„Ù‡",
    transliteration: "As-salatu was-salamu 'alayka ya Rasulallah.",
    english: "O Messenger of Allah, blessings and peace be upon you.",
  },
  {
    id: "signs-of-infidelity",
    title: "When we see the signs of infidelity",
    category: "iman",
    keywords: ["faith", "kufr", "iman"],
    arabic: "Ø£Ø´Ù‡Ø¯ Ø£Ù† Ù„Ø§ Ø¥Ù„Ù‡ Ø¥Ù„Ø§ Ø§Ù„Ù„Ù‡ ÙˆØ­Ø¯Ù‡ Ù„Ø§ Ø´Ø±ÙŠÙƒ Ù„Ù‡ Ø¥Ù„Ù‡Ø§Ù‹ ÙˆØ§Ø­Ø¯Ø§Ù‹ Ù„Ø§ Ù†Ø¹Ø¨Ø¯ Ø¥Ù„Ø§ Ø¥ÙŠØ§Ù‡",
    transliteration: "Ashhadu an la ilaha illallahu wahdahu la sharika lah ilahan wahidan la na'budu illa iyyah.",
    english: "I bear witness that there is none worthy of worship besides Allah alone. He has no partner. We worship none besides Him.",
  },
  {
    id: "boarding-transport",
    title: "Dua on boarding a car or other transport",
    category: "travel",
    keywords: ["car", "transport", "travel", "journey"],
    arabic: "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ Ø³Ø¨Ø­Ø§Ù† Ø§Ù„Ø°ÙŠ Ø³Ø®Ø± Ù„Ù†Ø§ Ù‡Ø°Ø§ ÙˆÙ…Ø§ ÙƒÙ†Ø§ Ù„Ù‡ Ù…Ù‚Ø±Ù†ÙŠÙ† ÙˆØ¥Ù†Ø§ Ø¥Ù„Ù‰ Ø±Ø¨Ù†Ø§ Ù„Ù…Ù†Ù‚Ù„Ø¨ÙˆÙ†",
    transliteration: "Alhamdulillah. Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila Rabbina lamunqalibun.",
    english: "All praise is due to Allah. Glory be to Him Who has subjected this to us, though we could not have controlled it ourselves. Surely to our Lord we will return.",
  },
  {
    id: "boarding-ship-plane",
    title: "Dua while boarding a ship or aeroplane",
    category: "travel",
    keywords: ["ship", "plane", "aeroplane", "travel"],
    arabic: "Ø¨Ø³Ù… Ø§Ù„Ù„Ù‡ Ù…Ø¬Ø±Ø§Ù‡Ø§ ÙˆÙ…Ø±Ø³Ø§Ù‡Ø§ Ø¥Ù† Ø±Ø¨ÙŠ Ù„ØºÙÙˆØ± Ø±Ø­ÙŠÙ…",
    transliteration: "Bismillahi majraha wa mursaha inna Rabbi laghafurun rahim.",
    english: "In the name of Allah is its movement and its stillness. Surely my Lord is Most Forgiving, Most Merciful.",
  },
  {
    id: "return-from-journey",
    title: "Dua when we return from a journey",
    category: "travel",
    keywords: ["journey", "return", "travel"],
    arabic: "Ø¢ÙŠØ¨ÙˆÙ† ØªØ§Ø¦Ø¨ÙˆÙ† Ù„Ø±Ø¨Ù†Ø§ Ø­Ø§Ù…Ø¯ÙˆÙ†",
    transliteration: "Ayibuna ta'ibuna li Rabbina hamidun.",
    english: "We return, repenting, worshipping and praising our Lord.",
  },
  {
    id: "new-muslim-dua",
    title: "Dua to be taught to a new Muslim",
    category: "iman",
    keywords: ["new muslim", "guidance", "sustenance"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø§ØºÙØ± Ù„ÙŠ ÙˆØ§Ø±Ø­Ù…Ù†ÙŠ ÙˆØ§Ù‡Ø¯Ù†ÙŠ ÙˆØ§Ø±Ø²Ù‚Ù†ÙŠ",
    transliteration: "Allahummaghfir li warhamni wahdini warzuqni.",
    english: "O Allah, forgive me, have mercy on me, guide me and grant me sustenance.",
  },
  {
    id: "heavy-rainfall",
    title: "Dua at the time of heavy rainfall",
    category: "protection",
    keywords: ["rain", "weather", "storm"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… ØµÙŠØ¨Ø§Ù‹ Ù†Ø§ÙØ¹Ø§Ù‹",
    transliteration: "Allahumma sayyiban nafi'an.",
    english: "O Allah, let this be a beneficial rain.",
  },
  {
    id: "when-afflicted-by-nazr",
    title: "Dua when afflicted with nazr",
    category: "protection",
    keywords: ["nazr", "evil eye", "healing"],
    arabic: "Ø¨Ø³Ù… Ø§Ù„Ù„Ù‡ Ø§Ù„Ù„Ù‡Ù… Ø£Ø°Ù‡Ø¨ Ø­Ø±Ù‡Ø§ ÙˆØ¨Ø±Ø¯Ù‡Ø§ ÙˆÙˆØµØ¨Ù‡Ø§",
    transliteration: "Bismillah Allahumma adhhib harraha wa bardaha wa wasabaha.",
    english: "In the name of Allah. O Allah, remove its heat, its cold and its pain.",
  },
  {
    id: "protection-from-calamities",
    title: "Dua for protection from calamities",
    category: "protection",
    keywords: ["calamity", "protection", "family", "wealth"],
    arabic: "Ø¨Ø³Ù… Ø§Ù„Ù„Ù‡ Ø¹Ù„Ù‰ Ø¯ÙŠÙ†ÙŠ ÙˆÙ†ÙØ³ÙŠ ÙˆÙˆÙ„Ø¯ÙŠ ÙˆØ£Ù‡Ù„ÙŠ ÙˆÙ…Ø§Ù„ÙŠ",
    transliteration: "Bismillahi 'ala dini wa nafsi wa waladi wa ahli wa mali.",
    english: "In the name of Allah, I seek protection for my religion, my life, my children, my family and my wealth.",
  },
  {
    id: "protection-day-of-qiyamah",
    title: "Dua for protection on the Day of Qiyamah",
    category: "protection",
    keywords: ["qiyamah", "akhirah", "protection"],
    arabic: "Ø±Ø¶ÙŠØª Ø¨Ø§Ù„Ù„Ù‡ Ø±Ø¨Ø§Ù‹ ÙˆØ¨Ø§Ù„Ø¥Ø³Ù„Ø§Ù… Ø¯ÙŠÙ†Ø§Ù‹ ÙˆØ¨Ù…Ø­Ù…Ø¯ ØµÙ„Ù‰ Ø§Ù„Ù„Ù‡ Ø¹Ù„ÙŠÙ‡ ÙˆØ³Ù„Ù… Ù†Ø¨ÙŠØ§Ù‹ ÙˆØ±Ø³ÙˆÙ„Ø§Ù‹",
    transliteration: "Raditu billahi Rabba wa bil-Islami dinan wa bi Muhammadin sallallahu 'alayhi wa sallama nabiyyan wa rasula.",
    english: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ï·º as my Prophet and Messenger.",
  },
  {
    id: "durood-muqaddas",
    title: "Durood-e-Muqaddas",
    category: "salah",
    keywords: ["durood", "salawat"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… ØµÙ„ Ø¹Ù„Ù‰ Ø³ÙŠØ¯Ù†Ø§ Ù…Ø­Ù…Ø¯ Ø§Ù„Ù†Ø¨ÙŠ Ø§Ù„Ø£Ù…ÙŠ ÙˆØ¹Ù„Ù‰ Ø¢Ù„Ù‡ ÙˆØ³Ù„Ù… ØªØ³Ù„ÙŠÙ…Ø§Ù‹",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin-nabiyyil-ummiyyi wa 'ala alihi wa sallim taslima.",
    english: "O Allah, send blessings upon our Master Muhammad, the unlettered Prophet, and upon his family, and send complete peace.",
  },
  {
    id: "after-witr-salah",
    title: "Dua after Witr salah",
    category: "salah",
    keywords: ["witr", "after prayer", "salah"],
    arabic: "Ø³Ø¨ÙˆØ­ Ù‚Ø¯ÙˆØ³ Ø±Ø¨ Ø§Ù„Ù…Ù„Ø§Ø¦ÙƒØ© ÙˆØ§Ù„Ø±ÙˆØ­",
    transliteration: "Subbuhun Quddusun Rabbul-mala'ikati war-ruh.",
    english: "Most Glorious, Most Holy, Lord of the angels and the Spirit.",
  },
  {
    id: "eating-at-someones-house",
    title: "Dua when eating at someone's house",
    category: "social",
    keywords: ["guest", "food", "host"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø¨Ø§Ø±Ùƒ Ù„Ù‡Ù… ÙÙŠÙ…Ø§ Ø±Ø²Ù‚ØªÙ‡Ù… ÙˆØ§ØºÙØ± Ù„Ù‡Ù… ÙˆØ§Ø±Ø­Ù…Ù‡Ù…",
    transliteration: "Allahumma barik lahum fima razaqtahum waghfir lahum warhamhum.",
    english: "O Allah, bless for them what You have provided them, forgive them and have mercy on them.",
  },
  {
    id: "breaking-fast-at-someones-house",
    title: "Dua for breaking fast at someone's house",
    category: "social",
    keywords: ["iftar", "guest", "fasting"],
    arabic: "Ø£ÙØ·Ø± Ø¹Ù†Ø¯ÙƒÙ… Ø§Ù„ØµØ§Ø¦Ù…ÙˆÙ† ÙˆØ£ÙƒÙ„ Ø·Ø¹Ø§Ù…ÙƒÙ… Ø§Ù„Ø£Ø¨Ø±Ø§Ø± ÙˆØªÙ†Ø²Ù„Øª Ø¹Ù„ÙŠÙƒÙ… Ø§Ù„Ù…Ù„Ø§Ø¦ÙƒØ©",
    transliteration: "Aftara 'indakumus-sa'imun wa akala ta'amakumul-abrar wa tanazzalat 'alaykumul-mala'ikah.",
    english: "May the fasting people break their fast with you, may the righteous eat your food, and may the angels descend upon you.",
  },
  {
    id: "new-moon",
    title: "Dua on sighting the new moon",
    category: "daily",
    keywords: ["moon", "hilal", "month"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø£Ù‡Ù„Ù‡ Ø¹Ù„ÙŠÙ†Ø§ Ø¨Ø§Ù„Ø£Ù…Ù† ÙˆØ§Ù„Ø¥ÙŠÙ…Ø§Ù† ÙˆØ§Ù„Ø³Ù„Ø§Ù…Ø© ÙˆØ§Ù„Ø¥Ø³Ù„Ø§Ù… ÙˆØ§Ù„ØªÙˆÙÙŠÙ‚ Ù„Ù…Ø§ ØªØ­Ø¨ ÙˆØªØ±Ø¶Ù‰",
    transliteration: "Allahumma ahillahu 'alayna bil-amni wal-iman was-salamati wal-Islam wat-tawfiqi lima tuhibbu wa tarda.",
    english: "O Allah, let this moon rise over us with safety, faith, peace, Islam and ability to do what You love and are pleased with.",
  },
  {
    id: "taking-off-clothes",
    title: "Dua while taking off clothes",
    category: "home",
    keywords: ["clothes", "dress", "undress"],
    arabic: "Ø¨Ø³Ù… Ø§Ù„Ù„Ù‡",
    transliteration: "Bismillah.",
    english: "In the name of Allah.",
  },
  {
    id: "wearing-new-clothes",
    title: "Dua on wearing new clothes",
    category: "daily",
    keywords: ["clothes", "new clothes", "dress"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ù„Ùƒ Ø§Ù„Ø­Ù…Ø¯ Ø£Ù†Øª ÙƒØ³ÙˆØªÙ†ÙŠÙ‡ Ø£Ø³Ø£Ù„Ùƒ Ø®ÙŠØ±Ù‡ ÙˆØ®ÙŠØ± Ù…Ø§ ØµÙ†Ø¹ Ù„Ù‡ ÙˆØ£Ø¹ÙˆØ° Ø¨Ùƒ Ù…Ù† Ø´Ø±Ù‡ ÙˆØ´Ø± Ù…Ø§ ØµÙ†Ø¹ Ù„Ù‡",
    transliteration: "Allahumma lakal-hamd anta kasawtanihi as'aluka khayrahu wa khayra ma suni'a lahu wa a'udhu bika min sharrihi wa sharri ma suni'a lahu.",
    english: "O Allah, all praise is for You. You clothed me with this. I ask You for its good and the good for which it was made, and I seek refuge in You from its evil and the evil for which it was made.",
  },
  {
    id: "wearing-clothes",
    title: "Dua on wearing clothes",
    category: "daily",
    keywords: ["clothes", "dress"],
    arabic: "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ Ø§Ù„Ø°ÙŠ ÙƒØ³Ø§Ù†ÙŠ Ù‡Ø°Ø§ ÙˆØ±Ø²Ù‚Ù†ÙŠÙ‡ Ù…Ù† ØºÙŠØ± Ø­ÙˆÙ„ Ù…Ù†ÙŠ ÙˆÙ„Ø§ Ù‚ÙˆØ©",
    transliteration: "Alhamdulillahil-ladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    english: "All praise is for Allah Who clothed me with this and provided it to me without any power or strength from me.",
  },
  {
    id: "expressing-love",
    title: "Expressing one's love to another",
    category: "social",
    keywords: ["love", "brotherhood", "friend"],
    arabic: "Ø¥Ù†ÙŠ Ø£Ø­Ø¨Ùƒ ÙÙŠ Ø§Ù„Ù„Ù‡",
    transliteration: "Inni uhibbuka fillah.",
    english: "Indeed, I love you for the sake of Allah.",
  },
  {
    id: "reply-to-love",
    title: "Reply to someone expressing love",
    category: "social",
    keywords: ["love", "reply", "friend"],
    arabic: "Ø£Ø­Ø¨Ùƒ Ø§Ù„Ø°ÙŠ Ø£Ø­Ø¨Ø¨ØªÙ†ÙŠ Ù„Ù‡",
    transliteration: "Ahabbakalladhi ahbabtani lah.",
    english: "May Allah love you for whose sake you loved me.",
  },
  {
    id: "seeing-muslim-cheerful",
    title: "When seeing another Muslim cheerful",
    category: "social",
    keywords: ["muslim", "cheerful", "joy"],
    arabic: "Ø§Ù„Ø­Ù…Ø¯ Ù„Ù„Ù‡ Ø§Ù„Ø°ÙŠ Ø¨Ù†Ø¹Ù…ØªÙ‡ ØªØªÙ… Ø§Ù„ØµØ§Ù„Ø­Ø§Øª",
    transliteration: "Alhamdulillahil-ladhi bi ni'matihi tatimmus-salihat.",
    english: "All praise is for Allah by Whose blessing righteous deeds are completed.",
  },
  {
    id: "when-loss-occurs",
    title: "When a loss occurs",
    category: "protection",
    keywords: ["loss", "grief", "patience"],
    arabic: "Ø¥Ù†Ø§ Ù„Ù„Ù‡ ÙˆØ¥Ù†Ø§ Ø¥Ù„ÙŠÙ‡ Ø±Ø§Ø¬Ø¹ÙˆÙ†",
    transliteration: "Inna lillahi wa inna ilayhi raji'un.",
    english: "Surely we belong to Allah and to Him we will return.",
  },
  {
    id: "visiting-sick-person",
    title: "Dua when visiting a sick person",
    category: "healing",
    keywords: ["sick", "illness", "healing", "visit"],
    arabic: "Ù„Ø§ Ø¨Ø£Ø³ Ø·Ù‡ÙˆØ± Ø¥Ù† Ø´Ø§Ø¡ Ø§Ù„Ù„Ù‡",
    transliteration: "La ba'sa tahurun in sha' Allah.",
    english: "No harm. It is a purification, if Allah wills.",
  },
  {
    id: "at-sunrise",
    title: "Dua at the time of sunrise",
    category: "daily",
    keywords: ["sunrise", "morning"],
    arabic: "Ø£ØµØ¨Ø­Ù†Ø§ ÙˆØ£ØµØ¨Ø­ Ø§Ù„Ù…Ù„Ùƒ Ù„Ù„Ù‡",
    transliteration: "Asbahna wa asbahal-mulku lillah.",
    english: "We have entered the morning and the dominion belongs to Allah.",
  },
  {
    id: "at-sunset",
    title: "Dua at the time of sunset",
    category: "daily",
    keywords: ["sunset", "evening"],
    arabic: "Ø£Ù…Ø³ÙŠÙ†Ø§ ÙˆØ£Ù…Ø³Ù‰ Ø§Ù„Ù…Ù„Ùƒ Ù„Ù„Ù‡",
    transliteration: "Amsayna wa amsal-mulku lillah.",
    english: "We have entered the evening and the dominion belongs to Allah.",
  },
  {
    id: "travel-undertaking",
    title: "Dua at the time of undertaking a journey",
    category: "travel",
    keywords: ["journey", "travel", "walk"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø¨Ùƒ Ø£ØµÙˆÙ„ ÙˆØ¨Ùƒ Ø£Ø¬ÙˆÙ„ ÙˆØ¨Ùƒ Ø£Ø³ÙŠØ±",
    transliteration: "Allahumma bika asulu wa bika ajulu wa bika asir.",
    english: "O Allah, with Your help I travel, with Your help I move and with Your help I walk.",
  },
  {
    id: "leaving-meeting-place",
    title: "When one leaves any meeting place",
    category: "social",
    keywords: ["meeting", "gathering", "leaving"],
    arabic: "Ø³Ø¨Ø­Ø§Ù†Ùƒ Ø§Ù„Ù„Ù‡Ù… ÙˆØ¨Ø­Ù…Ø¯Ùƒ Ø£Ø´Ù‡Ø¯ Ø£Ù† Ù„Ø§ Ø¥Ù„Ù‡ Ø¥Ù„Ø§ Ø£Ù†Øª Ø£Ø³ØªØºÙØ±Ùƒ ÙˆØ£ØªÙˆØ¨ Ø¥Ù„ÙŠÙƒ",
    transliteration: "Subhanaka Allahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilayk.",
    english: "Glory be to You, O Allah, and all praise is Yours. I bear witness that there is none worthy of worship except You. I seek Your forgiveness and repent to You.",
  },
  {
    id: "thunder-lightning",
    title: "Dua when thunder or lightning strike",
    category: "protection",
    keywords: ["thunder", "lightning", "storm"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ù„Ø§ ØªÙ‚ØªÙ„Ù†Ø§ Ø¨ØºØ¶Ø¨Ùƒ ÙˆÙ„Ø§ ØªÙ‡Ù„ÙƒÙ†Ø§ Ø¨Ø¹Ø°Ø§Ø¨Ùƒ ÙˆØ¹Ø§ÙÙ†Ø§ Ù‚Ø¨Ù„ Ø°Ù„Ùƒ",
    transliteration: "Allahumma la taqtulna bighadabika wa la tuhlikna bi'adhabika wa 'afina qabla dhalik.",
    english: "O Allah, do not slay us with Your wrath, do not destroy us with Your punishment, and protect us before that.",
  },
  {
    id: "debt-financial-difficulty",
    title: "Dua when in debt or financial difficulty",
    category: "protection",
    keywords: ["debt", "money", "financial difficulty", "rizq"],
    arabic: "Ø§Ù„Ù„Ù‡Ù… Ø§ÙƒÙÙ†ÙŠ Ø¨Ø­Ù„Ø§Ù„Ùƒ Ø¹Ù† Ø­Ø±Ø§Ù…Ùƒ ÙˆØ£ØºÙ†Ù†ÙŠ Ø¨ÙØ¶Ù„Ùƒ Ø¹Ù…Ù† Ø³ÙˆØ§Ùƒ",
    transliteration: "Allahummakfini bihalalika 'an haramika wa aghnini bifadlika 'amman siwak.",
    english: "O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and make me independent by Your grace from all besides You.",
  },
];

const categoryLabels = {
  all: "All",
  daily: "Daily",
  iman: "Iman",
  salah: "Salah",
  social: "Social",
  travel: "Travel",
  home: "Home",
  masjid: "Masjid",
  wudhu: "Wudhu",
  knowledge: "Knowledge",
  family: "Family",
  protection: "Protection",
  healing: "Healing",
  marriage: "Marriage",
  qurbani: "Qurbani",
  janazah: "Janazah",
  quran: "Quran",
  special: "Special",
};

function buildBookPages(start, end = start) {
  const pages = [];

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

const fullBookEntries = [
  {
    id: "islamic-months",
    title: "Islamic months",
    category: "daily",
    keywords: ["islamic months", "hijri months"],
    arabic:
      "Ù…ÙØ­ÙŽØ±Ù‘ÙŽÙ…ØŒ ØµÙŽÙÙŽØ±ØŒ Ø±ÙŽØ¨ÙÙŠØ¹Ù Ù±Ù„Ù’Ø£ÙŽÙˆÙ‘ÙŽÙ„ØŒ Ø±ÙŽØ¨ÙÙŠØ¹Ù Ù±Ù„Ù’Ø¢Ø®ÙØ±ØŒ Ø¬ÙÙ…ÙŽØ§Ø¯ÙŽÙ‰ Ù±Ù„Ù’Ø£ÙÙˆÙ„ÙŽÙ‰ØŒ Ø¬ÙÙ…ÙŽØ§Ø¯ÙŽÙ‰ Ù±Ù„Ù’Ø¢Ø®ÙØ±ÙŽØ©ØŒ Ø±ÙŽØ¬ÙŽØ¨ØŒ Ø´ÙŽØ¹Ù’Ø¨ÙŽØ§Ù†ØŒ Ø±ÙŽÙ…ÙŽØ¶ÙŽØ§Ù†ØŒ Ø´ÙŽÙˆÙ‘ÙŽØ§Ù„ØŒ Ø°ÙÙˆ Ù±Ù„Ù’Ù‚ÙŽØ¹Ù’Ø¯ÙŽØ©ØŒ Ø°ÙÙˆ Ù±Ù„Ù’Ø­ÙØ¬Ù‘ÙŽØ©",
    english:
      "Muharram, Safar, Rabi' al-Awwal, Rabi' al-Akhir, Jumada al-Ula, Jumada al-Ukhra, Rajab, Sha'ban, Ramadan, Shawwal, Dhul-Qa'dah and Dhul-Hijjah.",
    bookPages: buildBookPages(24),
  },
  {
    id: "azaan",
    title: "Azaan",
    category: "masjid",
    keywords: ["azaan", "adhan", "call to prayer"],
    arabic:
      "Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù. Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù’ Ù„Ù‘ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù’ Ù„Ù‘ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù. Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù‘ÙŽ Ù…ÙØ­ÙŽÙ…Ù‘ÙŽØ¯Ù‹Ø§ Ø±Ù‘ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù‘ÙŽ Ù…ÙØ­ÙŽÙ…Ù‘ÙŽØ¯Ù‹Ø§ Ø±Ù‘ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù. Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©ÙØŒ Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù. Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙÙŽÙ„ÙŽØ§Ø­ÙØŒ Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙÙŽÙ„ÙŽØ§Ø­Ù. Ø§ÙŽÙ„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù Ø®ÙŽÙŠÙ’Ø±ÙŒ Ù…Ù‘ÙÙ†ÙŽ Ø§Ù„Ù†Ù‘ÙŽÙˆÙ’Ù…ÙØŒ Ø§ÙŽÙ„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù Ø®ÙŽÙŠÙ’Ø±ÙŒ Ù…Ù‘ÙÙ†ÙŽ Ø§Ù„Ù†Ù‘ÙŽÙˆÙ’Ù…Ù. Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù. Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    english:
      "Allah is the Greatest, Allah is the Greatest. I bear witness that there is none worthy of worship besides Allah. I bear witness that Muhammad is the Messenger of Allah. Come to prayer. Come to success. In Fajr: Prayer is better than sleep. Allah is the Greatest. There is none worthy of worship besides Allah.",
    bookPages: buildBookPages(65),
  },
  {
    id: "iqaamah",
    title: "Iqaamah",
    category: "masjid",
    keywords: ["iqaamah", "iqamah", "call to prayer"],
    arabic:
      "Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù. Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù’ Ù„Ù‘ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù. Ø£ÙŽØ´Ù’Ù‡ÙŽØ¯Ù Ø£ÙŽÙ†Ù‘ÙŽ Ù…ÙØ­ÙŽÙ…Ù‘ÙŽØ¯Ù‹Ø§ Ø±Ù‘ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù. Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù. Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙÙŽÙ„ÙŽØ§Ø­Ù. Ù‚ÙŽØ¯Ù’ Ù‚ÙŽØ§Ù…ÙŽØªÙ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©ÙØŒ Ù‚ÙŽØ¯Ù’ Ù‚ÙŽØ§Ù…ÙŽØªÙ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù. Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±ÙØŒ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù. Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    english:
      "Allah is the Greatest. I bear witness that there is none worthy of worship besides Allah and that Muhammad is the Messenger of Allah. Come to prayer. Come to success. The prayer has begun. Allah is the Greatest. There is none worthy of worship besides Allah.",
    bookPages: buildBookPages(66),
  },
  {
    id: "replying-azaan-iqaamah",
    title: "Replying to Azaan and Iqaamah",
    category: "masjid",
    keywords: ["azaan", "adhan", "iqamah", "reply"],
    arabic:
      "ÙŠÙØ¬ÙŽØ§Ø¨Ù Ø§Ù„Ù’Ù…ÙØ¤ÙŽØ°Ù‘ÙÙ†Ù Ø¨ÙÙ…ÙØ«Ù’Ù„Ù Ù…ÙŽØ§ ÙŠÙŽÙ‚ÙÙˆÙ„ÙØŒ ÙˆÙŽØ¹ÙÙ†Ù’Ø¯ÙŽ Ø­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù ÙˆÙŽØ­ÙŽÙŠÙ‘ÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙÙŽÙ„ÙŽØ§Ø­Ù ÙŠÙÙ‚ÙŽØ§Ù„Ù: Ù„ÙŽØ§ Ø­ÙŽÙˆÙ’Ù„ÙŽ ÙˆÙŽÙ„ÙŽØ§ Ù‚ÙÙˆÙ‘ÙŽØ©ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù. ÙˆÙŽØ¹ÙÙ†Ù’Ø¯ÙŽ Ù‚ÙŽØ¯Ù’ Ù‚ÙŽØ§Ù…ÙŽØªÙ Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù ÙŠÙÙ‚ÙŽØ§Ù„Ù: Ø£ÙŽÙ‚ÙŽØ§Ù…ÙŽÙ‡ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ£ÙŽØ¯ÙŽØ§Ù…ÙŽÙ‡ÙŽØ§ Ù…ÙŽØ§ Ø¯ÙŽØ§Ù…ÙŽØªÙ Ø§Ù„Ø³Ù‘ÙŽÙ…ÙŽØ§ÙˆÙŽØ§ØªÙ ÙˆÙŽØ§Ù„Ù’Ø£ÙŽØ±Ù’Ø¶Ù",
    english:
      "Repeat the words of the mu'adhdhin. At Hayya 'alas-salah and Hayya 'alal-falah say: There is no might and no power except through Allah. At Qad qamatis-salah say: May Allah establish it and keep it lasting as long as the heavens and the earth remain.",
    bookPages: buildBookPages(67, 68),
  },
  {
    id: "niyyah-fardh-salah",
    title: "Niyyah for Fardh salah",
    category: "salah",
    keywords: ["niyyah", "fardh", "salah", "prayer intention"],
    arabic:
      "Ù†ÙŽÙˆÙŽÙŠÙ’ØªÙ Ø£ÙŽÙ†Ù’ Ø£ÙØµÙŽÙ„Ù‘ÙÙŠÙŽ Ù„ÙÙ„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰ ÙÙŽØ±Ù’Ø¶ÙŽ ØµÙŽÙ„ÙŽØ§Ø©Ù [Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù] Ù…ÙØªÙŽÙˆÙŽØ¬Ù‘ÙÙ‡Ù‹Ø§ Ø¥ÙÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙƒÙŽØ¹Ù’Ø¨ÙŽØ©Ù Ø§Ù„Ø´Ù‘ÙŽØ±ÙÙŠÙÙŽØ©Ù",
    english:
      "I intend to pray the fardh prayer of [this salah] for Allah Most High, facing the Noble Ka'bah.",
    bookPages: buildBookPages(50, 52),
  },
  {
    id: "niyyah-sunnah-nafl-salah",
    title: "Niyyah for Sunnah and Nafl salah",
    category: "salah",
    keywords: ["niyyah", "sunnah", "nafl", "salah"],
    arabic:
      "Ù†ÙŽÙˆÙŽÙŠÙ’ØªÙ Ø£ÙŽÙ†Ù’ Ø£ÙØµÙŽÙ„Ù‘ÙÙŠÙŽ Ù„ÙÙ„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰ Ø³ÙÙ†Ù‘ÙŽØ©ÙŽ Ø£ÙŽÙˆÙ’ Ù†ÙŽÙÙ’Ù„ÙŽ ØµÙŽÙ„ÙŽØ§Ø©Ù [Ø§Ù„ØµÙ‘ÙŽÙ„ÙŽØ§Ø©Ù] Ù…ÙØªÙŽÙˆÙŽØ¬Ù‘ÙÙ‡Ù‹Ø§ Ø¥ÙÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙƒÙŽØ¹Ù’Ø¨ÙŽØ©Ù Ø§Ù„Ø´Ù‘ÙŽØ±ÙÙŠÙÙŽØ©Ù",
    english:
      "I intend to pray the Sunnah or Nafl prayer of [this salah] for Allah Most High, facing the Noble Ka'bah.",
    bookPages: buildBookPages(52, 54),
  },
  {
    id: "niyyah-jumuah-witr-eid",
    title: "Niyyah for Jumu'ah, Witr, Eid al-Fitr and Eid al-Adha salah",
    category: "salah",
    keywords: ["niyyah", "jumuah", "witr", "eid", "salah"],
    arabic:
      "Ù†ÙŽÙˆÙŽÙŠÙ’ØªÙ Ø£ÙŽÙ†Ù’ Ø£ÙØµÙŽÙ„Ù‘ÙÙŠÙŽ Ù„ÙÙ„Ù‘Ù°Ù‡Ù ØªÙŽØ¹ÙŽØ§Ù„ÙŽÙ‰ ØµÙŽÙ„ÙŽØ§Ø©ÙŽ Ø§Ù„Ù’Ø¬ÙÙ…ÙØ¹ÙŽØ©Ù Ø£ÙŽÙˆÙ Ø§Ù„Ù’ÙˆÙØªÙ’Ø±Ù Ø£ÙŽÙˆÙ Ø§Ù„Ù’Ø¹ÙÙŠØ¯Ù Ù…ÙØªÙŽÙˆÙŽØ¬Ù‘ÙÙ‡Ù‹Ø§ Ø¥ÙÙ„ÙŽÙ‰ Ø§Ù„Ù’ÙƒÙŽØ¹Ù’Ø¨ÙŽØ©Ù Ø§Ù„Ø´Ù‘ÙŽØ±ÙÙŠÙÙŽØ©Ù",
    english:
      "I intend to pray Jumu'ah, Witr, or Eid prayer for Allah Most High, facing the Noble Ka'bah.",
    bookPages: buildBookPages(54, 56),
  },
  {
    id: "arrival-of-bride",
    title: "Dua at the arrival of a bride",
    category: "marriage",
    keywords: ["bride", "marriage", "nikah"],
    arabic:
      "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ Ø¥ÙÙ†Ù‘ÙÙŠ Ø£ÙŽØ³Ù’Ø£ÙŽÙ„ÙÙƒÙŽ Ø®ÙŽÙŠÙ’Ø±ÙŽÙ‡ÙŽØ§ ÙˆÙŽØ®ÙŽÙŠÙ’Ø±ÙŽ Ù…ÙŽØ§ Ø¬ÙŽØ¨ÙŽÙ„Ù’ØªÙŽÙ‡ÙŽØ§ Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡ÙØŒ ÙˆÙŽØ£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙÙƒÙŽ Ù…ÙÙ†Ù’ Ø´ÙŽØ±Ù‘ÙÙ‡ÙŽØ§ ÙˆÙŽØ´ÙŽØ±Ù‘Ù Ù…ÙŽØ§ Ø¬ÙŽØ¨ÙŽÙ„Ù’ØªÙŽÙ‡ÙŽØ§ Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù",
    english:
      "O Allah, I ask You for her goodness and the goodness upon which You created her, and I seek refuge in You from her evil and the evil upon which You created her.",
    bookPages: buildBookPages(57),
  },
  {
    id: "evil-thought",
    title: "Dua when an evil thought comes to mind",
    category: "protection",
    keywords: ["evil thought", "waswasa", "mind"],
    arabic: "Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù Ù…ÙÙ†ÙŽ Ø§Ù„Ø´Ù‘ÙŽÙŠÙ’Ø·ÙŽØ§Ù†Ù Ø§Ù„Ø±Ù‘ÙŽØ¬ÙÙŠÙ…Ù",
    english: "I seek protection in Allah from Shaytan, the rejected one.",
    bookPages: buildBookPages(57),
  },
  {
    id: "bodily-pain",
    title: "Dua when in bodily pain",
    category: "healing",
    keywords: ["pain", "body", "healing"],
    arabic:
      "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù. Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙØ§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽÙ‚ÙØ¯Ù’Ø±ÙŽØªÙÙ‡Ù Ù…ÙÙ†Ù’ Ø´ÙŽØ±Ù‘Ù Ù…ÙŽØ§ Ø£ÙŽØ¬ÙØ¯Ù ÙˆÙŽØ£ÙØ­ÙŽØ§Ø°ÙØ±Ù",
    english:
      "In the name of Allah. I seek refuge in Allah and His power from the evil of what I feel and fear.",
    bookPages: buildBookPages(57),
  },
  {
    id: "excessive-downpour",
    title: "Dua when there is an excessive downpour",
    category: "protection",
    keywords: ["rain", "storm", "downpour"],
    arabic: "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ Ø­ÙŽÙˆÙŽØ§Ù„ÙŽÙŠÙ’Ù†ÙŽØ§ ÙˆÙŽÙ„ÙŽØ§ Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù†ÙŽØ§",
    english: "O Allah, let it rain around us and not against us.",
    bookPages: buildBookPages(58),
  },
  {
    id: "barakah-increase-wealth",
    title: "Dua for barakah and increase in wealth",
    category: "daily",
    keywords: ["barakah", "wealth", "rizq"],
    arabic:
      "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ Ø§ÙƒÙ’ÙÙÙ†ÙÙŠ Ø¨ÙØ­ÙŽÙ„ÙŽØ§Ù„ÙÙƒÙŽ Ø¹ÙŽÙ†Ù’ Ø­ÙŽØ±ÙŽØ§Ù…ÙÙƒÙŽ ÙˆÙŽØ£ÙŽØºÙ’Ù†ÙÙ†ÙÙŠ Ø¨ÙÙÙŽØ¶Ù’Ù„ÙÙƒÙŽ Ø¹ÙŽÙ…Ù‘ÙŽÙ†Ù’ Ø³ÙÙˆÙŽØ§ÙƒÙŽ",
    english:
      "O Allah, suffice me with what You have made lawful instead of what You have made unlawful, and make me independent by Your ÙØ¶Ù„ from everyone besides You.",
    bookPages: buildBookPages(58),
  },
  {
    id: "entering-market-place",
    title: "Dua when entering the market place",
    category: "daily",
    keywords: ["market", "bazaar", "shop"],
    arabic:
      "Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ­Ù’Ø¯ÙŽÙ‡Ù Ù„ÙŽØ§ Ø´ÙŽØ±ÙÙŠÙƒÙŽ Ù„ÙŽÙ‡ÙØŒ Ù„ÙŽÙ‡Ù Ø§Ù„Ù’Ù…ÙÙ„Ù’ÙƒÙ ÙˆÙŽÙ„ÙŽÙ‡Ù Ø§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯ÙØŒ ÙŠÙØ­Ù’ÙŠÙÙŠ ÙˆÙŽÙŠÙÙ…ÙÙŠØªÙ ÙˆÙŽÙ‡ÙÙˆÙŽ Ø­ÙŽÙŠÙ‘ÙŒ Ù„ÙŽØ§ ÙŠÙŽÙ…ÙÙˆØªÙØŒ Ø¨ÙÙŠÙŽØ¯ÙÙ‡Ù Ø§Ù„Ù’Ø®ÙŽÙŠÙ’Ø±ÙØŒ ÙˆÙŽÙ‡ÙÙˆÙŽ Ø¹ÙŽÙ„ÙŽÙ‰ ÙƒÙÙ„Ù‘Ù Ø´ÙŽÙŠÙ’Ø¡Ù Ù‚ÙŽØ¯ÙÙŠØ±ÙŒ",
    english:
      "There is none worthy of worship besides Allah alone without partner. To Him belongs the kingdom and all praise. He gives life and causes death, and He is Ever-Living and never dies. In His hand is all good, and He has power over everything.",
    bookPages: buildBookPages(58),
  },
  {
    id: "after-fardh-salah-duas",
    title: "Duas to be recited after Fardh salah",
    category: "salah",
    keywords: ["after fardh", "after prayer", "salah"],
    arabic:
      "Ø£ÙŽØ³Ù’ØªÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙŽØŒ Ø£ÙŽØ³Ù’ØªÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙŽØŒ Ø£ÙŽØ³Ù’ØªÙŽØºÙ’ÙÙØ±Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙŽ. Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ Ø£ÙŽÙ†Ù’ØªÙŽ Ø§Ù„Ø³Ù‘ÙŽÙ„ÙŽØ§Ù…Ù ÙˆÙŽÙ…ÙÙ†Ù’ÙƒÙŽ Ø§Ù„Ø³Ù‘ÙŽÙ„ÙŽØ§Ù…Ù ØªÙŽØ¨ÙŽØ§Ø±ÙŽÙƒÙ’ØªÙŽ ÙŠÙŽØ§ Ø°ÙŽØ§ Ø§Ù„Ù’Ø¬ÙŽÙ„ÙŽØ§Ù„Ù ÙˆÙŽØ§Ù„Ù’Ø¥ÙÙƒÙ’Ø±ÙŽØ§Ù…Ù. Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù£Ù£ØŒ Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ù£Ù£ØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù Ù£Ù¤",
    english:
      "After the fardh prayer: seek forgiveness from Allah three times, say O Allah, You are Peace and from You is peace, then recite SubhanAllah 33 times, Alhamdulillah 33 times and Allahu Akbar 34 times.",
    bookPages: buildBookPages(59),
  },
  {
    id: "tasbeeh-fatimah",
    title: "Tasbeeh-e-Fatimah",
    category: "daily",
    keywords: ["tasbeeh", "fatimah", "dhikr"],
    arabic: "Ø³ÙØ¨Ù’Ø­ÙŽØ§Ù†ÙŽ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ù£Ù£ØŒ Ø§ÙŽÙ„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘Ù°Ù‡Ù Ù£Ù£ØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù Ù£Ù¤",
    english: "Recite SubhanAllah 33 times, Alhamdulillah 33 times and Allahu Akbar 34 times.",
    bookPages: buildBookPages(60),
  },
  {
    id: "sayyidul-istighfaar",
    title: "Sayyidul Istighfaar",
    category: "protection",
    keywords: ["istighfar", "istigfar", "forgiveness", "sayyidul istighfar", "allahumma anta rabbi"],
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    english:
      "O Allah, You are my Lord. There is none worthy of worship besides You. You created me and I am Your servant, and I remain upon Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favor upon me, and I acknowledge my sin, so forgive me, for surely none forgives sins except You.",
    bookPages: buildBookPages(68),
  },
  {
    id: "durood-e-nabi",
    title: "Durood-e-Nabi",
    category: "salah",
    keywords: ["durood", "salawat", "nabi"],
    arabic:
      "صَلَّى اللَّهُ عَلَى النَّبِيِّ الْأُمِّيِّ وَآلِهِ وَسَلَّمَ تَسْلِيمًا",
    english:
      "May Allah send blessings upon the unlettered Prophet, upon his family, and grant them peace.",
    bookPages: buildBookPages(68),
  },
  {
    id: "upon-seeing-person-in-difficulty",
    title: "Dua upon seeing a person in difficulty",
    category: "protection",
    keywords: ["difficulty", "hardship"],
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلَاكَ بِهِ وَفَضَّلَنِي عَلَىٰ كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلًا",
    english:
      "All praise is due to Allah Who has kept me safe from that with which He tested you and preferred me greatly over many of His creation.",
    bookPages: buildBookPages(69),
  },
  {
    id: "before-slaughtering-qurbani",
    title: "Dua before slaughtering a Qurbani animal",
    category: "qurbani",
    keywords: ["qurbani", "slaughter", "udhiyah"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡Ù Ø£ÙŽÙƒÙ’Ø¨ÙŽØ±Ù",
    english: "In the name of Allah. Allah is the Greatest.",
    bookPages: buildBookPages(69),
  },
  {
    id: "after-slaughtering-qurbani",
    title: "Dua after slaughtering a Qurbani animal",
    category: "qurbani",
    keywords: ["qurbani", "slaughter", "udhiyah"],
    arabic:
      "Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ ØªÙŽÙ‚ÙŽØ¨Ù‘ÙŽÙ„Ù’Ù‡Ù Ù…ÙÙ†Ù‘ÙÙŠ ÙƒÙŽÙ…ÙŽØ§ ØªÙŽÙ‚ÙŽØ¨Ù‘ÙŽÙ„Ù’ØªÙŽ Ù…ÙÙ†Ù’ Ø®ÙŽÙ„ÙÙŠÙ„ÙÙƒÙŽ Ø¥ÙØ¨Ù’Ø±ÙŽØ§Ù‡ÙÙŠÙ…ÙŽ Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù Ø§Ù„Ø³Ù‘ÙŽÙ„ÙŽØ§Ù…Ù ÙˆÙŽØ­ÙŽØ¨ÙÙŠØ¨ÙÙƒÙŽ Ù…ÙØ­ÙŽÙ…Ù‘ÙŽØ¯Ù ØµÙŽÙ„Ù‘ÙŽÙ‰ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡Ù ÙˆÙŽØ³ÙŽÙ„Ù‘ÙŽÙ…ÙŽ",
    english:
      "O Allah, accept it from me as You accepted from Your friend Ibrahim, peace be upon him, and from Your beloved Muhammad, peace and blessings be upon him.",
    bookPages: buildBookPages(70),
  },
  {
    id: "aqeeqah",
    title: "Dua-e-Aqeeqah",
    category: "family",
    keywords: ["aqeeqah", "child", "newborn"],
    arabic:
      "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡ÙØŒ Ø§ÙŽÙ„Ù„Ù‘Ù°Ù‡ÙÙ…Ù‘ÙŽ Ù„ÙŽÙƒÙŽ ÙˆÙŽØ¥ÙÙ„ÙŽÙŠÙ’ÙƒÙŽØŒ Ù‡Ù°Ø°ÙÙ‡Ù Ø¹ÙŽÙ‚ÙÙŠÙ‚ÙŽØ©Ù ÙÙÙ„ÙŽØ§Ù†Ù",
    english:
      "In the name of Allah. O Allah, this is for You and for Your sake. This is the 'aqiqah of [name].",
    bookPages: buildBookPages(70),
  },
  {
    id: "time-of-death",
    title: "Dua at the time of death",
    category: "janazah",
    keywords: ["death", "dying"],
    arabic: "Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    english: "There is none worthy of worship besides Allah.",
    bookPages: buildBookPages(71),
  },
  {
    id: "talqeen-dying-person",
    title: "Talqeen for a dying person",
    category: "janazah",
    keywords: ["talqeen", "dying person"],
    arabic: "Ù„ÙŽÙ‚Ù‘ÙÙ†ÙÙˆØ§ Ù…ÙŽÙˆÙ’ØªÙŽØ§ÙƒÙÙ…Ù’ Ù„ÙŽØ§ Ø¥ÙÙ„Ù°Ù‡ÙŽ Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    english: "Prompt your dying person with: There is none worthy of worship besides Allah.",
    bookPages: buildBookPages(71),
  },
  {
    id: "thana-janazah-salah",
    title: "Thana in Janazah salah",
    category: "janazah",
    keywords: ["janazah", "thana"],
    arabic:
      "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَجَلَّ ثَنَاؤُكَ وَلَا إِلٰهَ غَيْرُكَ",
    english:
      "Glory be to You, O Allah, and all praise is due to You. Blessed is Your name, exalted is Your majesty, glorious is Your praise, and there is none worthy of worship besides You.",
    bookPages: buildBookPages(71),
  },
  {
    id: "entering-qabrastan",
    title: "Dua when entering the Qabrastan",
    category: "janazah",
    keywords: ["graveyard", "qabrastan"],
    arabic:
      "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَلَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ",
    english:
      "Peace be upon you, dwellers of these abodes, from among the believers and Muslims. If Allah wills, we will surely join you. We ask Allah for wellbeing for us and for you.",
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah",
    title: "Dua-e-Janazah",
    category: "janazah",
    keywords: ["janazah", "funeral"],
    arabic:
      "اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا. اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الْإِسْلَامِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الْإِيمَانِ",
    english:
      "O Allah, forgive our living and our dead, those present and those absent, our young and our old, our male and our female. O Allah, whoever You keep alive from among us, keep him alive upon Islam, and whoever You cause to die, cause him to die upon faith.",
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah-boy",
    title: "Dua-e-Janazah for a boy child",
    category: "janazah",
    keywords: ["janazah", "boy child"],
    arabic:
      "اللَّهُمَّ اجْعَلْهُ لَنَا فَرَطًا وَاجْعَلْهُ لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهُ لَنَا شَافِعًا وَمُشَفَّعًا",
    english:
      "O Allah, make him a forerunner for us, a reward and a treasure for us, and make him an intercessor for us whose intercession is accepted.",
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah-girl",
    title: "Dua-e-Janazah for a girl child",
    category: "janazah",
    keywords: ["janazah", "girl child"],
    arabic:
      "اللَّهُمَّ اجْعَلْهَا لَنَا فَرَطًا وَاجْعَلْهَا لَنَا أَجْرًا وَذُخْرًا وَاجْعَلْهَا لَنَا شَافِعَةً وَمُشَفَّعَةً",
    english:
      "O Allah, make her a forerunner for us, a reward and a treasure for us, and make her an intercessor for us whose intercession is accepted.",
    bookPages: buildBookPages(73),
  },
  {
    id: "laying-deceased-in-qabr",
    title: "Dua while laying the deceased in Qabr",
    category: "janazah",
    keywords: ["qabr", "grave", "deceased"],
    arabic: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù ÙˆÙŽØ¹ÙŽÙ„ÙŽÙ‰ Ù…ÙÙ„Ù‘ÙŽØ©Ù Ø±ÙŽØ³ÙÙˆÙ„Ù Ø§Ù„Ù„Ù‘Ù°Ù‡Ù",
    english: "In the name of Allah and upon the way of the Messenger of Allah.",
    bookPages: buildBookPages(74),
  },
  {
    id: "filling-qabr-with-soil",
    title: "Dua when filling the Qabr with soil",
    category: "janazah",
    keywords: ["grave", "soil", "qabr"],
    arabic:
      "Ù…ÙÙ†Ù’Ù‡ÙŽØ§ Ø®ÙŽÙ„ÙŽÙ‚Ù’Ù†ÙŽØ§ÙƒÙÙ…Ù’ ÙˆÙŽÙÙÙŠÙ‡ÙŽØ§ Ù†ÙØ¹ÙÙŠØ¯ÙÙƒÙÙ…Ù’ ÙˆÙŽÙ…ÙÙ†Ù’Ù‡ÙŽØ§ Ù†ÙØ®Ù’Ø±ÙØ¬ÙÙƒÙÙ…Ù’ ØªÙŽØ§Ø±ÙŽØ©Ù‹ Ø£ÙØ®Ù’Ø±ÙŽÙ‰",
    english:
      "From it We created you, into it We shall return you, and from it We shall bring you out once again.",
    bookPages: buildBookPages(75),
  },
  {
    id: "save-yourself-from-fitnah",
    title: "To save yourself from fitnah",
    category: "protection",
    keywords: ["fitnah", "temptation"],
    arabic:
      "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَنْ يَحْضُرُونِ",
    english:
      "My Lord, I seek refuge in You from the whispers of the devils, and I seek refuge in You, my Lord, lest they come near me.",
    bookPages: buildBookPages(76),
  },
  {
    id: "relief-from-worries-debts",
    title: "Dua for relief from worries and debts",
    category: "protection",
    keywords: ["worries", "debts", "anxiety"],
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ",
    english:
      "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from cowardice and miserliness, and from being overcome by debt and overpowered by people.",
    bookPages: buildBookPages(76),
  },
  {
    id: "istikharah",
    title: "Dua-e-Istikharah",
    category: "protection",
    keywords: ["istikharah", "guidance", "decision"],
    arabic:
      "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ. وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هٰذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ",
    english:
      "O Allah, I seek goodness from Your knowledge and seek ability from Your power, and I ask You from Your immense bounty. You have power and I do not. You know and I do not. You are the Knower of the unseen. O Allah, if You know this matter to be good for my religion, my livelihood, and the outcome of my affairs, then decree it for me, make it easy for me, and bless me in it. And if You know this matter to be bad for my religion, my livelihood, and the outcome of my affairs, then turn it away from me and turn me away from it, and decree what is good for me wherever it may be, then make me content with it.",
    bookPages: buildBookPages(81),
  },
  {
    id: "dua-e-mathoorah",
    title: "Dua-e-Ma'thoorah",
    category: "daily",
    keywords: ["ma'thoorah", "morning", "evening"],
    arabic:
      "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    english:
      "O Ever-Living, O Sustainer, in Your mercy I seek relief. Set right all of my affairs and do not leave me to myself even for the blink of an eye.",
    bookPages: buildBookPages(86),
  },
  {
    id: "protection-from-accidents",
    title: "Dua for protection from accidents",
    category: "protection",
    keywords: ["accidents", "safety"],
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    english:
      "In the name of Allah, with whose name nothing in the earth or the sky can cause harm, and He is the All-Hearing, the All-Knowing.",
    bookPages: buildBookPages(87),
  },
];

duas.push(...fullBookEntries);

const visibleDuas = duas.filter((dua) => {
  const hasReading = Boolean(dua.arabic || dua.english);
  const isUrduEntry =
    dua.id === "salami-urdu" ||
    /\burdu\b/i.test(dua.title || "") ||
    (Array.isArray(dua.keywords) && dua.keywords.some((keyword) => /\burdu\b/i.test(keyword)));

  return hasReading && !isUrduEntry;
});

let currentSearch = "";
let currentCategory = "all";
let favoritesOnly = false;

function decodeMojibake(value) {
  const raw = String(value || "");

  if (/[\u0600-\u06FF]/.test(raw) || !/[ØÙÚÛÃ]/.test(raw)) {
    return raw;
  }

  try {
    const bytes = Uint8Array.from([...raw].map((character) => character.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    if (/[\u0600-\u06FF]/.test(decoded)) {
      return decoded;
    }

    return raw;
  } catch {
    return raw;
  }
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(duaFavoritesStorageKey);
    const parsed = JSON.parse(raw || "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

let favoriteIds = loadFavorites();

function saveFavorites() {
  localStorage.setItem(duaFavoritesStorageKey, JSON.stringify(Array.from(favoriteIds)));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFilteredDuas() {
  const term = normalizeText(currentSearch);

  return visibleDuas.filter((dua) => {
    if (currentCategory !== "all" && dua.category !== currentCategory) {
      return false;
    }

    if (favoritesOnly && !favoriteIds.has(dua.id)) {
      return false;
    }

    if (!term) {
      return true;
    }

    const haystack = [
      dua.title,
      dua.english,
      dua.arabic,
      dua.transliteration,
      ...(dua.keywords || []),
      categoryLabels[dua.category] || dua.category,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

function renderCategoryChips() {
  if (!duaCategoryRow) {
    return;
  }

  const categories = ["all", ...new Set(visibleDuas.map((dua) => dua.category))];

  duaCategoryRow.innerHTML = categories
    .map(
      (category) => `
        <button
          class="dua-category-chip${currentCategory === category ? " is-active" : ""}"
          data-dua-category="${category}"
          type="button"
        >
          ${escapeHtml(categoryLabels[category] || category)}
        </button>
      `,
    )
    .join("");

  duaCategoryRow.querySelectorAll("[data-dua-category]").forEach((button) => {
    button.addEventListener("click", () => {
      currentCategory = button.dataset.duaCategory;
      renderCategoryChips();
      renderDuas();
    });
  });
}

function bindDuaActions() {
  duaList.querySelectorAll("[data-dua-favorite]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.dataset.duaFavorite;

      if (favoriteIds.has(id)) {
        favoriteIds.delete(id);
      } else {
        favoriteIds.add(id);
      }

      saveFavorites();
      renderDuas();
    });
  });
}

function renderDuas() {
  if (!duaList) {
    return;
  }

  const filteredDuas = getFilteredDuas();

  if (duaStatus) {
    duaStatus.textContent = filteredDuas.length ? "" : "No duas found.";
  }

  if (!filteredDuas.length) {
    duaList.innerHTML = `
      <article class="dua-empty-state">
        <strong>No dua found</strong>
        <p>Try another name, keyword, or category.</p>
      </article>
    `;
    return;
  }

  duaList.innerHTML = filteredDuas
    .map((dua) => {
      const isFavorite = favoriteIds.has(dua.id);
      return `
        <details class="dua-card" ${currentSearch || favoritesOnly ? "open" : ""}>
          <summary class="dua-card-summary">
            <span class="dua-card-title-wrap">
              <strong>${escapeHtml(dua.title)}</strong>
              <small>${escapeHtml(categoryLabels[dua.category] || dua.category)}</small>
            </span>
            <span class="dua-card-summary-actions">
              <button
                class="dua-favorite-button${isFavorite ? " is-active" : ""}"
                data-dua-favorite="${escapeHtml(dua.id)}"
                type="button"
                aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
              >
                &#9733;
              </button>
              <span class="dua-card-arrow" aria-hidden="true"></span>
            </span>
          </summary>
          <div class="dua-card-body">
            ${dua.arabic ? `<p class="dua-card-arabic" dir="rtl" lang="ar">${escapeHtml(decodeMojibake(dua.arabic))}</p>` : ""}
            ${dua.transliteration ? `<p class="dua-card-transliteration">${escapeHtml(dua.transliteration)}</p>` : ""}
            ${dua.english ? `<p class="dua-card-english">${escapeHtml(dua.english)}</p>` : ""}
          </div>
        </details>
      `;
    })
    .join("");

  bindDuaActions();
}

duaSearchInput?.addEventListener("input", () => {
  currentSearch = duaSearchInput.value;
  renderDuas();
});

duaFavoritesToggle?.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  duaFavoritesToggle.classList.toggle("is-active", favoritesOnly);
  duaFavoritesToggle.textContent = favoritesOnly ? "Showing favorites" : "Favorites";
  renderDuas();
});

if (duaStatus) {
  duaStatus.textContent = "";
}

renderCategoryChips();
renderDuas();

