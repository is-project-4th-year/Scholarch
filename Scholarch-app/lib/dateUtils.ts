/**
 * 🔹 Converts a Firestore Timestamp or string into a clean display format.
 * Works safely even if the input is already a string or null.
 * Example output: "Oct 17, 2025"
 */
export const formatDate = (input: any): string => {
  if (!input) return "Unknown date";

  try {
    // If it's a Firestore Timestamp
    if (input.seconds) {
      return new Date(input.seconds * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // If it's already a Date object
    if (input instanceof Date) {
      return input.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // If it's a string (like ISO)
    if (typeof input === "string") {
      return new Date(input).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    // Fallback
    return String(input);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * 🔹 Converts a Firestore Timestamp or Date into an ISO string.
 * Ideal for sending to APIs or ML models.
 * Example output: "2025-10-17T12:00:00.000Z"
 */
export const toISODate = (input: any): string => {
  if (!input) return "";

  try {
    if (input.seconds) {
      return new Date(input.seconds * 1000).toISOString();
    }

    if (input instanceof Date) {
      return input.toISOString();
    }

    if (typeof input === "string") {
      // Ensure it’s a valid date string
      const d = new Date(input);
      return d.toISOString();
    }

    return "";
  } catch (error) {
    console.error("Error converting to ISO date:", error);
    return "";
  }
};
