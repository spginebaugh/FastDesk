
DO $$
DECLARE
    -- GauntletAI Messages
    MSG_GA_1 CONSTANT text := 'I keep getting a 403 error when trying to access the dashboard. I''ve cleared my cache and tried different browsers but nothing works.';
    MSG_GA_2 CONSTANT text := 'I''ll look into this right away. Can you confirm when this started happening?';
    MSG_GA_3 CONSTANT text := 'It started happening after the latest update, about 2 hours ago.';
    MSG_GA_4 CONSTANT text := 'I have a suggestion for improving the platform. Would be great to have keyboard shortcuts for common actions.';
    MSG_GA_5 CONSTANT text := 'Thank you for the suggestion! Could you share some specific actions you''d like to see shortcuts for?';
    MSG_GA_6 CONSTANT text := 'Sure! Things like Ctrl+N for new ticket, Ctrl+S for save, Ctrl+F for search would be really helpful.';
    
    -- UniverseTech Messages
    MSG_UT_1 CONSTANT text := 'Could you explain when the billing cycle starts and ends? I was charged on an unexpected date.';
    MSG_UT_2 CONSTANT text := 'The billing cycle starts on the 1st of each month. Let me check your specific account details.';
    MSG_UT_3 CONSTANT text := 'Thanks, I was charged on the 15th last month, which seemed unusual.';
    
    -- New GauntletAI Messages
    MSG_NGA_1 CONSTANT text := 'The integration API is returning 500 errors consistently. Here are the logs...';
    MSG_NGA_2 CONSTANT text := 'I see the issue in the logs. There seems to be a configuration mismatch.';
    MSG_NGA_3 CONSTANT text := 'I''ve corrected the configuration. Please try again and let me know if it works.';
    MSG_NGA_4 CONSTANT text := 'Need help setting up webhooks for event notifications';
    MSG_NGA_5 CONSTANT text := 'I''ll guide you through the webhook setup process. First, let''s verify your endpoint.';
    MSG_NGA_6 CONSTANT text := 'Here''s our webhook documentation for reference...';
    MSG_NGA_7 CONSTANT text := 'How do I set up a custom domain for my workspace?';
    MSG_NGA_8 CONSTANT text := 'I''ll help you with the custom domain setup. Do you have your DNS records ready?';
    MSG_NGA_9 CONSTANT text := 'Here are the required DNS records you''ll need to add...';
    MSG_NGA_10 CONSTANT text := 'I''d like to upgrade to the enterprise plan';
    MSG_NGA_11 CONSTANT text := 'I''ll help you with the upgrade process. Let me pull up your current subscription details.';
    MSG_NGA_12 CONSTANT text := 'Here are the enterprise features you''ll get access to...';
    MSG_NGA_13 CONSTANT text := 'The data export feature is stuck at 0%';
    MSG_NGA_14 CONSTANT text := 'Let me check the export logs. What time did you initiate the export?';
    MSG_NGA_15 CONSTANT text := 'I''ve identified the issue. There was a temporary storage constraint.';

    -- New UniverseTech Messages
    MSG_NUT_1 CONSTANT text := 'Not receiving password reset emails';
    MSG_NUT_2 CONSTANT text := 'I''ll help you with the password reset. Let me check our email delivery logs.';
    MSG_NUT_3 CONSTANT text := 'I''ve verified your email address and resent the reset link.';
    MSG_NUT_4 CONSTANT text := 'Need to update billing address for tax purposes';
    MSG_NUT_5 CONSTANT text := 'I can help you update your billing information. What''s the new address?';
    MSG_NUT_6 CONSTANT text := 'I''ve updated the billing address. You''ll see this reflected in your next invoice.';
    MSG_NUT_7 CONSTANT text := 'Would love to see a dark mode option';
    MSG_NUT_8 CONSTANT text := 'Thank you for the suggestion! We''re actually working on this feature.';
    MSG_NUT_9 CONSTANT text := 'I''ve added you to the beta testing list for dark mode.';
    MSG_NUT_10 CONSTANT text := 'App keeps crashing on startup after latest update';
    MSG_NUT_11 CONSTANT text := 'I''m sorry to hear about the crashes. Could you share your app version and device info?';
    MSG_NUT_12 CONSTANT text := 'Thanks for the info. This is a known issue we''re fixing in version 2.0.5.';
    MSG_NUT_13 CONSTANT text := 'I want to delete my account and all associated data';
    MSG_NUT_14 CONSTANT text := 'I can help you with the account deletion. Please note this action is irreversible.';
    MSG_NUT_15 CONSTANT text := 'I''ve initiated the deletion process. It will complete within 30 days.';

    -- Additional worker response messages
    MSG_AWR_1 CONSTANT text := 'I''ve also added additional logging to prevent this issue in the future.';
    MSG_AWR_2 CONSTANT text := 'Here''s a guide for monitoring your API health metrics...';
    MSG_AWR_3 CONSTANT text := 'I''ve tested your webhook endpoint and it''s responding correctly now.';
    MSG_AWR_4 CONSTANT text := 'Would you like me to help you set up retry policies for failed webhooks?';
    MSG_AWR_5 CONSTANT text := 'Your SSL certificate has been provisioned successfully.';
    MSG_AWR_6 CONSTANT text := 'I''ve verified that your custom domain is now working properly.';
    MSG_AWR_7 CONSTANT text := 'I''ve scheduled a demo of our enterprise security features.';
    MSG_AWR_8 CONSTANT text := 'Here''s a comparison document of your current plan vs enterprise.';
    MSG_AWR_9 CONSTANT text := 'I''ve also added additional security measures to your account.';
    MSG_AWR_10 CONSTANT text := 'Here''s a guide for setting up 2FA for additional security...';
    MSG_AWR_11 CONSTANT text := 'I''ve also updated your tax exemption status as requested.';
    MSG_AWR_12 CONSTANT text := 'The dark mode beta will be available next week. Here''s how to enable it...';
    MSG_AWR_13 CONSTANT text := 'In the meantime, here''s a workaround you can try...';
    MSG_AWR_14 CONSTANT text := 'I''ve sent you an export of your data for your records.';
    MSG_AWR_15 CONSTANT text := 'Please confirm once you''ve received the data export.';

    -- GraphQL Subscription Messages
    MSG_GQL_1 CONSTANT text := 'Our GraphQL subscriptions are randomly disconnecting in production. We''re using Apollo Client 3.7.x with WebSocket transport. The issue seems to occur more frequently during high traffic periods. Here''s our connection config and error logs...';
    MSG_GQL_2 CONSTANT text := 'I''ll help investigate this. Could you confirm if you''re using any load balancers or if there are any network policies that might affect WebSocket connections? Also, what''s your current ping timeout configuration?';
    MSG_GQL_3 CONSTANT text := 'Yes, we''re using AWS ELB with sticky sessions enabled. Ping timeout is set to 30s. We noticed the disconnections happen even when the server load is relatively low.';
    MSG_GQL_4 CONSTANT text := 'Thanks for the details. I''ve reviewed your logs and noticed that the WebSocket connections are being terminated by the load balancer. Let''s try increasing the idle timeout on your ELB to 60s to match your application timeouts.';
    MSG_GQL_5 CONSTANT text := 'Internal note: Checked CloudWatch metrics - seeing consistent WebSocket termination patterns around the 30s mark. Possible race condition between app and ELB timeouts.';
    MSG_GQL_6 CONSTANT text := 'I noticed this issue in the logs. Have you considered implementing a reconnection strategy using exponential backoff? This could help handle temporary disconnections more gracefully.';
    MSG_GQL_7 CONSTANT text := 'We''ve updated the ELB timeout settings, but we''re still seeing intermittent disconnections. The reconnection strategy sounds promising - do you have any example configurations?';
    MSG_GQL_8 CONSTANT text := 'Here''s a recommended configuration for Apollo Client with exponential backoff...';
    MSG_GQL_9 CONSTANT text := 'Adding to this - you might also want to implement connection status monitoring. Here''s a code snippet that helps track connection state changes and automatically triggers reconnection...';
    MSG_GQL_10 CONSTANT text := 'We''ve implemented both suggestions but are still experiencing disconnections every few hours. Now seeing this new error in the logs: "Too many connection attempts in the last 5 minutes"';

    -- WebAssembly Safari Messages
    MSG_WAS_1 CONSTANT text := 'After deploying our latest WebAssembly module, Safari users are reporting "CompileError: WebAssembly.instantiate(): Wasm code generation disallowed by embedder". Works fine in Chrome and Firefox. Using wasm-pack with rust-wasm bindgen.';
    MSG_WAS_2 CONSTANT text := 'This is likely related to Safari''s strict security policies. Can you share your Content-Security-Policy headers and the wasm-pack build configuration?';
    MSG_WAS_3 CONSTANT text := 'Here are our current CSP headers: [headers provided]. We''re using default wasm-pack configuration with target web.';
    MSG_WAS_4 CONSTANT text := 'I see the issue. You''ll need to add ''wasm-unsafe-eval'' to your script-src directive. Also, ensure you have cross-origin isolation headers set.';
    MSG_WAS_5 CONSTANT text := 'Internal note: Customer''s implementation doesn''t follow Safari''s latest security requirements for WebAssembly. Need to update our documentation.';
    MSG_WAS_6 CONSTANT text := 'Also noticed you''re not using the latest wasm-bindgen. Version 0.2.84+ includes specific fixes for Safari''s security policies.';
    MSG_WAS_7 CONSTANT text := 'Updated CSP headers and wasm-bindgen, but now getting "SharedArrayBuffer is not defined" errors in Safari.';
    MSG_WAS_8 CONSTANT text := 'You''ll need to add these COOP/COEP headers to enable SharedArrayBuffer support...';
    MSG_WAS_9 CONSTANT text := 'To add to this, consider implementing a fallback mechanism for browsers without SharedArrayBuffer support. Here''s a pattern we''ve seen work well...';
    MSG_WAS_10 CONSTANT text := 'Added the headers and fallback, but Safari users are now reporting significant performance degradation compared to Chrome. Any ideas?';

    -- Redis Cluster Messages
    MSG_RDS_1 CONSTANT text := 'Experiencing significant replication lag in our Redis cluster (>500ms). Running Redis 6.2.6 with 3 masters and 3 replicas. Network metrics show no obvious bottlenecks. MONITOR output shows heavy EVAL commands usage.';
    MSG_RDS_2 CONSTANT text := 'Let''s investigate this. Could you provide: 1) INFO REPLICATION output from all nodes 2) Recent SLOWLOG entries 3) Are these EVAL commands part of a specific Lua script?';
    MSG_RDS_3 CONSTANT text := '[Provides requested logs] The EVAL commands are from our rate limiting implementation using a sliding window algorithm.';
    MSG_RDS_4 CONSTANT text := 'I see the issue. Your Lua script is performing multiple ZSET operations which are being replicated individually. We should optimize this to reduce replication overhead.';
    MSG_RDS_5 CONSTANT text := 'Internal note: Rate limiting script needs major optimization. Current implementation causing unnecessary write ops.';
    MSG_RDS_6 CONSTANT text := 'Looking at the SLOWLOG, I notice the GC is also impacting replication. Consider adjusting your maxmemory-policy.';
    MSG_RDS_7 CONSTANT text := 'We''ve optimized the Lua script and adjusted memory settings. Lag improved but still seeing spikes to 200ms during peak hours.';
    MSG_RDS_8 CONSTANT text := 'Let''s try partitioning your rate limiting keys across multiple shards. Here''s an updated script that includes key sharding...';
    MSG_RDS_9 CONSTANT text := 'Additionally, you might want to consider implementing a local cache layer to reduce Redis operations. Here''s an example using a two-tier rate limiting approach...';
    MSG_RDS_10 CONSTANT text := 'Implemented sharding and local caching, but now seeing occasional "CROSSSLOT Keys in request don''t hash to the same slot" errors during key migration.';

    -- Kubernetes HPA Messages
    MSG_HPA_1 CONSTANT text := 'HPA not scaling pods based on our custom metrics adapter. Using k8s 1.24, prometheus-adapter with custom rules. Metrics are visible in prometheus but HPA shows <unknown> for current value. Here''s our HPA config and metrics adapter logs...';
    MSG_HPA_2 CONSTANT text := 'I''ll help troubleshoot the HPA configuration. Please share: 1) Output of kubectl describe hpa 2) Your prometheus-adapter rules config 3) A sample of the raw prometheus query you''re trying to use';
    MSG_HPA_3 CONSTANT text := '[Shares requested information] The prometheus query works in the UI but the adapter seems to be having issues with the metric name format.';
    MSG_HPA_4 CONSTANT text := 'I see the issue. Your metric names need to be reformatted to match the k8s naming convention. Here''s the corrected rules configuration...';
    MSG_HPA_5 CONSTANT text := 'Internal note: Customer''s prometheus-adapter config doesn''t follow k8s metric naming best practices. Should update our documentation.';
    MSG_HPA_6 CONSTANT text := 'Also noticed your HPA is configured with too aggressive scaling parameters. Consider adjusting stabilization windows to prevent thrashing.';
    MSG_HPA_7 CONSTANT text := 'Updated metric names and stabilization windows. Now metrics are visible but scaling is very slow to react to traffic spikes.';
    MSG_HPA_8 CONSTANT text := 'Let''s fine-tune your scaling thresholds. Here''s a recommended configuration based on your traffic patterns...';
    MSG_HPA_9 CONSTANT text := 'You might also want to consider implementing predictive scaling using the Prometheus Prediction API. Here''s an example configuration...';
    MSG_HPA_10 CONSTANT text := 'After implementing these changes, we''re seeing pods scale up properly but they''re not scaling down even after traffic decreases. Metrics show normal levels but pods remain.';

    -- WebRTC Messages
    MSG_WRT_1 CONSTANT text := 'WebRTC peer connections failing to establish behind our corporate proxy. ICE candidates gathering completes but connection state never progresses. Using TURN server with TCP/TLS fallback. Wireshark capture and ICE candidate logs attached.';
    MSG_WRT_2 CONSTANT text := 'Thanks for the detailed logs. Let''s verify: 1) TURN server configuration 2) Corporate proxy settings for UDP/TCP/TLS 3) ICE candidate priorities';
    MSG_WRT_3 CONSTANT text := '[Provides configurations] We''re using Coturn with default ports. Corporate firewall only allows outbound 80/443.';
    MSG_WRT_4 CONSTANT text := 'I see the issue. Your TURN server needs to be configured to handle TCP traffic on port 443. Here''s the required Coturn configuration...';
    MSG_WRT_5 CONSTANT text := 'Internal note: Customer needs enterprise-grade TURN setup. Current configuration won''t scale well with their security requirements.';
    MSG_WRT_6 CONSTANT text := 'Looking at your ICE candidate logs, you should also implement ICE restart on connection failures. Here''s a code example...';
    MSG_WRT_7 CONSTANT text := 'Updated TURN config and implemented ICE restart. Connections now establish but we''re seeing frequent disconnections.';
    MSG_WRT_8 CONSTANT text := 'Let''s implement connection monitoring and automatic fallback to relay-only candidates when needed...';
    MSG_WRT_9 CONSTANT text := 'Also consider implementing bandwidth estimation to adjust video quality dynamically. Here''s how to configure this...';
    MSG_WRT_10 CONSTANT text := 'Implemented all suggestions but still seeing high packet loss (>15%) on some connections, even with relay candidates.';

    -- gRPC Stream Messages
    MSG_GRP_1 CONSTANT text := 'Memory leak detected in Node.js service using gRPC bi-directional streams. Heap snapshots show accumulation of _stream objects. Using @grpc/grpc-js 1.8.x with Node 18. Memory grows ~50MB/hour under normal load.';
    MSG_GRP_2 CONSTANT text := 'Let''s analyze this. Could you provide: 1) Your stream handling code 2) Current error handling implementation 3) Are you properly closing streams?';
    MSG_GRP_3 CONSTANT text := '[Shares code] We''re using try-catch blocks and calling cancel() on error. Still seeing memory growth.';
    MSG_GRP_4 CONSTANT text := 'I see several issues. You need to properly handle stream.end() events and implement backpressure. Here''s the corrected implementation...';
    MSG_GRP_5 CONSTANT text := 'Internal note: Customer''s gRPC implementation missing crucial stream lifecycle handling. Need to add examples to docs.';
    MSG_GRP_6 CONSTANT text := 'Also noticed you''re not handling server pushback correctly. You should implement retry with exponential backoff.';
    MSG_GRP_7 CONSTANT text := 'Implemented proper stream handling and backoff. Memory growth slowed but still seeing gradual increase.';
    MSG_GRP_8 CONSTANT text := 'Let''s implement proper stream pooling and cleanup. Here''s a pattern using a connection pool...';
    MSG_GRP_9 CONSTANT text := 'You should also consider implementing circuit breaking for stream creation. Here''s an example using Hystrix...';
    MSG_GRP_10 CONSTANT text := 'Added pooling and circuit breaking, but now seeing "Too many active streams" errors during high traffic periods.';

    -- ElasticSearch Messages
    MSG_ELS_1 CONSTANT text := 'Percolator queries taking >2s after index grew to 100GB. Running ES 7.17 with 5 data nodes. Noticed high JVM garbage collection time. Query and index settings attached.';
    MSG_ELS_2 CONSTANT text := 'I''ll help optimize this. Please share: 1) Current index settings and mappings 2) GC logs 3) A sample of slow percolator queries';
    MSG_ELS_3 CONSTANT text := '[Provides requested information] We have about 50k percolator queries stored, most with complex boolean conditions.';
    MSG_ELS_4 CONSTANT text := 'I see several optimization opportunities. First, let''s adjust your index settings to better handle percolator queries. Here''s the optimized configuration...';
    MSG_ELS_5 CONSTANT text := 'Internal note: Customer''s percolator usage exceeds recommended limits. Need to propose architectural changes.';
    MSG_ELS_6 CONSTANT text := 'Looking at your query patterns, you should also consider implementing query pre-filtering. Here''s an example using the percolator query API...';
    MSG_ELS_7 CONSTANT text := 'Applied the optimizations and pre-filtering. Query times improved but GC pauses still occurring during peak loads.';
    MSG_ELS_8 CONSTANT text := 'Let''s tune your JVM settings and implement query result caching. Here''s the recommended configuration...';
    MSG_ELS_9 CONSTANT text := 'Consider implementing a query result cache using Redis. Here''s a pattern we''ve seen work well...';
    MSG_ELS_10 CONSTANT text := 'Implemented caching but seeing cache inconsistencies when percolator queries are updated. Some stale results being returned.';

    -- TypeScript Messages
    MSG_TS_1 CONSTANT text := 'After upgrading to TypeScript 4.9, our generic constraints are causing unexpected type errors. Specifically with conditional types and mapped types. Code worked fine in 4.8. Minimal reproduction case attached.';
    MSG_TS_2 CONSTANT text := 'I''ll help investigate the type regression. Could you share: 1) The specific error messages 2) Your tsconfig.json 3) The affected type definitions';
    MSG_TS_3 CONSTANT text := '[Provides requested information] The errors mainly occur in our utility types that use infer with nested conditionals.';
    MSG_TS_4 CONSTANT text := 'I see the issue. TypeScript 4.9 changed how it handles conditional type inference. Here''s how to refactor your utility types...';
    MSG_TS_5 CONSTANT text := 'Internal note: This is a breaking change in TS 4.9 that affects many customers. Need to update migration guide.';
    MSG_TS_6 CONSTANT text := 'Also noticed some potential performance issues with your type definitions. Consider using these optimizations...';
    MSG_TS_7 CONSTANT text := 'Refactored the types, but now getting "Type instantiation is excessively deep and possibly infinite" errors.';
    MSG_TS_8 CONSTANT text := 'Let''s break down the recursive types into smaller chunks. Here''s how to restructure them...';
    MSG_TS_9 CONSTANT text := 'You might also want to consider using template literal types instead. Here''s an alternative approach...';
    MSG_TS_10 CONSTANT text := 'Implemented the changes but now seeing type inference issues with our React components using these utility types.';
