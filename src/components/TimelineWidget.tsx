import React from 'react';

type Stage = {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'past' | 'current' | 'future';
};

const DUMMY_STAGES: Stage[] = [
  {
    id: 'stage-1',
    title: 'Voter Registration',
    date: 'Ongoing - Oct 15',
    description: 'Ensure you are registered to vote in your state or local district.',
    status: 'past'
  },
  {
    id: 'stage-2',
    title: 'Campaigning Period',
    date: 'Current Phase',
    description: 'Candidates share their platforms, participate in debates, and rally supporters.',
    status: 'current'
  },
  {
    id: 'stage-3',
    title: 'Early Voting',
    date: 'Oct 20 - Nov 2',
    description: 'Cast your ballot ahead of the official Election Day at designated locations.',
    status: 'future'
  },
  {
    id: 'stage-4',
    title: 'Election Day',
    date: 'November 5',
    description: 'The final day to cast your vote in person. Polls typically close at 7 PM or 8 PM.',
    status: 'future'
  }
];

export const TimelineWidget: React.FC = React.memo(() => {
  return (
    <div className="timeline-widget glass-panel">
       <div className="timeline-header">
           <h3>Election Timeline</h3>
           <p className="subtitle">Key dates and stages</p>
       </div>
       
       <div className="timeline-track">
         {DUMMY_STAGES.map((stage, index) => {
           // Create a simple generic calendar link for demonstration
           const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(stage.title)}&details=${encodeURIComponent(stage.description)}&dates=20241105T120000Z/20241105T130000Z`;

           return (
             <div key={stage.id} className={`timeline-item ${stage.status}`}>
                <div className="timeline-marker">
                   <div className="marker-dot"></div>
                   {index < DUMMY_STAGES.length - 1 && <div className="marker-line"></div>}
                </div>
                <div className="timeline-content">
                    <span className="timeline-date">{stage.date}</span>
                    <h4>{stage.title}</h4>
                    <p>{stage.description}</p>
                    {stage.status !== 'past' && (
                       <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm" style={{ marginTop: '0.8rem', display: 'inline-block', fontSize: '0.75rem'}}>
                          + Add to Calendar
                       </a>
                    )}
                </div>
             </div>
           );
         })}
       </div>
    </div>
  );
});
