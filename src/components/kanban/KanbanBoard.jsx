import React from 'react';

const KanbanBoard = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
};

export default KanbanBoard;
