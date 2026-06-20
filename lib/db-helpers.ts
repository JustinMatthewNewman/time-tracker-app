import { getDb } from "./db";
import { TimeEntry, TimeEntryCreate, TimeRangeFilter } from "./schemas";
import { v4 as uuidv4 } from "uuid";

/**
 * Create the time_entries table if it doesn't exist
 */
export async function initializeTimeEntriesTable() {
  try {
    const pool = await getDb();
    
    const query = `
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'time_entries'
      )
      BEGIN
        CREATE TABLE time_entries (
          id NVARCHAR(36) PRIMARY KEY,
          userId NVARCHAR(255) NOT NULL,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          startTime DATETIME2 NOT NULL,
          endTime DATETIME2 NOT NULL,
          category NVARCHAR(100) NOT NULL,
          tags NVARCHAR(MAX),
          duration INT,
          createdAt DATETIME2 DEFAULT GETUTCDATE(),
          updatedAt DATETIME2 DEFAULT GETUTCDATE(),
          INDEX idx_userId (userId),
          INDEX idx_startTime (startTime),
          INDEX idx_category (category)
        );
      END
    `;
    
    await pool.request().query(query);
    console.log("✓ time_entries table initialized");
  } catch (error) {
    console.error("Error initializing time_entries table:", error);
    throw error;
  }
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  userId: string,
  data: TimeEntryCreate
): Promise<TimeEntry> {
  try {
    const pool = await getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO time_entries (id, userId, title, description, startTime, endTime, category, tags, duration, createdAt, updatedAt)
      VALUES (@id, @userId, @title, @description, @startTime, @endTime, @category, @tags, @duration, @createdAt, @updatedAt);
      SELECT * FROM time_entries WHERE id = @id;
    `;

    const duration = (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / (1000 * 60);

    const result = await pool
      .request()
      .input("id", id)
      .input("userId", userId)
      .input("title", data.title)
      .input("description", data.description || "")
      .input("startTime", new Date(data.startTime))
      .input("endTime", new Date(data.endTime))
      .input("category", data.category)
      .input("tags", JSON.stringify(data.tags || []))
      .input("duration", Math.round(duration))
      .input("createdAt", new Date(now))
      .input("updatedAt", new Date(now))
      .query(query);

    return rowToTimeEntry(result.recordset[0]);
  } catch (error) {
    console.error("Error creating time entry:", error);
    throw error;
  }
}

/**
 * Get a time entry by ID
 */
export async function getTimeEntryById(userId: string, entryId: string): Promise<TimeEntry | null> {
  try {
    const pool = await getDb();

    const result = await pool
      .request()
      .input("id", entryId)
      .input("userId", userId)
      .query("SELECT * FROM time_entries WHERE id = @id AND userId = @userId");

    if (result.recordset.length === 0) {
      return null;
    }

    return rowToTimeEntry(result.recordset[0]);
  } catch (error) {
    console.error("Error getting time entry:", error);
    throw error;
  }
}

/**
 * List time entries for a user with optional filtering
 */
export async function listTimeEntries(
  userId: string,
  filters?: TimeRangeFilter
): Promise<TimeEntry[]> {
  try {
    const pool = await getDb();

    let query = "SELECT * FROM time_entries WHERE userId = @userId";
    const request = pool.request().input("userId", userId);

    if (filters?.startDate) {
      query += " AND startTime >= @startDate";
      request.input("startDate", new Date(filters.startDate));
    }

    if (filters?.endDate) {
      query += " AND endTime <= @endDate";
      request.input("endDate", new Date(filters.endDate));
    }

    if (filters?.category) {
      query += " AND category = @category";
      request.input("category", filters.category);
    }

    query += " ORDER BY startTime DESC";

    const result = await request.query(query);

    let entries = result.recordset.map(rowToTimeEntry);

    // Filter by tags if provided (since SQL JSON ops can be complex)
    if (filters?.tags && filters.tags.length > 0) {
      entries = entries.filter((entry) => {
        const entryTags = entry.tags || [];
        return filters.tags!.some((tag) => entryTags.includes(tag));
      });
    }

    return entries;
  } catch (error) {
    console.error("Error listing time entries:", error);
    throw error;
  }
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(
  userId: string,
  entryId: string,
  data: Partial<TimeEntryCreate>
): Promise<TimeEntry | null> {
  try {
    const pool = await getDb();

    // First, check if entry exists and belongs to user
    const existing = await getTimeEntryById(userId, entryId);
    if (!existing) {
      return null;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const request = pool.request();
    request.input("id", entryId).input("userId", userId);

    if (data.title) {
      updates.push("title = @title");
      request.input("title", data.title);
    }

    if (data.description !== undefined) {
      updates.push("description = @description");
      request.input("description", data.description || "");
    }

    if (data.startTime) {
      updates.push("startTime = @startTime");
      request.input("startTime", new Date(data.startTime));
    }

    if (data.endTime) {
      updates.push("endTime = @endTime");
      request.input("endTime", new Date(data.endTime));
    }

    if (data.category) {
      updates.push("category = @category");
      request.input("category", data.category);
    }

    if (data.tags) {
      updates.push("tags = @tags");
      request.input("tags", JSON.stringify(data.tags));
    }

    // Calculate new duration if time changed
    if (data.startTime || data.endTime) {
      const startTime = data.startTime ? new Date(data.startTime) : new Date(existing.startTime);
      const endTime = data.endTime ? new Date(data.endTime) : new Date(existing.endTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      updates.push("duration = @duration");
      request.input("duration", duration);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push("updatedAt = GETUTCDATE()");

    const query = `
      UPDATE time_entries
      SET ${updates.join(", ")}
      WHERE id = @id AND userId = @userId;
      SELECT * FROM time_entries WHERE id = @id;
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return rowToTimeEntry(result.recordset[0]);
  } catch (error) {
    console.error("Error updating time entry:", error);
    throw error;
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(userId: string, entryId: string): Promise<boolean> {
  try {
    const pool = await getDb();

    // First verify it exists and belongs to user
    const existing = await getTimeEntryById(userId, entryId);
    if (!existing) {
      return false;
    }

    const result = await pool
      .request()
      .input("id", entryId)
      .input("userId", userId)
      .query("DELETE FROM time_entries WHERE id = @id AND userId = @userId");

    return result.rowsAffected[0] > 0;
  } catch (error) {
    console.error("Error deleting time entry:", error);
    throw error;
  }
}

/**
 * Helper function to convert database row to TimeEntry
 */
function rowToTimeEntry(row: any): TimeEntry {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description || "",
    startTime: new Date(row.startTime).toISOString(),
    endTime: new Date(row.endTime).toISOString(),
    category: row.category,
    tags: row.tags ? JSON.parse(row.tags) : [],
    duration: row.duration,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}
