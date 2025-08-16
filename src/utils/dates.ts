export function formatRelativeDate(dateString?: string) {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    const hours = Math.floor(diffHours);
    return hours === 0
      ? "Less than an hour ago"
      : `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  return year === currentYear ? `${day} ${month}` : `${day} ${month} ${year}`;
}
