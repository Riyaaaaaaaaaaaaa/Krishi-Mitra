import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { translateCropName } from '../utils/cropTranslation'

export default function MyCrops() {
  const { t } = useTranslation()
  const [crops, setCrops] = useState([
    { id: 1, name: 'Rice', area: '2.5 hectares', plantedDate: '2025-06-15', status: 'Growing', health: 'Good' },
    { id: 2, name: 'Wheat', area: '1.8 hectares', plantedDate: '2024-11-20', status: 'Harvested', health: 'Excellent' },
    { id: 3, name: 'Cotton', area: '3.0 hectares', plantedDate: '2025-05-10', status: 'Growing', health: 'Fair' }
  ])

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  
  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [healthFilter, setHealthFilter] = useState('All')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    plantedDate: '',
    status: 'Planted',
    health: 'Good'
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'Growing': return 'bg-green-100 text-green-800 border-green-300'
      case 'Harvested': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Planted': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excellent': return 'text-green-600'
      case 'Good': return 'text-blue-600'
      case 'Fair': return 'text-yellow-600'
      case 'Poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Helper to translate status
  const getStatusText = (status) => {
    const statusMap = {
      'Growing': t('app.myCrops.statusGrowing'),
      'Harvested': t('app.myCrops.statusHarvested'),
      'Planted': t('app.myCrops.statusPlanted')
    }
    return statusMap[status] || status
  }

  // Helper to translate health
  const getHealthText = (health) => {
    const healthMap = {
      'Excellent': t('app.myCrops.healthExcellent'),
      'Good': t('app.myCrops.healthGood'),
      'Fair': t('app.myCrops.healthFair'),
      'Poor': t('app.myCrops.healthPoor')
    }
    return healthMap[health] || health
  }

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Filtered and sorted crops
  const filteredAndSortedCrops = useMemo(() => {
    let filtered = [...crops]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(crop => 
        crop.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(crop => crop.status === statusFilter)
    }

    // Apply health filter
    if (healthFilter !== 'All') {
      filtered = filtered.filter(crop => crop.health === healthFilter)
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [crops, searchTerm, statusFilter, healthFilter, sortConfig])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedCrops.length / itemsPerPage)
  const paginatedCrops = filteredAndSortedCrops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Crop Name', 'Area', 'Planted Date', 'Status', 'Health']
    const csvData = filteredAndSortedCrops.map(crop => [
      crop.name,
      crop.area,
      crop.plantedDate,
      crop.status,
      crop.health
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-crops-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Sort indicator component
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  // CRUD Functions
  const handleAddCrop = () => {
    setFormData({
      name: '',
      area: '',
      plantedDate: '',
      status: 'Planted',
      health: 'Good'
    })
    setShowAddModal(true)
  }

  const handleViewCrop = (crop) => {
    setSelectedCrop(crop)
    setShowViewModal(true)
  }

  const handleEditCrop = (crop) => {
    setSelectedCrop(crop)
    setFormData({
      name: crop.name,
      area: crop.area,
      plantedDate: crop.plantedDate,
      status: crop.status,
      health: crop.health
    })
    setShowEditModal(true)
  }

  const handleDeleteCrop = (crop) => {
    setSelectedCrop(crop)
    setShowDeleteModal(true)
  }

  const confirmAddCrop = () => {
    const newCrop = {
      id: crops.length + 1,
      ...formData
    }
    setCrops([...crops, newCrop])
    setShowAddModal(false)
    setFormData({ name: '', area: '', plantedDate: '', status: 'Planted', health: 'Good' })
  }

  const confirmEditCrop = () => {
    setCrops(crops.map(crop => 
      crop.id === selectedCrop.id ? { ...crop, ...formData } : crop
    ))
    setShowEditModal(false)
    setFormData({ name: '', area: '', plantedDate: '', status: 'Planted', health: 'Good' })
  }

  const confirmDeleteCrop = () => {
    setCrops(crops.filter(crop => crop.id !== selectedCrop.id))
    setShowDeleteModal(false)
    setSelectedCrop(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app.myCrops.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('app.myCrops.pageSubtitle')}</p>
        </div>
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2" onClick={handleAddCrop}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('app.myCrops.addNewCrop')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.myCrops.totalCrops')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.myCrops.totalArea')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">7.3</p>
              <p className="text-xs text-gray-500">{t('app.myCrops.hectares')}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📏</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.myCrops.activeCrops')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">2</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{t('app.myCrops.avgHealth')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{t('app.myCrops.healthGood')}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💚</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('app.myCrops.cropDetails')}</h2>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('app.myCrops.exportCSV')}
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('app.myCrops.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">{t('app.myCrops.all')} - {t('app.myCrops.status')}</option>
                <option value="Growing">{t('app.myCrops.statusGrowing')}</option>
                <option value="Harvested">{t('app.myCrops.statusHarvested')}</option>
                <option value="Planted">{t('app.myCrops.statusPlanted')}</option>
              </select>
            </div>
            
            <div>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="All">{t('app.myCrops.all')} - {t('app.myCrops.health')}</option>
                <option value="Excellent">{t('app.myCrops.healthExcellent')}</option>
                <option value="Good">{t('app.myCrops.healthGood')}</option>
                <option value="Fair">{t('app.myCrops.healthFair')}</option>
                <option value="Poor">{t('app.myCrops.healthPoor')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    {t('app.myCrops.cropName')}
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('area')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    {t('app.myCrops.area')}
                    <SortIcon columnKey="area" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('plantedDate')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    {t('app.myCrops.plantedDate')}
                    <SortIcon columnKey="plantedDate" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    {t('app.myCrops.status')}
                    <SortIcon columnKey="status" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('health')}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    {t('app.myCrops.health')}
                    <SortIcon columnKey="health" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('app.myCrops.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCrops.map((crop) => (
                <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🌾</span>
                      <div className="text-sm font-medium text-gray-900">{translateCropName(crop.name)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{crop.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{crop.plantedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(crop.status)}`}>
                      {getStatusText(crop.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${getHealthColor(crop.health)}`}>{getHealthText(crop.health)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleViewCrop(crop)}>{t('app.myCrops.view')}</button>
                    <button className="text-green-600 hover:text-green-900" onClick={() => handleEditCrop(crop)}>{t('app.myCrops.edit')}</button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteCrop(crop)}>{t('app.myCrops.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {t('app.myCrops.showing')} {filteredAndSortedCrops.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} {t('app.myCrops.to')} {Math.min(currentPage * itemsPerPage, filteredAndSortedCrops.length)} {t('app.myCrops.of')} {filteredAndSortedCrops.length} {t('app.myCrops.crops')}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('app.myCrops.previous')}
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('app.myCrops.next')}
            </button>
          </div>
        </div>
      </div>

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('app.myCrops.addCropTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.cropNameLabel')}</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{t('app.myCrops.selectCrop')}</option>
                  <option value="Rice">{translateCropName('Rice')}</option>
                  <option value="Wheat">{translateCropName('Wheat')}</option>
                  <option value="Cotton">{translateCropName('Cotton')}</option>
                  <option value="Maize">{translateCropName('Maize')}</option>
                  <option value="Soybean">{translateCropName('Soybean')}</option>
                  <option value="Chickpea">{translateCropName('Chickpea')}</option>
                  <option value="Kidney Beans">{translateCropName('Kidney Beans')}</option>
                  <option value="Pigeon Peas">{translateCropName('Pigeon Peas')}</option>
                  <option value="Moth Beans">{translateCropName('Moth Beans')}</option>
                  <option value="Mung Bean">{translateCropName('Mung Bean')}</option>
                  <option value="Black Gram">{translateCropName('Black Gram')}</option>
                  <option value="Lentil">{translateCropName('Lentil')}</option>
                  <option value="Pomegranate">{translateCropName('Pomegranate')}</option>
                  <option value="Banana">{translateCropName('Banana')}</option>
                  <option value="Mango">{translateCropName('Mango')}</option>
                  <option value="Grapes">{translateCropName('Grapes')}</option>
                  <option value="Watermelon">{translateCropName('Watermelon')}</option>
                  <option value="Muskmelon">{translateCropName('Muskmelon')}</option>
                  <option value="Apple">{translateCropName('Apple')}</option>
                  <option value="Orange">{translateCropName('Orange')}</option>
                  <option value="Papaya">{translateCropName('Papaya')}</option>
                  <option value="Coconut">{translateCropName('Coconut')}</option>
                  <option value="Jute">{translateCropName('Jute')}</option>
                  <option value="Coffee">{translateCropName('Coffee')}</option>
                  <option value="Sugarcane">{translateCropName('Sugarcane')}</option>
                  <option value="Groundnut">{translateCropName('Groundnut')}</option>
                  <option value="Pulses">{translateCropName('Pulses')}</option>
                  <option value="Tea">{translateCropName('Tea')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.areaLabel')}</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder={t('app.myCrops.areaPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.plantedDateLabel')}</label>
                <input
                  type="date"
                  name="plantedDate"
                  value={formData.plantedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.statusLabel')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Planted">{t('app.myCrops.statusPlanted')}</option>
                  <option value="Growing">{t('app.myCrops.statusGrowing')}</option>
                  <option value="Harvested">{t('app.myCrops.statusHarvested')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.healthLabel')}</label>
                <select
                  name="health"
                  value={formData.health}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Poor">{t('app.myCrops.healthPoor')}</option>
                  <option value="Fair">{t('app.myCrops.healthFair')}</option>
                  <option value="Good">{t('app.myCrops.healthGood')}</option>
                  <option value="Excellent">{t('app.myCrops.healthExcellent')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('app.myCrops.cancel')}
              </button>
              <button
                onClick={confirmAddCrop}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t('app.myCrops.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Crop Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('app.myCrops.editCropTitle')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.cropNameLabel')}</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">{t('app.myCrops.selectCrop')}</option>
                  <option value="Rice">{translateCropName('Rice')}</option>
                  <option value="Wheat">{translateCropName('Wheat')}</option>
                  <option value="Cotton">{translateCropName('Cotton')}</option>
                  <option value="Maize">{translateCropName('Maize')}</option>
                  <option value="Soybean">{translateCropName('Soybean')}</option>
                  <option value="Chickpea">{translateCropName('Chickpea')}</option>
                  <option value="Kidney Beans">{translateCropName('Kidney Beans')}</option>
                  <option value="Pigeon Peas">{translateCropName('Pigeon Peas')}</option>
                  <option value="Moth Beans">{translateCropName('Moth Beans')}</option>
                  <option value="Mung Bean">{translateCropName('Mung Bean')}</option>
                  <option value="Black Gram">{translateCropName('Black Gram')}</option>
                  <option value="Lentil">{translateCropName('Lentil')}</option>
                  <option value="Pomegranate">{translateCropName('Pomegranate')}</option>
                  <option value="Banana">{translateCropName('Banana')}</option>
                  <option value="Mango">{translateCropName('Mango')}</option>
                  <option value="Grapes">{translateCropName('Grapes')}</option>
                  <option value="Watermelon">{translateCropName('Watermelon')}</option>
                  <option value="Muskmelon">{translateCropName('Muskmelon')}</option>
                  <option value="Apple">{translateCropName('Apple')}</option>
                  <option value="Orange">{translateCropName('Orange')}</option>
                  <option value="Papaya">{translateCropName('Papaya')}</option>
                  <option value="Coconut">{translateCropName('Coconut')}</option>
                  <option value="Jute">{translateCropName('Jute')}</option>
                  <option value="Coffee">{translateCropName('Coffee')}</option>
                  <option value="Sugarcane">{translateCropName('Sugarcane')}</option>
                  <option value="Groundnut">{translateCropName('Groundnut')}</option>
                  <option value="Pulses">{translateCropName('Pulses')}</option>
                  <option value="Tea">{translateCropName('Tea')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.areaLabel')}</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.plantedDateLabel')}</label>
                <input
                  type="date"
                  name="plantedDate"
                  value={formData.plantedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.statusLabel')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Planted">{t('app.myCrops.statusPlanted')}</option>
                  <option value="Growing">{t('app.myCrops.statusGrowing')}</option>
                  <option value="Harvested">{t('app.myCrops.statusHarvested')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('app.myCrops.healthLabel')}</label>
                <select
                  name="health"
                  value={formData.health}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Poor">{t('app.myCrops.healthPoor')}</option>
                  <option value="Fair">{t('app.myCrops.healthFair')}</option>
                  <option value="Good">{t('app.myCrops.healthGood')}</option>
                  <option value="Excellent">{t('app.myCrops.healthExcellent')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('app.myCrops.cancel')}
              </button>
              <button
                onClick={confirmEditCrop}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t('app.myCrops.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Crop Modal */}
      {showViewModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t('app.myCrops.viewCropTitle')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-4">
                <span className="text-6xl">🌾</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{t('app.myCrops.cropNameLabel')}</p>
                    <p className="text-base font-semibold text-gray-900">{translateCropName(selectedCrop.name)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('app.myCrops.areaLabel')}</p>
                    <p className="text-base font-semibold text-gray-900">{selectedCrop.area}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('app.myCrops.plantedDateLabel')}</p>
                    <p className="text-base font-semibold text-gray-900">{selectedCrop.plantedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('app.myCrops.statusLabel')}</p>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(selectedCrop.status)}`}>
                      {getStatusText(selectedCrop.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('app.myCrops.healthLabel')}</p>
                    <p className={`text-base font-semibold ${getHealthColor(selectedCrop.health)}`}>{getHealthText(selectedCrop.health)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('app.myCrops.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('app.myCrops.deleteCropTitle')}</h3>
                <p className="text-sm text-gray-600">{t('app.myCrops.deleteCropMessage')}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700"><span className="font-medium">{t('app.myCrops.cropNameLabel')}:</span> {translateCropName(selectedCrop.name)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t('app.myCrops.cancel')}
              </button>
              <button
                onClick={confirmDeleteCrop}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {t('app.myCrops.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
