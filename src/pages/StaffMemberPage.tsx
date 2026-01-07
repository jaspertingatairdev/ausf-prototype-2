import { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, User, Settings, ChevronDown, Check, X } from 'lucide-react';
import staffMemberData from '../data/staffMemberShifts.json';

type DailyEntryStatus = 'Not Submitted' | 'Pending Approval' | 'Pending Re-approval' | 'Approved' | 'Paid';

interface DailyEntry {
  status: DailyEntryStatus;
  hoursSubmitted: number | null;
  workerNote: string | null;
  supervisorNote: string | null;
  adminNote: string | null;
  editedBy: string | null;
}

interface Shift {
  id: number;
  type: 'Labour' | 'Container';
  supervisorName: string;
  date: string;
  startTime: string;
  endTime: string;
  hoursWorked: number | null;
  containers: number | null;
  jobSite: string;
  dailyEntry: DailyEntry;
}

const StaffMemberPage = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [shifts, setShifts] = useState<Shift[]>(staffMemberData.shifts as Shift[]);
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilters, setStatusFilters] = useState<DailyEntryStatus[]>([
    'Not Submitted',
    'Pending Approval',
    'Pending Re-approval'
  ]);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  // Ref for status dropdown
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Modal state
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Form state for submit modal
  const [submitHours, setSubmitHours] = useState<string>('');
  const [submitNote, setSubmitNote] = useState<string>('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');

  const tabs = [
    { id: 'shifts', label: 'Shifts', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Available supervisors for selection
  const availableSupervisors = useMemo(() => {
    // Extract unique supervisors from shifts
    const supervisorSet = new Set(shifts.map(shift => shift.supervisorName));
    return Array.from(supervisorSet).sort();
  }, [shifts]);

  const dailyEntryStatuses: DailyEntryStatus[] = [
    'Not Submitted',
    'Pending Approval',
    'Pending Re-approval',
    'Approved',
    'Paid'
  ];

  // Filter and sort shifts
  const filteredShifts = useMemo(() => {
    return shifts
      .filter(shift => {
        // Type filter
        if (typeFilter !== 'all' && shift.type !== typeFilter) return false;
        
        // Status filter - if any statuses are selected, filter by them
        if (statusFilters.length > 0 && !statusFilters.includes(shift.dailyEntry.status)) return false;
        
        // Date range filter
        if (dateFrom && shift.date < dateFrom) return false;
        if (dateTo && shift.date > dateTo) return false;
        
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shifts, typeFilter, statusFilters, dateFrom, dateTo]);
  
  // Toggle status in multi-select
  const toggleStatusFilter = (status: DailyEntryStatus) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };
  
  // Get display text for status dropdown
  const getStatusFilterDisplayText = () => {
    if (statusFilters.length === 0) return 'All Statuses';
    if (statusFilters.length === dailyEntryStatuses.length) return 'All Statuses';
    if (statusFilters.length === 1) return statusFilters[0];
    return `${statusFilters.length} selected`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadgeStyle = (status: DailyEntryStatus) => {
    switch (status) {
      case 'Not Submitted':
        return 'bg-gray-100 text-gray-700';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending Re-approval':
        return 'bg-orange-100 text-orange-800';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Paid':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    return type === 'Labour' 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-purple-100 text-purple-700';
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    if (shift.dailyEntry.status === 'Not Submitted') {
      setSubmitHours('');
      setSubmitNote('');
      setSelectedSupervisor(shift.supervisorName); // Set default supervisor
      setShowSubmitModal(true);
    } else {
      setShowViewModal(true);
    }
  };

  const handleSubmitEntry = () => {
    if (!selectedShift || submitHours === '') return;
    
    const hours = parseFloat(submitHours);
    if (isNaN(hours) || hours < 0) return;

    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === selectedShift.id
          ? {
              ...shift,
              supervisorName: selectedSupervisor || shift.supervisorName,
              hoursWorked: hours,
              dailyEntry: {
                ...shift.dailyEntry,
                status: 'Pending Approval' as DailyEntryStatus,
                hoursSubmitted: hours,
                workerNote: submitNote || null
              }
            }
          : shift
      )
    );
    
    setShowSubmitModal(false);
    setSelectedShift(null);
    setSubmitHours('');
    setSubmitNote('');
    setSelectedSupervisor('');
  };

  const closeModals = () => {
    setShowSubmitModal(false);
    setShowViewModal(false);
    setSelectedShift(null);
  };

  const renderShiftsTab = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Shifts</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredShifts.length} shifts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="Labour">Labour</option>
              <option value="Container">Container</option>
            </select>
          </div>
          
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="min-w-[200px] relative" ref={statusDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Daily Entry Status</label>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-left flex items-center justify-between"
            >
              <span className={statusFilters.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
                {getStatusFilterDisplayText()}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {statusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilters([])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilters([...dailyEntryStatuses])}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    Select all
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  {dailyEntryStatuses.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatusFilter(status)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        statusFilters.includes(status) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {statusFilters.includes(status) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(status)}`}>
                        {status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Supervisor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Hours/Containers</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Daily Entry Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredShifts.map((shift) => (
              <tr 
                key={shift.id} 
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleShiftClick(shift)}
              >
                <td className="py-4 px-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTypeBadgeStyle(shift.type)}`}>
                    {shift.type}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{shift.supervisorName}</div>
                  <div className="text-sm text-gray-500">{shift.jobSite}</div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {formatDate(shift.date)}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {shift.startTime} - {shift.endTime}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {shift.type === 'Container' 
                    ? (shift.containers !== null ? `${shift.containers} containers` : '-')
                    : (shift.hoursWorked !== null ? `${shift.hoursWorked} hrs` : '-')
                  }
                </td>
                <td className="py-4 px-4">
                  {shift.type === 'Container' ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      N/A
                    </span>
                  ) : (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(shift.dailyEntry.status)}`}>
                      {shift.dailyEntry.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredShifts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  No shifts found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
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
                onClick={() => setActiveTab(tab.id)}
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

        {/* User info at bottom of sidebar */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
              {staffMemberData.staffMember.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{staffMemberData.staffMember.name}</div>
              <div className="text-gray-400 text-xs">Staff Member</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'shifts' && renderShiftsTab()}
            {activeTab === 'profile' && (
              <div className="text-gray-500">Profile settings coming soon...</div>
            )}
            {activeTab === 'settings' && (
              <div className="text-gray-500">Settings coming soon...</div>
            )}
          </div>
        </main>
      </div>

      {/* Submit Daily Entry Modal */}
      {showSubmitModal && selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModals}
          ></div>
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit Daily Entry</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedShift.date)} • {selectedShift.jobSite}
                </p>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Scheduled Shift</div>
                <div className="font-medium text-gray-900">
                  {selectedShift.startTime} - {selectedShift.endTime}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Supervisor: {selectedShift.supervisorName}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor *
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {availableSupervisors.map(supervisor => (
                    <option key={supervisor} value={supervisor}>
                      {supervisor}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the supervisor who oversaw this shift.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Hours Worked *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={submitHours}
                  onChange={(e) => setSubmitHours(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If you did not work that day, submit 0 hours.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worker Note (Optional)
                </label>
                <textarea
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about your shift..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEntry}
                  disabled={submitHours === ''}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Daily Entry Modal */}
      {showViewModal && selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModals}
          ></div>
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Entry Details</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedShift.date)} • {selectedShift.jobSite}
                </p>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Status Badge */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(selectedShift.dailyEntry.status)}`}>
                  {selectedShift.dailyEntry.status}
                </span>
              </div>

              {/* Hours */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours Worked</label>
                <div className="text-gray-900 font-medium">
                  {selectedShift.dailyEntry.hoursSubmitted !== null 
                    ? `${selectedShift.dailyEntry.hoursSubmitted} hours`
                    : '-'
                  }
                  {selectedShift.dailyEntry.editedBy && (
                    <span className="ml-2 text-sm text-orange-600 font-normal">
                      (Edited by {selectedShift.dailyEntry.editedBy})
                    </span>
                  )}
                </div>
              </div>

              {/* Worker Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker Note</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  {selectedShift.dailyEntry.workerNote || <span className="text-gray-400 italic">No note provided</span>}
                </div>
              </div>

              {/* Supervisor Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Note</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  {selectedShift.dailyEntry.supervisorNote || <span className="text-gray-400 italic">No note provided</span>}
                </div>
              </div>

              {/* Admin Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                  {selectedShift.dailyEntry.adminNote || <span className="text-gray-400 italic">No note provided</span>}
                </div>
              </div>

              <button
                onClick={closeModals}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffMemberPage;

