const COOKIE_NAME = "class_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
let warnedMissingCode = false;

function warnMissingCode() {
  if (warnedMissingCode) return;
  console.warn("CLASS_ACCESS_CODE is not set; class gate will open automatically.");
  warnedMissingCode = true;
}

function buildAuthorizedResponse() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`
  );
  return new Response(null, { status: 200, headers });
}

function hasAccessCookie(headers: Headers): boolean {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((entry) => entry.trim().startsWith(`${COOKIE_NAME}=`));
}

export async function GET(request: Request) {
  const classCode = process.env.CLASS_ACCESS_CODE;
  if (!classCode) {
    warnMissingCode();
    return buildAuthorizedResponse();
  }

  if (hasAccessCookie(request.headers)) {
    return buildAuthorizedResponse();
  }

  return new Response("Class access required", { status: 401 });
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
