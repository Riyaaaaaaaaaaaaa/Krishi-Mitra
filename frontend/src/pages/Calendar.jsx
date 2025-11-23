import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { translateCropName } from '../utils/cropTranslation'

export default function Calendar() {
  const { t } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month, list
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  
  const [events, setEvents] = useState([
    { id: 1, title: 'Rice Planting', date: '2025-01-15', time: '08:00', type: 'planting', crop: 'Rice', notes: 'Prepare seedbed', completed: false },
    { id: 2, title: 'Wheat Harvesting', date: '2025-01-20', time: '06:00', type: 'harvesting', crop: 'Wheat', notes: 'Check moisture', completed: false },
    { id: 3, title: 'Apply Fertilizer', date: '2025-01-25', time: '09:00', type: 'fertilizing', crop: 'Rice', notes: 'NPK 20:10:10', completed: false },
    { id: 4, title: 'Cotton Planting', date: '2025-02-10', time: '07:00', type: 'planting', crop: 'Cotton', notes: 'Bt cotton seeds', completed: false },
    { id: 5, title: 'Irrigation', date: '2025-02-15', time: '16:00', type: 'irrigation', crop: 'Cotton', notes: 'Drip irrigation', completed: false },
    { id: 6, title: 'Pest Control', date: '2025-01-18', time: '10:00', type: 'spraying', crop: 'Rice', notes: 'Organic pesticide', completed: false }
  ])

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '08:00',
    type: 'planting',
    crop: '',
    notes: ''
  })

  const getEventColor = (type) => {
    switch (type) {
      case 'planting': return 'bg-green-100 border-green-500 text-green-800'
      case 'harvesting': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'fertilizing': return 'bg-purple-100 border-purple-500 text-purple-800'
      case 'irrigation': return 'bg-blue-100 border-blue-500 text-blue-800'
      case 'spraying': return 'bg-red-100 border-red-500 text-red-800'
      default: return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return events.filter(event => event.date === dateStr)
  }

  // Stats calculation
  const stats = useMemo(() => {
    const thisMonthEvents = events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear()
    })
    
    return {
      planting: events.filter(e => e.type === 'planting').length,
      harvesting: events.filter(e => e.type === 'harvesting').length,
      fertilizing: events.filter(e => e.type === 'fertilizing').length,
      irrigation: events.filter(e => e.type === 'irrigation').length,
      spraying: events.filter(e => e.type === 'spraying').length,
      thisMonth: {
        planting: thisMonthEvents.filter(e => e.type === 'planting').length,
        harvesting: thisMonthEvents.filter(e => e.type === 'harvesting').length,
        fertilizing: thisMonthEvents.filter(e => e.type === 'fertilizing').length,
        irrigation: thisMonthEvents.filter(e => e.type === 'irrigation').length,
        spraying: thisMonthEvents.filter(e => e.type === 'spraying').length
      }
    }
  }, [events, currentDate])

  // CRUD operations
  const handleAddEvent = () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setFormData({
      title: '',
      date: dateStr,
      time: '08:00',
      type: 'planting',
      crop: '',
      notes: ''
    })
    setShowAddModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      crop: event.crop,
      notes: event.notes || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteEvent = (event) => {
    setSelectedEvent(event)
    setShowDeleteModal(true)
  }

  const handleCompleteEvent = (eventId) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, completed: !e.completed } : e
    ))
  }

  const confirmAddEvent = () => {
    const newEvent = {
      id: Date.now(),
      ...formData,
      completed: false
    }
    setEvents([...events, newEvent])
    setShowAddModal(false)
  }

  const confirmEditEvent = () => {
    setEvents(events.map(e => 
      e.id === selectedEvent.id ? { ...e, ...formData } : e
    ))
    setShowEditModal(false)
  }

  const confirmDeleteEvent = () => {
    setEvents(events.filter(e => e.id !== selectedEvent.id))
    setShowDeleteModal(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = today.toDateString() === date.toDateString()
      
      // Get unique event types for this day (for colored dots)
      const uniqueTypes = [...new Set(dayEvents.map(e => e.type))]
      
      days.push(
        <div
          key={day}
          onClick={() => handleQuickAdd(date)}
          className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'bg-white'
          }`}
        >
          {/* Date Number with Today Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-semibold ${
              isToday ? 'bg-blue-600 text-white px-2 py-1 rounded-full text-xs' : 'text-gray-900'
            }`}>
              {isToday ? `Today ${day}` : day}
            </div>
            {/* Event Type Indicators (colored dots) */}
            {uniqueTypes.length > 0 && (
              <div className="flex gap-1">
                {uniqueTypes.slice(0, 3).map((type, idx) => {
                  const colors = {
                    planting: 'bg-green-500',
                    harvesting: 'bg-yellow-500',
                    fertilizing: 'bg-purple-500',
                    irrigation: 'bg-blue-500',
                    spraying: 'bg-red-500'
                  }
                  return (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${colors[type] || 'bg-gray-500'}`}
                      title={type}
                    ></div>
                  )
                })}
                {uniqueTypes.length > 3 && (
                  <div className="text-xs text-gray-500">+{uniqueTypes.length - 3}</div>
                )}
              </div>
            )}
          </div>
          
          {/* Event Cards */}
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditEvent(event)
                }}
                className={`text-xs p-1 rounded cursor-pointer hover:shadow-md transition-shadow ${
                  getEventColor(event.type)
                } ${event.completed ? 'opacity-50 line-through' : ''}`}
              >
                <div className="font-medium truncate">{event.time} {event.title}</div>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 text-center">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  // Quick add handler
  const handleQuickAdd = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    setFormData({
      title: '',
      date: dateStr,
      time: '08:00',
      type: 'planting',
      crop: '',
      notes: ''
    })
    setShowAddModal(true)
  }

  // Render mini calendar for sidebar
  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-1"></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = today.toDateString() === date.toDateString()
      const hasEvents = getEventsForDate(date).length > 0
      
      days.push(
        <div
          key={day}
          onClick={() => {
            setCurrentDate(date)
            setView('month')
          }}
          className={`text-center py-1 text-xs cursor-pointer rounded ${
            isToday ? 'bg-blue-600 text-white font-bold' : hasEvents ? 'bg-green-100 font-semibold' : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  // Separate past and future events
  const sortedEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const past = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date))
    const todayEvents = events.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate.toDateString() === today.toDateString()
    })
    const future = events.filter(e => new Date(e.date) > today).sort((a, b) => new Date(a.date) - new Date(b.date))
    
    return { past, today: todayEvents, future }
  }, [events])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app.calendar.pageTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('app.calendar.pageSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month Selector Dropdown */}
          <select
            value={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-')
              setCurrentDate(new Date(parseInt(year), parseInt(month)))
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - 12 + i)
              return (
                <option key={i} value={`${date.getFullYear()}-${date.getMonth()}`}>
                  {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              )
            })}
          </select>

          {/* Jump to Today Button */}
          <button
            onClick={goToToday}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('app.calendar.today')}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'month' ? 'bg-white shadow' : ''}`}
            >
              {t('app.calendar.month')}
            </button>
            <button 
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'list' ? 'bg-white shadow' : ''}`}
            >
              {t('app.calendar.list')}
            </button>
          </div>

          {/* Add Event Button */}
          <button 
            onClick={handleAddEvent}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('app.calendar.addEvent')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('app.calendar.planting')}</p>
              <p className="text-2xl font-bold">{stats.planting}</p>
              <p className="text-xs text-green-600 mt-1">{stats.thisMonth.planting} {t('app.calendar.thisMonth')}</p>
            </div>
            <span className="text-2xl">🌱</span>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('app.calendar.harvesting')}</p>
              <p className="text-2xl font-bold">{stats.harvesting}</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.thisMonth.harvesting} {t('app.calendar.thisMonth')}</p>
            </div>
            <span className="text-2xl">🌾</span>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('app.calendar.fertilizing')}</p>
              <p className="text-2xl font-bold">{stats.fertilizing}</p>
              <p className="text-xs text-purple-600 mt-1">{stats.thisMonth.fertilizing} {t('app.calendar.thisMonth')}</p>
            </div>
            <span className="text-2xl">💊</span>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('app.calendar.irrigation')}</p>
              <p className="text-2xl font-bold">{stats.irrigation}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.thisMonth.irrigation} {t('app.calendar.thisMonth')}</p>
            </div>
            <span className="text-2xl">💧</span>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">{t('app.calendar.spraying')}</p>
              <p className="text-2xl font-bold">{stats.spraying}</p>
              <p className="text-xs text-red-600 mt-1">{stats.thisMonth.spraying} {t('app.calendar.thisMonth')}</p>
            </div>
            <span className="text-2xl">🐞</span>
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      {view === 'month' ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {[t('app.calendar.sun'), t('app.calendar.mon'), t('app.calendar.tue'), t('app.calendar.wed'), t('app.calendar.thu'), t('app.calendar.fri'), t('app.calendar.sat')].map((day, i) => (
              <div key={i} className="bg-gray-100 p-2 text-center text-sm font-semibold">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {renderCalendarGrid()}
          </div>
        </div>
      ) : (
        // List View with Mini Calendar Sidebar
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mini Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">
                  {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                  <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs font-semibold text-gray-500">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderMiniCalendar()}
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">{t('app.calendar.legendToday')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-gray-600">{t('app.calendar.hasEvents')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">{t('app.calendar.allEvents')}</h2>
            
            <div className="space-y-6">
              {/* Today's Events */}
              {sortedEvents.today.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">{t('app.calendar.todayLabel')}</div>
                    <div className="flex-1 h-px bg-blue-200"></div>
                  </div>
                  <div className="space-y-3">
                    {sortedEvents.today.map((event) => (
                      <div key={event.id} className={`border-l-4 p-4 rounded-lg ${getEventColor(event.type)} ${event.completed ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                              <p className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm">Crop: {translateCropName(event.crop)} | {event.time}</p>
                              {event.notes && <p className="text-xs mt-1">{event.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleCompleteEvent(event.id)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs">
                              {event.completed ? '↻ Undo' : '✓ Complete'}
                            </button>
                            <button onClick={() => handleEditEvent(event)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteEvent(event)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs text-red-600">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Future Events */}
              {sortedEvents.future.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">{t('app.calendar.upcomingLabel')}</div>
                    <div className="flex-1 h-px bg-green-200"></div>
                  </div>
                  <div className="space-y-3">
                    {sortedEvents.future.map((event) => (
                      <div key={event.id} className={`border-l-4 p-4 rounded-lg ${getEventColor(event.type)} ${event.completed ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                              <p className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm">Crop: {translateCropName(event.crop)} | {event.time}</p>
                              {event.notes && <p className="text-xs mt-1">{event.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleCompleteEvent(event.id)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs">
                              {event.completed ? '↻ Undo' : '✓ Complete'}
                            </button>
                            <button onClick={() => handleEditEvent(event)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteEvent(event)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs text-red-600">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {sortedEvents.past.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-bold">{t('app.calendar.pastLabel')}</div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div className="space-y-3">
                    {sortedEvents.past.map((event) => (
                      <div key={event.id} className={`border-l-4 p-4 rounded-lg ${getEventColor(event.type)} opacity-60`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{new Date(event.date).getDate()}</p>
                              <p className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <p className="text-sm">Crop: {translateCropName(event.crop)} | {event.time}</p>
                              {event.notes && <p className="text-xs mt-1">{event.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteEvent(event)} className="px-3 py-1 bg-white rounded hover:bg-gray-50 text-xs text-red-600">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {events.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No events yet</p>
                  <p className="text-sm">Click "Add Event" to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{showAddModal ? t('app.calendar.addEventTitle') : t('app.calendar.editEventTitle')}</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('app.calendar.eventTitle')}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="planting">{t('app.calendar.eventTypes.planting')}</option>
                <option value="harvesting">{t('app.calendar.eventTypes.harvesting')}</option>
                <option value="fertilizing">{t('app.calendar.eventTypes.fertilizing')}</option>
                <option value="irrigation">{t('app.calendar.eventTypes.irrigation')}</option>
                <option value="spraying">{t('app.calendar.eventTypes.spraying')}</option>
              </select>
              <input
                type="text"
                name="crop"
                value={formData.crop}
                onChange={handleInputChange}
                placeholder={t('app.calendar.crop')}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('app.calendar.notes')}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false) }} className="flex-1 px-4 py-2 border rounded-lg">
                {t('app.calendar.cancel')}
              </button>
              <button onClick={showAddModal ? confirmAddEvent : confirmEditEvent} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">
                {showAddModal ? t('app.calendar.add') : t('app.calendar.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-2">{t('app.calendar.deleteEventTitle')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('app.calendar.deleteEventMessage')} "{selectedEvent.title}"?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
                {t('app.calendar.cancel')}
              </button>
              <button onClick={confirmDeleteEvent} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">
                {t('app.calendar.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
