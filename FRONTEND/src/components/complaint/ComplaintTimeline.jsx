import React from 'react';

/** Standard successful lifecycle path (linear) */
const STANDARD_STEPS = [
   { key: 'submitted', label: 'Submitted' },
   { key: 'in_review', label: 'In Review' },
   { key: 'assigned', label: 'Assigned' },
   { key: 'in_progress', label: 'In Progress' },
   { key: 'resolved', label: 'Resolved' },
   { key: 'closed', label: 'Closed' },
];

function getSteps(currentStatus, events = []) {
   if (currentStatus === 'rejected') {
      const hadAssigned = Array.isArray(events) && events.some(
         (e) => e.newStatus === 'assigned' || e.action === 'assigned'
      );
      return hadAssigned
         ? [
              { key: 'submitted', label: 'Submitted' },
              { key: 'in_review', label: 'In Review' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'rejected', label: 'Rejected' },
           ]
         : [
              { key: 'submitted', label: 'Submitted' },
              { key: 'in_review', label: 'In Review' },
              { key: 'rejected', label: 'Rejected' },
           ];
   }
   return STANDARD_STEPS;
}

function getStepState(stepKey, currentStatus, steps) {
   if (currentStatus === 'rejected') {
      if (stepKey === 'rejected') return 'rejected';
      return 'done';
   }

   if (currentStatus === 'closed') {
      return 'done';
   }

   const currentIdx = steps.findIndex((s) => s.key === currentStatus);
   const stepIdx = steps.findIndex((s) => s.key === stepKey);
   if (currentIdx === -1) return 'pending';
   if (stepIdx < currentIdx) return 'done';
   if (stepIdx === currentIdx) return 'active';
   return 'pending';
}

/**
 * ComplaintTimeline
 *
 * Vertical stepper that renders the complaint lifecycle progression:
 *   submitted → in_review → assigned → in_progress → resolved → closed
 *   (or branches to rejected only if rejected)
 *
 * @param {string} currentStatus - The current lifecycle stage key
 * @param {Array}  [events]      - Optional audit timeline events
 */
const ComplaintTimeline = ({ currentStatus = 'submitted', events = [] }) => {
   const steps = getSteps(currentStatus, events);

   return (
      <div className="flex flex-col gap-0">
         {steps.map((step, idx) => {
            const state = getStepState(step.key, currentStatus, steps);
            const isLast = idx === steps.length - 1;

            /* Node styling */
            const nodeCls =
               state === 'done'
                  ? 'bg-success border-success text-background'
                  : state === 'active'
                     ? 'bg-transparent border-primary-accent text-primary-accent ring-4 ring-primary-accent/20'
                     : state === 'rejected'
                        ? 'bg-[#FBF0F0] border-[#BA1A1A] text-[#BA1A1A] ring-4 ring-[#BA1A1A]/20'
                        : 'bg-surface border-border text-muted-text';

            /* Connector line styling */
            const lineCls =
               state === 'done'
                  ? 'border-success'
                  : state === 'rejected'
                     ? 'border-[#BA1A1A]'
                     : 'border-border border-dashed';

            return (
               <div key={step.key} className="flex items-stretch gap-3">
                  {/* Left column: node + connector */}
                  <div className="flex flex-col items-center">
                     {/* Circle node */}
                     <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${nodeCls} transition-all duration-300`}
                     >
                        {state === 'done' ? (
                           /* Checkmark */
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                           </svg>
                        ) : state === 'active' ? (
                           /* Pulse dot */
                           <span className="w-2.5 h-2.5 rounded-full bg-primary-accent animate-pulse" />
                        ) : state === 'rejected' ? (
                           /* Rejection cross */
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        ) : (
                           /* Empty dot */
                           <span className="w-2 h-2 rounded-full bg-muted-text/30" />
                        )}
                     </div>

                     {/* Connector line */}
                     {!isLast && (
                        <div className={`flex-1 w-px border-l-2 my-1 ${lineCls} min-h-6`} />
                     )}
                  </div>

                  {/* Right column: label */}
                  <div className={`pb-5 flex items-start pt-0.5 ${isLast ? 'pb-0' : ''}`}>
                     <span
                        className={`text-sm font-medium transition-colors duration-200 ${state === 'done'
                           ? 'text-success'
                           : state === 'active'
                              ? 'text-primary-accent font-semibold'
                              : state === 'rejected'
                                 ? 'text-[#BA1A1A] font-semibold'
                                 : 'text-muted-text'
                           }`}
                     >
                        {step.label}
                     </span>
                     {state === 'active' && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-primary-accent/70 bg-primary-accent/10 border border-primary-accent/20 px-1.5 py-0.5 rounded-full">
                           Active
                        </span>
                     )}
                     {state === 'rejected' && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-[#BA1A1A] bg-[#FBF0F0] border border-[#F3C5C5] px-1.5 py-0.5 rounded-full">
                           Rejected
                        </span>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
};

export default ComplaintTimeline;
