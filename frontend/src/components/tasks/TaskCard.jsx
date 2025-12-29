import React from 'react';

const TaskCard = ({ task, onToggleStatus, onDelete }) => {
    const formattedDate = task.deadline
        ? new Date(task.deadline).toLocaleDateString('pl-PL')
        : 'Brak terminu';

    const isDone = task.status === 'done';

    return (
        <div className="task-card" style={isDone ? { opacity: 0.6 } : {}}>
            <p className="task-title" style={isDone ? { textDecoration: 'line-through' } : {}}>
                {task.name}
            </p>

            <p className="task-desc">{task.description || 'Project node.js'}</p>
            <p className="task-desc">Deadline: {formattedDate}</p>

            <div className="task-actions">
                <button
                    className="complete-btn"
                    onClick={() => onToggleStatus(task.id, task.status)}
                >
                    ✔
                </button>
                <button
                    className="delete-btn"
                    onClick={() => onDelete(task.id)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default TaskCard;