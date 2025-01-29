-- Seed data for FastDesk platform

-- Insert Organizations
INSERT INTO organizations (id, name, description) VALUES
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'GauntletAI', 'An learning platform for the next generation of developers'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'UniverseTech', 'A made up company');

-- Insert/Update profiles for all users (both workers and customers)
INSERT INTO user_profiles (id, email, full_name, user_type, user_status, company, metadata, external_metadata) VALUES
    ('USER_ID_1', 'USER_EMAIL_1', 'USER_FULL_NAME_1', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_2', 'USER_EMAIL_2', 'USER_FULL_NAME_2', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_3', 'USER_EMAIL_3', 'USER_FULL_NAME_3', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_4', 'USER_EMAIL_4', 'USER_FULL_NAME_4', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_5', 'USER_EMAIL_5', 'USER_FULL_NAME_5', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_6', 'USER_EMAIL_6', 'USER_FULL_NAME_6', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_7', 'USER_EMAIL_7', 'USER_FULL_NAME_7', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_8', 'USER_EMAIL_8', 'USER_FULL_NAME_8', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_9', 'USER_EMAIL_9', 'USER_FULL_NAME_9', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_10', 'USER_EMAIL_10', 'USER_FULL_NAME_10', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_11', 'USER_EMAIL_11', 'USER_FULL_NAME_11', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_12', 'USER_EMAIL_12', 'USER_FULL_NAME_12', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_13', 'USER_EMAIL_13', 'USER_FULL_NAME_13', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_14', 'USER_EMAIL_14', 'USER_FULL_NAME_14', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_15', 'USER_EMAIL_15', 'USER_FULL_NAME_15', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_16', 'USER_EMAIL_16', 'USER_FULL_NAME_16', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_17', 'USER_EMAIL_17', 'USER_FULL_NAME_17', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_18', 'USER_EMAIL_18', 'USER_FULL_NAME_18', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_19', 'USER_EMAIL_19', 'USER_FULL_NAME_19', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_20', 'USER_EMAIL_20', 'USER_FULL_NAME_20', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_21', 'USER_EMAIL_21', 'USER_FULL_NAME_21', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_22', 'USER_EMAIL_22', 'USER_FULL_NAME_22', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_23', 'USER_EMAIL_23', 'USER_FULL_NAME_23', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_24', 'USER_EMAIL_24', 'USER_FULL_NAME_24', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_25', 'USER_EMAIL_25', 'USER_FULL_NAME_25', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_26', 'USER_EMAIL_26', 'USER_FULL_NAME_26', 'customer', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_27', 'USER_EMAIL_27', 'USER_FULL_NAME_27', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_28', 'USER_EMAIL_28', 'USER_FULL_NAME_28', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_29', 'USER_EMAIL_29', 'USER_FULL_NAME_29', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_30', 'USER_EMAIL_30', 'USER_FULL_NAME_30', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb),
    ('USER_ID_31', 'USER_EMAIL_31', 'USER_FULL_NAME_31', 'worker', 'offline', null, '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type,
    user_status = EXCLUDED.user_status,
    company = EXCLUDED.company,
    metadata = EXCLUDED.metadata,
    external_metadata = EXCLUDED.external_metadata;

-- Insert organization members
INSERT INTO organization_members (organization_id, profile_id, organization_role) VALUES
    -- GauntletAI workers
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_1', 'admin'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_2', 'member'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_27', 'member'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_28', 'member'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_29', 'member'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_30', 'member'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_31', 'member'),
    
    -- UniverseTech worker
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_3', 'admin'),
    
    -- GauntletAI customers (even numbered users)
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_4', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_6', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_8', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_10', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_12', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_14', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_16', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_18', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_20', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_22', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_24', 'customer'),
    ('d7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_26', 'customer'),
    
    -- UniverseTech customers (odd numbered users)
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_5', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_7', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_9', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_11', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_13', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_15', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_17', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_19', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_21', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_23', 'customer'),
    ('e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_25', 'customer');

-- Insert tags
INSERT INTO tags (id, name, color, description) VALUES
    ('a1a2c49c-f34d-4c5b-8d54-d123f229a111', 'bug', '#FF0000', 'Software bugs and issues'),
    ('b2b3c49c-f34d-4c5b-8d54-d123f229b222', 'feature-request', '#00FF00', 'New feature requests'),
    ('c3c4c49c-f34d-4c5b-8d54-d123f229c333', 'billing', '#0000FF', 'Billing related issues');

-- Insert templates
INSERT INTO templates (id, title, content, organization_id, created_by) VALUES
    ('d4d5c49c-f34d-4c5b-8d54-d123f229d444', 'Welcome Response', 'Thank you for contacting FastDesk support. I''ll be happy to help you today.', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'USER_ID_1'),
    ('e5e6c49c-f34d-4c5b-8d54-d123f229e555', 'Billing FAQ', 'Here are our most common billing questions and answers...', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'USER_ID_3');

-- Insert tickets
INSERT INTO tickets (id, title, user_id, organization_id, ticket_status, ticket_priority, ticket_source, created_by_type, created_by_id) VALUES
    -- Existing GauntletAI tickets
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'Cannot access dashboard', 'USER_ID_4', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'high', 'customer_portal', 'customer', 'USER_ID_4'),
    ('b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'Feature suggestion', 'USER_ID_6', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'pending', 'low', 'customer_portal', 'customer', 'USER_ID_6'),
    
    -- Existing UniverseTech ticket
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'Billing cycle question', 'USER_ID_5', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'new', 'medium', 'email', 'customer', 'USER_ID_5'),

    -- New GauntletAI tickets (using even-numbered customers)
    ('11111111-1111-4111-1111-111111111111', 'Integration API not working', 'USER_ID_8', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'high', 'customer_portal', 'customer', 'USER_ID_8'),
    ('22222222-2222-4222-2222-222222222222', 'Need help with webhook setup', 'USER_ID_10', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'pending', 'medium', 'customer_portal', 'customer', 'USER_ID_10'),
    ('33333333-3333-4333-3333-333333333333', 'Custom domain configuration', 'USER_ID_12', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'new', 'low', 'email', 'customer', 'USER_ID_12'),
    ('44444444-4444-4444-4444-444444444444', 'Account upgrade request', 'USER_ID_14', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'medium', 'customer_portal', 'customer', 'USER_ID_14'),
    ('55555555-5555-4555-5555-555555555555', 'Data export not working', 'USER_ID_16', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'pending', 'high', 'customer_portal', 'customer', 'USER_ID_16'),

    -- New UniverseTech tickets (using odd-numbered customers)
    ('66666666-6666-4666-6666-666666666666', 'Password reset issues', 'USER_ID_7', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'new', 'high', 'email', 'customer', 'USER_ID_7'),
    ('77777777-7777-4777-7777-777777777777', 'Billing address update', 'USER_ID_9', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'open', 'low', 'customer_portal', 'customer', 'USER_ID_9'),
    ('88888888-8888-4888-8888-888888888888', 'Feature request: Dark mode', 'USER_ID_11', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'pending', 'low', 'customer_portal', 'customer', 'USER_ID_11'),
    ('99999999-9999-4999-9999-999999999999', 'Mobile app crash', 'USER_ID_13', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'open', 'high', 'customer_portal', 'customer', 'USER_ID_13'),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'Account deletion request', 'USER_ID_15', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', 'new', 'medium', 'email', 'customer', 'USER_ID_15'),

    -- New GauntletAI Technical Tickets
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'GraphQL Subscription Connection Issues in Production', 'USER_ID_4', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'high', 'customer_portal', 'customer', 'USER_ID_4'),
    ('cccccccc-cccc-4ccc-cccc-cccccccccccc', 'WebAssembly Module Loading Failure in Safari', 'USER_ID_6', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'new', 'high', 'customer_portal', 'customer', 'USER_ID_6'),
    ('dddddddd-dddd-4ddd-dddd-dddddddddddd', 'Redis Cluster Replication Lag Spikes', 'USER_ID_8', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'urgent', 'email', 'customer', 'USER_ID_8'),
    ('eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'Kubernetes Pod Autoscaling Not Triggering on Custom Metrics', 'USER_ID_10', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'pending', 'high', 'customer_portal', 'customer', 'USER_ID_10'),
    ('ffffffff-ffff-4fff-ffff-ffffffffffff', 'WebRTC ICE Candidate Negotiation Failing Behind Corporate Proxy', 'USER_ID_12', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'high', 'customer_portal', 'customer', 'USER_ID_12'),
    ('11111111-2222-4333-4444-555555555555', 'gRPC Stream Memory Leak in Node.js Client', 'USER_ID_14', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'new', 'high', 'email', 'customer', 'USER_ID_14'),
    ('22222222-3333-4444-5555-666666666666', 'ElasticSearch Percolator Query Performance Degradation', 'USER_ID_16', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'medium', 'customer_portal', 'customer', 'USER_ID_16'),
    ('33333333-4444-5555-6666-777777777777', 'Docker Image Layer Caching Issues in CI/CD Pipeline', 'USER_ID_18', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'new', 'high', 'customer_portal', 'customer', 'USER_ID_18'),
    ('44444444-5555-6666-7777-888888888888', 'TypeScript Generic Constraints Breaking After Upgrade', 'USER_ID_20', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'open', 'medium', 'customer_portal', 'customer', 'USER_ID_20'),
    ('55555555-6666-7777-8888-999999999999', 'OAuth2 Token Refresh Race Condition in Multi-Tab Environment', 'USER_ID_22', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', 'pending', 'high', 'customer_portal', 'customer', 'USER_ID_22');

-- Insert ticket assignments
INSERT INTO ticket_assignments (ticket_id, worker_id, organization_id, is_primary) VALUES
    -- Existing assignments
    -- GauntletAI assignments
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'USER_ID_2', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    -- UniverseTech assignments
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),

    -- New GauntletAI assignments (alternating between workers 1 and 2)
    ('11111111-1111-4111-1111-111111111111', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('22222222-2222-4222-2222-222222222222', 'USER_ID_2', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('33333333-3333-4333-3333-333333333333', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('44444444-4444-4444-4444-444444444444', 'USER_ID_2', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('55555555-5555-4555-5555-555555555555', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),

    -- New UniverseTech assignments (all to worker 3)
    ('66666666-6666-4666-6666-666666666666', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),
    ('77777777-7777-4777-7777-777777777777', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),
    ('88888888-8888-4888-8888-888888888888', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),
    ('99999999-9999-4999-9999-999999999999', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'USER_ID_3', 'e8b2c49c-f34d-4c5b-8d54-d123f229a86f', true),

    -- New technical ticket assignments (distributed among GauntletAI workers)
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'USER_ID_27', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('cccccccc-cccc-4ccc-cccc-cccccccccccc', 'USER_ID_28', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('dddddddd-dddd-4ddd-dddd-dddddddddddd', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'USER_ID_29', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('ffffffff-ffff-4fff-ffff-ffffffffffff', 'USER_ID_2', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('11111111-2222-4333-4444-555555555555', 'USER_ID_30', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('22222222-3333-4444-5555-666666666666', 'USER_ID_31', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('33333333-4444-5555-6666-777777777777', 'USER_ID_27', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('44444444-5555-6666-7777-888888888888', 'USER_ID_28', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true),
    ('55555555-6666-7777-8888-999999999999', 'USER_ID_1', 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', true);

-- Insert ticket tags
INSERT INTO ticket_tags (ticket_id, tag_id) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'c3c4c49c-f34d-4c5b-8d54-d123f229c333'),
    ('b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222'),
    ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222'),
    ('cccccccc-cccc-4ccc-cccc-cccccccccccc', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('dddddddd-dddd-4ddd-dddd-dddddddddddd', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222'),
    ('ffffffff-ffff-4fff-ffff-ffffffffffff', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('11111111-2222-4333-4444-555555555555', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('22222222-3333-4444-5555-666666666666', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222'),
    ('33333333-4444-5555-6666-777777777777', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('44444444-5555-6666-7777-888888888888', 'a1a2c49c-f34d-4c5b-8d54-d123f229a111'),
    ('55555555-6666-7777-8888-999999999999', 'b2b3c49c-f34d-4c5b-8d54-d123f229b222');

-- Insert knowledge base articles
INSERT INTO kb_articles (id, title, content, author_id, kb_status, published_at) VALUES
    ('c9c0c49c-f34d-4c5b-8d54-d123f229c999', 'Getting Started Guide', 'Welcome to FastDesk! Here''s how to get started...', 'USER_ID_1', 'published', now()),
    ('d0d1c49c-f34d-4c5b-8d54-d123f229d000', 'Billing FAQ', 'Frequently asked questions about billing...', 'USER_ID_3', 'published', now());

-- Insert ticket feedback
INSERT INTO ticket_feedback (ticket_id, rating, comment) VALUES
    ('f6f7c49c-f34d-4c5b-8d54-d123f229f666', 5, 'Great and quick support!'),
    ('a7a8c49c-f34d-4c5b-8d54-d123f229a777', 4, 'Good response, but took a while');
