CREATE OR REPLACE FUNCTION create_tiptap_content(msg text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    result := jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
            jsonb_build_object(
                'type', 'paragraph',
                'content', jsonb_build_array(
                    jsonb_build_object(
                        'type', 'text',
                        'text', msg
                    )
                )
            )
        ),
        'plaintext', msg
    );
    RETURN result;
END;
$$; 
