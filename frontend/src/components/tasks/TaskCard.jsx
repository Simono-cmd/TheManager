import React from 'react';
import '../../assets/styles/task-style.css';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
    const formattedDate = task.deadline
        ? new Date(task.deadline).toLocaleDateString('pl-PL')
        : 'No deadline';

    const isCompleted = task.status === 'completed';

    return (
        <div className={`task-card ${isCompleted ? 'completed' : ''}`}>
            <div className="task-header">
                <h3 className="task-title">
                    {task.title}
                </h3>
            </div>

            <p className="task-desc">
                {task.description || 'No description'}
            </p>

            <p className="task-date">
                Deadline: {formattedDate}
            </p>

            <div className="task-actions">
                <button
                    className="btn-action btn-toggle"
                    onClick={() => onToggleStatus(task)}
                    title={isCompleted ? "Oznacz jako do zrobienia" : "Oznacz jako wykonane"}
                >
                    ✔
                </button>

                <button
                    className="btn-action btn-edit"
                    onClick={onEdit}
                    title="Edytuj"
                >
                    ✎
                </button>

                <button
                    className="btn-action btn-delete"
                    onClick={onDelete}
                    title="Usuń"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default TaskCard;