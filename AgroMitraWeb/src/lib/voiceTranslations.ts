// Comprehensive voice translation system for multi-language TTS support
export interface VoiceTranslations {
  common: Record<string, string>;
  tasks: Record<string, string>;
  community: Record<string, string>;
  groups: Record<string, string>;
  market: Record<string, string>;
  farm: Record<string, string>;
  home: Record<string, string>;
  ui: Record<string, string>;
}

const englishTranslations: VoiceTranslations = {
  common: {
    welcome: "Welcome to AI Farm Care",
    loading: "Loading content",
    error: "An error occurred",
    success: "Operation completed successfully",
    voiceOn: "Voice enabled",
    voiceOff: "Voice disabled",
    languageSwitch: "Language switched to English"
  },
  tasks: {
    welcomeMessage: "Your tasks are as follows:",
    taskCount: "You have {count} tasks",
    noTasks: "No tasks available at the moment",
    taskCompleted: "Task completed",
    newTaskAdded: "New task has been added",
    taskDetails: "{name} task with {status} status and {priority} priority",
    // Task names in English
    irrigation: "Irrigation",
    fertilization: "Fertilization", 
    "pest-control": "Pest Control",
    harvesting: "Harvesting",
    maintenance: "Maintenance",
    livestock: "Livestock Care",
    planning: "Planning"
  },
  community: {
    welcomeMessage: "Here are the latest community posts:",
    postCount: "There are {count} new posts",
    noPosts: "No posts available",
    userPosted: "{user} posted: {content}",
    newPostAdded: "New post added to community feed"
  },
  groups: {
    welcomeMessage: "Welcome to community groups. Here are the available groups:",
    groupCount: "There are {count} groups available",
    noGroups: "No groups available",
    groupInfo: "{name} group has {members} members. {description}",
    joinedGroup: "You have joined {name} group",
    leftGroup: "You have left {name} group",
    newGroup: "New group created"
  },
  market: {
    welcomeMessage: "Here are the current market prices:",
    priceCount: "Showing prices for {count} commodities",
    noPrices: "No market data available",
    priceInfo: "{commodity} is currently priced at {price} per {unit}, {change} from yesterday",
    priceAlert: "Price alert: {commodity} has reached your target price",
    marketUpdate: "Market prices updated"
  },
  farm: {
    welcomeMessage: "Welcome to your farm dashboard",
    areaInstruction: "to find area of your field click on find my location then wait for 4 seconds and then click draw boundary and click on the dots to create the area and click on the first point to finish marking the area",
    farmAdded: "New farm area has been added",
    areaCalculated: "Area calculated successfully"
  },
  home: {
    welcomeMessage: "Welcome to AgroMitra, your AI farming companion",
    startInstruction: "Click the green button to get started and talk with our AI agent",
    aiAgentReady: "Your AI agent is ready to help with all your farming needs",
    getStarted: "Get started now by clicking the connect button"
  },
  ui: {
    speakText: "Click to hear this content",
    stopSpeaking: "Stop speaking",
    switchLanguage: "Switch to Hindi",
    readAll: "Read all content",
    skipReading: "Skip reading"
  }
};

