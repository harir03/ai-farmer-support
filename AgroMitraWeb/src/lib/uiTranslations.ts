// UI Translation system for multilingual content display
export interface UITranslations {
  common: Record<string, string>;
  navigation: Record<string, string>;
  navbar: Record<string, string>;
  tasks: Record<string, string>;
  community: Record<string, string>;
  groups: Record<string, string>;
  schemes: Record<string, string>;
  market: Record<string, string>;
  farm: Record<string, string>;
  home: Record<string, string>;
}

const englishUI: UITranslations = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error occurred",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    filter: "Filter",
    all: "All",
    none: "None",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    open: "Open"
  },
  navigation: {
    home: "Home",
    tasks: "Tasks",
    community: "Community",
    feed: "Feed",
    groups: "Groups",
    schemes: "Schemes",
    myFarm: "My Farm",
    marketPrices: "Market Prices",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout"
  },
  navbar: {
    languageToggle: "Switch Language"
  },
  tasks: {
    title: "Farm Tasks",
    subtitle: "Management",
    description: "Organize, track, and complete your daily farm operations efficiently",
    addNew: "Add New Task",
    filterTasks: "Filter Tasks",
    noTasks: "No tasks available",
    pending: "Pending",
    completed: "Completed",
    overdue: "Overdue",
    priority: "Priority",
    dueDate: "Due Date",
    assignedTo: "Assigned To",
    status: "Status",
    high: "High",
    medium: "Medium",
    low: "Low",
    irrigation: "Irrigation",
    fertilization: "Fertilization",
    pestControl: "Pest Control",
    harvesting: "Harvesting",
    maintenance: "Maintenance",
    livestock: "Livestock Care",
    planning: "Planning"
  },
  community: {
    title: "Community",
    feed: "Feed",
    groups: "Groups",
    feedDescription: "Connect with fellow farmers, share experiences, and learn from the community",
    groupsDescription: "Join specialized farming communities, share knowledge, and connect with experts",
    newPost: "What's happening on your farm?",
    writePost: "Write your post here...",
    post: "Post",
    like: "Like",
    comment: "Comment",
    share: "Share",
    members: "members",
    posts: "posts",
    joinGroup: "Join Group",
    viewGroup: "View Group",
    createPost: "Create Post"
  },
  groups: {
    searchGroups: "Search groups...",
    createGroup: "Create New Group",
    allGroups: "All Groups",
    sustainable: "Sustainable",
    equipment: "Equipment",
    crops: "Crops",
    livestock: "Livestock",
    technology: "Technology",
    business: "Business",
    joined: "Joined",
    recentActivity: "recent activity"
  },
  schemes: {
    title: "Government Schemes",
    subtitle: "Agricultural Benefits",
    description: "Explore government schemes and subsidies available for farmers to improve productivity and income",
    searchSchemes: "Search schemes...",
    allCategories: "All Categories",
    subsidies: "Subsidies",
    loans: "Loans", 
    insurance: "Insurance",
    training: "Training",
    equipment: "Equipment",
    organic: "Organic Farming",
    eligibility: "Eligibility",
    benefits: "Benefits",
    howToApply: "How to Apply",
    documents: "Required Documents",
    applyNow: "Apply Now",
    learnMore: "Learn More",
    status: "Application Status",
    active: "Active",
    closed: "Closed",
    upcoming: "Upcoming"
  },
  market: {
    title: "Market Prices Dashboard",
    description: "Real-time commodity prices, trends, and market insights for informed farming decisions",
    commodity: "Commodity",
    price: "Price",
    change: "Change",
    market: "Market",
    volume: "Volume",
    forecast: "Forecast",
    updated: "Updated",
    addAlert: "Add Alert",
    priceAlert: "Price Alert",
    bullish: "Bullish",
    bearish: "Bearish",
    neutral: "Neutral",
    up: "Up",
    down: "Down",
    stable: "Stable"
  },
  farm: {
    title: "My Farm",
    description: "Manage your farm areas and calculate field boundaries",
    findLocation: "Find My Location",
    drawBoundary: "Draw Boundary",
    calculateArea: "Calculate Area",
    addFarm: "Add New Farm",
    farmName: "Farm Name",
    farmSize: "Farm Size",
    soilType: "Soil Type",
    currentCrop: "Current Crop",
    instructions: "Click 'Find My Location', wait 4 seconds, then click 'Draw Boundary' and mark your field area"
  },
  home: {
    title: "AgroMitra",
    subtitle: "Real-time Voice Assistant",
    description: "Advanced AI farming companion with real-time voice interaction and comprehensive agricultural guidance",
    connect: "Connect to Voice Agent",
    connecting: "Connecting...",
    getStarted: "Get Started",
    aiReady: "AI Agent Ready"
  }
};

