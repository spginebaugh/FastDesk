DO $$
DECLARE
    -- Organization ID for GauntletAI
    ORG_ID CONSTANT uuid := 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d';
    -- worker ID for GauntletAI
    WORKER_ID_01 CONSTANT uuid := 'USER_ID_1';
    WORKER_ID_02 CONSTANT uuid := 'USER_ID_2';
    WORKER_ID_03 CONSTANT uuid := 'USER_ID_27';
    WORKER_ID_04 CONSTANT uuid := 'USER_ID_28';
    WORKER_ID_05 CONSTANT uuid := 'USER_ID_29';
    WORKER_ID_06 CONSTANT uuid := 'USER_ID_30';
    WORKER_ID_07 CONSTANT uuid := 'USER_ID_31';
    -- customer IDs
    CUSTOMER_ID_01 CONSTANT uuid := 'USER_ID_20';
    CUSTOMER_ID_02 CONSTANT uuid := 'USER_ID_22';
    CUSTOMER_ID_03 CONSTANT uuid := 'USER_ID_24';
    CUSTOMER_ID_04 CONSTANT uuid := 'USER_ID_26';
    -- Add ticket ID in correct Supabase UUID format (e.g. 'f6f7c49c-f34d-4c5b-8d54-d123f229f666' , no letters after 'f' allowed)
    TICKET_ID_01 CONSTANT uuid := 'b01b01bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_02 CONSTANT uuid := 'b02b02bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_03 CONSTANT uuid := 'b03b03bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_04 CONSTANT uuid := 'b04b04bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_05 CONSTANT uuid := 'b05b05bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_06 CONSTANT uuid := 'b06b06bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_07 CONSTANT uuid := 'b07b07bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_08 CONSTANT uuid := 'b08b08bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_09 CONSTANT uuid := 'b09b09bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_10 CONSTANT uuid := 'b10b10bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_11 CONSTANT uuid := 'b11b11bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';
    TICKET_ID_12 CONSTANT uuid := 'b12b12bb-bbbb-4bbb-bbbb-bbbbbbbbbbbb';

    -- Message constants for new tickets
    -- Ticket 1 Messages
    MSG_T1_1 CONSTANT text := 'Hi, I''m running Fedora 36 on my laptop, and I''m having trouble connecting to the internet. The network card doesn''t seem to be recognized.';
    MSG_T1_2 CONSTANT text := 'Hello Sophia, thanks for reaching out. Have you tried installing the latest drivers from the official Fedora repository or checking your laptop manufacturer''s support site?';
    MSG_T1_3 CONSTANT text := 'I tried dnf update and dnf install <driver-package>, but it''s still not detecting the hardware. The command lspci lists the network card, but I get no network interface in ip link.';
    MSG_T1_4 CONSTANT text := 'Understood. Sometimes you might need to enable secure boot or disable it to load the correct drivers. Try disabling secure boot in your BIOS and then re-installing the driver package. Let me know if that works.';
    MSG_T1_5 CONSTANT text := 'That did the trick—disabling secure boot allowed the driver to load properly. I''m now online. Thanks!';

    -- Ticket 2 Messages
    MSG_T2_1 CONSTANT text := 'Hi again. I found an application called AppXYZ that I need for work. I''ve tried installing it on Fedora, but the installer fails every time.';
    MSG_T2_2 CONSTANT text := 'Thanks for contacting us, Sophia. AppXYZ officially lists support only for Ubuntu. Are you following any specific installation steps for Fedora or using third-party repositories?';
    MSG_T2_3 CONSTANT text := 'I''ve been using a .deb package I found on the official website. I tried converting it with alien, but it just won''t run properly.';
    MSG_T2_4 CONSTANT text := 'That might be the cause. Even though alien can convert .deb to .rpm, compatibility can be spotty. The software might rely on dependencies unique to Ubuntu.';
    MSG_T2_5 CONSTANT text := 'Got it. I''ll consider installing it on an Ubuntu VM or switching distributions for now. Thanks for clarifying.';

    -- Ticket 3 Messages
    MSG_T3_1 CONSTANT text := 'Hello. I set up a virtual machine to run some testing software, but it''s painfully slow. I''m using KVM on Fedora. My host system is also Fedora 36.';
    MSG_T3_2 CONSTANT text := 'Hi Sophia, could you provide more details? What OS is running inside your VM, and have you enabled virtualization in your BIOS?';
    MSG_T3_3 CONSTANT text := 'I have virtualization enabled (I can see vt-x in my BIOS). The guest OS is a custom build of Debian. I''m not sure if I''m missing some optimization.';
    MSG_T3_4 CONSTANT text := 'KVM usually works well on Fedora, but some guests require specialized drivers or configurations. Could you share your VM settings and CPU/RAM allocations?';
    MSG_T3_5 CONSTANT text := 'I''m giving it 2 cores, 4GB of RAM. I haven''t installed any special guest drivers. I''ll get the logs soon. Meanwhile, if you have any suggestions, let me know.';

    -- Ticket 4 Messages (Memory Card Compatibility)
    MSG_T4_1 CONSTANT text := 'Hi, I have a Canon EOS 80D, and it won''t read my new 128GB SD card.';
    MSG_T4_2 CONSTANT text := 'Hi Olivia, have you tried formatting the card in-camera? Also, check if your camera firmware is up to date.';
    MSG_T4_3 CONSTANT text := 'I tried formatting on my computer, but the camera still says ''Card error''. I''ll update the firmware next.';
    MSG_T4_4 CONSTANT text := 'Great. Updating firmware often fixes SD card compatibility. Let me know if that resolves it.';
    MSG_T4_5 CONSTANT text := 'That worked—once I updated the camera firmware, it recognized the SD card. Thanks for the help!';

    -- Ticket 5 Messages (Lens Autofocus Issue)
    MSG_T5_1 CONSTANT text := 'I just bought a third-party 50mm lens. The autofocus hunts endlessly and never locks onto the subject.';
    MSG_T5_2 CONSTANT text := 'Hello Olivia. Third-party lenses sometimes have compatibility quirks. Is the lens firmware up to date, and have you checked if the lens is fully compatible with the 80D?';
    MSG_T5_3 CONSTANT text := 'I haven''t checked lens firmware. I didn''t realize that was a thing. It''s brand new, so I''d assume it''s up to date.';
    MSG_T5_4 CONSTANT text := 'It''s possible the lens was in stock for a while and might need an update. Check the manufacturer''s site for instructions on how to update via USB or the camera body.';
    MSG_T5_5 CONSTANT text := 'I updated the lens firmware, and it''s focusing fine now. Thank you so much!';

    -- Ticket 6 Messages (Battery Drain & Charger Compatibility)
    MSG_T6_1 CONSTANT text := 'Hey, I''m having an issue where my battery drains super fast. I can barely take 30 photos before it goes from 100% to almost dead.';
    MSG_T6_2 CONSTANT text := 'Hello Olivia, could you confirm you''re using the official Canon charger and battery? Sometimes third-party chargers do not fully charge or calibrate the battery.';
    MSG_T6_3 CONSTANT text := 'I am using a third-party charger, but the battery is original Canon. I''ve used it a few times before with no issue.';
    MSG_T6_4 CONSTANT text := 'There might be a calibration or firmware issue. Could you try charging it with the official Canon charger, if you have access to one? Also, how old is the battery?';
    MSG_T6_5 CONSTANT text := 'I''ll try to track down the original charger, but I''m not sure where it is. The battery is about a year old. Any other suggestions in the meantime?';

    -- Ticket 7 Messages (Slow Wi-Fi Speeds)
    MSG_T7_1 CONSTANT text := 'I just got a new router and I''m only getting half the speed I''m paying for from my ISP.';
    MSG_T7_2 CONSTANT text := 'Hi Emily, have you tested speeds via an Ethernet cable directly to the router to confirm the wired speed first?';
    MSG_T7_3 CONSTANT text := 'Wired speeds are fine. I''m getting around 200 Mbps, which is what my plan provides, but over Wi-Fi it''s only 90-100 Mbps.';
    MSG_T7_4 CONSTANT text := 'That''s likely a Wi-Fi channel or interference issue. Try switching to the 5GHz band if your router supports dual-band, and change channels to one with less congestion.';
    MSG_T7_5 CONSTANT text := 'I switched to 5GHz and changed the channel. Now I''m getting around 180 Mbps, which is acceptable. Thank you!';

    -- Ticket 8 Messages (Guest Network Setup)
    MSG_T8_1 CONSTANT text := 'I want visitors to have Wi-Fi, but I don''t want them accessing my computers or NAS. Help?';
    MSG_T8_2 CONSTANT text := 'Hello Emily. Most modern routers have a ''Guest Network'' option in their settings. Have you checked the router''s admin panel under ''Wireless'' or ''Network Settings''?';
    MSG_T8_3 CONSTANT text := 'Yes, I see a Guest Network toggle, but there''s an option for ''Network Isolation'' that I''m not fully understanding.';
    MSG_T8_4 CONSTANT text := '''Network Isolation'' is exactly what ensures that guests can''t see your main network devices. Just enable that, set a secure password, and you should be good.';
    MSG_T8_5 CONSTANT text := 'That worked perfectly. Now guests have internet, but they can''t see my other devices.';

    -- Ticket 9 Messages (Frequent Disconnections)
    MSG_T9_1 CONSTANT text := 'My Wi-Fi has started dropping every few minutes. It''s driving me crazy. The router logs say something about ''Channel Overlap Detected''.';
    MSG_T9_2 CONSTANT text := 'Hi Emily, this can happen if multiple neighboring routers are on the same channel. Have you tried manually choosing a less congested channel again?';
    MSG_T9_3 CONSTANT text := 'I switched channels, but it still happens. Maybe I''m missing a setting or advanced configuration?';
    MSG_T9_4 CONSTANT text := 'Could be. Could you send screenshots of your Wi-Fi settings and logs? Also, let us know if there''s a mesh network or range extender in use.';
    MSG_T9_5 CONSTANT text := 'I have a mesh extender in the living room. I''ll get the screenshots soon. Thanks.';

    -- Ticket 10 Messages (Password Reset Troubles)
    MSG_T10_1 CONSTANT text := 'I''m trying to reset my password, but the reset email never arrives. It''s not in spam either.';
    MSG_T10_2 CONSTANT text := 'Hi Anna, sometimes the email can be delayed. Could you confirm the correct email address on your account and check if you have any mail filters?';
    MSG_T10_3 CONSTANT text := 'My email is correct: [email protected]. I don''t have any filters. I get other emails fine.';
    MSG_T10_4 CONSTANT text := 'We manually triggered a reset email. Let me know if you see it now.';
    MSG_T10_5 CONSTANT text := 'It just came through! Thanks for the help.';

    -- Ticket 11 Messages (Billing Confusion)
    MSG_T11_1 CONSTANT text := 'I see two charges on my credit card for the same month. Please help.';
    MSG_T11_2 CONSTANT text := 'Hi Anna, so sorry for the inconvenience. Did you perhaps create two accounts or switch plans recently?';
    MSG_T11_3 CONSTANT text := 'I only have one account. I didn''t switch plans. Maybe I clicked twice on the payment page by mistake?';
    MSG_T11_4 CONSTANT text := 'No worries. We''ll refund the duplicate charge. You''ll see it on your card statement within 5-7 business days.';
    MSG_T11_5 CONSTANT text := 'Great, thank you. The duplicate charge is an error, so I appreciate the quick fix.';

    -- Ticket 12 Messages (Unable to Access Premium Features)
    MSG_T12_1 CONSTANT text := 'I''m supposed to have premium, but all features are still locked. My account shows ''Basic'' when I log in.';
    MSG_T12_2 CONSTANT text := 'Hello Anna. Could you confirm the email address you use to log in? Sometimes, if you have a second account or used a different email, it can cause conflicts.';
    MSG_T12_3 CONSTANT text := 'I only have one email: [email protected]. It''s the same one from my previous tickets.';
    MSG_T12_4 CONSTANT text := 'We see an active subscription under [email protected]. Are you sure you didn''t update your primary email in the past?';
    MSG_T12_5 CONSTANT text := 'I might have changed from my old [email protected] to [email protected]. Not sure if that''s the cause. Let me double-check.';

BEGIN
    -- Insert tickets
    INSERT INTO tickets (id, title, user_id, organization_id, ticket_status, ticket_priority, ticket_source, created_by_type, created_by_id) VALUES
    (TICKET_ID_01, 'Unable to connect to the internet on Fedora 36', CUSTOMER_ID_01, ORG_ID, 'open', 'medium', 'customer_portal', 'customer', CUSTOMER_ID_01),
    (TICKET_ID_02, 'Trouble installing AppXYZ on Fedora', CUSTOMER_ID_01, ORG_ID, 'open', 'low', 'customer_portal', 'customer', CUSTOMER_ID_01),
    (TICKET_ID_03, 'VM running very slowly', CUSTOMER_ID_01, ORG_ID, 'open', 'medium', 'customer_portal', 'customer', CUSTOMER_ID_01),
    (TICKET_ID_04, 'New SD card not recognized', CUSTOMER_ID_02, ORG_ID, 'closed', 'medium', 'customer_portal', 'customer', CUSTOMER_ID_02),
    (TICKET_ID_05, 'Lens AF not working on Canon EOS 80D', CUSTOMER_ID_02, ORG_ID, 'closed', 'medium', 'customer_portal', 'customer', CUSTOMER_ID_02),
    (TICKET_ID_06, 'Battery dies after 30 shots', CUSTOMER_ID_02, ORG_ID, 'open', 'high', 'customer_portal', 'customer', CUSTOMER_ID_02),
    (TICKET_ID_07, 'Slow Wi-Fi on new router', CUSTOMER_ID_03, ORG_ID, 'closed', 'medium', 'customer_portal', 'customer', CUSTOMER_ID_03),
    (TICKET_ID_08, 'How do I enable a guest network?', CUSTOMER_ID_03, ORG_ID, 'closed', 'low', 'customer_portal', 'customer', CUSTOMER_ID_03),
    (TICKET_ID_09, 'Wi-Fi drops frequently', CUSTOMER_ID_03, ORG_ID, 'open', 'high', 'customer_portal', 'customer', CUSTOMER_ID_03),
    (TICKET_ID_10, 'Not getting password reset email', CUSTOMER_ID_04, ORG_ID, 'closed', 'high', 'customer_portal', 'customer', CUSTOMER_ID_04),
    (TICKET_ID_11, 'Double charged for Premium', CUSTOMER_ID_04, ORG_ID, 'closed', 'high', 'customer_portal', 'customer', CUSTOMER_ID_04),
    (TICKET_ID_12, 'Premium features locked', CUSTOMER_ID_04, ORG_ID, 'open', 'high', 'customer_portal', 'customer', CUSTOMER_ID_04);

    -- Insert ticket assignments
    INSERT INTO ticket_assignments (ticket_id, worker_id, organization_id, is_primary) VALUES
    (TICKET_ID_01, WORKER_ID_01, ORG_ID, true),
    (TICKET_ID_02, WORKER_ID_02, ORG_ID, true),
    (TICKET_ID_03, WORKER_ID_02, ORG_ID, true),
    (TICKET_ID_04, WORKER_ID_03, ORG_ID, true),
    (TICKET_ID_05, WORKER_ID_04, ORG_ID, true),
    (TICKET_ID_06, WORKER_ID_03, ORG_ID, true),
    (TICKET_ID_07, WORKER_ID_05, ORG_ID, true),
    (TICKET_ID_08, WORKER_ID_06, ORG_ID, true),
    (TICKET_ID_09, WORKER_ID_05, ORG_ID, true),
    (TICKET_ID_10, WORKER_ID_07, ORG_ID, true),
    (TICKET_ID_11, WORKER_ID_01, ORG_ID, true),
    (TICKET_ID_12, WORKER_ID_07, ORG_ID, true);

    -- Insert ticket messages
    INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_id, content, content_format, is_internal) 
    VALUES
    -- Ticket 1 Messages
    ('b01b01bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_01, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T1_1), 'tiptap', false),
    ('b01b01bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_01, 'worker', WORKER_ID_01, create_tiptap_content(MSG_T1_2), 'tiptap', false),
    ('b01b01bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_01, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T1_3), 'tiptap', false),
    ('b01b01bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_01, 'worker', WORKER_ID_01, create_tiptap_content(MSG_T1_4), 'tiptap', false),
    ('b01b01bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_01, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T1_5), 'tiptap', false),

    -- Ticket 2 Messages
    ('b02b02bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_02, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T2_1), 'tiptap', false),
    ('b02b02bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_02, 'worker', WORKER_ID_02, create_tiptap_content(MSG_T2_2), 'tiptap', false),
    ('b02b02bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_02, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T2_3), 'tiptap', false),
    ('b02b02bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_02, 'worker', WORKER_ID_02, create_tiptap_content(MSG_T2_4), 'tiptap', false),
    ('b02b02bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_02, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T2_5), 'tiptap', false),

    -- Ticket 3 Messages
    ('b03b03bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_03, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T3_1), 'tiptap', false),
    ('b03b03bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_03, 'worker', WORKER_ID_02, create_tiptap_content(MSG_T3_2), 'tiptap', false),
    ('b03b03bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_03, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T3_3), 'tiptap', false),
    ('b03b03bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_03, 'worker', WORKER_ID_02, create_tiptap_content(MSG_T3_4), 'tiptap', false),
    ('b03b03bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_03, 'customer', CUSTOMER_ID_01, create_tiptap_content(MSG_T3_5), 'tiptap', false),

    -- Ticket 4 Messages (Memory Card)
    ('b04b04bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_04, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T4_1), 'tiptap', false),
    ('b04b04bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_04, 'worker', WORKER_ID_03, create_tiptap_content(MSG_T4_2), 'tiptap', false),
    ('b04b04bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_04, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T4_3), 'tiptap', false),
    ('b04b04bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_04, 'worker', WORKER_ID_03, create_tiptap_content(MSG_T4_4), 'tiptap', false),
    ('b04b04bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_04, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T4_5), 'tiptap', false),

    -- Ticket 5 Messages (Lens AF)
    ('b05b05bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_05, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T5_1), 'tiptap', false),
    ('b05b05bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_05, 'worker', WORKER_ID_04, create_tiptap_content(MSG_T5_2), 'tiptap', false),
    ('b05b05bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_05, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T5_3), 'tiptap', false),
    ('b05b05bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_05, 'worker', WORKER_ID_04, create_tiptap_content(MSG_T5_4), 'tiptap', false),
    ('b05b05bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_05, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T5_5), 'tiptap', false),

    -- Ticket 6 Messages (Battery)
    ('b06b06bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_06, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T6_1), 'tiptap', false),
    ('b06b06bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_06, 'worker', WORKER_ID_03, create_tiptap_content(MSG_T6_2), 'tiptap', false),
    ('b06b06bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_06, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T6_3), 'tiptap', false),
    ('b06b06bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_06, 'worker', WORKER_ID_03, create_tiptap_content(MSG_T6_4), 'tiptap', false),
    ('b06b06bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_06, 'customer', CUSTOMER_ID_02, create_tiptap_content(MSG_T6_5), 'tiptap', false),

    -- Ticket 7 Messages (Slow Wi-Fi)
    ('b07b07bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_07, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T7_1), 'tiptap', false),
    ('b07b07bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_07, 'worker', WORKER_ID_05, create_tiptap_content(MSG_T7_2), 'tiptap', false),
    ('b07b07bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_07, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T7_3), 'tiptap', false),
    ('b07b07bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_07, 'worker', WORKER_ID_05, create_tiptap_content(MSG_T7_4), 'tiptap', false),
    ('b07b07bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_07, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T7_5), 'tiptap', false),

    -- Ticket 8 Messages (Guest Network)
    ('b08b08bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_08, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T8_1), 'tiptap', false),
    ('b08b08bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_08, 'worker', WORKER_ID_06, create_tiptap_content(MSG_T8_2), 'tiptap', false),
    ('b08b08bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_08, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T8_3), 'tiptap', false),
    ('b08b08bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_08, 'worker', WORKER_ID_06, create_tiptap_content(MSG_T8_4), 'tiptap', false),
    ('b08b08bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_08, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T8_5), 'tiptap', false),

    -- Ticket 9 Messages (Frequent Disconnections)
    ('b09b09bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_09, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T9_1), 'tiptap', false),
    ('b09b09bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_09, 'worker', WORKER_ID_05, create_tiptap_content(MSG_T9_2), 'tiptap', false),
    ('b09b09bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_09, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T9_3), 'tiptap', false),
    ('b09b09bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_09, 'worker', WORKER_ID_05, create_tiptap_content(MSG_T9_4), 'tiptap', false),
    ('b09b09bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_09, 'customer', CUSTOMER_ID_03, create_tiptap_content(MSG_T9_5), 'tiptap', false),

    -- Ticket 10 Messages (Password Reset)
    ('b10b10bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_10, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T10_1), 'tiptap', false),
    ('b10b10bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_10, 'worker', WORKER_ID_07, create_tiptap_content(MSG_T10_2), 'tiptap', false),
    ('b10b10bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_10, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T10_3), 'tiptap', false),
    ('b10b10bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_10, 'worker', WORKER_ID_07, create_tiptap_content(MSG_T10_4), 'tiptap', false),
    ('b10b10bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_10, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T10_5), 'tiptap', false),

    -- Ticket 11 Messages (Billing)
    ('b11b11bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_11, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T11_1), 'tiptap', false),
    ('b11b11bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_11, 'worker', WORKER_ID_01, create_tiptap_content(MSG_T11_2), 'tiptap', false),
    ('b11b11bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_11, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T11_3), 'tiptap', false),
    ('b11b11bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_11, 'worker', WORKER_ID_01, create_tiptap_content(MSG_T11_4), 'tiptap', false),
    ('b11b11bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_11, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T11_5), 'tiptap', false),

    -- Ticket 12 Messages (Premium Features)
    ('b12b12bb-0001-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_12, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T12_1), 'tiptap', false),
    ('b12b12bb-0002-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_12, 'worker', WORKER_ID_07, create_tiptap_content(MSG_T12_2), 'tiptap', false),
    ('b12b12bb-0003-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_12, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T12_3), 'tiptap', false),
    ('b12b12bb-0004-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_12, 'worker', WORKER_ID_07, create_tiptap_content(MSG_T12_4), 'tiptap', false),
    ('b12b12bb-0005-4bbb-bbbb-bbbbbbbbbbbb', TICKET_ID_12, 'customer', CUSTOMER_ID_04, create_tiptap_content(MSG_T12_5), 'tiptap', false);

END;
$$;