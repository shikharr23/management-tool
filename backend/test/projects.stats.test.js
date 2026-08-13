import test from "node:test";
import assert from "node:assert/strict";
import authMiddleware, { authorizeProject } from "../middleware/authMiddleware.js";
import Project from "../models/Project.js";

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

// Pure formatter helper replicating the stats endpoint aggregation shaping
function formatAggregationResult(rawStats) {
  const totalTasks = rawStats?.total?.[0]?.count || 0;

  const byStatus = {
    todo: 0,
    "in-progress": 0,
    review: 0,
    completed: 0,
  };
  (rawStats?.byStatus || []).forEach((item) => {
    if (item._id && byStatus[item._id] !== undefined) {
      byStatus[item._id] = item.count;
    }
  });

  const byPriority = {
    low: 0,
    medium: 0,
    high: 0,
  };
  (rawStats?.byPriority || []).forEach((item) => {
    if (item._id && byPriority[item._id] !== undefined) {
      byPriority[item._id] = item.count;
    }
  });

  const completedTasks = byStatus.completed;
  const completionRate = totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0;
  const overdueCount = rawStats?.overdue?.[0]?.count || 0;
  const dueSoonCount = rawStats?.dueSoon?.[0]?.count || 0;

  const memberWorkload = (rawStats?.memberWorkload || []).map((item) => ({
    userId: item._id ? item._id.toString() : null,
    count: item.count,
  }));

  return {
    totalTasks,
    completedTasks,
    completionRate,
    byStatus,
    byPriority,
    overdueCount,
    dueSoonCount,
    memberWorkload,
  };
}

// Helper evaluating date boundaries exactly as defined in MongoDB aggregation match stages
function categorizeDeadline(task, nowTimestamp) {
  if (!task.dueDate || task.status === "completed") {
    return "neither";
  }
  const taskDueDate = new Date(task.dueDate).getTime();
  const inThreeDays = nowTimestamp + 3 * 24 * 60 * 60 * 1000;

  if (taskDueDate <= nowTimestamp) {
    return "overdue";
  }
  if (taskDueDate > nowTimestamp && taskDueDate <= inThreeDays) {
    return "dueSoon";
  }
  return "neither";
}

test("formatAggregationResult correctly formats mixed project tasks across all 4 statuses", () => {
  const rawStats = {
    total: [{ count: 10 }],
    byStatus: [
      { _id: "todo", count: 2 },
      { _id: "in-progress", count: 3 },
      { _id: "review", count: 1 },
      { _id: "completed", count: 4 },
    ],
    byPriority: [
      { _id: "low", count: 3 },
      { _id: "medium", count: 5 },
      { _id: "high", count: 2 },
    ],
    overdue: [{ count: 2 }],
    dueSoon: [{ count: 3 }],
    memberWorkload: [
      { _id: "user-1", count: 5 },
      { _id: "user-2", count: 3 },
      { _id: null, count: 2 },
    ],
  };

  const formatted = formatAggregationResult(rawStats);

  assert.equal(formatted.totalTasks, 10);
  assert.equal(formatted.completedTasks, 4);
  assert.equal(formatted.completionRate, 40.0);
  assert.deepEqual(formatted.byStatus, {
    todo: 2,
    "in-progress": 3,
    review: 1,
    completed: 4,
  });
  assert.deepEqual(formatted.byPriority, {
    low: 3,
    medium: 5,
    high: 2,
  });
  assert.equal(formatted.overdueCount, 2);
  assert.equal(formatted.dueSoonCount, 3);
  assert.equal(formatted.memberWorkload.length, 3);
  assert.deepEqual(formatted.memberWorkload[2], { userId: null, count: 2 });
});

