import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByBoardId, updateTask, deleteTask, createTask } from '../api/tasks.api'; // Jeden poziom w górę do api
import { getBoardById } from '../api/boards.api';
import TaskCard from '../components/tasks/TaskCard'; // Import z folderu tasks
import { useAuth } from '../hooks/useAuth';

const BoardDetailsPage = () => {
    const { boardId } = useParams();
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [boardName, setBoardName] = useState('Tasks');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(!boardId) return;
        setLoading(true);

        if (user?.role === 'guest') {
            // --- GOŚĆ: POBIERANIE LOKALNE ---
            // Pobierz nazwę tablicy z local storage
            const localBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            const foundBoard = localBoards.find(b => b.id == boardId); // == bo z URL jest string, a w ID number
            setBoardName(foundBoard ? foundBoard.name : 'Moja tablica');

            // Pobierz zadania z local storage
            const allGuestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
            const myTasks = allGuestTasks.filter(t => t.boardId == boardId);
            setTasks(myTasks);
            setLoading(false);
        } else {
            // --- USER: POBIERANIE Z API ---
            getBoardById(boardId).then(res => setBoardName(res.name)).catch(console.error);
            getTasksByBoardId(boardId)
                .then(data => {
                    setTasks(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [boardId, user]);

    // Funkcja pomocnicza do zapisu zadań gościa
    const saveGuestTasks = (newTasksList) => {
        // Musimy wziąć wszystkie zadania (również z innych tablic), usunąć stare z tej tablicy i dodać nowe
        const allGuestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
        const otherTasks = allGuestTasks.filter(t => t.boardId != boardId);
        const updatedAll = [...otherTasks, ...newTasksList];
        localStorage.setItem('guest_tasks', JSON.stringify(updatedAll));
        setTasks(newTasksList); // Aktualizuj widok
    };

    const handleToggleStatus = async (id, status) => {
        const newStatus = status === 'done' ? 'todo' : 'done';

        if (user?.role === 'guest') {
            const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
            saveGuestTasks(updatedTasks);
        } else {
            await updateTask(id, { status: newStatus });
            // Odśwież (możesz tu zrobić optymistyczną aktualizację jak wyżej)
            const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
            setTasks(updated);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Usunąć?")) return;

        if (user?.role === 'guest') {
            const updatedTasks = tasks.filter(t => t.id !== id);
            saveGuestTasks(updatedTasks);
        } else {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddTask = async () => {
        const name = prompt("Task name:");
        const deadline = prompt("Deadline (YYYY-MM-DD):");

        if(name) {
            const newTaskData = {
                name,
                deadline,
                boardId: boardId, // Tu ważne, żeby ID się zgadzało
                userId: user.id,
                status: 'todo'
            };

            if (user?.role === 'guest') {
                const taskWithId = { ...newTaskData, id: Date.now() }; // Generujemy ID
                saveGuestTasks([...tasks, taskWithId]);
            } else {
                await createTask(newTaskData);
                // Ponowne pobranie jest bezpieczniejsze przy bazie danych
                getTasksByBoardId(boardId).then(setTasks);
            }
        }
    };

    return (
        <>
            <div className="task-container">
                <div className="task-container"> {/* Powtórzenie klasy z Twojego HTML */}
                    <h1>{boardName}</h1>

                    {loading ? <p>Loading...</p> : (
                        <div className="tasks">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggleStatus={handleToggleStatus}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {tasks.length === 0 && <p>Brak zadań.</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="bottom-buttons">
                <button className="add-task-btn" onClick={handleAddTask}>+ Add Task</button>
                <button className="edit-task-btn">
                    <img src="../assets/media/edit.png" alt="edit" className="icon" /> Edit Task
                </button>
            </div>
        </>
    );
};

export default BoardDetailsPage;