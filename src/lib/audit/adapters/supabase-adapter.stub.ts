import type { AuditAdapter, AuditLogEntry } from "../types";

/**
 * Placeholder za Supabase implementaciju AuditAdapter interfejsa.
 * Primer migracije:
 *
 * ```ts
 * export class SupabaseAuditAdapter implements AuditAdapter {
 *   async append(entry: AuditLogEntry) {
 *     await supabase.from("audit_logs").insert(mapEntryToRow(entry));
 *   }
 *   async list(limit = 200) {
 *     const { data } = await supabase.from("audit_logs")
 *       .select("*").order("timestamp", { ascending: false }).limit(limit);
 *     return data.map(mapRowToEntry);
 *   }
 * }
 * ```
 */
export class SupabaseAuditAdapter implements AuditAdapter {
  async append(entry: AuditLogEntry): Promise<void> {
    void entry;
    throw new Error("SupabaseAuditAdapter nije implementiran — koristite CompositeAuditAdapter za MVP.");
  }

  async list(limit?: number): Promise<AuditLogEntry[]> {
    void limit;
    throw new Error("SupabaseAuditAdapter nije implementiran — koristite CompositeAuditAdapter za MVP.");
  }
}