test("formatAggregationResult safely handles empty project (0 tasks) with zero division protection", () => {
  const rawStats = {
    total: [],
    byStatus: [],
    byPriority: [],
    overdue: [],
    dueSoon: [],
    memberWorkload: [],
  };

  const formatted = formatAggregationResult(rawStats);

  assert.equal(formatted.totalTasks, 0);
  assert.equal(formatted.completedTasks, 0);
  assert.equal(formatted.completionRate, 0);
  assert.deepEqual(formatted.byStatus, {
    todo: 0,
    "in-progress": 0,
    review: 0,
    completed: 0,
  });
  assert.deepEqual(formatted.byPriority, {
    low: 0,
    medium: 0,
    high: 0,
  });
  assert.equal(formatted.overdueCount, 0);
  assert.equal(formatted.dueSoonCount, 0);
  assert.deepEqual(formatted.memberWorkload, []);
});

test("Date boundary evaluation accurately categorizes task deadlines", () => {
  const now = new Date("2026-08-14T00:00:00.000Z").getTime();
  const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;
  const fourDaysLater = now + 4 * 24 * 60 * 60 * 1000;

  // 1. dueDate === now -> overdue
  assert.equal(
    categorizeDeadline({ dueDate: new Date(now), status: "todo" }, now),
    "overdue"
  );

  // 2. dueDate < now -> overdue
  assert.equal(
    categorizeDeadline({ dueDate: new Date(now - 1000), status: "in-progress" }, now),
    "overdue"
  );

  // 3. dueDate === now + 3 days -> dueSoon
  assert.equal(
    categorizeDeadline({ dueDate: new Date(threeDaysLater), status: "review" }, now),
    "dueSoon"
  );

  // 4. dueDate > now + 3 days -> neither
  assert.equal(
    categorizeDeadline({ dueDate: new Date(fourDaysLater), status: "todo" }, now),
    "neither"
  );

  // 5. dueDate === null / undefined -> neither
  assert.equal(
    categorizeDeadline({ dueDate: null, status: "todo" }, now),
    "neither"
  );
  assert.equal(
    categorizeDeadline({ status: "todo" }, now),
    "neither"
  );

  // 6. completed task with past dueDate is not overdue
  assert.equal(
    categorizeDeadline({ dueDate: new Date(now - 10000), status: "completed" }, now),
    "neither"
  );
});

test("RBAC authorization rules for stats endpoint: unauthenticated -> 401", async () => {
  const req = { headers: {} };
  const res = createMockResponse();
  let nextCalled = false;

  await authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { msg: "No token provided" });
});

test("RBAC authorization rules: Project Owner, Manager, Member, Admin allowed; Non-member rejected with 403", async () => {
  const originalFindById = Project.findById;

  const mockProject = {
    _id: "project-123",
    owner: "user-owner",
    members: [
      { user: "user-manager", role: "projectManager" },
      { user: "user-member", role: "member" },
    ],
  };

  Project.findById = async () => mockProject;

  try {
    // 1. Project Owner -> 200 (nextCalled: true)
    {
      const req = { params: { id: "project-123" }, user: { id: "user-owner", role: "user" } };
      const res = createMockResponse();
      let nextCalled = false;
      await authorizeProject([])(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    }

    // 2. Project Manager -> 200 (nextCalled: true)
    {
      const req = { params: { id: "project-123" }, user: { id: "user-manager", role: "user" } };
      const res = createMockResponse();
      let nextCalled = false;
      await authorizeProject([])(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    }

    // 3. Project Member -> 200 (nextCalled: true)
    {
      const req = { params: { id: "project-123" }, user: { id: "user-member", role: "user" } };
      const res = createMockResponse();
      let nextCalled = false;
      await authorizeProject([])(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    }

    // 4. System Admin -> 200 (nextCalled: true)
    {
      const req = { params: { id: "project-123" }, user: { id: "user-external", role: "admin" } };
      const res = createMockResponse();
      let nextCalled = false;
      await authorizeProject([])(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
    }

    // 5. Non-member (regular user) -> 403 (nextCalled: false)
    {
      const req = { params: { id: "project-123" }, user: { id: "user-stranger", role: "user" } };
      const res = createMockResponse();
      let nextCalled = false;
      await authorizeProject([])(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.deepEqual(res.body, { msg: "You are not a member of this project" });
    }
  } finally {
    Project.findById = originalFindById;
  }
});
