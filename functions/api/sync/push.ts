export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const payload = await request.json();
    const { syncCode, data } = payload;
    
    if (!syncCode || !data) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Insert or update SQL query on Cloudflare D1
    await env.DB.prepare(
      "INSERT INTO study_plans (sync_code, data_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(sync_code) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP"
    ).bind(syncCode, JSON.stringify(data)).run();

    return new Response(JSON.stringify({ success: true, syncCode }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}