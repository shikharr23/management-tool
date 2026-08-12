import { useState, useEffect } from "react";
import { projectService } from "../services/api";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

const emptyForm = { name: "", description: "", deadline: "" };

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      name: project.name,
      description: project.description || "",
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().split("T")[0]
        : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await projectService.update(editingId, formData);
      } else {
        await projectService.create(formData);
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 pb-10">
        <div className="flex justify-between items-start mb-10 gap-4 flex-wrap">
          <div>
            <h1 className="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Projects</h1>
            <p className="text-sm text-gray-400 m-0">{projects.length} projects</p>
          </div>
          <button
            type="button"
            className="py-2.5 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              if (showForm && !editingId) {
                resetForm();
              } else {
                setEditingId(null);
                setFormData(emptyForm);
                setShowForm(true);
              }
            }}
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-[30px] rounded-lg mb-10 flex flex-col gap-5 border border-gray-100 shadow-xs">
            <h2 className="text-lg font-semibold text-gray-900 m-0">
              {editingId ? "Edit Project" : "New Project"}
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Project Name</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Description</label>
              <textarea
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all min-h-[100px] resize-y"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="py-2.5 px-5 bg-gray-900 text-white text-sm font-semibold rounded-md hover:bg-gray-800 hover:-translate-y-px hover:shadow-md transition-all cursor-pointer"
              >
                {editingId ? "Save Changes" : "Create Project"}
              </button>
              <button
                type="button"
                className="py-2.5 px-5 text-sm font-semibold bg-gray-100 text-gray-900 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 transition-all cursor-pointer"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <p className="text-red-500 p-4 bg-red-100 rounded-md mb-6 text-sm border border-red-200">{error}</p>}

        {projects.length === 0 ? (
          <div className="text-center py-20 px-5 bg-white rounded-lg border border-gray-100">
            <p className="text-lg font-semibold text-gray-900 m-0">No projects yet.</p>
            <p className="text-sm text-gray-400 mt-2 m-0">Create one to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
