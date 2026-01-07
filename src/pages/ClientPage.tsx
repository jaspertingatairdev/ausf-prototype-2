import { useState } from 'react';

const ClientPage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showInviteSupervisorModal, setShowInviteSupervisorModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobType, setJobType] = useState('labour');
  const [selectedJobSite, setSelectedJobSite] = useState('');
  const [containers, setContainers] = useState([{ id: 1 }]);
  
  const [jobs, setJobs] = useState([
    {
      id: 1,
      name: 'Warehouse Construction - Site A',
      type: 'labour',
      status: 'ongoing',
      createdDate: 'Dec 5, 2025',
      jobSite: '123 Construction Ave, Sydney',
      workersAssigned: 8,
      timesheets: { pending: 3, approved: 12 },
      shifts: [
        {
          id: 1,
          skill: 'forklift',
          type: 'ongoing',
          supervisor: 'sup1',
          workers: '3',
          date: '',
          startTime: '',
          endTime: '',
          days: {
            Monday: { enabled: true, startTime: '07:00', endTime: '15:00' },
            Tuesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
            Wednesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
            Thursday: { enabled: true, startTime: '07:00', endTime: '15:00' },
            Friday: { enabled: true, startTime: '07:00', endTime: '15:00' },
            Saturday: { enabled: false, startTime: '', endTime: '' }
          }
        },
        {
          id: 2,
          skill: 'general',
          type: 'ongoing',
          supervisor: 'sup1',
          workers: '5',
          date: '',
          startTime: '',
          endTime: '',
          days: {
            Monday: { enabled: true, startTime: '08:00', endTime: '16:00' },
            Tuesday: { enabled: true, startTime: '08:00', endTime: '16:00' },
            Wednesday: { enabled: true, startTime: '08:00', endTime: '16:00' },
            Thursday: { enabled: true, startTime: '08:00', endTime: '16:00' },
            Friday: { enabled: true, startTime: '08:00', endTime: '14:00' },
            Saturday: { enabled: false, startTime: '', endTime: '' }
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Container Unloading - Port Terminal',
      type: 'container',
      status: 'pending',
      createdDate: 'Dec 8, 2025',
      jobSite: 'Port Terminal 4, Sydney',
      date: 'Dec 12, 2025',
      containers: [
        { id: 1, endCustomer: 'ACME Logistics', length: '40', boxes: 250, skus: 45 }
      ]
    }
  ]);

  const [shifts, setShifts] = useState([{ 
    id: 1, 
    type: 'fixed', 
    supervisor: '', 
    skill: '', 
    dates: [{ id: 1, date: '', startTime: '', endTime: '' }],
    days: {
      Monday: { enabled: false, startTime: '', endTime: '' },
      Tuesday: { enabled: false, startTime: '', endTime: '' },
      Wednesday: { enabled: false, startTime: '', endTime: '' },
      Thursday: { enabled: false, startTime: '', endTime: '' },
      Friday: { enabled: false, startTime: '', endTime: '' },
      Saturday: { enabled: false, startTime: '', endTime: '' }
    },
    workers: ''
  }]);

  // Bulk add state
  const [activeBulkShiftId, setActiveBulkShiftId] = useState<number | null>(null);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkDays, setBulkDays] = useState({
    Monday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    Tuesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    Wednesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    Thursday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    Friday: { enabled: true, startTime: '07:00', endTime: '15:00' },
    Saturday: { enabled: false, startTime: '', endTime: '' },
    Sunday: { enabled: false, startTime: '', endTime: '' }
  });

  const toggleBulkAdd = (shiftId: number) => {
    if (activeBulkShiftId === shiftId) {
      setActiveBulkShiftId(null);
    } else {
      setActiveBulkShiftId(shiftId);
      setBulkStartDate('');
      setBulkEndDate('');
      // Reset days to default
      setBulkDays({
        Monday: { enabled: true, startTime: '07:00', endTime: '15:00' },
        Tuesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
        Wednesday: { enabled: true, startTime: '07:00', endTime: '15:00' },
        Thursday: { enabled: true, startTime: '07:00', endTime: '15:00' },
        Friday: { enabled: true, startTime: '07:00', endTime: '15:00' },
        Saturday: { enabled: false, startTime: '', endTime: '' },
        Sunday: { enabled: false, startTime: '', endTime: '' }
      });
    }
  };

  const updateBulkDay = (day: string, field: string, value: any) => {
    setBulkDays(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], [field]: value }
    }));
  };

  const handleBulkAdd = () => {
    if (!activeBulkShiftId) return;
    
    if (!bulkStartDate || !bulkEndDate) {
      alert('Please select a start and end date');
      return;
    }

    // Use noon to avoid timezone rollover issues
    const start = new Date(bulkStartDate + 'T12:00:00');
    const end = new Date(bulkEndDate + 'T12:00:00');

    if (start > end) {
      alert('End date must be after start date');
      return;
    }

    const newDates: any[] = [];
    
    // Find current max ID for this shift's dates
    const shift = shifts.find(s => s.id === activeBulkShiftId);
    if (!shift) return;
    
    let currentIdCounter = Math.max(0, ...shift.dates.map(d => d.id)) + 1;

    // Loop through dates
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      // Map 'Sunday' etc to keys if needed, but en-US should match keys like Monday, Tuesday...
      const dayConfig = bulkDays[dayName as keyof typeof bulkDays];

      if (dayConfig && dayConfig.enabled) {
        // Format as YYYY-MM-DD manually to ensure local date is used
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        newDates.push({
          id: currentIdCounter++,
          date: dateStr,
          startTime: dayConfig.startTime,
          endTime: dayConfig.endTime
        });
      }
    }

    if (newDates.length === 0) {
      alert('No dates were generated based on your selection. Please check your date range and day settings.');
      return;
    }

    setShifts(prevShifts => prevShifts.map(s => {
      if (s.id !== activeBulkShiftId) return s;
      
      // Filter out empty initial date if it exists and hasn't been modified
      const existingDates = s.dates.filter(d => d.date !== '' || d.startTime !== '' || d.endTime !== '');
      
      return {
        ...s,
        dates: [...existingDates, ...newDates]
      };
    }));

    setActiveBulkShiftId(null);
  };

  const addContainer = () => setContainers([...containers, { id: containers.length + 1 }]);
  const removeContainer = (id: number) => setContainers(containers.filter(c => c.id !== id));

  const addShift = (skillValue = '') => {
    const lastShift = shifts[shifts.length - 1];
    const newId = shifts.length > 0 ? Math.max(...shifts.map(s => s.id)) + 1 : 1;
    
    setShifts([...shifts, { 
      id: newId, 
      type: lastShift ? lastShift.type : 'fixed',
      supervisor: lastShift ? lastShift.supervisor : '',
      skill: skillValue,
      dates: [{ id: 1, date: '', startTime: '', endTime: '' }],
      days: lastShift ? {
        Monday: { ...lastShift.days.Monday },
        Tuesday: { ...lastShift.days.Tuesday },
        Wednesday: { ...lastShift.days.Wednesday },
        Thursday: { ...lastShift.days.Thursday },
        Friday: { ...lastShift.days.Friday },
        Saturday: { ...lastShift.days.Saturday }
      } : {
        Monday: { enabled: false, startTime: '', endTime: '' },
        Tuesday: { enabled: false, startTime: '', endTime: '' },
        Wednesday: { enabled: false, startTime: '', endTime: '' },
        Thursday: { enabled: false, startTime: '', endTime: '' },
        Friday: { enabled: false, startTime: '', endTime: '' },
        Saturday: { enabled: false, startTime: '', endTime: '' }
      },
      workers: ''
    }]);
  };

  const removeShift = (id: number) => setShifts(shifts.filter(s => s.id !== id));
  const updateShiftType = (id: number, type: string) => setShifts(shifts.map(s => s.id === id ? { ...s, type } : s));
  const updateShiftSupervisor = (id: number, supervisor: string) => setShifts(shifts.map(s => s.id === id ? { ...s, supervisor } : s));
  const updateShiftSkill = (id: number, skill: string) => setShifts(shifts.map(s => s.id === id ? { ...s, skill } : s));
  const updateShiftWorkers = (id: number, workers: string) => setShifts(shifts.map(s => s.id === id ? { ...s, workers } : s));

  const addShiftDate = (shiftId: number) => {
    setShifts(shifts.map(s => {
      if (s.id !== shiftId) return s;
      const lastDate = s.dates[s.dates.length - 1];
      return {
        ...s,
        dates: [...s.dates, { 
          id: s.dates.length + 1, 
          date: '', 
          startTime: lastDate?.startTime || '', 
          endTime: lastDate?.endTime || '' 
        }]
      };
    }));
  };

  const removeShiftDate = (shiftId: number, dateId: number) => {
    setShifts(shifts.map(s => {
      if (s.id !== shiftId) return s;
      return { ...s, dates: s.dates.filter(d => d.id !== dateId) };
    }));
  };

  const updateShiftDate = (shiftId: number, dateId: number, field: string, value: string) => {
    setShifts(shifts.map(s => {
      if (s.id !== shiftId) return s;
      return {
        ...s,
        dates: s.dates.map(d => d.id !== dateId ? d : { ...d, [field]: value })
      };
    }));
  };

  const updateShiftDay = (id: number, day: string, field: string, value: any) => {
    setShifts(shifts.map(s => {
      if (s.id !== id) return s;
      if (field === 'enabled' && value === true) {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const idx = dayOrder.indexOf(day);
        let prevStart = '', prevEnd = '';
        for (let i = idx - 1; i >= 0; i--) {
          const pd = dayOrder[i];
          if ((s.days as any)[pd] && (s.days as any)[pd].enabled) {
            prevStart = (s.days as any)[pd].startTime || '';
            prevEnd = (s.days as any)[pd].endTime || '';
            break;
          }
        }
        return { ...s, days: { ...s.days, [day]: { enabled: true, startTime: prevStart, endTime: prevEnd } } };
      }
      return { ...s, days: { ...s.days, [day]: { ...(s.days as any)[day], [field]: value } } };
    }));
  };

  const updateJobShift = (jobId: number, shiftId: number, field: string, value: any) => {
    setJobs(jobs.map(job => {
      if (job.id !== jobId) return job;
      if (!job.shifts) return job;
      return { ...job, shifts: job.shifts.map(shift => shift.id !== shiftId ? shift : { ...shift, [field]: value }) };
    }));
    if (selectedJob && selectedJob.id === jobId && selectedJob.shifts) {
      setSelectedJob({
        ...selectedJob,
        shifts: selectedJob.shifts.map((shift: any) => shift.id !== shiftId ? shift : { ...shift, [field]: value })
      });
    }
  };

  const updateJobShiftDay = (jobId: number, shiftId: number, day: string, field: string, value: any) => {
    const updateDays = (shift: any) => {
      if (field === 'enabled' && value === true) {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const idx = dayOrder.indexOf(day);
        let prevStart = '', prevEnd = '';
        for (let i = idx - 1; i >= 0; i--) {
          const pd = dayOrder[i];
          if (shift.days[pd] && shift.days[pd].enabled) {
            prevStart = shift.days[pd].startTime || '';
            prevEnd = shift.days[pd].endTime || '';
            break;
          }
        }
        return { ...shift.days, [day]: { enabled: true, startTime: prevStart, endTime: prevEnd } };
      }
      return { ...shift.days, [day]: { ...shift.days[day], [field]: value } };
    };

    setJobs(jobs.map(job => {
      if (job.id !== jobId) return job;
      if (!job.shifts) return job;
      return {
        ...job,
        shifts: job.shifts.map(shift => {
          if (shift.id !== shiftId) return shift;
          return { ...shift, days: updateDays(shift) };
        })
      };
    }));

    if (selectedJob && selectedJob.id === jobId && selectedJob.shifts) {
      setSelectedJob({
        ...selectedJob,
        shifts: selectedJob.shifts.map((shift: any) => {
          if (shift.id !== shiftId) return shift;
          return { ...shift, days: updateDays(shift) };
        })
      });
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Staffing Requests</h1>
          <p className="text-gray-600">Manage your staffing requests and view timesheets</p>
        </div>

        <div className="flex gap-8 border-b-2 border-gray-200 mb-8">
          <button className={`pb-4 font-medium -mb-0.5 ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('requests')}>Staffing Requests</button>
          <button className={`pb-4 font-medium -mb-0.5 ${activeTab === 'supervisors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('supervisors')}>Supervisors</button>
        </div>

        {activeTab === 'requests' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <input type="date" className="px-4 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]" />
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]">
                  <option>All Types</option>
                  <option>Labour</option>
                  <option>Container</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]">
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <button onClick={() => setShowNewRequestModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">+ New Staffing Request</button>
            </div>

            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedJob(job)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.name}</h3>
                      <p className="text-sm text-gray-600">Created on {job.createdDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${job.type === 'labour' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{job.type === 'labour' ? 'Labour' : 'Container'}</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${job.status === 'ongoing' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}>{job.status === 'ongoing' ? 'Ongoing' : 'Pending'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Job Site</p>
                      <p className="text-sm text-gray-900 font-medium">{job.jobSite}</p>
                    </div>
                    {job.type === 'labour' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Shifts</p>
                          <p className="text-sm text-gray-900 font-medium">{job.shifts?.length || 0} shifts</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Timesheets</p>
                          <p className="text-sm text-gray-900 font-medium">{job.timesheets?.pending || 0} pending, {job.timesheets?.approved || 0} approved</p>
                        </div>
                      </>
                    )}
                    {job.type === 'container' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Date</p>
                          <p className="text-sm text-gray-900 font-medium">{job.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Containers</p>
                          <p className="text-sm text-gray-900 font-medium">{job.containers?.length || 0} containers</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'supervisors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <input type="text" placeholder="Search supervisors..." className="px-4 py-2 border border-gray-300 rounded-md text-sm min-w-[300px]" />
              <button onClick={() => setShowInviteSupervisorModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">+ Invite Supervisor</button>
            </div>
            <div className="space-y-3">
              {[{ init: 'JS', name: 'John Smith', email: 'john.smith@email.com', phone: '+61 400 123 456' }, { init: 'MW', name: 'Mary Wilson', email: 'mary.wilson@email.com', phone: '+61 400 789 012' }].map((sup, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-600">{sup.init}</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{sup.name}</h4>
                      <p className="text-xs text-gray-600">{sup.email} • {sup.phone}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-xl z-10 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedJob.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Created on {selectedJob.createdDate}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-2xl text-gray-600 hover:text-gray-900">×</button>
            </div>

            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Job Site</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedJob.jobSite}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Type</p>
                  <p className="text-sm text-gray-900 font-medium capitalize">{selectedJob.type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Status</p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedJob.status === 'ongoing' ? 'bg-indigo-100 text-indigo-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedJob.status === 'ongoing' ? 'Ongoing' : 'Pending'}</span>
                </div>
                {selectedJob.timesheets && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Timesheets</p>
                    <p className="text-sm text-gray-900 font-medium">{selectedJob.timesheets.pending} pending, {selectedJob.timesheets.approved} approved</p>
                  </div>
                )}
              </div>

              {selectedJob.type === 'labour' && selectedJob.shifts && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shifts</h3>
                  <div className="space-y-4">
                    {selectedJob.shifts.map((shift: any, index: number) => (
                      <div key={shift.id} className="p-5 bg-gray-50 border border-gray-300 rounded-md">
                        <div className="font-semibold text-gray-900 mb-4">Shift {index + 1}</div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Skill Required *</label>
                          <select value={shift.skill} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'skill', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                            <option value="">Select skill</option>
                            <option value="forklift">Forklift Driver</option>
                            <option value="general">General Labourer</option>
                            <option value="skilled">Skilled Labourer</option>
                            <option value="traffic">Traffic Controller</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type *</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="single" checked={shift.type === 'single'} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'type', e.target.value)} className="w-4 h-4" />
                              <span>Single Date</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="ongoing" checked={shift.type === 'ongoing'} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'type', e.target.value)} className="w-4 h-4" />
                              <span>Ongoing</span>
                            </label>
                          </div>
                        </div>

                        {shift.type === 'single' && (
                          <>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                              <input type="date" value={shift.date || ''} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                                <input type="time" value={shift.startTime || ''} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'startTime', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                                <input type="time" value={shift.endTime || ''} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'endTime', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                              </div>
                            </div>
                          </>
                        )}

                        {shift.type === 'ongoing' && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                            <div className="flex items-center gap-4 mb-2 px-3">
                              <div className="min-w-[120px]"></div>
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center w-24">Start</span>
                                <span className="w-6"></span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center w-24">End</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <div key={day} className="flex items-center gap-4 p-3 border border-gray-300 rounded-md bg-white">
                                  <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                                    <input type="checkbox" className="w-4 h-4" checked={shift.days[day]?.enabled || false} onChange={(e) => updateJobShiftDay(selectedJob.id, shift.id, day, 'enabled', e.target.checked)} />
                                    <span className="text-sm font-medium">{day}</span>
                                  </label>
                                  <div className="flex items-center gap-3 flex-1 justify-end">
                                    <input type="time" value={shift.days[day]?.startTime || ''} onChange={(e) => updateJobShiftDay(selectedJob.id, shift.id, day, 'startTime', e.target.value)} disabled={!shift.days[day]?.enabled} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                    <span className="text-gray-500">to</span>
                                    <input type="time" value={shift.days[day]?.endTime || ''} onChange={(e) => updateJobShiftDay(selectedJob.id, shift.id, day, 'endTime', e.target.value)} disabled={!shift.days[day]?.enabled} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor *</label>
                          <select value={shift.supervisor} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'supervisor', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                            <option value="">Select supervisor</option>
                            <option value="sup1">John Smith</option>
                            <option value="sup2">Mary Wilson</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Workers *</label>
                          <input type="number" min="1" value={shift.workers} onChange={(e) => updateJobShift(selectedJob.id, shift.id, 'workers', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.type === 'container' && selectedJob.containers && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Containers</h3>
                  <div className="space-y-4">
                    {selectedJob.containers.map((container: any, index: number) => (
                      <div key={container.id} className="p-4 bg-gray-50 border border-gray-300 rounded-md">
                        <div className="font-semibold mb-4">Container {index + 1}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-xs text-gray-600 uppercase mb-1">End Customer</p><p className="text-sm font-medium">{container.endCustomer}</p></div>
                          <div><p className="text-xs text-gray-600 uppercase mb-1">Length</p><p className="text-sm font-medium">{container.length}ft</p></div>
                          <div><p className="text-xs text-gray-600 uppercase mb-1">Boxes</p><p className="text-sm font-medium">{container.boxes}</p></div>
                          <div><p className="text-xs text-gray-600 uppercase mb-1">SKUs</p><p className="text-sm font-medium">{container.skus}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 flex justify-end gap-4 rounded-b-xl">
              <button onClick={() => setSelectedJob(null)} className="px-5 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Close</button>
              <button onClick={() => { alert('Changes saved!'); setSelectedJob(null); }} className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-xl z-10">
              <h2 className="text-2xl font-semibold text-gray-900">New Staffing Request</h2>
              <button onClick={() => setShowNewRequestModal(false)} className="text-2xl text-gray-600 hover:text-gray-900">×</button>
            </div>

            <div className="px-8 py-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="labour" checked={jobType === 'labour'} onChange={(e) => setJobType(e.target.value)} className="w-4 h-4" /><span>Labour</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="container" checked={jobType === 'container'} onChange={(e) => setJobType(e.target.value)} className="w-4 h-4" /><span>Container</span></label>
                </div>
              </div>

              {jobType === 'labour' && (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Site *</label>
                    <select value={selectedJobSite} onChange={(e) => setSelectedJobSite(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select existing job site</option>
                      <option value="new">+ Create new job site</option>
                      <option value="site1">123 Construction Ave, Sydney</option>
                      <option value="site2">Port Terminal 4, Sydney</option>
                    </select>
                  </div>

                  {selectedJobSite === 'new' && (
                    <>
                      <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Job Site Name *</label><input type="text" placeholder="e.g., Warehouse Construction Site" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
                      <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Address *</label><input type="text" placeholder="Full address" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
                    </>
                  )}
                </>
              )}

              {jobType === 'labour' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workers</label>
                  <div className="space-y-4">
                    {shifts.map((shift, index) => (
                      <div key={shift.id} className="p-5 bg-gray-50 border border-gray-300 rounded-md">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-gray-900">Worker Request {index + 1}</span>
                          {shifts.length > 1 && <button onClick={() => removeShift(shift.id)} className="text-red-600 text-sm hover:text-red-800">Remove</button>}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Skill Required *</label>
                          <select value={shift.skill} onChange={(e) => updateShiftSkill(shift.id, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                            <option value="">Select skill</option>
                            <option value="forklift">Forklift Driver</option>
                            <option value="general">General Labourer</option>
                            <option value="skilled">Skilled Labourer</option>
                            <option value="traffic">Traffic Controller</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type *</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="fixed" checked={shift.type === 'fixed'} onChange={(e) => updateShiftType(shift.id, e.target.value)} className="w-4 h-4" /><span>Fixed Dates</span></label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="ongoing" checked={shift.type === 'ongoing'} onChange={(e) => updateShiftType(shift.id, e.target.value)} className="w-4 h-4" /><span>Ongoing</span></label>
                          </div>
                        </div>

                        {shift.type === 'fixed' && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dates *</label>
                            <div className="space-y-3">
                              {shift.dates.map((dateEntry) => (
                                <div key={dateEntry.id} className="flex items-center gap-3 p-3 border border-gray-300 rounded-md bg-white">
                                  <input type="date" value={dateEntry.date} onChange={(e) => updateShiftDate(shift.id, dateEntry.id, 'date', e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                                  <input type="time" value={dateEntry.startTime} onChange={(e) => updateShiftDate(shift.id, dateEntry.id, 'startTime', e.target.value)} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                                  <span className="text-gray-500">to</span>
                                  <input type="time" value={dateEntry.endTime} onChange={(e) => updateShiftDate(shift.id, dateEntry.id, 'endTime', e.target.value)} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm" />
                                  {shift.dates.length > 1 && (
                                    <button onClick={() => removeShiftDate(shift.id, dateEntry.id)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-3">
                              <button onClick={() => addShiftDate(shift.id)} className="flex-1 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50">+ Add Another Date</button>
                              <button onClick={() => toggleBulkAdd(shift.id)} className={`flex-1 py-2 border rounded-md text-sm font-medium ${activeBulkShiftId === shift.id ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>{activeBulkShiftId === shift.id ? 'Hide Bulk Add' : 'Bulk Add Dates'}</button>
                            </div>

                            {activeBulkShiftId === shift.id && (
                              <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50">
                                <h4 className="font-semibold text-blue-900 mb-3">Bulk Add Dates</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Start Date</label>
                                    <input type="date" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm bg-white" />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">End Date</label>
                                    <input type="date" value={bulkEndDate} onChange={(e) => setBulkEndDate(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-md text-sm bg-white" />
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-blue-900 mb-2">Days & Times</label>
                                  <div className="space-y-2">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                      <div key={day} className="flex items-center gap-3 p-2 border border-blue-200 rounded-md bg-white/50">
                                        <label className="flex items-center gap-2 cursor-pointer min-w-[100px]">
                                          <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                                            checked={(bulkDays as any)[day]?.enabled || false} 
                                            onChange={(e) => updateBulkDay(day, 'enabled', e.target.checked)} 
                                          />
                                          <span className="text-sm font-medium text-gray-700">{day}</span>
                                        </label>
                                        <div className="flex items-center gap-2 flex-1 justify-end">
                                          <input 
                                            type="time" 
                                            value={(bulkDays as any)[day]?.startTime || ''} 
                                            onChange={(e) => updateBulkDay(day, 'startTime', e.target.value)} 
                                            disabled={!(bulkDays as any)[day]?.enabled} 
                                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                                          />
                                          <span className="text-gray-500 text-xs">to</span>
                                          <input 
                                            type="time" 
                                            value={(bulkDays as any)[day]?.endTime || ''} 
                                            onChange={(e) => updateBulkDay(day, 'endTime', e.target.value)} 
                                            disabled={!(bulkDays as any)[day]?.enabled} 
                                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex justify-end pt-2 gap-3">
                                  <button onClick={() => setActiveBulkShiftId(null)} className="px-4 py-2 border border-blue-200 rounded-md text-blue-700 font-medium text-sm hover:bg-blue-50">Cancel</button>
                                  <button onClick={handleBulkAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-blue-700">Add Selected Dates</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {shift.type === 'ongoing' && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule *</label>
                            <div className="flex items-center gap-4 mb-2 px-3">
                              <div className="min-w-[120px]"></div>
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center w-24">Start</span>
                                <span className="w-6"></span>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center w-24">End</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <div key={day} className="flex items-center gap-4 p-3 border border-gray-300 rounded-md bg-white">
                                  <label className="flex items-center gap-2 cursor-pointer min-w-[120px]"><input type="checkbox" className="w-4 h-4" checked={(shift.days as any)[day]?.enabled || false} onChange={(e) => updateShiftDay(shift.id, day, 'enabled', e.target.checked)} /><span className="text-sm font-medium">{day}</span></label>
                                  <div className="flex items-center gap-3 flex-1 justify-end">
                                    <input type="time" value={(shift.days as any)[day]?.startTime || ''} onChange={(e) => updateShiftDay(shift.id, day, 'startTime', e.target.value)} disabled={!(shift.days as any)[day]?.enabled} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                    <span className="text-gray-500">to</span>
                                    <input type="time" value={(shift.days as any)[day]?.endTime || ''} onChange={(e) => updateShiftDay(shift.id, day, 'endTime', e.target.value)} disabled={!(shift.days as any)[day]?.enabled} className="w-24 px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Supervisor *</label><select value={shift.supervisor} onChange={(e) => updateShiftSupervisor(shift.id, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"><option value="">Select supervisor</option><option value="sup1">John Smith</option><option value="sup2">Mary Wilson</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">How Many Workers? *</label><input type="number" min="1" placeholder="1" value={shift.workers} onChange={(e) => updateShiftWorkers(shift.id, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-4">
                    <select onChange={(e) => { if (e.target.value) { addShift(e.target.value); e.target.value = ''; } }} className="w-full py-3 pl-4 pr-10 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 cursor-pointer appearance-none">
                      <option value="">+ Add Worker Request</option>
                      <option value="forklift">+ Forklift Driver</option>
                      <option value="general">+ General Labourer</option>
                      <option value="skilled">+ Skilled Labourer</option>
                      <option value="traffic">+ Traffic Controller</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>
              )}

              {jobType === 'container' && (
                <div className="mb-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Date *</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Site *</label>
                    <select value={selectedJobSite} onChange={(e) => setSelectedJobSite(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select existing job site</option>
                      <option value="new">+ Create new job site</option>
                      <option value="site1">123 Construction Ave, Sydney</option>
                      <option value="site2">Port Terminal 4, Sydney</option>
                    </select>
                  </div>

                  {selectedJobSite === 'new' && (
                    <>
                      <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Job Site Name *</label><input type="text" placeholder="e.g., Port Terminal 5" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
                      <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Address *</label><input type="text" placeholder="Full address" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
                    </>
                  )}

                  <label className="block text-sm font-medium text-gray-700 mb-2">Containers</label>
                  <div className="space-y-4">
                    {containers.map((container, index) => (
                      <div key={container.id} className="p-4 bg-gray-50 border border-gray-300 rounded-md">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold">Container {index + 1}</span>
                          {containers.length > 1 && <button onClick={() => removeContainer(container.id)} className="text-red-600 text-sm hover:text-red-800">Remove</button>}
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Customer *</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                            <option value="">Select existing customer</option>
                            <option value="new">+ Create new customer</option>
                            <option value="acme">ACME Logistics</option>
                            <option value="global">Global Shipping Co</option>
                            <option value="pacific">Pacific Trade Ltd</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Container Length *</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
                            <option value="20">20ft</option>
                            <option value="40">40ft</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Boxes *</label>
                            <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Number of SKUs *</label>
                            <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={addContainer} className="w-full mt-4 py-3 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">+ Add Another Container</button>
                </div>
              )}

              <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label><textarea rows={4} placeholder="Any additional information..." className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm resize-y"></textarea></div>
            </div>

            <div className="bg-white border-t border-gray-200 px-8 py-6 flex justify-end gap-4 rounded-b-xl flex-shrink-0">
              <button onClick={() => setShowNewRequestModal(false)} className="px-5 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { alert('Staffing request created!'); setShowNewRequestModal(false); }} className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">Create Request</button>
            </div>
            </div>
          </div>
        </div>
      )}

      {showInviteSupervisorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Invite Supervisor</h2>
              <button onClick={() => setShowInviteSupervisorModal(false)} className="text-2xl text-gray-600 hover:text-gray-900">×</button>
            </div>
            <div className="px-8 py-6">
              <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label><input type="text" placeholder="Supervisor's full name" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
              <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label><input type="email" placeholder="supervisor@email.com" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
              <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label><input type="tel" placeholder="+61 400 000 000" className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm" /></div>
            </div>
            <div className="border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
              <button onClick={() => setShowInviteSupervisorModal(false)} className="px-5 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { alert('Invitation sent!'); setShowInviteSupervisorModal(false); }} className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700">Send Invitation</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ClientPage;


