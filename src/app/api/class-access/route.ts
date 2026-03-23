let warnedMissingCode = false;

function warnMissingCode() {
  if (warnedMissingCode) return;
  console.warn("CLASS_ACCESS_CODE is not set; class gate will open automatically.");
  warnedMissingCode = true;
}

function buildAuthorizedResponse() {
  return new Response(null, { status: 200 });
}

export async function POST(request: Request) {
  const classCode = process.env.CLASS_ACCESS_CODE;
  const body = await request.json().catch(() => ({}));
  const providedCode = typeof body?.code === "string" ? body.code.trim() : "";

  if (!classCode) {
    warnMissingCode();
    return buildAuthorizedResponse();
  }

  if (!providedCode) {
    return new Response("Please provide a class code", { status: 400 });
  }

  if (providedCode === classCode) {
    return buildAuthorizedResponse();
  }

  return new Response("Incorrect class code", { status: 401 });
}