BEGIN
    INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, content, content_format, is_internal) 
    VALUES
    -- Existing messages for GauntletAI tickets
    ('f6f7c49c-0001-4c5b-8d54-d123f229f666', 'f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GA_1), 'tiptap', false),
    ('f6f7c49c-0002-4c5b-8d54-d123f229f666', 'f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'worker', 'USER_ID_1', create_tiptap_content(MSG_GA_2), 'tiptap', false),
    ('f6f7c49c-0003-4c5b-8d54-d123f229f666', 'f6f7c49c-f34d-4c5b-8d54-d123f229f666', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GA_3), 'tiptap', false),
    ('b8b9c49c-0001-4c5b-8d54-d123f229b888', 'b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'customer', 'USER_ID_6', create_tiptap_content(MSG_GA_4), 'tiptap', false),
    ('b8b9c49c-0002-4c5b-8d54-d123f229b888', 'b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'worker', 'USER_ID_2', create_tiptap_content(MSG_GA_5), 'tiptap', false),
    ('b8b9c49c-0003-4c5b-8d54-d123f229b888', 'b8b9c49c-f34d-4c5b-8d54-d123f229b888', 'customer', 'USER_ID_6', create_tiptap_content(MSG_GA_6), 'tiptap', false),

    -- Existing messages for UniverseTech ticket
    ('a7a8c49c-0001-4c5b-8d54-d123f229a777', 'a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'customer', 'USER_ID_5', create_tiptap_content(MSG_UT_1), 'tiptap', false),
    ('a7a8c49c-0002-4c5b-8d54-d123f229a777', 'a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'worker', 'USER_ID_3', create_tiptap_content(MSG_UT_2), 'tiptap', false),
    ('a7a8c49c-0003-4c5b-8d54-d123f229a777', 'a7a8c49c-f34d-4c5b-8d54-d123f229a777', 'customer', 'USER_ID_5', create_tiptap_content(MSG_UT_3), 'tiptap', false),

    -- New GauntletAI ticket messages
    ('11111111-1111-4111-1111-111111111001', '11111111-1111-4111-1111-111111111111', 'customer', 'USER_ID_8', create_tiptap_content(MSG_NGA_1), 'tiptap', false),
    ('11111111-1111-4111-1111-111111111002', '11111111-1111-4111-1111-111111111111', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_2), 'tiptap', false),
    ('11111111-1111-4111-1111-111111111003', '11111111-1111-4111-1111-111111111111', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_3), 'tiptap', false),
    ('22222222-2222-4222-2222-222222222001', '22222222-2222-4222-2222-222222222222', 'customer', 'USER_ID_10', create_tiptap_content(MSG_NGA_4), 'tiptap', false),
    ('22222222-2222-4222-2222-222222222002', '22222222-2222-4222-2222-222222222222', 'worker', 'USER_ID_2', create_tiptap_content(MSG_NGA_5), 'tiptap', false),
    ('22222222-2222-4222-2222-222222222003', '22222222-2222-4222-2222-222222222222', 'worker', 'USER_ID_2', create_tiptap_content(MSG_NGA_6), 'tiptap', false),
    ('33333333-3333-4333-3333-333333333001', '33333333-3333-4333-3333-333333333333', 'customer', 'USER_ID_12', create_tiptap_content(MSG_NGA_7), 'tiptap', false),
    ('33333333-3333-4333-3333-333333333002', '33333333-3333-4333-3333-333333333333', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_8), 'tiptap', false),
    ('33333333-3333-4333-3333-333333333003', '33333333-3333-4333-3333-333333333333', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_9), 'tiptap', false),
    ('44444444-4444-4444-4444-444444444001', '44444444-4444-4444-4444-444444444444', 'customer', 'USER_ID_14', create_tiptap_content(MSG_NGA_10), 'tiptap', false),
    ('44444444-4444-4444-4444-444444444002', '44444444-4444-4444-4444-444444444444', 'worker', 'USER_ID_2', create_tiptap_content(MSG_NGA_11), 'tiptap', false),
    ('44444444-4444-4444-4444-444444444003', '44444444-4444-4444-4444-444444444444', 'worker', 'USER_ID_2', create_tiptap_content(MSG_NGA_12), 'tiptap', false),
    ('55555555-5555-4555-5555-555555555001', '55555555-5555-4555-5555-555555555555', 'customer', 'USER_ID_16', create_tiptap_content(MSG_NGA_13), 'tiptap', false),
    ('55555555-5555-4555-5555-555555555002', '55555555-5555-4555-5555-555555555555', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_14), 'tiptap', false),
    ('55555555-5555-4555-5555-555555555003', '55555555-5555-4555-5555-555555555555', 'worker', 'USER_ID_1', create_tiptap_content(MSG_NGA_15), 'tiptap', false),

    -- New UniverseTech ticket messages
    ('66666666-6666-4666-6666-666666666001', '66666666-6666-4666-6666-666666666666', 'customer', 'USER_ID_7', create_tiptap_content(MSG_NUT_1), 'tiptap', false),
    ('66666666-6666-4666-6666-666666666002', '66666666-6666-4666-6666-666666666666', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_2), 'tiptap', false),
    ('66666666-6666-4666-6666-666666666003', '66666666-6666-4666-6666-666666666666', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_3), 'tiptap', false),
    ('77777777-7777-4777-7777-777777777001', '77777777-7777-4777-7777-777777777777', 'customer', 'USER_ID_9', create_tiptap_content(MSG_NUT_4), 'tiptap', false),
    ('77777777-7777-4777-7777-777777777002', '77777777-7777-4777-7777-777777777777', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_5), 'tiptap', false),
    ('77777777-7777-4777-7777-777777777003', '77777777-7777-4777-7777-777777777777', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_6), 'tiptap', false),
    ('88888888-8888-4888-8888-888888888001', '88888888-8888-4888-8888-888888888888', 'customer', 'USER_ID_11', create_tiptap_content(MSG_NUT_7), 'tiptap', false),
    ('88888888-8888-4888-8888-888888888002', '88888888-8888-4888-8888-888888888888', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_8), 'tiptap', false),
    ('88888888-8888-4888-8888-888888888003', '88888888-8888-4888-8888-888888888888', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_9), 'tiptap', false),
    ('99999999-9999-4999-9999-999999999001', '99999999-9999-4999-9999-999999999999', 'customer', 'USER_ID_13', create_tiptap_content(MSG_NUT_10), 'tiptap', false),
    ('99999999-9999-4999-9999-999999999002', '99999999-9999-4999-9999-999999999999', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_11), 'tiptap', false),
    ('99999999-9999-4999-9999-999999999003', '99999999-9999-4999-9999-999999999999', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_12), 'tiptap', false),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaa001', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'customer', 'USER_ID_15', create_tiptap_content(MSG_NUT_13), 'tiptap', false),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaa002', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_14), 'tiptap', false),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaa003', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'worker', 'USER_ID_3', create_tiptap_content(MSG_NUT_15), 'tiptap', false),

    -- Additional worker responses (15 more detailed follow-ups)
    ('11111111-1111-4111-1111-111111111004', '11111111-1111-4111-1111-111111111111', 'worker', 'USER_ID_1', create_tiptap_content(MSG_AWR_1), 'tiptap', false),
    ('11111111-1111-4111-1111-111111111005', '11111111-1111-4111-1111-111111111111', 'worker', 'USER_ID_1', create_tiptap_content(MSG_AWR_2), 'tiptap', false),
    ('22222222-2222-4222-2222-222222222004', '22222222-2222-4222-2222-222222222222', 'worker', 'USER_ID_2', create_tiptap_content(MSG_AWR_3), 'tiptap', false),
    ('22222222-2222-4222-2222-222222222005', '22222222-2222-4222-2222-222222222222', 'worker', 'USER_ID_2', create_tiptap_content(MSG_AWR_4), 'tiptap', false),
    ('33333333-3333-4333-3333-333333333004', '33333333-3333-4333-3333-333333333333', 'worker', 'USER_ID_1', create_tiptap_content(MSG_AWR_5), 'tiptap', false),
    ('33333333-3333-4333-3333-333333333005', '33333333-3333-4333-3333-333333333333', 'worker', 'USER_ID_1', create_tiptap_content(MSG_AWR_6), 'tiptap', false),
    ('44444444-4444-4444-4444-444444444004', '44444444-4444-4444-4444-444444444444', 'worker', 'USER_ID_2', create_tiptap_content(MSG_AWR_7), 'tiptap', false),
    ('44444444-4444-4444-4444-444444444005', '44444444-4444-4444-4444-444444444444', 'worker', 'USER_ID_2', create_tiptap_content(MSG_AWR_8), 'tiptap', false),
    ('66666666-6666-4666-6666-666666666004', '66666666-6666-4666-6666-666666666666', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_9), 'tiptap', false),
    ('66666666-6666-4666-6666-666666666005', '66666666-6666-4666-6666-666666666666', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_10), 'tiptap', false),
    ('77777777-7777-4777-7777-777777777004', '77777777-7777-4777-7777-777777777777', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_11), 'tiptap', false),
    ('88888888-8888-4888-8888-888888888004', '88888888-8888-4888-8888-888888888888', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_12), 'tiptap', false),
    ('99999999-9999-4999-9999-999999999004', '99999999-9999-4999-9999-999999999999', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_13), 'tiptap', false),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaa004', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_14), 'tiptap', false),
    ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaa005', 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', 'worker', 'USER_ID_3', create_tiptap_content(MSG_AWR_15), 'tiptap', false),

    -- GraphQL Subscription Issue Thread (bbbbbbbb)
    ('b1b1b1b1-0000-4000-a000-000000000001', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GQL_1), 'tiptap', false),
    ('b2b2b2b2-0000-4000-a000-000000000002', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_27', create_tiptap_content(MSG_GQL_2), 'tiptap', false),
    ('b3b3b3b3-0000-4000-a000-000000000003', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GQL_3), 'tiptap', false),
    ('b4b4b4b4-0000-4000-a000-000000000004', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_27', create_tiptap_content(MSG_GQL_4), 'tiptap', false),
    ('b5b5b5b5-0000-4000-a000-000000000005', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_27', create_tiptap_content(MSG_GQL_5), 'tiptap', true),
    ('b6b6b6b6-0000-4000-a000-000000000006', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_1', create_tiptap_content(MSG_GQL_6), 'tiptap', false),
    ('b7b7b7b7-0000-4000-a000-000000000007', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GQL_7), 'tiptap', false),
    ('b8b8b8b8-0000-4000-a000-000000000008', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_27', create_tiptap_content(MSG_GQL_8), 'tiptap', false),
    ('b9b9b9b9-0000-4000-a000-000000000009', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'worker', 'USER_ID_28', create_tiptap_content(MSG_GQL_9), 'tiptap', false),
    ('b0b0b0b0-0000-4000-a000-000000000010', 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb', 'customer', 'USER_ID_4', create_tiptap_content(MSG_GQL_10), 'tiptap', false),

    -- WebAssembly Safari Issue Thread (cccccccc)
    ('c1c1c1c1-0000-4000-b000-000000000001', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'customer', 'USER_ID_6', create_tiptap_content(MSG_WAS_1), 'tiptap', false),
    ('c2c2c2c2-0000-4000-b000-000000000002', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_28', create_tiptap_content(MSG_WAS_2), 'tiptap', false),
    ('c3c3c3c3-0000-4000-b000-000000000003', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'customer', 'USER_ID_6', create_tiptap_content(MSG_WAS_3), 'tiptap', false),
    ('c4c4c4c4-0000-4000-b000-000000000004', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_28', create_tiptap_content(MSG_WAS_4), 'tiptap', false),
    ('c5c5c5c5-0000-4000-b000-000000000005', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_28', create_tiptap_content(MSG_WAS_5), 'tiptap', true),
    ('c6c6c6c6-0000-4000-b000-000000000006', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_2', create_tiptap_content(MSG_WAS_6), 'tiptap', false),
    ('c7c7c7c7-0000-4000-b000-000000000007', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'customer', 'USER_ID_6', create_tiptap_content(MSG_WAS_7), 'tiptap', false),
    ('c8c8c8c8-0000-4000-b000-000000000008', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_28', create_tiptap_content(MSG_WAS_8), 'tiptap', false),
    ('c9c9c9c9-0000-4000-b000-000000000009', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'worker', 'USER_ID_29', create_tiptap_content(MSG_WAS_9), 'tiptap', false),
    ('c0c0c0c0-0000-4000-b000-000000000010', 'cccccccc-cccc-4ccc-cccc-cccccccccccc', 'customer', 'USER_ID_6', create_tiptap_content(MSG_WAS_10), 'tiptap', false),

    -- Redis Cluster Issue Thread (dddddddd)
    ('d1d1d1d1-0000-4000-c000-000000000001', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'customer', 'USER_ID_8', create_tiptap_content(MSG_RDS_1), 'tiptap', false),
    ('d2d2d2d2-0000-4000-c000-000000000002', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_1', create_tiptap_content(MSG_RDS_2), 'tiptap', false),
    ('d3d3d3d3-0000-4000-c000-000000000003', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'customer', 'USER_ID_8', create_tiptap_content(MSG_RDS_3), 'tiptap', false),
    ('d4d4d4d4-0000-4000-c000-000000000004', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_1', create_tiptap_content(MSG_RDS_4), 'tiptap', false),
    ('d5d5d5d5-0000-4000-c000-000000000005', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_1', create_tiptap_content(MSG_RDS_5), 'tiptap', true),
    ('d6d6d6d6-0000-4000-c000-000000000006', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_27', create_tiptap_content(MSG_RDS_6), 'tiptap', false),
    ('d7d7d7d7-0000-4000-c000-000000000007', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'customer', 'USER_ID_8', create_tiptap_content(MSG_RDS_7), 'tiptap', false),
    ('d8d8d8d8-0000-4000-c000-000000000008', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_1', create_tiptap_content(MSG_RDS_8), 'tiptap', false),
    ('d9d9d9d9-0000-4000-c000-000000000009', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'worker', 'USER_ID_30', create_tiptap_content(MSG_RDS_9), 'tiptap', false),
    ('d0d0d0d0-0000-4000-c000-000000000010', 'dddddddd-dddd-4ddd-dddd-dddddddddddd', 'customer', 'USER_ID_8', create_tiptap_content(MSG_RDS_10), 'tiptap', false),

    -- Kubernetes HPA Issue Thread (eeeeeeee)
    ('e1e1e1e1-0000-4000-d000-000000000001', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'customer', 'USER_ID_10', create_tiptap_content(MSG_HPA_1), 'tiptap', false),
    ('e2e2e2e2-0000-4000-d000-000000000002', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_29', create_tiptap_content(MSG_HPA_2), 'tiptap', false),
    ('e3e3e3e3-0000-4000-d000-000000000003', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'customer', 'USER_ID_10', create_tiptap_content(MSG_HPA_3), 'tiptap', false),
    ('e4e4e4e4-0000-4000-d000-000000000004', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_29', create_tiptap_content(MSG_HPA_4), 'tiptap', false),
    ('e5e5e5e5-0000-4000-d000-000000000005', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_29', create_tiptap_content(MSG_HPA_5), 'tiptap', true),
    ('e6e6e6e6-0000-4000-d000-000000000006', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_31', create_tiptap_content(MSG_HPA_6), 'tiptap', false),
    ('e7e7e7e7-0000-4000-d000-000000000007', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'customer', 'USER_ID_10', create_tiptap_content(MSG_HPA_7), 'tiptap', false),
    ('e8e8e8e8-0000-4000-d000-000000000008', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_29', create_tiptap_content(MSG_HPA_8), 'tiptap', false),
    ('e9e9e9e9-0000-4000-d000-000000000009', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'worker', 'USER_ID_27', create_tiptap_content(MSG_HPA_9), 'tiptap', false),
    ('e0e0e0e0-0000-4000-d000-000000000010', 'eeeeeeee-eeee-4eee-eeee-eeeeeeeeeeee', 'customer', 'USER_ID_10', create_tiptap_content(MSG_HPA_10), 'tiptap', false),

    -- WebRTC Issue Thread (ffffffff)
    ('f1f1f1f1-0000-4000-e000-000000000001', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'customer', 'USER_ID_12', create_tiptap_content(MSG_WRT_1), 'tiptap', false),
    ('f2f2f2f2-0000-4000-e000-000000000002', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_2', create_tiptap_content(MSG_WRT_2), 'tiptap', false),
    ('f3f3f3f3-0000-4000-e000-000000000003', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'customer', 'USER_ID_12', create_tiptap_content(MSG_WRT_3), 'tiptap', false),
    ('f4f4f4f4-0000-4000-e000-000000000004', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_2', create_tiptap_content(MSG_WRT_4), 'tiptap', false),
    ('f5f5f5f5-0000-4000-e000-000000000005', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_2', create_tiptap_content(MSG_WRT_5), 'tiptap', true),
    ('f6f6f6f6-0000-4000-e000-000000000006', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_30', create_tiptap_content(MSG_WRT_6), 'tiptap', false),
    ('f7f7f7f7-0000-4000-e000-000000000007', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'customer', 'USER_ID_12', create_tiptap_content(MSG_WRT_7), 'tiptap', false),
    ('f8f8f8f8-0000-4000-e000-000000000008', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_2', create_tiptap_content(MSG_WRT_8), 'tiptap', false),
    ('f9f9f9f9-0000-4000-e000-000000000009', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'worker', 'USER_ID_28', create_tiptap_content(MSG_WRT_9), 'tiptap', false),
    ('f0f0f0f0-0000-4000-e000-000000000010', 'ffffffff-ffff-4fff-ffff-ffffffffffff', 'customer', 'USER_ID_12', create_tiptap_content(MSG_WRT_10), 'tiptap', false),

    -- gRPC Stream Issue Thread (11111111-2222-4333-4444-555555555555)
    ('a1a1a1a1-0000-4000-f000-000000000001', '11111111-2222-4333-4444-555555555555', 'customer', 'USER_ID_14', create_tiptap_content(MSG_GRP_1), 'tiptap', false),
    ('a2a2a2a2-0000-4000-f000-000000000002', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_30', create_tiptap_content(MSG_GRP_2), 'tiptap', false),
    ('a3a3a3a3-0000-4000-f000-000000000003', '11111111-2222-4333-4444-555555555555', 'customer', 'USER_ID_14', create_tiptap_content(MSG_GRP_3), 'tiptap', false),
    ('a4a4a4a4-0000-4000-f000-000000000004', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_30', create_tiptap_content(MSG_GRP_4), 'tiptap', false),
    ('a5a5a5a5-0000-4000-f000-000000000005', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_30', create_tiptap_content(MSG_GRP_5), 'tiptap', true),
    ('a6a6a6a6-0000-4000-f000-000000000006', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_1', create_tiptap_content(MSG_GRP_6), 'tiptap', false),
    ('a7a7a7a7-0000-4000-f000-000000000007', '11111111-2222-4333-4444-555555555555', 'customer', 'USER_ID_14', create_tiptap_content(MSG_GRP_7), 'tiptap', false),
    ('a8a8a8a8-0000-4000-f000-000000000008', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_30', create_tiptap_content(MSG_GRP_8), 'tiptap', false),
    ('a9a9a9a9-0000-4000-f000-000000000009', '11111111-2222-4333-4444-555555555555', 'worker', 'USER_ID_27', create_tiptap_content(MSG_GRP_9), 'tiptap', false),
    ('a0a0a0a0-0000-4000-f000-000000000010', '11111111-2222-4333-4444-555555555555', 'customer', 'USER_ID_14', create_tiptap_content(MSG_GRP_10), 'tiptap', false),

    -- ElasticSearch Issue Thread (22222222-3333-4444-5555-666666666666)
    ('b1b1b1b1-0000-4000-bb00-000000000001', '22222222-3333-4444-5555-666666666666', 'customer', 'USER_ID_16', create_tiptap_content(MSG_ELS_1), 'tiptap', false),
    ('b2b2b2b2-0000-4000-bb00-000000000002', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_31', create_tiptap_content(MSG_ELS_2), 'tiptap', false),
    ('b3b3b3b3-0000-4000-bb00-000000000003', '22222222-3333-4444-5555-666666666666', 'customer', 'USER_ID_16', create_tiptap_content(MSG_ELS_3), 'tiptap', false),
    ('b4b4b4b4-0000-4000-bb00-000000000004', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_31', create_tiptap_content(MSG_ELS_4), 'tiptap', false),
    ('b5b5b5b5-0000-4000-bb00-000000000005', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_31', create_tiptap_content(MSG_ELS_5), 'tiptap', true),
    ('b6b6b6b6-0000-4000-bb00-000000000006', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_27', create_tiptap_content(MSG_ELS_6), 'tiptap', false),
    ('b7b7b7b7-0000-4000-bb00-000000000007', '22222222-3333-4444-5555-666666666666', 'customer', 'USER_ID_16', create_tiptap_content(MSG_ELS_7), 'tiptap', false),
    ('b8b8b8b8-0000-4000-bb00-000000000008', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_31', create_tiptap_content(MSG_ELS_8), 'tiptap', false),
    ('b9b9b9b9-0000-4000-bb00-000000000009', '22222222-3333-4444-5555-666666666666', 'worker', 'USER_ID_29', create_tiptap_content(MSG_ELS_9), 'tiptap', false),
    ('b0b0b0b0-0000-4000-bb00-000000000010', '22222222-3333-4444-5555-666666666666', 'customer', 'USER_ID_16', create_tiptap_content(MSG_ELS_10), 'tiptap', false),

    -- Docker CI/CD Issue Thread (33333333-4444-5555-6666-777777777777)
    ('c1c1c1c1-0000-4000-cc00-000000000001', '33333333-4444-5555-6666-777777777777', 'customer', 'USER_ID_18', create_tiptap_content(MSG_RDS_1), 'tiptap', false),
    ('c2c2c2c2-0000-4000-cc00-000000000002', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_27', create_tiptap_content(MSG_RDS_2), 'tiptap', false),
    ('c3c3c3c3-0000-4000-cc00-000000000003', '33333333-4444-5555-6666-777777777777', 'customer', 'USER_ID_18', create_tiptap_content(MSG_RDS_3), 'tiptap', false),
    ('c4c4c4c4-0000-4000-cc00-000000000004', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_27', create_tiptap_content(MSG_RDS_4), 'tiptap', false),
    ('c5c5c5c5-0000-4000-cc00-000000000005', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_27', create_tiptap_content(MSG_RDS_5), 'tiptap', true),
    ('c6c6c6c6-0000-4000-cc00-000000000006', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_29', create_tiptap_content(MSG_RDS_6), 'tiptap', false),
    ('c7c7c7c7-0000-4000-cc00-000000000007', '33333333-4444-5555-6666-777777777777', 'customer', 'USER_ID_18', create_tiptap_content(MSG_RDS_7), 'tiptap', false),
    ('c8c8c8c8-0000-4000-cc00-000000000008', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_27', create_tiptap_content(MSG_RDS_8), 'tiptap', false),
    ('c9c9c9c9-0000-4000-cc00-000000000009', '33333333-4444-5555-6666-777777777777', 'worker', 'USER_ID_30', create_tiptap_content(MSG_RDS_9), 'tiptap', false),
    ('c0c0c0c0-0000-4000-cc00-000000000010', '33333333-4444-5555-6666-777777777777', 'customer', 'USER_ID_18', create_tiptap_content(MSG_RDS_10), 'tiptap', false);
END;
$$;