

PRAGMA foreign_keys = OFF;

--password: pass
INSERT INTO Users (id, username, email, password, role, createdAt, updatedAt) VALUES
(1, 'Admin', 'admin@test.com', '$2b$10$H/isggGenryQg7z0aW08hO3h6yluIK/HdWUt840l3zOgfLJlDpvl6', 'admin', DATETIME('now'), DATETIME('now')),
(2, 'Jan', 'jan@test.com', '$2b$10$H/isggGenryQg7z0aW08hO3h6yluIK/HdWUt840l3zOgfLJlDpvl6', 'user', DATETIME('now'), DATETIME('now')),
(3, 'Anna', 'anna@test.com', '$2b$10$H/isggGenryQg7z0aW08hO3h6yluIK/HdWUt840l3zOgfLJlDpvl6', 'user', DATETIME('now'), DATETIME('now')),
(4, 'Piotr', 'piotr@test.com', '$2b$10$H/isggGenryQg7z0aW08hO3h6yluIK/HdWUt840l3zOgfLJlDpvl6', 'user', DATETIME('now'), DATETIME('now'));


INSERT INTO Boards (id, name, description, ownerId, createdAt) VALUES
(1, 'IT project', 'A very important project' ,2, DATETIME('now')),
(2, 'My stuff', '-' , 2, DATETIME('now')),
(3, 'Marketing', 'Marketing stuff general' , 3, DATETIME('now')),
(4, 'Admin board', 'For admin tasks', 1, DATETIME('now'));


INSERT INTO Tasks (id, title, description, status, boardId, createdAt, deadline) VALUES
-- board 1 (Jan)
(1, 'Create DB', 'MYSQL and relations', 'completed', 1, DATETIME('now'), DATETIME('now', '+7 days')),
(2, 'Write API', 'Express.js', 'to do', 1, DATETIME('now'), DATETIME('now', '+7 days')),
(3, 'Frontend', 'All styles', 'to do',  1, DATETIME('now'), DATETIME('now', '+7 days')),

-- board 2 (Jan)
(4, 'Buy gifts', 'mother, father and sister', 'to do', 2, DATETIME('now'), DATETIME('now', '+7 days')),

-- board 3 (Anna)
(5, 'Social media campaign', 'Prepare posts', 'to do', 3,DATETIME('now'), DATETIME('now', '+7 days')),
(6, 'Yearly HQ meeting', 'Prepare presentation', 'completed',  3,DATETIME('now'), DATETIME('now', '+7 days')),

-- board 4 (admin)
(7, 'Vulnerability assessment', 'Check vulnerabilities', 'to do',  4,DATETIME('now'), DATETIME('now', '+7 days')),
(8, 'Check logs', '-', 'to do',  4, DATETIME('now'),DATETIME('now', '+7 days')),
(9, 'Delete outdated users', 'Server 3', 'completed',  4, DATETIME('now'),DATETIME('now', '+7 days'));



INSERT INTO task_members (taskId, userId, role, joinedAt) VALUES
-- task 1: Jan owner
(1, 2, 'owner', DATETIME('now')),

-- task 2: Jan owner, Anna member
(2, 2, 'owner', DATETIME('now')),
(2, 3, 'member', DATETIME('now')),

-- task 3: Jan owner, admin member
(3, 2, 'owner', DATETIME('now')),
(3, 1, 'member', DATETIME('now')),

-- task 4: Jan owner
(4, 2, 'owner', DATETIME('now')),

-- task 5: Anna owner, admin member
(5, 3, 'owner', DATETIME('now')),
(5, 1, 'member', DATETIME('now')),

-- task 6: Anna owner
(6, 3, 'owner', DATETIME('now')),

-- task 7: Admin owner
(7, 1, 'owner', DATETIME('now')),
(8, 1, 'owner', DATETIME('now')),
(9, 1, 'owner', DATETIME('now'));




PRAGMA foreign_keys = ON;