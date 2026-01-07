import { useState, useRef, useEffect, useMemo } from 'react';
import { Home, Clock, Users, Building2, UserCog, Settings, Search, Bell, ShoppingCart, MoreVertical, Plus, ArrowLeft, Calendar, X, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStaffing } from '../context/StaffingContext';
import StaffAssignmentGrid, { GridDateColumn } from '../components/StaffAssignmentGrid';

const AdminPage = () => {
  const { 
    unstaffedRequests, 
    staffedRequests, 
    updateRequest, 
    moveRequestToStaffed
  } = useStaffing();

  const [activeTab, setActiveTab] = useState('requests');
  const [requestFilter, setRequestFilter] = useState('unstaffed');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [assignmentModal, setAssignmentModal] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCells, setSelectedCells] = useState<any[]>([]);
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleDateStart, setVisibleDateStart] = useState(0);
  const [gridViewMode, setGridViewMode] = useState<'schedule' | 'calendar'>('schedule');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const VISIBLE_DAYS = 5;

  const selectedRequest = [...unstaffedRequests, ...staffedRequests].find(r => r.id === selectedRequestId) || null;
  const assignments = selectedRequest?.assignments || {};

  const tabs = [
    { id: 'requests', label: 'Requests', icon: Home },
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'team', label: 'Team', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Reset visible date start when selected request changes
  useEffect(() => {
    setVisibleDateStart(0);
  }, [selectedRequestId]);

  // Check if a request is fully staffed
  const checkIfFullyStaffed = (request: any, currentAssignments: any) => {
    if (!request.skillRequirements || request.type === 'Container') return false;
    
    let totalPositions = 0;
    let staffedPositions = 0;
    
    request.skillRequirements.forEach((skillReq: any, skillIdx: number) => {
      const numDates = request.dateType === 'ongoing' 
        ? skillReq.weekdaySchedule?.length || 0
        : skillReq.dates?.length || 0;
      
      for (let posIdx = 0; posIdx < skillReq.quantity; posIdx++) {
        for (let dateIdx = 0; dateIdx < numDates; dateIdx++) {
          totalPositions++;
          const key = `${skillIdx}-${posIdx}-${dateIdx}`;
          if (currentAssignments[key]) {
            staffedPositions++;
          }
        }
      }
    });
    
    return totalPositions > 0 && totalPositions === staffedPositions;
  };

  const displayRequests = requestFilter === 'unstaffed' ? unstaffedRequests : staffedRequests;

  const allStaff = [
    { id: 1, name: 'John Smith', skills: ['General Labourer'], phone: '(555) 123-4567', rating: 4.5 },
    { id: 2, name: 'Sarah Johnson', skills: ['General Labourer', 'Forklift Driver'], phone: '(555) 234-5678', rating: 4.8 },
    { id: 3, name: 'Michael Chen', skills: ['Forklift Driver'], phone: '(555) 345-6789', rating: 4.2 },
    { id: 4, name: 'Emma Wilson', skills: ['General Labourer'], phone: '(555) 456-7890', rating: 4.6 },
    { id: 5, name: 'David Brown', skills: ['Skilled Labourer'], phone: '(555) 567-8901', rating: 4.7 },
    { id: 6, name: 'Lisa Martinez', skills: ['Skilled Labourer'], phone: '(555) 678-9012', rating: 4.9 },
    { id: 7, name: 'Tom Anderson', skills: ['General Labourer'], phone: '(555) 789-0123', rating: 4.3 },
    { id: 8, name: 'Rachel Lee', skills: ['Forklift Driver', 'Skilled Labourer'], phone: '(555) 890-1234', rating: 4.8 },
    { id: 9, name: 'James Taylor', skills: ['General Labourer'], phone: '(555) 901-2345', rating: 4.4 },
    { id: 10, name: 'Amy White', skills: ['Skilled Labourer'], phone: '(555) 012-3456', rating: 4.6 },
  ];

  useEffect(() => {
    if (assignmentModal && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [assignmentModal]);

  useEffect(() => {
    if (!assignmentModal) {
      setSearchQuery('');
    }
  }, [assignmentModal]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDatePicker]);

  // Generate next 12 Mondays starting from today
  const getNextMondays = (count = 12): Date[] => {
    const mondays: Date[] = [];
    const today = new Date();
    const currentDay = today.getDay();
    
    // Calculate days until next Monday (1 is Monday)
    const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay) % 7 || 7;
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    
    for (let i = 0; i < count; i++) {
      const monday = new Date(nextMonday);
      monday.setDate(nextMonday.getDate() + (i * 7));
      mondays.push(monday);
    }
    
    return mondays;
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleAssignStaff = (staffMember: any) => {
    if (selectedCells.length === 0 || !selectedRequest) return;
    
    const newAssignments = { ...assignments };
    const pendingData = effectiveDate ? {
      ...staffMember,
      effectiveDate: effectiveDate.toISOString()
    } : null;

    selectedCells.forEach(cell => {
      const key = `${cell.skillIdx}-${cell.positionIdx}-${cell.dateIdx}`;
      const existingAssignment = (assignments as any)[key];
      
      if (effectiveDate) {
        // Future assignment: Preserve existing current assignment, add/update pending
        const updatedAssignment = existingAssignment ? { ...existingAssignment } : {};
        updatedAssignment.pendingAssignment = pendingData;
        (newAssignments as any)[key] = updatedAssignment;
      } else {
        // Immediate assignment: Overwrite current assignment, preserve pending if any
        const pending = existingAssignment?.pendingAssignment;
        (newAssignments as any)[key] = { 
           ...staffMember, 
           pendingAssignment: pending 
        };
      }
    });
    
    // Persist assignments to the request
    updateRequest(selectedRequest.id, { 
      assignments: newAssignments,
      lastUpdated: new Date().toISOString()
    });
    
    // Check if all positions are now staffed
    const allStaffed = checkIfFullyStaffed(selectedRequest, newAssignments);
    if (allStaffed) {
      moveRequestToStaffed(selectedRequest.id);
    }
    
    setSelectedCells([]);
    setAssignmentModal(null);
  };

  const toggleCellSelection = (skillIdx: number, positionIdx: number, dateIdx: number, skillReq: any) => {
    const cellId = `${skillIdx}-${positionIdx}-${dateIdx}`;
    const isSelected = selectedCells.some(
      cell => `${cell.skillIdx}-${cell.positionIdx}-${cell.dateIdx}` === cellId
    );
    
    if (isSelected) {
      setSelectedCells(selectedCells.filter(
        cell => `${cell.skillIdx}-${cell.positionIdx}-${cell.dateIdx}` !== cellId
      ));
    } else {
      setSelectedCells([...selectedCells, { skillIdx, positionIdx, dateIdx, skillReq }]);
    }
  };

  const selectAllInRow = (skillIdx: number, positionIdx: number, skillReq: any, numDates: number) => {
    const rowCells = Array.from({ length: numDates }, (_, dateIdx) => ({
      skillIdx,
      positionIdx,
      dateIdx,
      skillReq
    }));
    
    const allSelected = rowCells.every(cell => 
      selectedCells.some(
        selected => 
          selected.skillIdx === cell.skillIdx &&
          selected.positionIdx === cell.positionIdx &&
          selected.dateIdx === cell.dateIdx
      )
    );

    if (allSelected) {
      setSelectedCells(selectedCells.filter(
        selected => !(selected.skillIdx === skillIdx && selected.positionIdx === positionIdx)
      ));
    } else {
      const otherCells = selectedCells.filter(
        selected => !(selected.skillIdx === skillIdx && selected.positionIdx === positionIdx)
      );
      setSelectedCells([...otherCells, ...rowCells]);
      // Automatically open the assignment modal
      setAssignmentModal({ skillReq });
    }
  };

  const isCellSelected = (skillIdx: number, positionIdx: number, dateIdx: number) => {
    const cellId = `${skillIdx}-${positionIdx}-${dateIdx}`;
    return selectedCells.some(
      cell => `${cell.skillIdx}-${cell.positionIdx}-${cell.dateIdx}` === cellId
    );
  };

  const getAssignment = (skillIdx: number, positionIdx: number, dateIdx: number) => {
    const key = `${skillIdx}-${positionIdx}-${dateIdx}`;
    return (assignments as any)[key];
  };

  const filteredStaff = assignmentModal && selectedCells.length > 0
    ? allStaff.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSkill = staff.skills.includes(selectedCells[0].skillReq.skill);
        return matchesSearch && matchesSkill;
      })
    : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Generate calendar dates for ongoing jobs based on weekday schedule
  const generateCalendarDates = (request: any, weeksToShow = 8): GridDateColumn[] => {
    if (!request || request.dateType !== 'ongoing') return [];
    
    const weekdaySchedule = request.skillRequirements?.[0]?.weekdaySchedule || [];
    if (weekdaySchedule.length === 0) return [];

    const dayNameToNumber: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    // Get the scheduled days as numbers
    const scheduledDayNumbers = weekdaySchedule.map((d: any) => dayNameToNumber[d.day]);

    const dates: GridDateColumn[] = [];
    const startDate = request.startDate ? new Date(request.startDate) : new Date();
    const today = new Date();
    
    // Start from either the job start date or today, whichever is later
    const effectiveStart = startDate > today ? startDate : today;
    
    // Generate dates for the next N weeks
    const endDate = new Date(effectiveStart);
    endDate.setDate(endDate.getDate() + (weeksToShow * 7));

    const currentDate = new Date(effectiveStart);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      if (scheduledDayNumbers.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push({
          date: dateStr,
          dayLabel: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dateLabel: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Generate grid dates for fixed date jobs
  const generateFixedDates = (request: any): GridDateColumn[] => {
    if (!request || request.dateType === 'ongoing') return [];
    
    const fixedDates = request.skillRequirements?.[0]?.dates || [];
    return fixedDates.map((dateStr: string) => ({
      date: dateStr,
      dayLabel: getDayOfWeek(dateStr),
      dateLabel: formatDateShort(dateStr)
    }));
  };

  // Memoize calendar dates for ongoing jobs
  const calendarDates = useMemo(() => {
    if (selectedRequest?.dateType === 'ongoing') {
      return generateCalendarDates(selectedRequest);
    }
    return generateFixedDates(selectedRequest);
  }, [selectedRequest]);

  // Get shift time for a given skill requirement and date
  const getShiftTimeForGrid = (skillReq: any, dateIdx: number, date: string): string => {
    if (selectedRequest?.dateType === 'ongoing' && gridViewMode === 'calendar') {
      // For calendar view of ongoing jobs, find the matching weekday schedule
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      const daySchedule = skillReq.weekdaySchedule?.find((d: any) => d.day === dayOfWeek);
      if (daySchedule) {
        return `${daySchedule.startTime} - ${daySchedule.endTime}`;
      }
    } else if (selectedRequest?.dateType === 'ongoing') {
      // Schedule view for ongoing - use dateIdx directly
      const daySchedule = skillReq.weekdaySchedule?.[dateIdx];
      if (daySchedule) {
        return `${daySchedule.startTime} - ${daySchedule.endTime}`;
      }
    } else if (skillReq.shiftTimes) {
      // Fixed dates - use the date to look up times
      const times = skillReq.shiftTimes[date];
      if (times) {
        return `${times.startTime} - ${times.endTime}`;
      }
    }
    return '';
  };

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => {
              setSelectedRequestId(null);
              setSelectedCells([]);
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Requests
          </button>
          <h1 className="text-3xl font-semibold text-gray-900">{selectedRequest.jobSite}</h1>
          <p className="text-gray-500 mt-1">{selectedRequest.client}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{selectedRequest.description || 'No description provided'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Job Type</h3>
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  selectedRequest.type === 'Labour' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedRequest.type}
                </span>
              </div>

              {selectedRequest.type === 'Labour' && (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Date Range</h3>
                    <p className="text-gray-700">
                      {selectedRequest.dateType === 'ongoing' 
                        ? `Ongoing from ${formatDate(selectedRequest.startDate)}`
                        : `${formatDate(selectedRequest.dates[0])} - ${formatDate(selectedRequest.dates[selectedRequest.dates.length - 1])}`
                      }
                    </p>
                  </div>

                  {selectedRequest.supervisor && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Supervisor</h3>
                      <p className="text-gray-700">{selectedRequest.supervisor}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Required Roles</h3>
                    <p className="text-gray-700">{selectedRequest.roles}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact</h3>
            <p className="text-gray-700">{selectedRequest.contactPerson} • {selectedRequest.phone}</p>
          </div>
        </div>

        {selectedRequest.type === 'Labour' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Staff Assignment Grid
              </h2>
              
              {/* View Mode Toggle - Only shown for ongoing jobs */}
              {selectedRequest.dateType === 'ongoing' && (
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setGridViewMode('schedule')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      gridViewMode === 'schedule'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Schedule View
                  </button>
                  <button
                    onClick={() => setGridViewMode('calendar')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      gridViewMode === 'calendar'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Calendar View
                  </button>
                </div>
              )}
            </div>

            {selectedCells.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedCells.length}</span> shift{selectedCells.length !== 1 ? 's' : ''} selected
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCells([])}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setAssignmentModal({ skillReq: selectedCells[0].skillReq })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Assign Staff
                  </button>
                </div>
              </div>
            )}
            
            {/* Fixed jobs: Always show StaffAssignmentGrid */}
            {/* Ongoing jobs: Show schedule view OR calendar view based on toggle */}
            {selectedRequest.dateType !== 'ongoing' ? (
              /* Fixed date jobs - Use StaffAssignmentGrid */
              <StaffAssignmentGrid
                dates={calendarDates}
                skillRequirements={selectedRequest.skillRequirements || []}
                assignments={assignments}
                visibleDays={VISIBLE_DAYS}
                onCellClick={toggleCellSelection}
                onSelectAllInRow={selectAllInRow}
                selectedCells={selectedCells}
                getShiftTime={getShiftTimeForGrid}
                isOngoing={false}
                formatDateShort={formatDateShort}
              />
            ) : gridViewMode === 'schedule' ? (
              /* Ongoing jobs - Schedule View (weekday-based) */
              <div className="overflow-x-auto relative">
                <div className="flex justify-between items-center mb-2 px-1">
                  <div className="text-sm text-gray-500">
                    Showing days {visibleDateStart + 1} - {Math.min(visibleDateStart + VISIBLE_DAYS, selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.length || 0)} of {selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.length || 0}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVisibleDateStart(prev => Math.max(0, prev - 1))}
                      disabled={visibleDateStart === 0}
                      className={`p-1 rounded-full border ${visibleDateStart === 0 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        const maxDays = selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.length || 0;
                        setVisibleDateStart(prev => Math.min(Math.max(0, maxDays - VISIBLE_DAYS), prev + 1));
                      }}
                      disabled={visibleDateStart >= (selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.length || 0) - VISIBLE_DAYS}
                      className={`p-1 rounded-full border ${visibleDateStart >= (selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.length || 0) - VISIBLE_DAYS ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white border-r border-b-2 border-gray-300 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                        Staff Position
                      </th>
                      {selectedRequest.skillRequirements?.[0]?.weekdaySchedule?.slice(visibleDateStart, visibleDateStart + VISIBLE_DAYS).map((daySchedule: any, idx: number) => (
                        <th key={idx + visibleDateStart} className="border-r border-b-2 border-gray-300 p-3 text-left min-w-[140px]">
                          <div className="font-semibold text-gray-900">{daySchedule.day}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.skillRequirements?.flatMap((skillReq: any, skillIdx: number) => 
                      Array.from({ length: skillReq.quantity }, (_, positionIdx) => {
                        const numDates = skillReq.weekdaySchedule?.length || 0;
                        
                        return (
                          <tr key={`${skillIdx}-${positionIdx}`} className="hover:bg-gray-50">
                            <td className="group sticky left-0 z-10 bg-white border-r border-b border-gray-200 p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                                  {positionIdx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">{skillReq.skill}</div>
                                  <button
                                    onClick={() => selectAllInRow(skillIdx, positionIdx, skillReq, numDates)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    Select all
                                  </button>
                                </div>
                              </div>
                            </td>
                            {Array.from({ length: Math.min(VISIBLE_DAYS, numDates - visibleDateStart) }, (_, offset) => {
                              const dateIdx = visibleDateStart + offset;
                              const assignment = getAssignment(skillIdx, positionIdx, dateIdx);
                              const isSelected = isCellSelected(skillIdx, positionIdx, dateIdx);
                              
                              const activeStaff = assignment && assignment.name ? assignment : null;
                              const pendingStaff = assignment?.pendingAssignment;
                              const daySchedule = skillReq.weekdaySchedule?.[dateIdx];
                              const shiftTime = daySchedule ? `${daySchedule.startTime} - ${daySchedule.endTime}` : '';
                              
                              return (
                                <td key={dateIdx} className="border-r border-b border-gray-200 p-0 align-top">
                                  <button
                                    onClick={() => toggleCellSelection(skillIdx, positionIdx, dateIdx, skillReq)}
                                    className={`w-full p-4 min-h-[100px] transition-all relative group flex flex-col items-center justify-center ${
                                      isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                                    }`}
                                  >
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Edit2 size={14} className="text-gray-500" />
                                    </div>
                                    
                                    {activeStaff ? (
                                      <div>
                                        <div className="font-medium text-gray-900 text-center">{activeStaff.name}</div>
                                        <div className="text-sm text-gray-500 text-center mt-1">{shiftTime}</div>
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="text-gray-500 text-center">Unstaffed</div>
                                        <div className="text-sm text-gray-500 text-center mt-1">{shiftTime}</div>
                                      </div>
                                    )}
                                  </button>
                                  {pendingStaff && (
                                    <div className="w-full bg-gray-200 border-t border-gray-300 px-2 py-1.5 text-xs text-gray-700 text-center">
                                      {pendingStaff.name} <span className="text-gray-500">Starting {formatDateShort(pendingStaff.effectiveDate)}</span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Ongoing jobs - Calendar View (actual dates using StaffAssignmentGrid) */
              <StaffAssignmentGrid
                dates={calendarDates}
                skillRequirements={selectedRequest.skillRequirements || []}
                assignments={assignments}
                visibleDays={VISIBLE_DAYS}
                onCellClick={toggleCellSelection}
                onSelectAllInRow={selectAllInRow}
                selectedCells={selectedCells}
                getShiftTime={getShiftTimeForGrid}
                isOngoing={true}
                formatDateShort={formatDateShort}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Containers</h2>
            <div className="space-y-3">
              {selectedRequest.containers?.map((container: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Container #{container.containerNumber}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(container.date)}
                        </span>
                        <span>Size: {container.size}</span>
                      </div>
                    </div>
                    {container.staffed < container.required ? (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        Assign Crew
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Crew Assigned
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Boxes:</span>{' '}
                      <span className="font-medium text-gray-900">{container.boxes}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SKUs:</span>{' '}
                      <span className="font-medium text-gray-900">{container.skus}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">End Customer:</span>{' '}
                      <span className="font-medium text-gray-900">{container.endCustomer}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                    <span className="font-medium">{container.staffed}</span> / {container.required} crew members assigned
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignmentModal && selectedCells.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setAssignmentModal(null)}
            ></div>
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Staff</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedCells[0].skillReq.skill} - {selectedCells.length} shift{selectedCells.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <button
                  onClick={() => setAssignmentModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  From which week should this change take effect?
                </label>
                <div className="relative" ref={datePickerRef}>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className={effectiveDate ? 'text-gray-900' : 'text-gray-900'}>
                      {effectiveDate ? formatDateForDisplay(effectiveDate) : 'Immediately'}
                    </span>
                    <Calendar size={18} className="text-gray-400" />
                  </button>
                  
                  {showDatePicker && (
                    <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setEffectiveDate(null);
                          setShowDatePicker(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${
                          !effectiveDate
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'text-gray-900'
                        }`}
                      >
                        Immediately
                      </button>
                      {getNextMondays().map((monday, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setEffectiveDate(monday);
                            setShowDatePicker(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors ${
                            effectiveDate && monday.toDateString() === effectiveDate.toDateString()
                              ? 'bg-blue-100 text-blue-900 font-medium'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatDateForDisplay(monday)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search staff by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredStaff.length > 0 ? (
                  <div className="space-y-2">
                    {filteredStaff.map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() => handleAssignStaff(staff)}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors text-left"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.phone}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {staff.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          ⭐ {staff.rating}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {searchQuery ? 'No staff found matching your search' : 'No staff available with this skill'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRequestsContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staffing Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{displayRequests.length} results</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus size={18} />
          Create Request
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setRequestFilter('unstaffed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            requestFilter === 'unstaffed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unstaffed
        </button>
        <button
          onClick={() => setRequestFilter('staffed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            requestFilter === 'staffed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Staffed
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Client</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Job Site</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Required Roles</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {displayRequests.map((request) => (
              <tr 
                key={request.id} 
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedRequestId(request.id);
                  setSelectedCells([]);
                }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                      {request.client[0]}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{request.contactPerson}</div>
                      <div className="text-sm text-gray-500">{request.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{request.client}</div>
                  <div className="text-sm text-gray-500">{request.jobSite}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    request.type === 'Labour' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {request.type}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {request.dateType === 'ongoing' 
                    ? 'Ongoing'
                    : request.dates?.length === 1 
                      ? formatDate(request.dates[0])
                      : `${formatDateShort(request.dates[0])} - ${formatDateShort(request.dates[request.dates.length - 1])}`
                  }
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{request.roles}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'unstaffed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {request.status === 'unstaffed' ? 'Unstaffed' : 'Staffed'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-slate-900 text-gray-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-700">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <span className="text-white text-xl font-semibold">ausf</span>
        </div>

        <nav className="flex-1 px-3 py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedRequestId(null);
                  setSelectedCells([]);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#2a3544] text-white'
                    : 'text-gray-400 hover:bg-[#242d3c] hover:text-gray-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="flex items-center gap-6">
            <span className="text-gray-700 font-medium">Admin</span>
            <button className="text-gray-600 hover:text-gray-900">
              <Search size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Bell size={20} />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <ShoppingCart size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'requests' && (selectedRequest ? renderRequestDetail() : renderRequestsContent())}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;