const hindiTranslations: VoiceTranslations = {
  common: {
    welcome: "एआई फार्म केयर में आपका स्वागत है",
    loading: "सामग्री लोड हो रही है",
    error: "एक त्रुटि हुई है",
    success: "कार्य सफलतापूर्वक पूरा हुआ",
    voiceOn: "आवाज़ चालू है",
    voiceOff: "आवाज़ बंद है",
    languageSwitch: "भाषा हिंदी में बदल गई"
  },
  tasks: {
    welcomeMessage: "आपके कार्य निम्नलिखित हैं:",
    taskCount: "आपके पास {count} कार्य हैं",
    noTasks: "फिलहाल कोई कार्य उपलब्ध नहीं है",
    taskCompleted: "कार्य पूरा हुआ",
    newTaskAdded: "नया कार्य जोड़ा गया है",
    taskDetails: "{name} कार्य {status} स्थिति और {priority} प्राथमिकता के साथ",
    // Task names in Hindi
    irrigation: "सिंचाई",
    fertilization: "उर्वरीकरण",
    "pest-control": "कीट नियंत्रण", 
    harvesting: "फसल कटाई",
    maintenance: "रखरखाव",
    livestock: "पशुधन देखभाल",
    planning: "योजना"
  },
  community: {
    welcomeMessage: "यहाँ नवीनतम समुदायिक पोस्ट हैं:",
    postCount: "{count} नई पोस्ट हैं",
    noPosts: "कोई पोस्ट उपलब्ध नहीं है",
    userPosted: "{user} ने पोस्ट किया: {content}",
    newPostAdded: "कम्युनिटी फ़ीड में नई पोस्ट जोड़ी गई"
  },
  groups: {
    welcomeMessage: "कम्युनिटी ग्रुप्स में आपका स्वागत है। यहाँ उपलब्ध ग्रुप्स हैं:",
    groupCount: "{count} ग्रुप्स उपलब्ध हैं",
    noGroups: "कोई ग्रुप्स उपलब्ध नहीं हैं",
    groupInfo: "{name} ग्रुप में {members} सदस्य हैं। {description}",
    joinedGroup: "आपने {name} ग्रुप ज्वाइन किया है",
    leftGroup: "आपने {name} ग्रुप छोड़ दिया है",
    newGroup: "नया ग्रुप बनाया गया"
  },
  market: {
    welcomeMessage: "यहाँ वर्तमान बाज़ार दरें हैं:",
    priceCount: "{count} वस्तुओं की कीमतें दिखाई जा रही हैं",
    noPrices: "कोई बाज़ार डेटा उपलब्ध नहीं है",
    priceInfo: "{commodity} की वर्तमान कीमत {price} प्रति {unit} है, कल से {change}",
    priceAlert: "कीमत अलर्ट: {commodity} आपकी लक्षित कीमत तक पहुँच गया है",
    marketUpdate: "बाज़ार की कीमतें अपडेट हुईं"
  },
  farm: {
    welcomeMessage: "आपके फार्म डैशबोर्ड में आपका स्वागत है",
    areaInstruction: "अपने खेत का क्षेत्रफल जानने के लिए मेरा स्थान खोजें पर क्लिक करें फिर 4 सेकंड प्रतीक्षा करें और फिर सीमा बनाएं पर क्लिक करें और क्षेत्र बनाने के लिए बिंदुओं पर क्लिक करें और क्षेत्र को चिह्नित करना समाप्त करने के लिए पहले बिंदु पर क्लिक करें",
    farmAdded: "नया फार्म क्षेत्र जोड़ा गया है",
    areaCalculated: "क्षेत्रफल सफलतापूर्वक गणना की गई"
  },
  home: {
    welcomeMessage: "एग्रोमित्र में आपका स्वागत है, आपका AI कृषि साथी",
    startInstruction: "शुरू करने के लिए हरे बटन पर क्लिक करें और हमारे AI एजेंट से बात करें",
    aiAgentReady: "आपका AI एजेंट आपकी सभी कृषि आवश्यकताओं में मदद के लिए तैयार है",
    getStarted: "कनेक्ट बटन पर क्लिक करके अभी शुरू करें"
  },
  ui: {
    speakText: "इस सामग्री को सुनने के लिए क्लिक करें",
    stopSpeaking: "बोलना बंद करें", 
    switchLanguage: "अंग्रेजी में बदलें",
    readAll: "सभी सामग्री पढ़ें",
    skipReading: "पढ़ना छोड़ें"
  }
};

// Voice configuration for different languages
const getVoiceConfig = (language: 'en' | 'hi') => {
  const configs = {
    en: {
      lang: 'en-US',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      preferredVoice: 'Google US English',
      voiceFilter: (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('en-US') || voice.lang.includes('en-GB')
    },
    hi: {
      lang: 'hi-IN',
      rate: 0.8,
      pitch: 1.1,
      volume: 1.0,
      preferredVoice: 'Google हिन्दी',
      voiceFilter: (voice: SpeechSynthesisVoice) => 
        voice.lang.includes('hi') || 
        (voice.lang.includes('en') && voice.name.includes('Google'))
    }
  };
  
  return configs[language] || configs.en;
};

export const voiceTranslations = {
  en: englishTranslations,
  hi: hindiTranslations
};

// Utility functions for translation system
export const getTranslatedText = (
  key: string,
  language: 'en' | 'hi',
  section?: 'tasks' | 'community' | 'groups' | 'market' | 'farm' | 'home',
  replacements?: Record<string, string>
): string => {
  const translations = voiceTranslations[language];
  let text = '';

  if (section) {
    // @ts-ignore - Dynamic key access
    text = translations[section][key] || translations.common[key] || key;
  } else {
    text = translations.common[key] || key;
  }

  // Replace placeholders
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{${placeholder}}`, value);
    });
  }

  return text;
};

export const configureVoiceForLanguage = (language: 'en' | 'hi') => {
  const voiceConfig = getVoiceConfig(language);
  
  return new Promise<SpeechSynthesisVoice | null>((resolve) => {
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => 
        v.lang.startsWith(voiceConfig.lang) || 
        v.name.includes(voiceConfig.preferredVoice)
      ) || voices[0];
      
      resolve(voice);
    };

    if (speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }
  });
};

export const speakTextWithLanguage = async (
  key: string,
  language: 'en' | 'hi',
  section?: 'tasks' | 'community' | 'groups' | 'market' | 'farm' | 'home',
  replacements?: Record<string, string>
) => {
  const text = getTranslatedText(key, language, section, replacements);
  const voice = await configureVoiceForLanguage(language);
  const voiceConfig = getVoiceConfig(language);

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = voiceConfig.rate;
  utterance.pitch = voiceConfig.pitch;
  utterance.volume = voiceConfig.volume;

  speechSynthesis.speak(utterance);
};

export default voiceTranslations;