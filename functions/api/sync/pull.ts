export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const payload = await request.json();
    const { syncCode } = payload;
    
    if (!syncCode) {
      return new Response(JSON.stringify({ error: "Sync key parameter required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Select row from D1 database
    const result = await env.DB.prepare(
      "SELECT data_json FROM study_plans WHERE sync_code = ?"
    ).bind(syncCode).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "Study plan not found with this security key" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, data: JSON.parse(result.data_json) }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}