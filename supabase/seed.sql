-- Seed data for FastDesk platform

-- Insert Teams
INSERT INTO teams (id, name, description) VALUES
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'Technical Support', 'Primary technical support team'),
    ('f9b2c49c-f34d-4c5b-8d54-d123f229a86e', 'Customer Success', 'Customer success and account management'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'Billing Support', 'Billing and payment support');

-- Insert test users (profiles)
INSERT INTO auth.users (id, email, encrypted_password) VALUES
    ('a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'john.doe@fastdesk.com', '$2a$10$kX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.'),
    ('b2c3d49c-f34d-4c5b-8d54-d123f229a456', 'jane.smith@fastdesk.com', '$2a$10$kX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.'),
    ('c3d4e49c-f34d-4c5b-8d54-d123f229a789', 'mike.wilson@fastdesk.com', '$2a$10$kX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.KX1.');

-- Insert profiles for the test users
INSERT INTO profiles (id, full_name, role, avatar_url) VALUES
    ('a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'John Doe', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
    ('b2c3d49c-f34d-4c5b-8d54-d123f229a456', 'Jane Smith', 'agent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'),
    ('c3d4e49c-f34d-4c5b-8d54-d123f229a789', 'Mike Wilson', 'agent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike');

-- Insert team members
INSERT INTO team_members (team_id, profile_id, role_in_team) VALUES
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'lead'),
    ('f9b2c49c-f34d-4c5b-8d54-d123f229a86e', 'b2c3d49c-f34d-4c5b-8d54-d123f229a456', 'member'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'c3d4e49c-f34d-4c5b-8d54-d123f229a789', 'member');

-- Insert customers
INSERT INTO customers (id, email, full_name, company, metadata) VALUES
    ('d4e5f49c-f34d-4c5b-8d54-d123f229abcd', 'alice@example.com', 'Alice Johnson', 'TechCorp', '{"plan": "enterprise", "region": "US-West"}'),
    ('e5f6a49c-f34d-4c5b-8d54-d123f229bcde', 'bob@example.com', 'Bob Brown', 'DevInc', '{"plan": "pro", "region": "US-East"}'),
    ('f6a7b49c-f34d-4c5b-8d54-d123f229cdef', 'carol@example.com', 'Carol White', 'WebSoft', '{"plan": "starter", "region": "EU"}');

-- Insert tags
INSERT INTO tags (id, name, color, description) VALUES
    ('a1a2c49c-f34d-4c5b-8d54-d123f229a111', 'bug', '#FF0000', 'Software bugs and issues'),
    ('b2b3c49c-f34d-4c5b-8d54-d123f229b222', 'feature-request', '#00FF00', 'New feature requests'),
    ('c3c4c49c-f34d-4c5b-8d54-d123f229c333', 'billing', '#0000FF', 'Billing related issues');

-- Insert templates
INSERT INTO templates (id, title, content, team_id, created_by) VALUES
    ('d4d5c49c-f34d-4c5b-8d54-d123f229d444', 'Welcome Response', 'Thank you for contacting FastDesk support. I''ll be happy to help you today.', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'a1b2c49c-f34d-4c5b-8d54-d123f229a123'),
    ('e5e6c49c-f34d-4c5b-8d54-d123f229e555', 'Billing FAQ', 'Here are our most common billing questions and answers...', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'c3d4e49c-f34d-4c5b-8d54-d123f229a789');

-- Insert tickets
INSERT INTO tickets (id, title, description, customer_id, assigned_to, team_id, status, priority) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'Cannot access dashboard', 'Getting 403 error when trying to access the dashboard', 'd4e5f49c-f34d-4c5b-8d54-d123f229abcd', 'a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'high'),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'Billing cycle question', 'Need clarification about the billing cycle', 'e5f6a49c-f34d-4c5b-8d54-d123f229bcde', 'c3d4e49c-f34d-4c5b-8d54-d123f229a789', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'new', 'medium'),
    ('b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'Feature suggestion', 'Would love to see dark mode', 'f6a7b49c-f34d-4c5b-8d54-d123f229cdef', 'b2c3d49c-f34d-4c5b-8d54-d123f229a456', 'f9b2c49c-f34d-4c5b-8d54-d123f229a86e', 'pending', 'low');

-- Insert ticket messages
INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, content, is_internal) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'customer', 'd4e5f49c-f34d-4c5b-8d54-d123f229abcd', 'I keep getting a 403 error when trying to access the dashboard. Can you help?', false),
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'agent', 'a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'I''ll look into this right away. Can you confirm when this started happening?', false),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'customer', 'e5f6a49c-f34d-4c5b-8d54-d123f229bcde', 'When exactly does the billing cycle start?', false);

-- Insert ticket tags
INSERT INTO ticket_tags (ticket_id, tag_id) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'c3c4c49c-f34d-4c5b-8d54-d123f229c333'),
    ('b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222');

-- Insert knowledge base articles
INSERT INTO kb_articles (id, title, content, author_id, status, published_at) VALUES
    ('c9c0c49c-f34d-4c5b-8d54-d123f229c999', 'Getting Started Guide', 'Welcome to FastDesk! Here''s how to get started...', 'a1b2c49c-f34d-4c5b-8d54-d123f229a123', 'published', now()),
    ('d0d1c49c-f34d-4c5b-8d54-d123f229d000', 'Billing FAQ', 'Frequently asked questions about billing...', 'c3d4e49c-f34d-4c5b-8d54-d123f229a789', 'published', now());

-- Insert ticket feedback
INSERT INTO ticket_feedback (ticket_id, rating, comment) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 5, 'Great and quick support!'),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 4, 'Good response, but took a while');
