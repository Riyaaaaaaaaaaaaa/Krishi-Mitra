import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Resources() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('videos')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [playingVideo, setPlayingVideo] = useState(null)

  // YouTube videos for farming education
  const videos = [
    // Farming Techniques
    {
      id: 1,
      title: 'Modern Farming Techniques in India',
      titleHi: 'भारत में आधुनिक कृषि तकनीकें',
      description: 'Learn about latest farming technologies and methods',
      descriptionHi: 'नवीनतम कृषि प्रौद्योगिकियों और विधियों के बारे में जानें',
      videoId: 'pz6F1Bc8eyg',
      category: 'techniques',
      duration: '10:30',
      views: '2.5M'
    },
    {
      id: 2,
      title: 'Advanced Farming Methods',
      titleHi: 'उन्नत कृषि विधियां',
      description: 'Innovative techniques for better crop production',
      descriptionHi: 'बेहतर फसल उत्पादन के लिए नवीन तकनीकें',
      videoId: 'JDMglfDdTJU',
      category: 'techniques',
      duration: '12:45',
      views: '1.8M'
    },
    {
      id: 3,
      title: 'Sustainable Farming Practices',
      titleHi: 'टिकाऊ कृषि पद्धतियां',
      description: 'Eco-friendly and sustainable agriculture methods',
      descriptionHi: 'पर्यावरण के अनुकूल और टिकाऊ कृषि विधियां',
      videoId: 'ZdxD_1aNI-c',
      category: 'techniques',
      duration: '15:20',
      views: '1.2M'
    },
    // Organic Farming
    {
      id: 4,
      title: 'Organic Farming - Complete Guide',
      titleHi: 'जैविक खेती - पूर्ण मार्गदर्शिका',
      description: 'Step by step guide to start organic farming',
      descriptionHi: 'जैविक खेती शुरू करने के लिए चरण दर चरण मार्गदर्शिका',
      videoId: '5Rem_w2CHhI',
      category: 'organic',
      duration: '15:30',
      views: '2.1M'
    },
    {
      id: 5,
      title: 'Benefits of Organic Agriculture',
      titleHi: 'जैविक कृषि के लाभ',
      description: 'Understanding organic farming advantages',
      descriptionHi: 'जैविक खेती के फायदे समझें',
      videoId: '2qiNKen-rm0',
      category: 'organic',
      duration: '11:45',
      views: '950K'
    },
    // Soil Management
    {
      id: 6,
      title: 'Soil Testing and Management',
      titleHi: 'मिट्टी परीक्षण और प्रबंधन',
      description: 'Understanding soil health and nutrient management',
      descriptionHi: 'मिट्टी के स्वास्थ्य और पोषक तत्व प्रबंधन को समझें',
      videoId: '8MlX1xA5skM',
      category: 'soil',
      duration: '14:15',
      views: '1.5M'
    },
    {
      id: 7,
      title: 'Soil Health Improvement',
      titleHi: 'मिट्टी स्वास्थ्य सुधार',
      description: 'Methods to improve and maintain soil fertility',
      descriptionHi: 'मिट्टी की उर्वरता बढ़ाने और बनाए रखने के तरीके',
      videoId: 'WcMd7yvbqiM',
      category: 'soil',
      duration: '13:20',
      views: '880K'
    },
    // Crop Protection
    {
      id: 8,
      title: 'Pest and Disease Management',
      titleHi: 'कीट और रोग प्रबंधन',
      description: 'Natural and chemical methods for crop protection',
      descriptionHi: 'फसल सुरक्षा के लिए प्राकृतिक और रासायनिक तरीके',
      videoId: 'uVNjlzIJs2I',
      category: 'protection',
      duration: '11:50',
      views: '1.3M'
    },
    // Smart Farming
    {
      id: 9,
      title: 'Smart Farming with IoT',
      titleHi: 'IoT के साथ स्मार्ट खेती',
      description: 'Using technology to optimize farm operations',
      descriptionHi: 'खेत संचालन को अनुकूलित करने के लिए प्रौद्योगिकी का उपयोग',
      videoId: 'XUwptP0_v00',
      category: 'technology',
      duration: '13:40',
      views: '1.9M'
    },
    {
      id: 10,
      title: 'Modern Agricultural Technology',
      titleHi: 'आधुनिक कृषि प्रौद्योगिकी',
      description: 'Latest innovations in agriculture',
      descriptionHi: 'कृषि में नवीनतम नवाचार',
      videoId: 'j8L77seGdSA',
      category: 'technology',
      duration: '16:25',
      views: '1.6M'
    },
    // Irrigation
    {
      id: 11,
      title: 'Drip Irrigation System Installation',
      titleHi: 'ड्रिप सिंचाई प्रणाली स्थापना',
      description: 'How to install and maintain drip irrigation',
      descriptionHi: 'ड्रिप सिंचाई स्थापित और बनाए रखने का तरीका',
      videoId: 'fzkUcH0WuDU',
      category: 'irrigation',
      duration: '10:20',
      views: '1.1M'
    },
    {
      id: 12,
      title: 'Water Conservation Techniques',
      titleHi: 'जल संरक्षण तकनीकें',
      description: 'Effective methods to save water in agriculture',
      descriptionHi: 'कृषि में पानी बचाने के प्रभावी तरीके',
      videoId: 'jDXGPw0VP6A',
      category: 'irrigation',
      duration: '8:45',
      views: '820K'
    },
    {
      id: 13,
      title: 'Modern Irrigation Systems',
      titleHi: 'आधुनिक सिंचाई प्रणालियां',
      description: 'Advanced irrigation solutions for farmers',
      descriptionHi: 'किसानों के लिए उन्नत सिंचाई समाधान',
      videoId: '-a34NOcADE8',
      category: 'irrigation',
      duration: '12:15',
      views: '750K'
    }
  ]

  const resources = [
    {
      category: t('app.resources.governmentSchemes'),
      icon: '🏛️',
      items: [
        { 
          title: 'PM-KISAN',
          titleHi: 'पीएम-किसान',
          description: 'Direct income support of ₹6000/year to farmer families',
          descriptionHi: 'किसान परिवारों को ₹6000/वर्ष की प्रत्यक्ष आय सहायता',
          link: 'https://pmkisan.gov.in/',
          external: true
        },
        { 
          title: 'PM Fasal Bima Yojana',
          titleHi: 'पीएम फसल बीमा योजना',
          description: 'Crop insurance scheme for farmers',
          descriptionHi: 'किसानों के लिए फसल बीमा योजना',
          link: 'https://pmfby.gov.in/',
          external: true
        },
        { 
          title: 'Soil Health Card',
          titleHi: 'मृदा स्वास्थ्य कार्ड',
          description: 'Get your soil tested for free',
          descriptionHi: 'अपनी मिट्टी का मुफ्त परीक्षण कराएं',
          link: 'https://soilhealth.dac.gov.in/',
          external: true
        },
        { 
          title: 'Kisan Credit Card',
          titleHi: 'किसान क्रेडिट कार्ड',
          description: 'Easy credit facility for farmers',
          descriptionHi: 'किसानों के लिए आसान ऋण सुविधा',
          link: 'https://pmkisan.gov.in/KCCReg/KCCMain.aspx',
          external: true
        }
      ]
    },
    {
      category: t('app.resources.marketPricing'),
      icon: '📊',
      items: [
        { 
          title: 'eNAM Portal',
          titleHi: 'ई-नाम पोर्टल',
          description: 'National Agriculture Market platform',
          descriptionHi: 'राष्ट्रीय कृषि बाजार मंच',
          link: 'https://enam.gov.in/web/',
          external: true
        },
        { 
          title: 'MSP Rates 2024-25',
          titleHi: 'एमएसपी दरें 2024-25',
          description: 'Current Minimum Support Prices',
          descriptionHi: 'वर्तमान न्यूनतम समर्थन मूल्य',
          link: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2131983',
          external: true
        },
        { 
          title: 'Mandi Prices',
          titleHi: 'मंडी कीमतें',
          description: 'Daily market rates across India',
          descriptionHi: 'भारत भर में दैनिक बाजार दरें',
          link: 'https://agmarknet.gov.in/',
          external: true
        }
      ]
    },
    {
      category: t('app.resources.learningResources'),
      icon: '📚',
      items: [
        { 
          title: 'Kisan Vigyan Kendra',
          titleHi: 'कृषि विज्ञान केंद्र',
          description: 'Find KVK centers in your district',
          descriptionHi: 'अपने जिले में KVK केंद्र खोजें',
          link: 'https://www.icar.org.in/en/krishi-vigyan-kendras',
          external: true
        },
        { 
          title: 'ICAR Research',
          titleHi: 'आईसीएआर अनुसंधान',
          description: 'Agricultural research and technology',
          descriptionHi: 'कृषि अनुसंधान और प्रौद्योगिकी',
          link: 'https://icar.org.in/',
          external: true
        },
        { 
          title: 'Kisan Portal',
          titleHi: 'किसान पोर्टल',
          description: 'One-stop shop for farmers',
          descriptionHi: 'किसानों के लिए वन-स्टॉप शॉप',
          link: 'https://fasalrin.gov.in/',
          external: true
        }
      ]
    }
  ]

  const categories = [
    { id: 'all', label: t('app.resources.allVideos'), icon: '🎬' },
    { id: 'techniques', label: t('app.resources.farmingTechniques'), icon: '🚜' },
    { id: 'organic', label: t('app.resources.organicFarming'), icon: '🌱' },
    { id: 'irrigation', label: t('app.resources.irrigation'), icon: '💧' },
    { id: 'soil', label: t('app.resources.soilManagement'), icon: '🌾' },
    { id: 'protection', label: t('app.resources.cropProtection'), icon: '🛡️' },
    { id: 'technology', label: t('app.resources.smartFarming'), icon: '💻' }
  ]

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('app.resources.pageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('app.resources.pageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'videos'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🎥 {t('app.resources.videoTutorials')}
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'schemes'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🏛️ {t('app.resources.governmentSchemes')}
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'links'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🔗 {t('app.resources.usefulLinks')}
        </button>
      </div>

      {/* Video Tutorials Tab */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* YouTube Thumbnail or Embed */}
                <div className="relative aspect-video bg-gray-900">
                  {playingVideo === video.id ? (
                    // Show iframe when playing
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    // Show thumbnail when not playing
                    <div 
                      className="relative w-full h-full cursor-pointer group"
                      onClick={() => setPlayingVideo(video.id)}
                    >
                      {/* YouTube Thumbnail */}
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to standard quality thumbnail if maxresdefault doesn't exist
                          e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                        }}
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all">
                        <div className="bg-red-600 rounded-full p-4 transform group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
                    {i18n.language === 'hi' && video.titleHi ? video.titleHi : video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {i18n.language === 'hi' && video.descriptionHi ? video.descriptionHi : video.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {video.views} {t('app.resources.views')}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {video.duration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Videos Message */}
          {filteredVideos.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <span className="text-6xl mb-4 block">🎥</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('app.resources.noVideos')}</h3>
              <p className="text-gray-600">{t('app.resources.tryDifferent')}</p>
            </div>
          )}
        </div>
      )}

      {/* Government Schemes Tab */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {resources.filter(r => r.category === t('app.resources.governmentSchemes')).map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{section.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 hover:shadow-md transition-all border border-green-200 hover:border-green-400"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                          {i18n.language === 'hi' && item.titleHi ? item.titleHi : item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {i18n.language === 'hi' && item.descriptionHi ? item.descriptionHi : item.description}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-green-600 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                      <span>{t('app.resources.visitWebsite')}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Useful Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {resources.filter(r => r.category !== t('app.resources.governmentSchemes')).map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{section.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 hover:border-green-400"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {i18n.language === 'hi' && item.titleHi ? item.titleHi : item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {i18n.language === 'hi' && item.descriptionHi ? item.descriptionHi : item.description}
                    </p>
                    <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                      <span>{t('app.resources.learnMore')}</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Helpline */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('app.resources.needHelp')}</h2>
            <p className="text-green-100 mb-4">{t('app.resources.contactExperts')}</p>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span>📞</span>
                <span className="font-semibold">{t('app.resources.kisanCallCenter')}: 1800-180-1551</span>
              </p>
              <p className="flex items-center gap-2">
                <span>📧</span>
                <span>krishiii.mitra@gmail.com</span>
              </p>
            </div>
          </div>
          <span className="text-8xl">🤝</span>
        </div>
      </div>
    </div>
  )
}
