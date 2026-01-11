import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Language resources
const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      community: 'Community',
      tasks: 'Tasks',
      myFarm: 'My Farm',
      marketPrices: 'Market Prices',
      cropRecommendations: 'Crop Recommendations',
      more: 'More',

      // Voice Agent
      voiceAgent: {
        title: 'AgroMitra Voice Assistant',
        subtitle: 'Your AI-powered farming companion',
        startListening: 'Start Voice Chat',
        listening: 'Listening...',
        processing: 'Processing your request...',
        stopListening: 'Stop Listening',
        greeting: 'Hello! I\'m AgroMitra, your farming assistant. How can I help you today?',
        
        // Navigation prompts
        taskNavigation: 'I can help you manage your farming tasks. Let me redirect you to the Tasks section where you can add, view, and complete your farming activities.',
        farmNavigation: 'To provide accurate recommendations, I need information about your farm. Let me take you to the My Farm section to set up your land details.',
        marketNavigation: 'Let me show you the latest market prices for your crops in the Market Prices section.',
        communityNavigation: 'Connect with fellow farmers in our Community section for tips, discussions, and local insights.',
        
        // Context gathering
        needLandInfo: 'To give you accurate recommendations, I need to know about your land area. Please go to My Farm section and add your field details first.',
        needCropInfo: 'What crops are you currently growing or planning to grow?',
        needLocationInfo: 'What is your farm location? This helps me provide location-specific advice.',
        
        // Error messages
        noAudioSupport: 'Voice features are not supported in your browser. Please try using a modern browser like Chrome or Firefox.',
        microphoneError: 'Could not access microphone. Please check permissions and try again.',
        processingError: 'Sorry, I had trouble processing your request. Please try again.',
        
        // Function responses
        weatherResponse: 'Here\'s the weather information for your area:',
        cropRecommendationResponse: 'Based on your farm conditions, here are my crop recommendations:',
        marketPriceResponse: 'Here are the current market prices:',
        taskResponse: 'I\'ve found some important tasks for you:',
        diseaseResponse: 'Based on the symptoms you described, here\'s what I found:',
      },

      // Common terms
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        continue: 'Continue',
        back: 'Back',
        next: 'Next',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        remove: 'Remove',
        view: 'View',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        retry: 'Retry'
      },

      // Farm Management
      farm: {
        myFarm: 'My Farm',
        addField: 'Add New Field',
        fieldName: 'Field Name',
        fieldSize: 'Field Size (acres)',
        soilType: 'Soil Type',
        cropType: 'Current Crop',
        irrigationType: 'Irrigation Type',
        lastUpdated: 'Last Updated',
        totalArea: 'Total Farm Area',
        activeFields: 'Active Fields',
        calculateArea: 'Calculate Area',
        fieldAdded: 'Field added successfully!',
        fieldUpdated: 'Field updated successfully!',
        fieldDeleted: 'Field deleted successfully!',
        noFields: 'No fields added yet. Start by adding your first field.',
      },

      // Tasks
      task: {
        farmingTasks: 'Farming Tasks',
        addTask: 'Add New Task',
        taskName: 'Task Name',
        taskDescription: 'Task Description',
        dueDate: 'Due Date',
        priority: 'Priority',
        category: 'Category',
        status: 'Status',
        completed: 'Completed',
        pending: 'Pending',
        overdue: 'Overdue',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        planting: 'Planting',
        irrigation: 'Irrigation',
        fertilization: 'Fertilization',
        pestControl: 'Pest Control',
        harvesting: 'Harvesting',
        maintenance: 'Maintenance',
        taskCompleted: 'Task marked as completed!',
        taskAdded: 'Task added successfully!',
        taskDeleted: 'Task deleted successfully!',
        noTasks: 'No tasks found. Add your first farming task.',
      },

      // Market Prices
      market: {
        marketPrices: 'Market Prices',
        crop: 'Crop',
        price: 'Price',
        unit: 'Unit',
        market: 'Market',
        date: 'Date',
        trend: 'Trend',
        priceIncreasing: 'Price Increasing',
        priceDecreasing: 'Price Decreasing',
        priceStable: 'Price Stable',
        lastUpdated: 'Last Updated',
        refreshPrices: 'Refresh Prices',
        noPrices: 'No market data available.',
      },

      // Weather
      weather: {
        currentWeather: 'Current Weather',
        temperature: 'Temperature',
        humidity: 'Humidity',
        windSpeed: 'Wind Speed',
        pressure: 'Pressure',
        forecast: 'Weather Forecast',
        precipitation: 'Precipitation',
        weatherAdvice: 'Farming Advice Based on Weather',
      }
    }
  },
  
  hi: {
    translation: {
      // Navigation
      home: 'मुख्य',
      community: 'समुदाय',
      tasks: 'कार्य',
      myFarm: 'मेरा खेत',
      marketPrices: 'बाज़ार भाव',
      cropRecommendations: 'फसल सुझाव',
      more: 'और',

      // Voice Agent
      voiceAgent: {
        title: 'एग्रोमित्र वॉयस असिस्टेंट',
        subtitle: 'आपका एआई-संचालित कृषि साथी',
        startListening: 'वॉयस चैट शुरू करें',
        listening: 'सुन रहा है...',
        processing: 'आपके अनुरोध को संसाधित कर रहा है...',
        stopListening: 'सुनना बंद करें',
        greeting: 'नमस्कार! मैं एग्रोमित्र हूँ, आपका कृषि सहायक। आज मैं आपकी कैसे सहायता कर सकता हूँ?',
        
        // Navigation prompts
        taskNavigation: 'मैं आपके कृषि कार्यों के प्रबंधन में सहायता कर सकता हूँ। मैं आपको कार्य अनुभाग में भेजता हूँ जहाँ आप अपनी कृषि गतिविधियों को जोड़, देख और पूरा कर सकते हैं।',
        farmNavigation: 'सटीक सुझाव देने के लिए, मुझे आपके खेत की जानकारी चाहिए। मैं आपको मेरा खेत अनुभाग में ले जाता हूँ।',
        marketNavigation: 'मैं आपको बाज़ार भाव अनुभाग में आपकी फसलों की नवीनतम कीमतें दिखाता हूँ।',
        communityNavigation: 'समुदाय अनुभाग में साथी किसानों से जुड़ें।',
        
        // Context gathering
        needLandInfo: 'सटीक सुझाव देने के लिए, मुझे आपकी भूमि का क्षेत्रफल जानना आवश्यक है। कृपया पहले मेरा खेत अनुभाग में जाकर अपनी खेत की जानकारी जोड़ें।',
        needCropInfo: 'आप वर्तमान में कौन सी फसलें उगा रहे हैं या उगाने की योजना बना रहे हैं?',
        needLocationInfo: 'आपके खेत का स्थान क्या है? यह मुझे स्थान-विशिष्ट सलाह देने में मदद करता है।',
        
        // Error messages
        noAudioSupport: 'आपके ब्राउज़र में वॉयस सुविधाएं समर्थित नहीं हैं। कृपया Chrome या Firefox जैसे आधुनिक ब्राउज़र का उपयोग करें।',
        microphoneError: 'माइक्रोफ़ोन तक पहुँच नहीं हो सकी। कृपया अनुमतियाँ जाँचें और पुनः प्रयास करें।',
        processingError: 'खुशी है, आपके अनुरोध को संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें।',
        
        // Function responses
        weatherResponse: 'यहाँ आपके क्षेत्र की मौसम जानकारी है:',
        cropRecommendationResponse: 'आपकी खेत की स्थिति के आधार पर, यहाँ मेरे फसल सुझाव हैं:',
        marketPriceResponse: 'यहाँ वर्तमान बाज़ार भाव हैं:',
        taskResponse: 'मैंने आपके लिए कुछ महत्वपूर्ण कार्य खोजे हैं:',
        diseaseResponse: 'आपके द्वारा वर्णित लक्षणों के आधार पर, यहाँ है जो मैंने पाया:',
      },

      // Common terms
      common: {
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
        cancel: 'रद्द करें',
        continue: 'जारी रखें',
        back: 'वापस',
        next: 'अगला',
        save: 'सहेजें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        add: 'जोड़ें',
        remove: 'हटाएं',
        view: 'देखें',
        close: 'बंद करें',
        confirm: 'पुष्टि करें',
        yes: 'हाँ',
        no: 'नहीं',
        ok: 'ठीक है',
        retry: 'पुनः प्रयास'
      },

      // Farm Management
      farm: {
        myFarm: 'मेरा खेत',
        addField: 'नया खेत जोड़ें',
        fieldName: 'खेत का नाम',
        fieldSize: 'खेत का आकार (एकड़)',
        soilType: 'मिट्टी का प्रकार',
        cropType: 'वर्तमान फसल',
        irrigationType: 'सिंचाई का प्रकार',
        lastUpdated: 'अंतिम अपडेट',
        totalArea: 'कुल खेत क्षेत्र',
        activeFields: 'सक्रिय खेत',
        calculateArea: 'क्षेत्रफल गणना',
        fieldAdded: 'खेत सफलतापूर्वक जोड़ा गया!',
        fieldUpdated: 'खेत सफलतापूर्वक अपडेट किया गया!',
        fieldDeleted: 'खेत सफलतापूर्वक हटाया गया!',
        noFields: 'अभी तक कोई खेत नहीं जोड़ा गया। अपना पहला खेत जोड़कर शुरुआत करें।',
      },

      // Tasks
      task: {
        farmingTasks: 'कृषि कार्य',
        addTask: 'नया कार्य जोड़ें',
        taskName: 'कार्य का नाम',
        taskDescription: 'कार्य विवरण',
        dueDate: 'समय सीमा',
        priority: 'प्राथमिकता',
        category: 'श्रेणी',
        status: 'स्थिति',
        completed: 'पूर्ण',
        pending: 'लंबित',
        overdue: 'समय सीमा समाप्त',
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'निम्न',
        planting: 'बुआई',
        irrigation: 'सिंचाई',
        fertilization: 'उर्वरीकरण',
        pestControl: 'कीट नियंत्रण',
        harvesting: 'कटाई',
        maintenance: 'रखरखाव',
        taskCompleted: 'कार्य पूर्ण के रूप में चिह्नित!',
        taskAdded: 'कार्य सफलतापूर्वक जोड़ा गया!',
        taskDeleted: 'कार्य सफलतापूर्वक हटाया गया!',
        noTasks: 'कोई कार्य नहीं मिला। अपना पहला कृषि कार्य जोड़ें।',
      },

      // Market Prices
      market: {
        marketPrices: 'बाज़ार भाव',
        crop: 'फसल',
        price: 'भाव',
        unit: 'इकाई',
        market: 'बाज़ार',
        date: 'तारीख',
        trend: 'रुझान',
        priceIncreasing: 'भाव बढ़ रहा है',
        priceDecreasing: 'भाव गिर रहा है',
        priceStable: 'भाव स्थिर है',
        lastUpdated: 'अंतिम अपडेट',
        refreshPrices: 'भाव रीफ्रेश करें',
        noPrices: 'कोई बाज़ार डेटा उपलब्ध नहीं है।',
      },

      // Weather
      weather: {
        currentWeather: 'वर्तमान मौसम',
        temperature: 'तापमान',
        humidity: 'नमी',
        windSpeed: 'हवा की गति',
        pressure: 'दबाव',
        forecast: 'मौसम पूर्वानुमान',
        precipitation: 'वर्षा',
        weatherAdvice: 'मौसम के आधार पर कृषि सलाह',
      }
    }
  },
  
  es: {
    translation: {
      // Navigation
      home: 'Inicio',
      community: 'Comunidad',
      tasks: 'Tareas',
      myFarm: 'Mi Granja',
      marketPrices: 'Precios de Mercado',
      cropRecommendations: 'Recomendaciones de Cultivos',
      more: 'Más',

      // Voice Agent
      voiceAgent: {
        title: 'Asistente de Voz AgroMitra',
        subtitle: 'Tu compañero agrícola impulsado por IA',
        startListening: 'Iniciar Chat de Voz',
        listening: 'Escuchando...',
        processing: 'Procesando tu solicitud...',
        stopListening: 'Dejar de Escuchar',
        greeting: '¡Hola! Soy AgroMitra, tu asistente agrícola. ¿Cómo puedo ayudarte hoy?',
        
        // Navigation prompts
        taskNavigation: 'Puedo ayudarte a gestionar tus tareas agrícolas. Te redirijo a la sección de Tareas donde puedes agregar, ver y completar tus actividades agrícolas.',
        farmNavigation: 'Para proporcionar recomendaciones precisas, necesito información sobre tu granja. Te llevo a la sección Mi Granja para configurar los detalles de tu tierra.',
        marketNavigation: 'Te muestro los últimos precios de mercado para tus cultivos en la sección de Precios de Mercado.',
        communityNavigation: 'Conecta con otros agricultores en nuestra sección de Comunidad para consejos, discusiones y perspectivas locales.',
        
        // Context gathering
        needLandInfo: 'Para darte recomendaciones precisas, necesito saber sobre el área de tu tierra. Por favor ve a la sección Mi Granja y agrega los detalles de tu campo primero.',
        needCropInfo: '¿Qué cultivos estás cultivando actualmente o planeas cultivar?',
        needLocationInfo: '¿Cuál es la ubicación de tu granja? Esto me ayuda a proporcionar consejos específicos de la ubicación.',
        
        // Error messages
        noAudioSupport: 'Las funciones de voz no son compatibles en tu navegador. Por favor intenta usar un navegador moderno como Chrome o Firefox.',
        microphoneError: 'No se pudo acceder al micrófono. Por favor verifica los permisos e intenta de nuevo.',
        processingError: 'Lo siento, tuve problemas procesando tu solicitud. Por favor intenta de nuevo.',
        
        // Function responses
        weatherResponse: 'Aquí está la información del clima para tu área:',
        cropRecommendationResponse: 'Basado en las condiciones de tu granja, aquí están mis recomendaciones de cultivos:',
        marketPriceResponse: 'Aquí están los precios actuales del mercado:',
        taskResponse: 'He encontrado algunas tareas importantes para ti:',
        diseaseResponse: 'Basado en los síntomas que describiste, esto es lo que encontré:',
      },

      // Common terms
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        continue: 'Continuar',
        back: 'Atrás',
        next: 'Siguiente',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        add: 'Agregar',
        remove: 'Quitar',
        view: 'Ver',
        close: 'Cerrar',
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        retry: 'Reintentar'
      },

      // Farm Management (Spanish translations would continue here...)
      farm: {
        myFarm: 'Mi Granja',
        addField: 'Agregar Nuevo Campo',
        fieldName: 'Nombre del Campo',
        fieldSize: 'Tamaño del Campo (acres)',
        soilType: 'Tipo de Suelo',
        cropType: 'Cultivo Actual',
        irrigationType: 'Tipo de Irrigación',
        lastUpdated: 'Última Actualización',
        totalArea: 'Área Total de la Granja',
        activeFields: 'Campos Activos',
        calculateArea: 'Calcular Área',
        fieldAdded: '¡Campo agregado exitosamente!',
        fieldUpdated: '¡Campo actualizado exitosamente!',
        fieldDeleted: '¡Campo eliminado exitosamente!',
        noFields: 'Aún no se han agregado campos. Comienza agregando tu primer campo.',
      }
    }
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;

// Helper hook for translations
export const useTranslation = () => {
  const { t, i18n } = require('react-i18next');
  
  return {
    t,
    changeLanguage: i18n.changeLanguage,
    currentLanguage: i18n.language,
    languages: ['en', 'hi', 'es'],
    getLanguageName: (code: string) => {
      const names: Record<string, string> = {
        en: 'English',
        hi: 'हिन्दी',
        es: 'Español'
      };
      return names[code] || code;
    }
  };
};