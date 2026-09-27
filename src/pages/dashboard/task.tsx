import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import { FaPlus, FaTrash } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import PageShell from "../../components/PageShell";
import { rise } from "../../lib/motion";

// Columns follow the day: night (not started), sunrise (under way), full sun (done)
const STATUS_COLUMNS = [
  { key: "todo", label: "To do", dot: "bg-mood-2" },
  { key: "inprogress", label: "In progress", dot: "bg-mood-4" },
  { key: "done", label: "Done", dot: "bg-mood-5" },
];

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newStatus, setNewStatus] = useState("todo");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusWarning, setStatusWarning] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setError(null);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return;
    const { data, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (fetchError) {
      setError("Failed to fetch tasks: " + fetchError.message);
      return;
    }
    setTasks(data || []);
    // Check if status column exists
    if (data && data.length > 0 && data[0].status === undefined) {
      setStatusWarning(true);
    } else {
      setStatusWarning(false);
    }
  }

  async function addTask(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!newTask.trim()) return;
    setAdding(true);
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      setError("Not authenticated");
      setAdding(false);
      return;
    }
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert([{ description: newTask, completed: false, user_id: session.user.id, status: newStatus }])
      .select();
    if (insertError) {
      setError("Failed to add task: " + insertError.message);
      setAdding(false);
      return;
    }
    if (data) {
      setTasks([data[0], ...tasks]);
      setNewTask("");
      setNewStatus("todo");
    }
    setAdding(false);
  }

  

  async function toggleTask(id: string, completed: boolean) {
    setError(null);
    const completedAt = !completed ? new Date().toISOString() : null;
    const { error: toggleError } = await supabase.from("tasks").update({ completed: !completed, completed_at: completedAt }).eq("id", id);
    if (toggleError) {
      setError("Failed to toggle task: " + toggleError.message);
    }
    fetchTasks();
  }

  async function deleteTask(id: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", id);
    if (deleteError) {
      setError("Failed to delete task: " + deleteError.message);
    }
    setTasks(tasks.filter(task => task.id !== id));
  }

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    if (sourceCol !== destCol) {
      const taskId = result.draggableId;
      // Optimistically update UI
      const prevTasks = [...tasks];
      setTasks(tasks.map(task =>
        String(task.id) === taskId ? { ...task, status: destCol } : task
      ));
      // Update backend
      const { error: updateError } = await supabase.from("tasks").update({ status: destCol }).eq("id", taskId);
      if (updateError) {
        setError("Failed to update task status: " + updateError.message);
        setTasks(prevTasks); // revert UI
      }
    }
  };

  return (
    <PageShell title="Tasks" eyebrow="Drag a task to move it between columns">
      {statusWarning && (
        <motion.p variants={rise} role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
          The tasks table has no <code>status</code> column, so tasks can&apos;t move between columns. Add a <code>status</code> text column in Supabase.
        </motion.p>
      )}
      {error && (
        <motion.p variants={rise} role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </motion.p>
      )}

      <motion.form variants={rise} onSubmit={addTask} className="card mb-8 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label htmlFor="new-task" className="sr-only">New task</label>
        <input
          id="new-task"
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What do you need to do?"
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-ink placeholder:text-muted/70 focus:outline-none"
        />
        <div className="flex gap-2">
          <label htmlFor="new-task-status" className="sr-only">Column</label>
          <select
            id="new-task-status"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="flex-1 rounded-full border border-line bg-surface/70 px-4 py-2.5 text-sm font-medium text-ink focus:border-iris focus:outline-none sm:flex-none"
          >
            {STATUS_COLUMNS.map(col => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
          <button type="submit" disabled={adding || !newTask.trim()} className="btn-primary">
            <FaPlus aria-hidden className="text-sm" /> Add task
          </button>
        </div>
      </motion.form>

      <DragDropContext onDragEnd={onDragEnd}>
        <motion.div variants={rise} className="grid gap-5 md:grid-cols-3">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = tasks.filter(task => (task.status || "todo") === col.key);
            return (
              <Droppable droppableId={col.key} key={col.key}>
                {(provided, snapshot) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex min-h-[320px] flex-col rounded-3xl border p-4 transition-colors duration-200 ${snapshot.isDraggingOver ? 'border-iris bg-iris-soft/80 shadow-glow' : 'border-white/40 bg-surface/50 shadow-soft backdrop-blur-xl dark:border-white/10'}`}
                  >
                    <h2 className="mb-4 flex items-center gap-2.5 px-1 font-semibold">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} aria-hidden />
                      {col.label}
                      <span className="ml-auto rounded-full bg-iris-soft px-2.5 py-0.5 text-xs font-semibold text-iris">{columnTasks.length}</span>
                    </h2>
                    <div className="flex-1 space-y-2.5">
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">Drop a task here</p>
                      )}
                      {columnTasks.map((task, idx) => (
                        <Draggable draggableId={String(task.id)} index={idx} key={task.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group flex items-start gap-3 rounded-2xl border bg-surface/90 p-4 transition-[box-shadow,border-color] ${snapshot.isDragging ? 'rotate-2 border-iris shadow-glow' : 'border-line hover:border-iris/40 hover:shadow-[0_14px_30px_-16px_rgb(var(--iris)/0.55)]'}`}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id, task.completed)}
                                aria-label={`Mark "${task.description}" as ${task.completed ? 'not finished' : 'finished'}`}
                                className="mt-1 h-4 w-4 shrink-0 accent-iris"
                              />
                              <span className={`flex-1 break-words leading-snug ${task.completed ? 'text-muted line-through' : ''}`}>{task.description}</span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Delete task "${task.description}"`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100 dark:hover:bg-red-950/40"
                              >
                                <FaTrash aria-hidden className="text-sm" />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            );
          })}
        </motion.div>
      </DragDropContext>
    </PageShell>
  );
}
