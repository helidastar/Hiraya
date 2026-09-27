import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaStar, FaRegStar } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import PageShell from "../../components/PageShell";
import { rise } from "../../lib/motion";

// Hiraya means "the fruit of one's hopes and dreams". Hopes are stored in the
// tasks table: status is the column, and "completed" means the hope came true.
// Columns follow the day: night (dreaming), sunrise (working on it), full sun (came true)
const STATUS_COLUMNS = [
  { key: "todo", label: "Dreaming", hint: "Hopes you're holding on to", dot: "bg-mood-2" },
  { key: "inprogress", label: "Working on it", hint: "Hopes you're taking steps toward", dot: "bg-mood-4" },
  { key: "done", label: "Came true", hint: "Hopes that became real", dot: "bg-mood-5" },
];

type Hope = {
  id: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  status?: string;
  created_at: string;
};

export default function HopesPage() {
  const [tasks, setTasks] = useState<Hope[]>([]);
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
      setError("Failed to load hopes: " + fetchError.message);
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
      .insert([{ description: newTask.trim(), completed: false, user_id: session.user.id, status: newStatus }])
      .select();
    if (insertError) {
      setError("Failed to add hope: " + insertError.message);
      setAdding(false);
      return;
    }
    if (data) {
      // Added straight into "Came true": mark it completed too
      if (newStatus === "done") {
        const completedAt = new Date().toISOString();
        await supabase.from("tasks").update({ completed: true, completed_at: completedAt }).eq("id", data[0].id);
        data[0] = { ...data[0], completed: true, completed_at: completedAt };
      }
      setTasks([data[0], ...tasks]);
      setNewTask("");
      setNewStatus("todo");
    }
    setAdding(false);
  }

  

  // Starring a hope moves it to "Came true"; unstarring sends it back to "Dreaming"
  async function toggleTask(id: string, completed: boolean) {
    setError(null);
    const cameTrue = !completed;
    const changes = { completed: cameTrue, completed_at: cameTrue ? new Date().toISOString() : null, status: cameTrue ? "done" : "todo" };
    setTasks(tasks.map(t => t.id === id ? { ...t, ...changes } : t));
    const { error: toggleError } = await supabase.from("tasks").update(changes).eq("id", id);
    if (toggleError) {
      setError("Failed to update hope: " + toggleError.message);
      fetchTasks();
    } else if (cameTrue) {
      toast("A hope came true", { icon: "✦" });
    }
  }

  async function deleteTask(id: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", id);
    if (deleteError) {
      setError("Failed to delete hope: " + deleteError.message);
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
      // A hope in "Came true" counts as completed, so it shows on the dashboard
      const cameTrue = destCol === "done";
      const changes = { status: destCol, completed: cameTrue, completed_at: cameTrue ? new Date().toISOString() : null };
      setTasks(tasks.map(task =>
        String(task.id) === taskId ? { ...task, ...changes } : task
      ));
      if (cameTrue) toast("A hope came true", { icon: "✦" });
      // Update backend
      const { error: updateError } = await supabase.from("tasks").update(changes).eq("id", taskId);
      if (updateError) {
        setError("Failed to move hope: " + updateError.message);
        setTasks(prevTasks); // revert UI
      }
    }
  };

  return (
    <PageShell title="Hopes" eyebrow="The fruit of your hopes and dreams">
      {statusWarning && (
        <motion.p variants={rise} role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
          The tasks table has no <code>status</code> column, so hopes can&apos;t move between columns. Add a <code>status</code> text column in Supabase.
        </motion.p>
      )}
      {error && (
        <motion.p variants={rise} role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </motion.p>
      )}

      <motion.form variants={rise} onSubmit={addTask} className="card mb-8 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label htmlFor="new-task" className="sr-only">New hope</label>
        <input
          id="new-task"
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What are you hoping for?"
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
            <FaPlus aria-hidden className="text-sm" /> Add hope
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
                    <h2 className="flex items-center gap-2.5 px-1 font-semibold">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} aria-hidden />
                      {col.label}
                      <span className="ml-auto rounded-full bg-iris-soft px-2.5 py-0.5 text-xs font-semibold text-iris">{columnTasks.length}</span>
                    </h2>
                    <p className="mb-4 mt-1 px-1 text-xs text-muted">{col.hint}</p>
                    <div className="flex-1 space-y-2.5">
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">Drop a hope here</p>
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
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.8, rotate: -20 }}
                                onClick={() => toggleTask(task.id, task.completed)}
                                aria-pressed={task.completed}
                                aria-label={task.completed ? `Mark "${task.description}" as not come true yet` : `Mark "${task.description}" as come true`}
                                className={`mt-0.5 shrink-0 text-lg transition ${task.completed ? 'text-mood-5 drop-shadow-[0_0_8px_rgb(var(--mood-5)/0.8)]' : 'text-muted hover:text-mood-5'}`}
                              >
                                {task.completed ? <FaStar /> : <FaRegStar />}
                              </motion.button>
                              <span className="flex-1 break-words leading-snug">{task.description}</span>
                              <button
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Delete hope "${task.description}"`}
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
