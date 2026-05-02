const rawKey = process.env.PASTEBIN_DEV_KEY;
if (!rawKey) {
  throw new Error("PASTEBIN_DEV_KEY environment variable is required");
}
const PASTEBIN_DEV_KEY = rawKey;

export interface PasteResult {
  url: string;
  key: string;
}

export async function createPaste(
  title: string,
  content: string
): Promise<PasteResult> {
  const params = new URLSearchParams();
  params.append("api_dev_key", PASTEBIN_DEV_KEY);
  params.append("api_option", "paste");
  params.append("api_paste_code", content);
  params.append("api_paste_name", title);
  params.append("api_paste_expire_date", "1W"); // 1 week expiry

  const res = await fetch("https://pastebin.com/api/api_post.php", {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    throw new Error(`Pastebin API error: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const url = text.trim();

  if (!url.startsWith("http")) {
    throw new Error(`Pastebin error: ${url}`);
  }

  const key = url.split("/").pop() || "";

  return { url, key };
}
