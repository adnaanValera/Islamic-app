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
    keywords: ["quran", "protection", "shaytan"],
    arabic: "أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim.",
    english: "I seek protection in Allah from Shaytan, the rejected one.",
  },
  {
    id: "tasmiyah",
    title: "Tasmiyah",
    category: "daily",
    keywords: ["bismillah", "mercy", "beginning"],
    arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ",
    transliteration: "Bismillahir Rahmanir Rahim.",
    english: "In the name of Allah, the Most Affectionate, the Most Merciful.",
  },
  {
    id: "kalimah-tayyibah",
    title: "Kalimah Tayyibah",
    category: "iman",
    keywords: ["shahadah", "faith", "declaration"],
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ",
    transliteration: "La ilaha illallah Muhammadur Rasulullah.",
    english: "There is none worthy of worship besides Allah. Muhammad is the Messenger of Allah.",
  },
  {
    id: "before-eating",
    title: "Before eating",
    category: "daily",
    keywords: ["food", "meal", "eat"],
    arabic: "بِسْمِ اللّٰهِ وَعَلَى بَرَكَةِ اللّٰهِ",
    transliteration: "Bismillahi wa 'ala barakatillah.",
    english: "In the name of Allah and with the blessings of Allah.",
  },
  {
    id: "after-eating",
    title: "After eating",
    category: "daily",
    keywords: ["food", "meal", "thanks"],
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana minal-muslimin.",
    english: "All praises are due to Allah who has given us food and drink and who has made us Muslims.",
  },
  {
    id: "before-sleep",
    title: "Before sleeping",
    category: "daily",
    keywords: ["sleep", "night", "bed"],
    arabic: "اَللّٰهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    transliteration: "Allahumma bismika amutu wa ahya.",
    english: "O Allah, with Your name I die and I live.",
  },
  {
    id: "after-waking",
    title: "After waking up",
    category: "daily",
    keywords: ["sleep", "morning", "wake"],
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur.",
    english: "All praises are due to Allah who has given us life after taking it away, and to Him is our raising.",
  },
  {
    id: "welcoming-someone",
    title: "When welcoming someone",
    category: "social",
    keywords: ["welcome", "guest"],
    arabic: "أَهْلًا وَّسَهْلًا وَّمَرْحَبًا",
    transliteration: "Ahlan wa sahlan wa marhaban.",
    english: "Welcome. May you be at ease and comfortable.",
  },
  {
    id: "greeting-muslim",
    title: "When greeting a Muslim",
    category: "social",
    keywords: ["salam", "greeting"],
    arabic: "اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ",
    transliteration: "As-salamu 'alaykum wa rahmatullahi wa barakatuh.",
    english: "Peace be upon you and the mercy of Allah and His blessings.",
  },
  {
    id: "reply-greeting",
    title: "Reply to a Muslim greeting",
    category: "social",
    keywords: ["salam", "reply", "greeting"],
    arabic: "وَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ",
    transliteration: "Wa 'alaykumus-salam wa rahmatullahi wa barakatuh.",
    english: "And peace be upon you and the mercy of Allah and His blessings.",
  },
  {
    id: "before-toilet",
    title: "Before entering the toilet",
    category: "daily",
    keywords: ["toilet", "bathroom"],
    arabic: "اَللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    transliteration: "Allahumma inni a'udhu bika minal-khubuthi wal-khaba'ith.",
    english: "O Allah, I seek protection in You from filth and male and female devils.",
  },
  {
    id: "after-toilet",
    title: "After leaving the toilet",
    category: "daily",
    keywords: ["toilet", "bathroom"],
    arabic: "غُفْرَانَكَ، اَلْحَمْدُ لِلّٰهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي",
    transliteration: "Ghufranaka, alhamdu lillahil-ladhi adh-haba 'annil-adha wa 'afani.",
    english: "I seek Your pardon. All praises are due to Allah who has taken away from me discomfort and granted me relief.",
  },
  {
    id: "thanking-someone",
    title: "When thanking someone",
    category: "social",
    keywords: ["thanks", "gratitude"],
    arabic: "جَزَاكَ اللّٰهُ خَيْرًا",
    transliteration: "Jazakallahu khayran.",
    english: "May Allah reward you well.",
  },
  {
    id: "intend-something",
    title: "When intending to do something",
    category: "daily",
    keywords: ["inshaallah", "intention"],
    arabic: "إِنْ شَاءَ اللّٰهُ",
    transliteration: "In sha' Allah.",
    english: "If Allah wills.",
  },
  {
    id: "good-news",
    title: "Upon hearing good news",
    category: "daily",
    keywords: ["good news", "gratitude", "happy"],
    arabic: "اَلْحَمْدُ لِلّٰهِ، مَا شَاءَ اللّٰهُ",
    transliteration: "Alhamdu lillah, ma sha' Allah.",
    english: "All praises are due to Allah, just as Allah willed.",
  },
  {
    id: "after-milk",
    title: "After drinking milk",
    category: "daily",
    keywords: ["milk", "drink"],
    arabic: "اَللّٰهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ",
    transliteration: "Allahumma barik lana fihi wa zidna minhu.",
    english: "O Allah, bless us in it and increase it for us.",
  },
  {
    id: "ascending",
    title: "While ascending",
    category: "travel",
    keywords: ["climbing", "up"],
    arabic: "اَللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar.",
    english: "Allah is the Greatest.",
  },
  {
    id: "descending",
    title: "While descending",
    category: "travel",
    keywords: ["down", "descent"],
    arabic: "سُبْحَانَ اللّٰهِ",
    transliteration: "SubhanAllah.",
    english: "Glory be to Allah.",
  },
  {
    id: "kalimah-shahadah",
    title: "Kalimah Shahadah",
    category: "iman",
    keywords: ["faith", "declaration", "shahadah"],
    arabic: "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Ashhadu an la ilaha illallahu wahdahu la sharika lahu wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
    english: "I bear witness that there is none worthy of worship besides Allah alone. He has no partner and I bear witness that Muhammad is His servant and Messenger.",
  },
  {
    id: "kalimah-tamjeed",
    title: "Kalimah Tamjeed",
    category: "iman",
    keywords: ["dhikr", "praise", "glory"],
    arabic: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ",
    transliteration: "SubhanAllahi walhamdu lillahi wa la ilaha illallahu wallahu akbar, wa la hawla wa la quwwata illa billahil 'aliyyil 'azim.",
    english: "Glory be to Allah, all praises are due to Allah, there is none worthy of worship besides Allah, Allah is the Greatest, and there is no might and no power except from Allah the Most High, the Magnificent.",
  },
  {
    id: "after-water",
    title: "After drinking water",
    category: "daily",
    keywords: ["water", "drink"],
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِي سَقَانَا عَذْبًا فُرَاتًا بِرَحْمَتِهِ وَلَمْ يَجْعَلْهُ مِلْحًا أُجَاجًا بِذُنُوبِنَا",
    transliteration: "Alhamdu lillahil-ladhi saqana 'adhban furatan birahmatihi wa lam yaj'alhu milhan ujajan bidhunubina.",
    english: "All praises are due to Allah who has given us sweet water to drink and did not make it bitter because of our sins.",
  },
  {
    id: "increase-knowledge",
    title: "For increasing knowledge",
    category: "knowledge",
    keywords: ["study", "school", "learn"],
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma.",
    english: "O my Lord, increase my knowledge.",
  },
  {
    id: "durood-shareef",
    title: "Durood Shareef",
    category: "salah",
    keywords: ["durood", "salawat", "prophet"],
    arabic: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ وَبَارِكْ وَسَلِّمْ",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin wa barik wa sallim.",
    english: "O Allah, send blessings upon our Master Muhammad and upon the family of our Master Muhammad, and send blessings and peace upon them.",
  },
  {
    id: "boarding-transport",
    title: "On boarding transport",
    category: "travel",
    keywords: ["car", "journey", "transport"],
    arabic: "اَلْحَمْدُ لِلّٰهِ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Alhamdu lillah, subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun.",
    english: "All praises are due to Allah. Glory be to Him who has caused this to be under our control though we were unable to control it. Surely we will return to our Lord.",
  },
  {
    id: "prophet-mentioned",
    title: "When the Prophet's name is mentioned",
    category: "social",
    keywords: ["prophet", "salawat"],
    arabic: "صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ",
    transliteration: "Sallallahu 'alayhi wa sallam.",
    english: "May Allah send blessings and peace upon him.",
  },
  {
    id: "after-sneeze",
    title: "After you sneeze",
    category: "daily",
    keywords: ["sneeze", "health"],
    arabic: "اَلْحَمْدُ لِلّٰهِ",
    transliteration: "Alhamdu lillah.",
    english: "All praises are due to Allah.",
  },
  {
    id: "hear-sneeze",
    title: "When you hear someone sneeze",
    category: "social",
    keywords: ["sneeze", "reply"],
    arabic: "يَرْحَمُكَ اللّٰهُ",
    transliteration: "Yarhamukallah.",
    english: "May Allah have mercy on you.",
  },
  {
    id: "sneezer-reply",
    title: "The sneezer's reply",
    category: "social",
    keywords: ["sneeze", "reply"],
    arabic: "يَهْدِيكُمُ اللّٰهُ وَيُصْلِحُ بَالَكُمْ",
    transliteration: "Yahdikumullahu wa yuslihu balakum.",
    english: "May Allah guide you and correct your affairs.",
  },
  {
    id: "mirror",
    title: "When looking into a mirror",
    category: "daily",
    keywords: ["mirror", "character"],
    arabic: "اَللّٰهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي",
    transliteration: "Allahumma anta hassanta khalqi fa hassin khuluqi.",
    english: "O Allah, You have made my body beautiful, so beautify my character as well.",
  },
  {
    id: "seek-forgiveness",
    title: "When seeking Allah's forgiveness",
    category: "protection",
    keywords: ["astaghfirullah", "forgiveness"],
    arabic: "أَسْتَغْفِرُ اللّٰهَ",
    transliteration: "Astaghfirullah.",
    english: "I seek Allah's forgiveness.",
  },
  {
    id: "imaan-mujmal",
    title: "Imaan-e-Mujmal",
    category: "iman",
    keywords: ["faith", "belief"],
    arabic: "آمَنْتُ بِاللّٰهِ كَمَا هُوَ بِأَسْمَائِهِ وَصِفَاتِهِ وَقَبِلْتُ جَمِيعَ أَحْكَامِهِ",
    transliteration: "Amantu billahi kama huwa bi asma'ihi wa sifatihi wa qabiltu jami'a ahkamihi.",
    english: "I believe in Allah as He is understood by His names and attributes, and I accept all His orders.",
  },
  {
    id: "kalimah-tawheed",
    title: "Kalimah Tawheed",
    category: "iman",
    keywords: ["faith", "tawheed"],
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, yuhyi wa yumit, biyadihil-khayr, wa huwa 'ala kulli shay'in qadir.",
    english: "There is none worthy of worship besides Allah alone. He has no partner. His is the kingdom and for Him is all praise. He gives life and causes death. In His hand is all good and He has power over everything.",
  },
  {
    id: "forget-bismillah",
    title: "When you forget Bismillah before eating",
    category: "daily",
    keywords: ["food", "bismillah", "eat"],
    arabic: "بِسْمِ اللّٰهِ فِي أَوَّلِهِ وَآخِرِهِ",
    transliteration: "Bismillahi fi awwalihi wa akhirih.",
    english: "In the name of Allah in its beginning and its end.",
  },
  {
    id: "shaking-hands",
    title: "While shaking hands",
    category: "social",
    keywords: ["handshake", "forgiveness"],
    arabic: "يَغْفِرُ اللّٰهُ لَنَا وَلَكُمْ",
    transliteration: "Yaghfirullahu lana wa lakum.",
    english: "May Allah forgive us and you.",
  },
  {
    id: "conveyed-salam",
    title: "When salam is conveyed",
    category: "social",
    keywords: ["salam", "message"],
    arabic: "عَلَيْكَ وَعَلَيْهِ السَّلَامُ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ",
    transliteration: "Alayka wa 'alayhis-salamu wa rahmatullahi wa barakatuh.",
    english: "Peace be upon you and him and the mercy of Allah and His blessings.",
  },
  {
    id: "entering-masjid",
    title: "When entering the masjid",
    category: "masjid",
    keywords: ["mosque", "masjid"],
    arabic: "اَللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma iftah li abwaba rahmatik.",
    english: "O Allah, open for me the doors of Your mercy.",
  },
  {
    id: "leaving-masjid",
    title: "When leaving the masjid",
    category: "masjid",
    keywords: ["mosque", "masjid"],
    arabic: "اَللّٰهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik.",
    english: "O Allah, verily I ask You from Your bounties.",
  },
  {
    id: "itikaf",
    title: "For Sunnat-e-Itikaaf",
    category: "masjid",
    keywords: ["itikaf", "masjid", "intention"],
    arabic: "نَوَيْتُ سُنَّةَ الْاِعْتِكَافِ لِلّٰهِ تَعَالَى",
    transliteration: "Nawaytu sunnatal i'tikafi lillahi ta'ala.",
    english: "I intended to make Sunnat-e-Itikaaf for the sake of Allah Ta'ala.",
  },
  {
    id: "farewell",
    title: "When we say farewell to someone",
    category: "social",
    keywords: ["farewell", "travel"],
    arabic: "فِي أَمَانِ اللّٰهِ وَفِي أَمَانِ الرَّسُولِ صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ",
    transliteration: "Fi amanillahi wa fi amanir-rasuli sallallahu 'alayhi wa sallam.",
    english: "Go in Allah's protection and with the Prophet's protection.",
  },
  {
    id: "difficulty",
    title: "When facing a problem or difficulty",
    category: "protection",
    keywords: ["difficulty", "problem", "stress"],
    arabic: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ وَعَلَى اللّٰهِ تَوَكَّلْنَا",
    transliteration: "Hasbunallahu wa ni'mal-wakil wa 'alallahi tawakkalna.",
    english: "Allah is enough for us and He is the best helper, and upon Allah do we rely.",
  },
  {
    id: "wudhu-niyyah",
    title: "Niyyah for wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu", "niyyah"],
    arabic: "نَوَيْتُ أَنْ أَتَوَضَّأَ لِرَفْعِ الْحَدَثِ وَاسْتِبَاحَةِ الصَّلَاةِ وَتَقَرُّبًا إِلَى اللّٰهِ تَعَالَى",
    transliteration: "Nawaytu an atawadda'a liraf'il-hadathi wastibahatis-salati wa taqarruban ilallahi ta'ala.",
    english: "I intended to perform wudhu to purify from impurity, to establish prayer, and to obtain nearness of Allah Ta'ala.",
  },
  {
    id: "before-wudhu",
    title: "Before making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "بِسْمِ اللّٰهِ وَالْحَمْدُ لِلّٰهِ",
    transliteration: "Bismillahi walhamdu lillah.",
    english: "In the name of Allah and all praises are due to Allah.",
  },
  {
    id: "while-wudhu",
    title: "While making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "اَللّٰهُمَّ اغْفِرْ لِي ذَنْبِي وَوَسِّعْ لِي فِي دَارِي وَبَارِكْ لِي فِي رِزْقِي",
    transliteration: "Allahummaghfir li dhanbi wa wassi' li fi dari wa barik li fi rizqi.",
    english: "O Allah, forgive my sin, give me abundance in my home, and grant me blessings in my sustenance.",
  },
  {
    id: "after-wudhu",
    title: "After making wudhu",
    category: "wudhu",
    keywords: ["wudu", "wudhu"],
    arabic: "اَللّٰهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    transliteration: "Allahummaj'alni minat-tawwabina waj'alni minal-mutatahhirin.",
    english: "O Allah, make me among those who repent and among those who are clean and pure.",
  },
  {
    id: "imaan-mufassal",
    title: "Imaan-e-Mufassal",
    category: "iman",
    keywords: ["faith", "belief", "angels", "books"],
    arabic: "آمَنْتُ بِاللّٰهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الْآخِرِ وَالْقَدْرِ خَيْرِهِ وَشَرِّهِ مِنَ اللّٰهِ تَعَالَى وَالْبَعْثِ بَعْدَ الْمَوْتِ",
    transliteration: "Amantu billahi wa mala'ikatihi wa kutubihi wa rusulihi wal-yawmil-akhiri wal-qadri khayrihi wa sharrihi minallahi ta'ala wal-ba'thi ba'dal-mawt.",
    english: "I believe in Allah, His angels, His books, His messengers, the Last Day, destiny - the good and the bad thereof - which is from Allah, and the raising after death.",
  },
  {
    id: "for-parents",
    title: "Dua for parents",
    category: "family",
    keywords: ["mother", "father", "parents"],
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir hamhuma kama rabbayani saghira.",
    english: "O my Lord, have mercy upon them as they both nourished me when I was small.",
  },
  {
    id: "radd-e-kufr",
    title: "Kalimah Radd-e-Kufr",
    category: "protection",
    keywords: ["kufr", "protection", "faith"],
    arabic: "اَللّٰهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ بِهِ وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ بِهِ تُبْتُ عَنْهُ وَتَبَرَّأْتُ مِنَ الْكُفْرِ وَالشِّرْكِ وَالْمَعَاصِي كُلِّهَا وَأَسْلَمْتُ وَآمَنْتُ وَأَقُولُ لَا إِلٰهَ إِلَّا اللّٰهُ مُحَمَّدٌ رَسُولُ اللّٰهِ",
    transliteration: "Allahumma inni a'udhu bika min an ushrika bika shay'an wa ana a'lamu bih, wa astaghfiruka lima la a'lamu bih, tubtu 'anhu wa tabarra'tu minal-kufri wash-shirki wal-ma'asi kulliha, wa aslamtu wa amantu wa aqulu la ilaha illallah Muhammadur Rasulullah.",
    english: "O Allah, I seek protection in You from knowingly joining any partner with You, and I seek Your forgiveness for that which I do not know. I repent, free myself from disbelief, shirk and all sins, submit to Your will, believe, and declare that there is none worthy of worship besides Allah and Muhammad is the Messenger of Allah.",
  },
  {
    id: "drought",
    title: "At the time of drought",
    category: "protection",
    keywords: ["rain", "drought"],
    arabic: "اَللّٰهُمَّ اسْقِنَا، اَللّٰهُمَّ أَغِثْنَا",
    transliteration: "Allahummasqina, Allahumma aghithna.",
    english: "O Allah, quench us. O Allah, let it rain upon us.",
  },
  {
    id: "entering-house",
    title: "When entering your house",
    category: "home",
    keywords: ["home", "house", "enter"],
    arabic: "اَللّٰهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللّٰهِ وَلَجْنَا وَبِسْمِ اللّٰهِ خَرَجْنَا وَعَلَى اللّٰهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Allahumma inni as'aluka khayral-mawlaji wa khayral-makhraji, bismillahi walajna wa bismillahi kharajna wa 'alallahi rabbina tawakkalna.",
    english: "O Allah, I ask You the blessing of entering the house and the blessing of leaving the house. In the name of Allah we enter and in the name of Allah we leave and upon Allah our Lord do we rely.",
  },
  {
    id: "leaving-house",
    title: "When leaving your house",
    category: "home",
    keywords: ["home", "house", "leave"],
    arabic: "بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
    transliteration: "Bismillahi tawakkaltu 'alallah wa la hawla wa la quwwata illa billah.",
    english: "In the name of Allah I leave, and I rely upon Allah, and there is no might and no power except from Allah.",
  },
  {
    id: "bidding-farewell",
    title: "When bidding farewell to someone",
    category: "social",
    keywords: ["farewell", "travel"],
    arabic: "أَسْتَوْدِعُ اللّٰهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ",
    transliteration: "Astawdi'ullaha dinaka wa amanataka wa khawatima 'amalik.",
    english: "I give in trust to Allah your religion, your belongings and the result of your deeds.",
  },
  {
    id: "fever",
    title: "Dua for fever",
    category: "healing",
    keywords: ["fever", "illness", "healing"],
    arabic: "بِسْمِ اللّٰهِ الْكَبِيرِ أَعُوذُ بِاللّٰهِ الْعَظِيمِ مِنْ شَرِّ كُلِّ عِرْقٍ نَعَّارٍ وَمِنْ شَرِّ حَرِّ النَّارِ",
    transliteration: "Bismillahil-kabir, a'udhu billahil-'azim min sharri kulli 'irqin na''arin wa min sharri harrin-nar.",
    english: "In the name of Allah, the Great. I seek protection in Allah the Magnificent from the evil of every spurting vein and from the evil of the heat of the fire.",
  },
  {
    id: "takbeer",
    title: "Takbeer",
    category: "salah",
    keywords: ["salah", "prayer", "takbir"],
    arabic: "اَللّٰهُ أَكْبَرُ",
    transliteration: "Allahu Akbar.",
    english: "Allah is the Greatest.",
  },
  {
    id: "thanaa",
    title: "Thanaa",
    category: "salah",
    keywords: ["salah", "prayer", "opening"],
    arabic: "سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ",
    transliteration: "Subhanakallahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa la ilaha ghayruk.",
    english: "Glory be to You O Allah and all praises are due to You, blessed is Your name, high is Your greatness and there is none worthy of worship besides You.",
  },
  {
    id: "ruku",
    title: "Tasbeeh of ruku'",
    category: "salah",
    keywords: ["ruku", "salah", "prayer"],
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    transliteration: "Subhana Rabbiyal 'Azim.",
    english: "Glory be to my Lord, the Magnificent.",
  },
  {
    id: "rising-ruku",
    title: "When rising from ruku'",
    category: "salah",
    keywords: ["ruku", "salah", "prayer"],
    arabic: "سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ، اَللّٰهُمَّ رَبَّنَا وَلَكَ الْحَمْدُ",
    transliteration: "Sami'Allahu liman hamidah. Allahumma Rabbana wa lakal-hamd.",
    english: "Allah has heard the servant who has praised Him. O Allah our Lord, all praises are due to You.",
  },
  {
    id: "sajdah",
    title: "Tasbeeh in sajdah",
    category: "salah",
    keywords: ["sajdah", "sujud", "salah"],
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliteration: "Subhana Rabbiyal A'la.",
    english: "Glory be to my Lord, the Most High.",
  },
  {
    id: "tashahhud",
    title: "Tashahhud",
    category: "salah",
    keywords: ["tashahhud", "salah", "prayer"],
    arabic: "التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "At-tahiyyatu lillahi was-salawatu wat-tayyibat, as-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh, as-salamu 'alayna wa 'ala 'ibadillahis-salihin, ashhadu an la ilaha illallah wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
    english: "All prayers and worship offered through words, actions and wealth are due to Allah. Peace be upon you O Prophet and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is none worthy of worship besides Allah and I bear witness that Muhammad is His servant and messenger.",
  },
  {
    id: "durood-ibrahim",
    title: "Durood-e-Ibrahim",
    category: "salah",
    keywords: ["durood", "salah", "salawat"],
    arabic: "اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ. اَللّٰهُمَّ بَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin kama sallayta 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahima innaka Hamidum Majid. Allahumma barik 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammadin kama barakta 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahima innaka Hamidum Majid.",
    english: "O Allah, send blessings upon our Master Muhammad and upon the family of our Master Muhammad as You sent blessings upon our Master Ibrahim and upon the family of our Master Ibrahim. Surely, You are Praiseworthy and Most High.",
  },
  {
    id: "after-durood-ibrahim",
    title: "After Durood-e-Ibrahim",
    category: "salah",
    keywords: ["forgiveness", "salah", "prayer"],
    arabic: "اَللّٰهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    transliteration: "Allahumma inni zalamtu nafsi zulman kathira wa innahu la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika وارحمني innaka antal-Ghafurur-Rahim.",
    english: "O Allah, I have wronged myself greatly and nobody forgives sins except You. Forgive me and have mercy upon me. Surely, You are the Most Forgiver and the Most Merciful.",
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
};

