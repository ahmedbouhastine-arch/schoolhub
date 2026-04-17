import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, text }) => {
  // mapped status to color variable
  const statusMap = {
    present: 'success',
    absent: 'danger',
    substitute: 'warning',
    today: 'info',
    upcoming: 'primary' // maps to accent-primary
  };

  const type = statusMap[status?.toLowerCase()] || 'primary';

  return (
    <span className={`status-badge badge-${type}`}>
      {text || status}
    </span>
  );
};

export default StatusBadge;
