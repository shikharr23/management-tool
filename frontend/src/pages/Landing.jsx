import { useState } from "react";
import { Link } from "react-router-dom";
import NavbarLanding from "../components/NavbarLanding";
import { getStatusColor, getPriorityColor } from "../utils/helpers";

export default function Landing() {
  // Interactive tab for the workflow demonstration
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // Realistic product preview tasks
  const sampleTasks = [
    {
      id: "t-1",
      title: "Design token audit & color ramp alignment",
      desc: "Normalize Tailwind v4 tokens across components and modals.",
      status: "todo",
      priority: "medium",
      assignee: "alex.chen",
      dueDate: "Sep 12",
    },
    {
      id: "t-2",
      title: "Implement MongoDB $facet stats engine",
      desc: "Single-pass pipeline aggregating status, overdue, and workload.",
      status: "in-progress",
      priority: "high",
      assignee: "sarah.dev",
      dueDate: "Sep 9",
    },
    {
      id: "t-3",
      title: "Peer review: Role-based route guard middleware",
      desc: "Verify Owner/Manager/Member permissions across project APIs.",
      status: "review",
      priority: "high",
      assignee: "marcus.lead",
      dueDate: "Sep 10",
    },
    {
      id: "t-4",
      title: "Optimize Kanban Dnd-kit sensor constraints",
      desc: "Set 5px pointer activation distance to prevent accidental drags.",
      status: "completed",
      priority: "low",
      assignee: "alex.chen",
      dueDate: "Sep 6",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Define the Project Scope",
      description:
        "Create dedicated workspaces with custom deadlines, project goals, and team members.",
      badge: "Workspace Creation",
    },
    {
      step: "02",
      title: "Prioritize & Assign Tasks",
      description:
        "Break deliverables into actionable items with clear priorities, due dates, and direct assignees.",
      badge: "Task Distribution",
    },
    {
      step: "03",
      title: "Execute on the Visual Kanban",
      description:
        "Move tasks seamlessly across Todo, In Progress, Review, and Completed with responsive drag-and-drop.",
      badge: "Live Progression",
    },
    {
      step: "04",
      title: "Monitor Health & Deliver",
      description:
        "Track completion percentage and overdue alerts through single-pass server-side analytics.",
      badge: "Completion & Metrics",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-gray-900 selection:bg-gray-900 selection:text-white">
      {/* Sticky Product Navbar */}
      <NavbarLanding />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION (DESIGN.md §6, §7, §8)                                       */}
        {/* ========================================================================= */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto text-center">
          {/* Small Product Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Built for modern engineering and product teams
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6">
            Organize work. <br className="hidden sm:inline" />
            Move projects forward.
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            A fast, intentional Kanban workspace built with real-time project analytics,
            team workload tracking, and strict role-based access control.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto py-3 px-6 bg-gray-900 text-white text-base font-semibold rounded-md hover:bg-gray-800 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 text-center"
            >
              Get Started Free
            </Link>
            <a
              href="#preview"
              className="w-full sm:w-auto py-3 px-6 bg-white text-gray-700 text-base font-semibold border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              Explore Live Preview ↓
            </a>
          </div>

          {/* ========================================================================= */}
          {/* HERO PRODUCT PREVIEW (DESIGN.md §9, §10 - THE VISUAL HERO)               */}
          {/* ========================================================================= */}
          <div
            id="preview"
            className="rounded-xl border border-gray-200/90 bg-white shadow-md overflow-hidden text-left"
          >
            {/* Window Header Chrome */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
                <span className="ml-2 text-xs font-mono text-gray-500 hidden sm:inline">
                  project-manager.internal/project/api-v2
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  ● Live Sync
                </span>
              </div>
            </div>

            {/* Application Mockup Toolbar */}
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    API Gateway v2.0
                  </h2>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200">
                    Owner: You
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Core infrastructure migration and service discovery proxy.
                </p>
              </div>

              {/* Aggregated Health Snapshot from ProjectSidebar */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-w-[260px]">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                  <span>Project Completion</span>
                  <span className="text-gray-900 font-bold">25% (1/4 tasks)</span>
                </div>
                {/* 4-segment status bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-200">
                  <div style={{ width: "25%" }} className="bg-[#888888]" title="Todo (25%)" />
                  <div style={{ width: "25%" }} className="bg-[#1a1a1a]" title="In Progress (25%)" />
                  <div style={{ width: "25%" }} className="bg-[#6366f1]" title="Review (25%)" />
                  <div style={{ width: "25%" }} className="bg-[#10b981]" title="Completed (25%)" />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
                  <span>3 Active Tasks</span>
                  <span className="text-amber-600 font-medium">⏰ 1 Due Soon</span>
                </div>
              </div>
            </div>

            {/* Kanban Columns (Exact 4 columns: Todo, In Progress, Review, Completed) */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#fbfbfb]">
              {/* Column 1: Todo */}
              <div className="bg-[#fafafa] rounded-lg p-3.5 border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center pb-2.5 mb-3 border-b-2 border-[#888888]">
                  <span className="text-sm font-bold text-gray-700">Todo</span>
                  <span className="text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    1
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-md border border-gray-200 border-l-[3px] border-l-gray-900 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {sampleTasks[0].title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {sampleTasks[0].desc}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                      <span
                        className="text-white py-0.5 px-2 rounded font-bold capitalize"
                        style={{ backgroundColor: getPriorityColor(sampleTasks[0].priority) }}
                      >
                        {sampleTasks[0].priority}
                      </span>
                      <span className="text-gray-500 font-medium">
                        Due {sampleTasks[0].dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="bg-[#fafafa] rounded-lg p-3.5 border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center pb-2.5 mb-3 border-b-2 border-[#1a1a1a]">
                  <span className="text-sm font-bold text-gray-900">In Progress</span>
                  <span className="text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    1
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-md border border-gray-200 border-l-[3px] border-l-gray-900 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {sampleTasks[1].title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {sampleTasks[1].desc}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                      <span
                        className="text-white py-0.5 px-2 rounded font-bold capitalize"
                        style={{ backgroundColor: getPriorityColor(sampleTasks[1].priority) }}
                      >
                        {sampleTasks[1].priority}
                      </span>
                      <span className="text-amber-600 font-semibold">
                        Due {sampleTasks[1].dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Review */}
              <div className="bg-[#fafafa] rounded-lg p-3.5 border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center pb-2.5 mb-3 border-b-2 border-[#6366f1]">
                  <span className="text-sm font-bold text-indigo-700">Review</span>
                  <span className="text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    1
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-md border border-gray-200 border-l-[3px] border-l-gray-900 shadow-xs">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {sampleTasks[2].title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {sampleTasks[2].desc}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                      <span
                        className="text-white py-0.5 px-2 rounded font-bold capitalize"
                        style={{ backgroundColor: getPriorityColor(sampleTasks[2].priority) }}
                      >
                        {sampleTasks[2].priority}
                      </span>
                      <span className="text-gray-500 font-medium">
                        Due {sampleTasks[2].dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 4: Completed */}
              <div className="bg-[#fafafa] rounded-lg p-3.5 border border-gray-200 flex flex-col">
                <div className="flex justify-between items-center pb-2.5 mb-3 border-b-2 border-[#10b981]">
                  <span className="text-sm font-bold text-emerald-700">Completed</span>
                  <span className="text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                    1
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-md border border-gray-200 border-l-[3px] border-l-emerald-500 shadow-xs opacity-90">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-through text-gray-500">
                      {sampleTasks[3].title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      {sampleTasks[3].desc}
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                      <span
                        className="text-white py-0.5 px-2 rounded font-bold capitalize"
                        style={{ backgroundColor: getStatusColor(sampleTasks[3].status) }}
                      >
                        Completed
                      </span>
                      <span className="text-emerald-700 font-semibold">Done</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CORE FEATURES (DESIGN.md §11, §12 - LAYOUT VARIETY, NO 3 EQUAL CARDS)     */}
        {/* ========================================================================= */}
        <section id="features" className="py-20 border-t border-gray-200 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Core Capabilities
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Designed for execution, not administrative overhead.
              </p>
            </div>

            {/* Feature 1: Split Layout (Text Left / Interactive UI Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-24">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                  Visual Flow
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Four-stage Kanban lifecycle with sub-second drag-and-drop
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Most tools clutter simple workflows with endless nested menus. Project Manager
                  gives your team an uncompromised four-column progression:{" "}
                  <strong className="text-gray-900 font-semibold">Todo, In Progress, Review, and Completed</strong>.
                </p>
                <ul className="space-y-2.5 text-sm text-gray-600 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Activation distance constraints prevent accidental drag events
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Atomic task ordering preserved per column
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Overdue indicators visually flag tasks before deadlines slip
                  </li>
                </ul>
              </div>

              {/* Real UI demonstration */}
              <div className="lg:col-span-7 bg-[#f9fafb] p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase">Interactive Column View</span>
                  <span className="text-xs font-medium text-gray-600">Review & Quality Gate</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-indigo-200 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      In Review
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      Needs 1 Approval
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">
                    Database indexing & query plan optimization
                  </h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Created compound indexes on project and dueDate for aggregation pipelines.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                    <span className="text-gray-500 font-medium">Assignee: Sarah Jenkins</span>
                    <span className="text-emerald-600 font-semibold">All checks passing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Split Layout Inverted (UI Left / Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-24">
              {/* Live Analytics UI demonstration */}
              <div className="lg:col-span-7 order-2 lg:order-1 bg-[#f9fafb] p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase">Single-Pass Analytics</span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    GET /api/projects/:id/stats → 200 OK
                  </span>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-4 shadow-xs">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">Sprint Completion</span>
                      <span className="text-gray-900 font-bold">75% (9/12 Done)</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-gray-100">
                      <div style={{ width: "10%" }} className="bg-[#888888]" />
                      <div style={{ width: "10%" }} className="bg-[#1a1a1a]" />
                      <div style={{ width: "5%" }} className="bg-[#6366f1]" />
                      <div style={{ width: "75%" }} className="bg-[#10b981]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                      <span className="text-[11px] text-gray-500 block">Total Workload</span>
                      <span className="text-lg font-bold text-gray-900">12 Tasks</span>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded border border-amber-200">
                      <span className="text-[11px] text-amber-700 block">Due This Week</span>
                      <span className="text-lg font-bold text-amber-800">2 Tasks</span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                      <span className="text-[11px] text-emerald-700 block">Overdue</span>
                      <span className="text-lg font-bold text-emerald-800">0 Tasks</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                  Real-time Telemetry
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  High-performance aggregation without client-side loops
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Stop calculating team metrics in client browser memory. Our backend engine aggregates
                  status breakdowns, member workloads, and critical due-date boundaries in a single database pass.
                </p>
                <ul className="space-y-2.5 text-sm text-gray-600 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Instant stale-while-revalidate invalidation on task mutations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Reordering within columns bypasses unnecessary API re-fetches
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    Non-blocking UI error boundaries protect your board
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3: Role-Based Access Control */}
            <div className="border border-gray-200 rounded-xl p-8 bg-gray-50/70">
              <div className="max-w-2xl mb-8">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-white text-gray-800 rounded border border-gray-200 mb-3">
                  Enterprise Security
                </span>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  Granular Role-Based Access Control
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Keep projects organized with clear ownership boundaries. Project permissions
                  are enforced at the middleware layer on every single request.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h4 className="text-base font-bold text-gray-900">Project Owner</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Full workspace administration, member invitations, role promotions, and project deletion.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h4 className="text-base font-bold text-gray-900">Project Manager</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Sprint planning, task creation, member assignment, and column progression oversight.
                  </p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
                    <h4 className="text-base font-bold text-gray-900">Team Member</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Task execution, status progression, commentary, and individual workload management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WORKFLOW SECTION (DESIGN.md §13)                                          */}
        {/* ========================================================================= */}
        <section id="workflow" className="py-20 border-t border-gray-200 bg-[#f9fafb]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Straightforward Workflow
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                From initial idea to delivered milestone.
              </p>
            </div>

            {/* Step Progression Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    activeWorkflowStep === idx
                      ? "bg-white border-gray-900 shadow-sm ring-1 ring-gray-900/5"
                      : "bg-white/60 border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-sm font-bold text-gray-400">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COLLABORATION & ACTIVITY (DESIGN.md §14 - REAL UI PATTERNS)                */}
        {/* ========================================================================= */}
        <section id="collaboration" className="py-20 border-t border-gray-200 bg-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                  Team Alignment
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Transparent collaboration where the work actually happens
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  No disconnected chat threads or lost Jira tickets. Discussions and updates live directly
                  on the task card with author attribution, timestamps, and workload visibility.
                </p>

                {/* Team Workload preview matching ProjectSidebar */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Active Team Distribution
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          AC
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 m-0">alex.chen</p>
                          <p className="text-xs text-gray-500 m-0">Owner</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded">
                        2 tasks assigned
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                          SJ
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 m-0">sarah.dev</p>
                          <p className="text-xs text-gray-500 m-0">Manager</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded">
                        1 task assigned
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Discussion Modal Preview */}
              <div className="lg:col-span-6 bg-[#fafafa] p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-mono text-gray-400">TASK-104</span>
                      <h4 className="text-base font-bold text-gray-900">
                        Peer review: Role-based route guard middleware
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      In Review
                    </span>
                  </div>

                  {/* Comment Thread */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-900">marcus.lead</span>
                        <span className="text-[11px] text-gray-400">25m ago</span>
                      </div>
                      <p className="text-xs text-gray-600 m-0 leading-relaxed">
                        Added test cases in <code>projects.stats.test.js</code> covering 403 non-member and 401 unauthenticated requests. Passing smoothly!
                      </p>
                    </div>

                    <div className="p-3 rounded-md bg-gray-50 border border-gray-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-gray-900">alex.chen</span>
                        <span className="text-[11px] text-gray-400">12m ago</span>
                      </div>
                      <p className="text-xs text-gray-600 m-0 leading-relaxed">
                        Looks solid. Ready to merge into staging branch.
                      </p>
                    </div>
                  </div>

                  {/* Comment Composer Simulation */}
                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                    <input
                      type="text"
                      readOnly
                      placeholder="Add an engineering note or update..."
                      className="w-full text-xs p-2.5 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled
                      className="py-2 px-3 bg-gray-900 text-white text-xs font-semibold rounded opacity-60 cursor-not-allowed"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION (DESIGN.md §8)                                       */}
        {/* ========================================================================= */}
        <section className="py-20 border-t border-gray-200 bg-gray-950 text-white">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Ready to streamline your team's workflow?
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Create your first project in seconds. No bloated setup, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5 max-w-md mx-auto">
              <Link
                to="/register"
                className="py-3 px-6 bg-white text-gray-950 text-base font-bold rounded-md hover:bg-gray-100 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Create Your Workspace
              </Link>
              <Link
                to="/login"
                className="py-3 px-6 bg-gray-900 text-gray-300 border border-gray-700 text-base font-semibold rounded-md hover:bg-gray-800 hover:text-white transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER (DESIGN.md §4)                                                     */}
      {/* ========================================================================= */}
      <footer className="border-t border-gray-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 tracking-tight">Project Manager</span>
            <span>—</span>
            <span>Clean, intentional productivity SaaS</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-gray-900 transition-colors">
              Workflow
            </a>
            <Link to="/login" className="hover:text-gray-900 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