let currentSearch = "";
let currentCategory = "all";
let favoritesOnly = false;

function decodeMojibake(value) {
  const raw = String(value || "");

  if (!/[ØÙ]/.test(raw)) {
    return raw;
  }

  try {
    return decodeURIComponent(escape(raw));
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
  return String(value || "").trim().toLowerCase();
}

function getFilteredDuas() {
  const term = normalizeText(currentSearch);

  return duas.filter((dua) => {
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

  const categories = ["all", ...new Set(duas.map((dua) => dua.category))];

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

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function speakText(text, lang) {
  const cleanText = decodeMojibake(text);

  if (!("speechSynthesis" in window) || !cleanText) {
    return;
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang;
  utterance.rate = lang.startsWith("ar") ? 0.9 : 0.95;
  window.speechSynthesis.speak(utterance);
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

  duaList.querySelectorAll("[data-dua-audio-ar]").forEach((button) => {
    button.addEventListener("click", () => {
      const dua = duas.find((item) => item.id === button.dataset.duaAudioAr);
      speakText(dua?.arabic, "ar-SA");
    });
  });

  duaList.querySelectorAll("[data-dua-audio-en]").forEach((button) => {
    button.addEventListener("click", () => {
      const dua = duas.find((item) => item.id === button.dataset.duaAudioEn);
      speakText(dua?.english, "en-US");
    });
  });
}

function renderDuas() {
  if (!duaList) {
    return;
  }

  const filteredDuas = getFilteredDuas();

  if (duaStatus) {
    duaStatus.textContent = filteredDuas.length
      ? `${filteredDuas.length} duas`
      : "No duas found.";
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
            <div class="dua-card-audio-row">
              <button class="dua-audio-button" data-dua-audio-ar="${escapeHtml(dua.id)}" type="button">Play Arabic</button>
              <button class="dua-audio-button" data-dua-audio-en="${escapeHtml(dua.id)}" type="button">Play English</button>
            </div>
            <p class="dua-card-arabic" dir="rtl" lang="ar">${escapeHtml(decodeMojibake(dua.arabic))}</p>
            <p class="dua-card-transliteration">${escapeHtml(dua.transliteration)}</p>
            <p class="dua-card-english">${escapeHtml(dua.english)}</p>
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
  duaStatus.textContent = "Loading duas...";
}

renderCategoryChips();
renderDuas();