const hindiUI: UITranslations = {
  common: {
    welcome: "स्वागत",
    loading: "लोड हो रहा है...",
    error: "त्रुटि हुई",
    success: "सफलता",
    save: "सेव करें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    add: "जोड़ें",
    search: "खोजें",
    filter: "फ़िल्टर",
    all: "सभी",
    none: "कोई नहीं",
    yes: "हाँ",
    no: "नहीं",
    back: "वापस",
    next: "आगे",
    previous: "पिछला",
    close: "बंद करें",
    open: "खोलें"
  },
  navigation: {
    home: "होम",
    tasks: "कार्य",
    community: "समुदाय",
    feed: "फ़ीड",
    groups: "ग्रुप्स",
    schemes: "योजनाएं",
    myFarm: "मेरा फार्म",
    marketPrices: "बाज़ार की कीमतें",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट"
  },
  navbar: {
    languageToggle: "भाषा बदलें"
  },
  tasks: {
    title: "फार्म कार्य",
    subtitle: "प्रबंधन",
    description: "अपने दैनिक कृषि कार्यों को कुशलता से व्यवस्थित, ट्रैक और पूरा करें",
    addNew: "नया कार्य जोड़ें",
    filterTasks: "कार्य फ़िल्टर करें",
    noTasks: "कोई कार्य उपलब्ध नहीं",
    pending: "लंबित",
    completed: "पूर्ण",
    overdue: "विलंबित",
    priority: "प्राथमिकता",
    dueDate: "नियत तारीख",
    assignedTo: "सौंपा गया",
    status: "स्थिति",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    irrigation: "सिंचाई",
    fertilization: "उर्वरीकरण",
    pestControl: "कीट नियंत्रण",
    harvesting: "फसल कटाई",
    maintenance: "रखरखाव",
    livestock: "पशुधन देखभाल",
    planning: "योजना"
  },
  community: {
    title: "समुदाय",
    feed: "फ़ीड",
    groups: "ग्रुप्स",
    feedDescription: "साथी किसानों से जुड़ें, अनुभव साझा करें और समुदाय से सीखें",
    groupsDescription: "विशेषज्ञ कृषि समुदायों से जुड़ें, ज्ञान साझा करें और विशेषज्ञों से मिलें",
    newPost: "आपके फार्म पर क्या हो रहा है?",
    writePost: "अपनी पोस्ट यहाँ लिखें...",
    post: "पोस्ट करें",
    like: "पसंद",
    comment: "टिप्पणी",
    share: "साझा करें",
    members: "सदस्य",
    posts: "पोस्ट",
    joinGroup: "ग्रुप में शामिल हों",
    viewGroup: "ग्रुप देखें",
    createPost: "पोस्ट बनाएं"
  },
  groups: {
    searchGroups: "ग्रुप्स खोजें...",
    createGroup: "नया ग्रुप बनाएं",
    allGroups: "सभी ग्रुप्स",
    sustainable: "स्थायी",
    equipment: "उपकरण",
    crops: "फसलें",
    livestock: "पशुधन",
    technology: "तकनीक",
    business: "व्यापार",
    joined: "शामिल",
    recentActivity: "हाल की गतिविधि"
  },
  schemes: {
    title: "सरकारी योजनाएं",
    subtitle: "कृषि लाभ",
    description: "उत्पादकता और आय में सुधार के लिए किसानों के लिए उपलब्ध सरकारी योजनाओं और सब्सिडी का अन्वेषण करें",
    searchSchemes: "योजनाएं खोजें...",
    allCategories: "सभी श्रेणियां",
    subsidies: "सब्सिडी",
    loans: "ऋण",
    insurance: "बीमा",
    training: "प्रशिक्षण",
    equipment: "उपकरण",
    organic: "जैविक खेती",
    eligibility: "पात्रता",
    benefits: "लाभ",
    howToApply: "आवेदन कैसे करें",
    documents: "आवश्यक दस्तावेज़",
    applyNow: "अभी आवेदन करें",
    learnMore: "और जानें",
    status: "आवेदन स्थिति",
    active: "सक्रिय",
    closed: "बंद",
    upcoming: "आगामी"
  },
  market: {
    title: "बाज़ार मूल्य डैशबोर्ड",
    description: "सूचित कृषि निर्णयों के लिए रीयल-टाइम कमोडिटी कीमतें, रुझान और बाज़ार अंतर्दृष्टि",
    commodity: "वस्तु",
    price: "कीमत",
    change: "परिवर्तन",
    market: "बाज़ार",
    volume: "मात्रा",
    forecast: "पूर्वानुमान",
    updated: "अपडेटेड",
    addAlert: "अलर्ट जोड़ें",
    priceAlert: "कीमत अलर्ट",
    bullish: "तेजी",
    bearish: "मंदी",
    neutral: "तटस्थ",
    up: "ऊपर",
    down: "नीचे",
    stable: "स्थिर"
  },
  farm: {
    title: "मेरा फार्म",
    description: "अपने फार्म क्षेत्रों का प्रबंधन करें और खेत की सीमाओं की गणना करें",
    findLocation: "मेरा स्थान खोजें",
    drawBoundary: "सीमा बनाएं",
    calculateArea: "क्षेत्रफल गणना करें",
    addFarm: "नया फार्म जोड़ें",
    farmName: "फार्म का नाम",
    farmSize: "फार्म का आकार",
    soilType: "मिट्टी का प्रकार",
    currentCrop: "वर्तमान फसल",
    instructions: "'मेरा स्थान खोजें' पर क्लिक करें, 4 सेकंड प्रतीक्षा करें, फिर 'सीमा बनाएं' पर क्लिक करें और अपने खेत का क्षेत्र चिह्नित करें"
  },
  home: {
    title: "एग्रोमित्र",
    subtitle: "रीयल-टाइम वॉयस असिस्टेंट",
    description: "रीयल-टाइम वॉयस इंटरैक्शन और व्यापक कृषि मार्गदर्शन के साथ उन्नत AI कृषि साथी",
    connect: "वॉयस एजेंट से कनेक्ट करें",
    connecting: "कनेक्ट हो रहा है...",
    getStarted: "शुरू करें",
    aiReady: "AI एजेंट तैयार"
  }
};

export const uiTranslations = {
  en: englishUI,
  hi: hindiUI
};

// UI Translation helper function
export const getUIText = (
  key: string,
  language: 'en' | 'hi',
  section?: keyof UITranslations,
  fallback?: string
): string => {
  const translations = uiTranslations[language];
  
  if (section && translations[section] && translations[section][key]) {
    return translations[section][key];
  }
  
  // Try common section as fallback
  if (translations.common[key]) {
    return translations.common[key];
  }
  
  // Return fallback or key if nothing found
  return fallback || key;
};

// TTS function that always uses English
export const speakInEnglish = async (text: string) => {
  if (!window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 0.8;
  
  // Wait for voices to load and find English voice
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
  }
};

export default uiTranslations;