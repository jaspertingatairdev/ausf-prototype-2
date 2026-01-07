import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

export interface GridDateColumn {
  date: string;           // YYYY-MM-DD format
  dayLabel: string;       // e.g., "Mon", "Tue"
  dateLabel?: string;     // e.g., "Dec 12"
}

export interface SelectedCell {
  skillIdx: number;
  positionIdx: number;
  dateIdx: number;
  skillReq: any;
}

export interface StaffAssignmentGridProps {
  dates: GridDateColumn[];
  skillRequirements: any[];
  assignments: Record<string, any>;
  visibleDays?: number;
  onCellClick: (skillIdx: number, positionIdx: number, dateIdx: number, skillReq: any, dateStr?: string) => void;
  onSelectAllInRow: (skillIdx: number, positionIdx: number, skillReq: any, numDates: number, dates?: string[]) => void;
  selectedCells: SelectedCell[];
  getShiftTime: (skillReq: any, dateIdx: number, date: string) => string;
  isOngoing?: boolean;
  formatDateShort?: (dateStr: string) => string;
  useDateKeys?: boolean; // When true, use date-string keys for assignment lookups
}

const StaffAssignmentGrid: React.FC<StaffAssignmentGridProps> = ({
  dates,
  skillRequirements,
  assignments,
  visibleDays = 5,
  onCellClick,
  onSelectAllInRow,
  selectedCells,
  getShiftTime,
  isOngoing = false,
  formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },
  useDateKeys = false
}) => {
  const [visibleDateStart, setVisibleDateStart] = useState(0);

  const isCellSelected = (skillIdx: number, positionIdx: number, dateIdx: number) => {
    const cellId = `${skillIdx}-${positionIdx}-${dateIdx}`;
    return selectedCells.some(
      cell => `${cell.skillIdx}-${cell.positionIdx}-${cell.dateIdx}` === cellId
    );
  };

  const getAssignment = (skillIdx: number, positionIdx: number, dateIdx: number, dateStr?: string) => {
    if (useDateKeys && dateStr) {
      const key = `${skillIdx}-${positionIdx}-${dateStr}`;
      return assignments[key];
    }
    const key = `${skillIdx}-${positionIdx}-${dateIdx}`;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/0f115a08-a27d-4f43-adf3-1a7cdf1d5f4f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StaffAssignmentGrid.tsx:getAssignment',message:'Grid lookup',data:{key,found:!!assignments[key],useDateKeys,assignmentKeys:Object.keys(assignments).slice(0,10)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-2',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return assignments[key];
  };

  const totalDates = dates.length;
  const maxVisibleStart = Math.max(0, totalDates - visibleDays);

  return (
    <div className="overflow-x-auto relative">
      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="text-sm text-gray-500">
          Showing days {visibleDateStart + 1} - {Math.min(visibleDateStart + visibleDays, totalDates)} of {totalDates}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVisibleDateStart(prev => Math.max(0, prev - 1))}
            disabled={visibleDateStart === 0}
            className={`p-1 rounded-full border ${
              visibleDateStart === 0 
                ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                : 'text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setVisibleDateStart(prev => Math.min(maxVisibleStart, prev + 1))}
            disabled={visibleDateStart >= maxVisibleStart}
            className={`p-1 rounded-full border ${
              visibleDateStart >= maxVisibleStart 
                ? 'text-gray-300 border-gray-200 cursor-not-allowed' 
                : 'text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white border-r border-b-2 border-gray-300 p-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
              Staff Position
            </th>
            {dates.slice(visibleDateStart, visibleDateStart + visibleDays).map((dateCol, idx) => (
              <th key={idx + visibleDateStart} className="border-r border-b-2 border-gray-300 p-3 text-left min-w-[140px]">
                <div className="font-semibold text-gray-900">{dateCol.dayLabel}</div>
                {dateCol.dateLabel && (
                  <div className="text-xs text-gray-500 font-normal">{dateCol.dateLabel}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skillRequirements?.flatMap((skillReq: any, skillIdx: number) => 
            Array.from({ length: skillReq.quantity }, (_, positionIdx) => {
              const numDates = dates.length;
              
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
                          onClick={() => onSelectAllInRow(skillIdx, positionIdx, skillReq, numDates, dates.map(d => d.date))}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Select all
                        </button>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: Math.min(visibleDays, numDates - visibleDateStart) }, (_, offset) => {
                    const dateIdx = visibleDateStart + offset;
                    const dateCol = dates[dateIdx];
                    const assignment = getAssignment(skillIdx, positionIdx, dateIdx, dateCol.date);
                    const isSelected = isCellSelected(skillIdx, positionIdx, dateIdx);
                    
                    // Determine active and pending staff
                    const activeStaff = assignment && assignment.name ? assignment : null;
                    const pendingStaff = assignment?.pendingAssignment;

                    const shiftTime = getShiftTime(skillReq, dateIdx, dateCol.date);
                    const hasUpcomingChange = isOngoing && pendingStaff;
                    
                      return (
                        <td key={dateIdx} className="border-r border-b border-gray-200 p-0 align-top">
                          <button
                            onClick={() => onCellClick(skillIdx, positionIdx, dateIdx, skillReq, dateCol.date)}
                            className={`w-full p-4 min-h-[100px] transition-all relative group flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-blue-100'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                          {/* Edit icon - shows on hover */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={14} className="text-gray-500" />
                          </div>
                          
                          {activeStaff ? (
                            <div>
                              <div className="font-medium text-gray-900 text-center">
                                {activeStaff.name}
                              </div>
                              <div className="text-sm text-gray-500 text-center mt-1">
                                {shiftTime}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-gray-500 text-center">Unstaffed</div>
                              <div className="text-sm text-gray-500 text-center mt-1">
                                {shiftTime}
                              </div>
                            </div>
                          )}
                        </button>
                        {hasUpcomingChange && (
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
  );
};

export default StaffAssignmentGrid;
