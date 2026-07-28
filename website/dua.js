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
    arabic: "أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'udhu billahi minash-shaytanir-rajim.",
    english: "I seek protection in Allah from Shaytan, the rejected one.",
  },
  {
    id: "tasmiyah",
    title: "Tasmiyah",
    category: "daily",
    keywords: ["bismillah", "bismilah", "basmala", "mercy", "beginning"],
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
    keywords: ["faith", "declaration", "shahadah", "ashhadu", "la ilaha illallah"],
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
    keywords: ["astaghfirullah", "astagfirullah", "istighfar", "istigfar", "forgiveness"],
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
    keywords: ["faith", "tawheed", "la ilaha illallah"],
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
    transliteration: "Allahumma inni zalamtu nafsi zulman kathira wa innahu la yaghfirudh-dhunuba illa anta, faghfir li maghfiratan min 'indika warhamni innaka antal-Ghafurur-Rahim.",
    english: "O Allah, I have wronged myself greatly and nobody forgives sins except You. Forgive me and have mercy upon me. Surely, You are the Most Forgiver and the Most Merciful.",
  },
  {
    id: "after-adhan",
    title: "Dua after adhan",
    category: "masjid",
    keywords: ["adhan", "azaan", "call to prayer"],
    arabic: "اللهم رب هذه الدعوة التامة والصلاة القائمة آت سيدنا محمداً الوسيلة والفضيلة والدرجة الرفيعة وابعثه مقاماً محموداً الذي وعدته وارزقنا شفاعته يوم القيامة إنك لا تخلف الميعاد",
    transliteration: "Allahumma rabba hadhihid-da'watit-tammah was-salatil-qa'imah ati sayyidina Muhammadanil-wasilata wal-fadilah wad-darajatar-rafi'ah wab'athhu maqamam mahmudanilladhi wa'adtah warzuqna shafa'atahu yawmal-qiyamah innaka la tukhliful-mi'ad.",
    english: "O Allah, Lord of this perfect call and established prayer, grant our Master Muhammad the Waseelah, excellence and the highest rank, raise him to the praised station You promised him, and grant us his intercession on the Day of Judgement. Surely You do not break Your promise.",
  },
  {
    id: "before-niyyah-salah",
    title: "Before making niyyah for salah",
    category: "salah",
    keywords: ["niyyah", "intention", "salah"],
    arabic: "إني وجهت وجهي للذي فطر السموات والأرض حنيفاً وما أنا من المشركين",
    transliteration: "Inni wajjahtu wajhiya lilladhi fataras-samawati wal-arda hanifan wa ma ana minal-mushrikin.",
    english: "Verily, I have firmly turned my face towards Him Who created the heavens and the earth, and I am not among those who associate partners with Allah.",
  },
  {
    id: "after-salam",
    title: "Dua after salam",
    category: "salah",
    keywords: ["after prayer", "salam", "salah"],
    arabic: "اللهم أنت السلام ومنك السلام تباركت يا ذا الجلال والإكرام",
    transliteration: "Allahumma antas-salam wa minkas-salam tabarakta ya dhal-jalali wal-ikram.",
    english: "O Allah, You are Peace and from You comes peace. Blessed are You, O Lord of Majesty and Generosity.",
  },
  {
    id: "dua-qunoot",
    title: "Dua-e-Qunoot",
    category: "salah",
    keywords: ["qunoot", "witr", "salah", "allahumma inna nasta inuka", "nastaeenuka", "nasta inuka"],
    arabic: "اللهم إنا نستعينك ونستغفرك ونؤمن بك ونتوكل عليك ونثني عليك الخير ونشكرك ولا نكفرك ونخلع ونترك من يفجرك اللهم إياك نعبد ولك نصلي ونسجد وإليك نسعى ونحفد ونرجو رحمتك ونخشى عذابك إن عذابك بالكفار ملحق",
    transliteration: "Allahumma inna nasta'inuka wa nastaghfiruka wa nu'minu bika wa natawakkalu 'alayka wa nuthni 'alaykal-khayr wa nashkuruka wa la nakfuruk wa nakhla'u wa natruku man yafjuruk. Allahumma iyyaka na'budu wa laka nusalli wa nasjudu wa ilayka nas'a wa nahfid wa narju rahmataka wa nakhsha 'adhabaka inna 'adhabaka bil-kuffari mulhiq.",
    english: "O Allah, we seek help from You, seek forgiveness from You, believe in You and rely on You. We praise You in the best way, thank You and do not show ingratitude. We separate ourselves from those who disobey You. O Allah, You alone we worship, to You we pray and prostrate, towards You we strive and hasten. We hope for Your mercy and fear Your punishment. Surely Your punishment overtakes the disbelievers.",
  },
  {
    id: "dua-for-fasting",
    title: "Dua for fasting",
    category: "daily",
    keywords: ["fasting", "sawm", "roza", "sehri"],
    arabic: "اللهم أصوم غداً لك فاغفر لي ما قدمت وما أخرت",
    transliteration: "Allahumma asumu ghadan laka faghfir li ma qaddamtu wa ma akhkhartu.",
    english: "O Allah, I am fasting for You in the coming day, so forgive my past and future sins.",
  },
  {
    id: "when-breaking-fast",
    title: "Dua when breaking fast",
    category: "daily",
    keywords: ["iftar", "fasting", "roza"],
    arabic: "اللهم لك صمت وبك آمنت وعلى رزقك أفطرت فتقبل مني",
    transliteration: "Allahumma laka sumtu wa bika amantu wa 'ala rizqika aftartu fataqabbal minni.",
    english: "O Allah, I fasted for You, believed in You, and with the provision You gave me I break my fast. Accept it from me.",
  },
  {
    id: "when-seeing-masjid",
    title: "When you see a masjid",
    category: "masjid",
    keywords: ["masjid", "mosque", "durood"],
    arabic: "الصلاة والسلام عليك يا رسول الله",
    transliteration: "As-salatu was-salamu 'alayka ya Rasulallah.",
    english: "O Messenger of Allah, blessings and peace be upon you.",
  },
  {
    id: "signs-of-infidelity",
    title: "When we see the signs of infidelity",
    category: "iman",
    keywords: ["faith", "kufr", "iman"],
    arabic: "أشهد أن لا إله إلا الله وحده لا شريك له إلهاً واحداً لا نعبد إلا إياه",
    transliteration: "Ashhadu an la ilaha illallahu wahdahu la sharika lah ilahan wahidan la na'budu illa iyyah.",
    english: "I bear witness that there is none worthy of worship besides Allah alone. He has no partner. We worship none besides Him.",
  },
  {
    id: "boarding-transport",
    title: "Dua on boarding a car or other transport",
    category: "travel",
    keywords: ["car", "transport", "travel", "journey"],
    arabic: "الحمد لله سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون",
    transliteration: "Alhamdulillah. Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila Rabbina lamunqalibun.",
    english: "All praise is due to Allah. Glory be to Him Who has subjected this to us, though we could not have controlled it ourselves. Surely to our Lord we will return.",
  },
  {
    id: "boarding-ship-plane",
    title: "Dua while boarding a ship or aeroplane",
    category: "travel",
    keywords: ["ship", "plane", "aeroplane", "travel"],
    arabic: "بسم الله مجراها ومرساها إن ربي لغفور رحيم",
    transliteration: "Bismillahi majraha wa mursaha inna Rabbi laghafurun rahim.",
    english: "In the name of Allah is its movement and its stillness. Surely my Lord is Most Forgiving, Most Merciful.",
  },
  {
    id: "return-from-journey",
    title: "Dua when we return from a journey",
    category: "travel",
    keywords: ["journey", "return", "travel"],
    arabic: "آيبون تائبون لربنا حامدون",
    transliteration: "Ayibuna ta'ibuna li Rabbina hamidun.",
    english: "We return, repenting, worshipping and praising our Lord.",
  },
  {
    id: "new-muslim-dua",
    title: "Dua to be taught to a new Muslim",
    category: "iman",
    keywords: ["new muslim", "guidance", "sustenance"],
    arabic: "اللهم اغفر لي وارحمني واهدني وارزقني",
    transliteration: "Allahummaghfir li warhamni wahdini warzuqni.",
    english: "O Allah, forgive me, have mercy on me, guide me and grant me sustenance.",
  },
  {
    id: "heavy-rainfall",
    title: "Dua at the time of heavy rainfall",
    category: "protection",
    keywords: ["rain", "weather", "storm"],
    arabic: "اللهم صيباً نافعاً",
    transliteration: "Allahumma sayyiban nafi'an.",
    english: "O Allah, let this be a beneficial rain.",
  },
  {
    id: "when-afflicted-by-nazr",
    title: "Dua when afflicted with nazr",
    category: "protection",
    keywords: ["nazr", "evil eye", "healing"],
    arabic: "بسم الله اللهم أذهب حرها وبردها ووصبها",
    transliteration: "Bismillah Allahumma adhhib harraha wa bardaha wa wasabaha.",
    english: "In the name of Allah. O Allah, remove its heat, its cold and its pain.",
  },
  {
    id: "protection-from-calamities",
    title: "Dua for protection from calamities",
    category: "protection",
    keywords: ["calamity", "protection", "family", "wealth"],
    arabic: "بسم الله على ديني ونفسي وولدي وأهلي ومالي",
    transliteration: "Bismillahi 'ala dini wa nafsi wa waladi wa ahli wa mali.",
    english: "In the name of Allah, I seek protection for my religion, my life, my children, my family and my wealth.",
  },
  {
    id: "protection-day-of-qiyamah",
    title: "Dua for protection on the Day of Qiyamah",
    category: "protection",
    keywords: ["qiyamah", "akhirah", "protection"],
    arabic: "رضيت بالله رباً وبالإسلام ديناً وبمحمد صلى الله عليه وسلم نبياً ورسولاً",
    transliteration: "Raditu billahi Rabba wa bil-Islami dinan wa bi Muhammadin sallallahu 'alayhi wa sallama nabiyyan wa rasula.",
    english: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet and Messenger.",
  },
  {
    id: "durood-muqaddas",
    title: "Durood-e-Muqaddas",
    category: "salah",
    keywords: ["durood", "salawat"],
    arabic: "اللهم صل على سيدنا محمد النبي الأمي وعلى آله وسلم تسليماً",
    transliteration: "Allahumma salli 'ala sayyidina Muhammadin-nabiyyil-ummiyyi wa 'ala alihi wa sallim taslima.",
    english: "O Allah, send blessings upon our Master Muhammad, the unlettered Prophet, and upon his family, and send complete peace.",
  },
  {
    id: "after-witr-salah",
    title: "Dua after Witr salah",
    category: "salah",
    keywords: ["witr", "after prayer", "salah"],
    arabic: "سبوح قدوس رب الملائكة والروح",
    transliteration: "Subbuhun Quddusun Rabbul-mala'ikati war-ruh.",
    english: "Most Glorious, Most Holy, Lord of the angels and the Spirit.",
  },
  {
    id: "eating-at-someones-house",
    title: "Dua when eating at someone's house",
    category: "social",
    keywords: ["guest", "food", "host"],
    arabic: "اللهم بارك لهم فيما رزقتهم واغفر لهم وارحمهم",
    transliteration: "Allahumma barik lahum fima razaqtahum waghfir lahum warhamhum.",
    english: "O Allah, bless for them what You have provided them, forgive them and have mercy on them.",
  },
  {
    id: "breaking-fast-at-someones-house",
    title: "Dua for breaking fast at someone's house",
    category: "social",
    keywords: ["iftar", "guest", "fasting"],
    arabic: "أفطر عندكم الصائمون وأكل طعامكم الأبرار وتنزلت عليكم الملائكة",
    transliteration: "Aftara 'indakumus-sa'imun wa akala ta'amakumul-abrar wa tanazzalat 'alaykumul-mala'ikah.",
    english: "May the fasting people break their fast with you, may the righteous eat your food, and may the angels descend upon you.",
  },
  {
    id: "new-moon",
    title: "Dua on sighting the new moon",
    category: "daily",
    keywords: ["moon", "hilal", "month"],
    arabic: "اللهم أهله علينا بالأمن والإيمان والسلامة والإسلام والتوفيق لما تحب وترضى",
    transliteration: "Allahumma ahillahu 'alayna bil-amni wal-iman was-salamati wal-Islam wat-tawfiqi lima tuhibbu wa tarda.",
    english: "O Allah, let this moon rise over us with safety, faith, peace, Islam and ability to do what You love and are pleased with.",
  },
  {
    id: "taking-off-clothes",
    title: "Dua while taking off clothes",
    category: "home",
    keywords: ["clothes", "dress", "undress"],
    arabic: "بسم الله",
    transliteration: "Bismillah.",
    english: "In the name of Allah.",
  },
  {
    id: "wearing-new-clothes",
    title: "Dua on wearing new clothes",
    category: "daily",
    keywords: ["clothes", "new clothes", "dress"],
    arabic: "اللهم لك الحمد أنت كسوتنيه أسألك خيره وخير ما صنع له وأعوذ بك من شره وشر ما صنع له",
    transliteration: "Allahumma lakal-hamd anta kasawtanihi as'aluka khayrahu wa khayra ma suni'a lahu wa a'udhu bika min sharrihi wa sharri ma suni'a lahu.",
    english: "O Allah, all praise is for You. You clothed me with this. I ask You for its good and the good for which it was made, and I seek refuge in You from its evil and the evil for which it was made.",
  },
  {
    id: "wearing-clothes",
    title: "Dua on wearing clothes",
    category: "daily",
    keywords: ["clothes", "dress"],
    arabic: "الحمد لله الذي كساني هذا ورزقنيه من غير حول مني ولا قوة",
    transliteration: "Alhamdulillahil-ladhi kasani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    english: "All praise is for Allah Who clothed me with this and provided it to me without any power or strength from me.",
  },
  {
    id: "expressing-love",
    title: "Expressing one's love to another",
    category: "social",
    keywords: ["love", "brotherhood", "friend"],
    arabic: "إني أحبك في الله",
    transliteration: "Inni uhibbuka fillah.",
    english: "Indeed, I love you for the sake of Allah.",
  },
  {
    id: "reply-to-love",
    title: "Reply to someone expressing love",
    category: "social",
    keywords: ["love", "reply", "friend"],
    arabic: "أحبك الذي أحببتني له",
    transliteration: "Ahabbakalladhi ahbabtani lah.",
    english: "May Allah love you for whose sake you loved me.",
  },
  {
    id: "seeing-muslim-cheerful",
    title: "When seeing another Muslim cheerful",
    category: "social",
    keywords: ["muslim", "cheerful", "joy"],
    arabic: "الحمد لله الذي بنعمته تتم الصالحات",
    transliteration: "Alhamdulillahil-ladhi bi ni'matihi tatimmus-salihat.",
    english: "All praise is for Allah by Whose blessing righteous deeds are completed.",
  },
  {
    id: "when-loss-occurs",
    title: "When a loss occurs",
    category: "protection",
    keywords: ["loss", "grief", "patience"],
    arabic: "إنا لله وإنا إليه راجعون",
    transliteration: "Inna lillahi wa inna ilayhi raji'un.",
    english: "Surely we belong to Allah and to Him we will return.",
  },
  {
    id: "visiting-sick-person",
    title: "Dua when visiting a sick person",
    category: "healing",
    keywords: ["sick", "illness", "healing", "visit"],
    arabic: "لا بأس طهور إن شاء الله",
    transliteration: "La ba'sa tahurun in sha' Allah.",
    english: "No harm. It is a purification, if Allah wills.",
  },
  {
    id: "at-sunrise",
    title: "Dua at the time of sunrise",
    category: "daily",
    keywords: ["sunrise", "morning"],
    arabic: "أصبحنا وأصبح الملك لله",
    transliteration: "Asbahna wa asbahal-mulku lillah.",
    english: "We have entered the morning and the dominion belongs to Allah.",
  },
  {
    id: "at-sunset",
    title: "Dua at the time of sunset",
    category: "daily",
    keywords: ["sunset", "evening"],
    arabic: "أمسينا وأمسى الملك لله",
    transliteration: "Amsayna wa amsal-mulku lillah.",
    english: "We have entered the evening and the dominion belongs to Allah.",
  },
  {
    id: "travel-undertaking",
    title: "Dua at the time of undertaking a journey",
    category: "travel",
    keywords: ["journey", "travel", "walk"],
    arabic: "اللهم بك أصول وبك أجول وبك أسير",
    transliteration: "Allahumma bika asulu wa bika ajulu wa bika asir.",
    english: "O Allah, with Your help I travel, with Your help I move and with Your help I walk.",
  },
  {
    id: "leaving-meeting-place",
    title: "When one leaves any meeting place",
    category: "social",
    keywords: ["meeting", "gathering", "leaving"],
    arabic: "سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك",
    transliteration: "Subhanaka Allahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilayk.",
    english: "Glory be to You, O Allah, and all praise is Yours. I bear witness that there is none worthy of worship except You. I seek Your forgiveness and repent to You.",
  },
  {
    id: "thunder-lightning",
    title: "Dua when thunder or lightning strike",
    category: "protection",
    keywords: ["thunder", "lightning", "storm"],
    arabic: "اللهم لا تقتلنا بغضبك ولا تهلكنا بعذابك وعافنا قبل ذلك",
    transliteration: "Allahumma la taqtulna bighadabika wa la tuhlikna bi'adhabika wa 'afina qabla dhalik.",
    english: "O Allah, do not slay us with Your wrath, do not destroy us with Your punishment, and protect us before that.",
  },
  {
    id: "debt-financial-difficulty",
    title: "Dua when in debt or financial difficulty",
    category: "protection",
    keywords: ["debt", "money", "financial difficulty", "rizq"],
    arabic: "اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك",
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
    bookPages: buildBookPages(24),
  },
  {
    id: "durood-e-wali",
    title: "Durood-e-Wali",
    category: "salah",
    keywords: ["durood", "wali", "salawat"],
    bookPages: buildBookPages(25),
  },
  {
    id: "durood-e-noor",
    title: "Durood-e-Noor",
    category: "salah",
    keywords: ["durood", "noor", "salawat"],
    bookPages: buildBookPages(30),
  },
  {
    id: "azaan",
    title: "Azaan",
    category: "masjid",
    keywords: ["azaan", "adhan", "call to prayer"],
    bookPages: buildBookPages(65),
  },
  {
    id: "iqaamah",
    title: "Iqaamah",
    category: "masjid",
    keywords: ["iqaamah", "iqamah", "call to prayer"],
    bookPages: buildBookPages(66),
  },
  {
    id: "replying-azaan-iqaamah",
    title: "Replying to Azaan and Iqaamah",
    category: "masjid",
    keywords: ["azaan", "adhan", "iqamah", "reply"],
    bookPages: buildBookPages(67, 68),
  },
  {
    id: "niyyah-fardh-salah",
    title: "Niyyah for Fardh salah",
    category: "salah",
    keywords: ["niyyah", "fardh", "salah", "prayer intention"],
    bookPages: buildBookPages(50, 52),
  },
  {
    id: "niyyah-sunnah-nafl-salah",
    title: "Niyyah for Sunnah and Nafl salah",
    category: "salah",
    keywords: ["niyyah", "sunnah", "nafl", "salah"],
    bookPages: buildBookPages(52, 54),
  },
  {
    id: "niyyah-jumuah-witr-eid",
    title: "Niyyah for Jumu'ah, Witr, Eid al-Fitr and Eid al-Adha salah",
    category: "salah",
    keywords: ["niyyah", "jumuah", "witr", "eid", "salah"],
    bookPages: buildBookPages(54, 56),
  },
  {
    id: "arrival-of-bride",
    title: "Dua at the arrival of a bride",
    category: "marriage",
    keywords: ["bride", "marriage", "nikah"],
    bookPages: buildBookPages(57),
  },
  {
    id: "evil-thought",
    title: "Dua when an evil thought comes to mind",
    category: "protection",
    keywords: ["evil thought", "waswasa", "mind"],
    bookPages: buildBookPages(57),
  },
  {
    id: "bodily-pain",
    title: "Dua when in bodily pain",
    category: "healing",
    keywords: ["pain", "body", "healing"],
    bookPages: buildBookPages(57),
  },
  {
    id: "excessive-downpour",
    title: "Dua when there is an excessive downpour",
    category: "protection",
    keywords: ["rain", "storm", "downpour"],
    bookPages: buildBookPages(58),
  },
  {
    id: "barakah-increase-wealth",
    title: "Dua for barakah and increase in wealth",
    category: "daily",
    keywords: ["barakah", "wealth", "rizq"],
    bookPages: buildBookPages(58),
  },
  {
    id: "entering-market-place",
    title: "Dua when entering the market place",
    category: "daily",
    keywords: ["market", "bazaar", "shop"],
    bookPages: buildBookPages(58),
  },
  {
    id: "after-fardh-salah-duas",
    title: "Duas to be recited after Fardh salah",
    category: "salah",
    keywords: ["after fardh", "after prayer", "salah"],
    bookPages: buildBookPages(59),
  },
  {
    id: "tasbeeh-fatimah",
    title: "Tasbeeh-e-Fatimah",
    category: "daily",
    keywords: ["tasbeeh", "fatimah", "dhikr"],
    bookPages: buildBookPages(60),
  },
  {
    id: "some-prophetic-duas",
    title: "Some Prophetic duas",
    category: "special",
    keywords: ["prophetic duas", "dua collection"],
    bookPages: buildBookPages(61, 63),
  },
  {
    id: "beautiful-names-allah",
    title: "99 Beautiful Names of Allah",
    category: "iman",
    keywords: ["asma ul husna", "99 names of allah"],
    bookPages: buildBookPages(64, 67),
  },
  {
    id: "sayyidul-istighfaar",
    title: "Sayyidul Istighfaar",
    category: "protection",
    keywords: ["istighfar", "istigfar", "forgiveness", "sayyidul istighfar", "allahumma anta rabbi"],
    bookPages: buildBookPages(68),
  },
  {
    id: "durood-e-nabi",
    title: "Durood-e-Nabi",
    category: "salah",
    keywords: ["durood", "salawat", "nabi"],
    bookPages: buildBookPages(68),
  },
  {
    id: "upon-seeing-person-in-difficulty",
    title: "Dua upon seeing a person in difficulty",
    category: "protection",
    keywords: ["difficulty", "hardship"],
    bookPages: buildBookPages(69),
  },
  {
    id: "before-slaughtering-qurbani",
    title: "Dua before slaughtering a Qurbani animal",
    category: "qurbani",
    keywords: ["qurbani", "slaughter", "udhiyah"],
    bookPages: buildBookPages(69),
  },
  {
    id: "after-slaughtering-qurbani",
    title: "Dua after slaughtering a Qurbani animal",
    category: "qurbani",
    keywords: ["qurbani", "slaughter", "udhiyah"],
    bookPages: buildBookPages(70),
  },
  {
    id: "aqeeqah",
    title: "Dua-e-Aqeeqah",
    category: "family",
    keywords: ["aqeeqah", "child", "newborn"],
    bookPages: buildBookPages(70),
  },
  {
    id: "time-of-death",
    title: "Dua at the time of death",
    category: "janazah",
    keywords: ["death", "dying"],
    bookPages: buildBookPages(71),
  },
  {
    id: "talqeen-dying-person",
    title: "Talqeen for a dying person",
    category: "janazah",
    keywords: ["talqeen", "dying person"],
    bookPages: buildBookPages(71),
  },
  {
    id: "thana-janazah-salah",
    title: "Thana in Janazah salah",
    category: "janazah",
    keywords: ["janazah", "thana"],
    bookPages: buildBookPages(71),
  },
  {
    id: "entering-qabrastan",
    title: "Dua when entering the Qabrastan",
    category: "janazah",
    keywords: ["graveyard", "qabrastan"],
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah",
    title: "Dua-e-Janazah",
    category: "janazah",
    keywords: ["janazah", "funeral"],
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah-boy",
    title: "Dua-e-Janazah for a boy child",
    category: "janazah",
    keywords: ["janazah", "boy child"],
    bookPages: buildBookPages(72),
  },
  {
    id: "dua-janazah-girl",
    title: "Dua-e-Janazah for a girl child",
    category: "janazah",
    keywords: ["janazah", "girl child"],
    bookPages: buildBookPages(73),
  },
  {
    id: "isaal-e-thawaab",
    title: "Dua for Isaal-e-Thawaab",
    category: "janazah",
    keywords: ["isaal e thawaab", "reward"],
    bookPages: buildBookPages(73),
  },
  {
    id: "laying-deceased-in-qabr",
    title: "Dua while laying the deceased in Qabr",
    category: "janazah",
    keywords: ["qabr", "grave", "deceased"],
    bookPages: buildBookPages(74),
  },
  {
    id: "filling-qabr-with-soil",
    title: "Dua when filling the Qabr with soil",
    category: "janazah",
    keywords: ["grave", "soil", "qabr"],
    bookPages: buildBookPages(75),
  },
  {
    id: "excellence-of-durood-shareef",
    title: "Excellence of praying Durood Shareef",
    category: "salah",
    keywords: ["durood", "salawat"],
    bookPages: buildBookPages(75),
  },
  {
    id: "save-yourself-from-fitnah",
    title: "To save yourself from fitnah",
    category: "protection",
    keywords: ["fitnah", "temptation"],
    bookPages: buildBookPages(76),
  },
  {
    id: "relief-from-worries-debts",
    title: "Dua for relief from worries and debts",
    category: "protection",
    keywords: ["worries", "debts", "anxiety"],
    bookPages: buildBookPages(76),
  },
  {
    id: "durood-razwiyyah",
    title: "Durood-e-Razwiyyah",
    category: "salah",
    keywords: ["durood", "razwiyyah", "salawat"],
    bookPages: buildBookPages(76),
  },
  {
    id: "beautiful-names-prophet",
    title: "99 Beautiful Names of Prophet Muhammad ﷺ",
    category: "salah",
    keywords: ["99 names", "prophet muhammad", "asma"],
    bookPages: buildBookPages(77, 80),
  },
  {
    id: "istikharah",
    title: "Dua-e-Istikharah",
    category: "protection",
    keywords: ["istikharah", "guidance", "decision"],
    bookPages: buildBookPages(81),
  },
  {
    id: "lawh-e-quran",
    title: "Lawh-e-Quran",
    category: "quran",
    keywords: ["quran", "lawh"],
    bookPages: buildBookPages(82),
  },
  {
    id: "hajj-umrah",
    title: "Dua for Hajj and Umrah",
    category: "travel",
    keywords: ["hajj", "umrah", "travel"],
    bookPages: buildBookPages(83, 85),
  },
  {
    id: "dua-e-mathoorah",
    title: "Dua-e-Ma'thoorah",
    category: "daily",
    keywords: ["ma'thoorah", "morning", "evening"],
    bookPages: buildBookPages(86),
  },
  {
    id: "protection-from-accidents",
    title: "Dua for protection from accidents",
    category: "protection",
    keywords: ["accidents", "safety"],
    bookPages: buildBookPages(87),
  },
  {
    id: "method-isaal-e-thawaab",
    title: "Method of making Isaal-e-Thawaab",
    category: "janazah",
    keywords: ["isaal e thawaab", "method"],
    bookPages: buildBookPages(88),
  },
  {
    id: "extra-morning-evening-duas",
    title: "Extra duas in the morning and evening",
    category: "daily",
    keywords: ["morning", "evening", "adhkar"],
    bookPages: buildBookPages(90, 94),
  },
  {
    id: "munajaat",
    title: "Munajaat",
    category: "special",
    keywords: ["munajaat", "supplication"],
    bookPages: buildBookPages(95),
  },
  {
    id: "durood-taaj",
    title: "Durood-e-Taaj",
    category: "salah",
    keywords: ["durood", "taaj", "salawat"],
    bookPages: buildBookPages(96, 97),
  },
  {
    id: "salami-arabic",
    title: "Salami (Arabic)",
    category: "salah",
    keywords: ["salami", "arabic"],
    bookPages: buildBookPages(98),
  },
  {
    id: "salami-urdu",
    title: "Salami (Urdu)",
    category: "salah",
    keywords: ["salami", "urdu"],
    bookPages: buildBookPages(99),
  },
  {
    id: "qaseedah-burdah-shareef",
    title: "Qaseedah Burdah Shareef",
    category: "salah",
    keywords: ["burdah", "qaseedah", "salawat"],
    bookPages: buildBookPages(100),
  },
  {
    id: "dua-e-jameelah",
    title: "Dua-e-Jameelah",
    category: "special",
    keywords: ["jameelah", "dua"],
    bookPages: buildBookPages(101, 104),
  },
  {
    id: "khatm-e-qadiriah",
    title: "Khatm-e-Qadiriah",
    category: "special",
    keywords: ["qadiriah", "khatm"],
    bookPages: buildBookPages(105),
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
  duaStatus.textContent = "Loading duas...";
}

renderCategoryChips();
renderDuas();
