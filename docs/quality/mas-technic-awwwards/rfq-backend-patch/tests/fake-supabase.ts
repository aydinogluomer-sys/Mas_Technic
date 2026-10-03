/**
 * In-memory stand-in for the parts of @supabase/supabase-js the RFQ functions
 * use. Mapped over the real import by import_map.json in this folder, so the
 * functions run unmodified. It models behaviour, not Postgres: enough to
 * exercise every branch of the contract, nothing more.
 */
type Obj = { size: number; bytes: Uint8Array };
type State = {
  rfqs: Map<string, Record<string, unknown>>;
  objects: Map<string, Obj>;
  hits: Map<string, number>;
  users: Map<string, string>; // token → user id
  staff: Set<string>;
};
export const state: State = (globalThis as unknown as { __fake: State }).__fake ??= {
  rfqs: new Map(), objects: new Map(), hits: new Map(), users: new Map(), staff: new Set(),
};

function table(name: string) {
  if (name !== "rfqs") throw new Error(`unexpected table ${name}`);
  let filter: [string, unknown] | null = null;
  let pendingUpsert: { rows: Record<string, unknown>[]; ignore: boolean } | null = null;
  const builder = {
    upsert(row: Record<string, unknown>, options: { ignoreDuplicates?: boolean }) {
      pendingUpsert = { rows: [row], ignore: !!options.ignoreDuplicates };
      return builder;
    },
    select() {
      if (pendingUpsert) {
        const written: Record<string, unknown>[] = [];
        for (const row of pendingUpsert.rows) {
          const id = row.id as string;
          if (state.rfqs.has(id)) { if (!pendingUpsert.ignore) state.rfqs.set(id, row); continue; }
          state.rfqs.set(id, structuredClone(row));
          written.push(row);
        }
        return Promise.resolve({ data: written, error: null });
      }
      return builder;
    },
    eq(column: string, value: unknown) { filter = [column, value]; return builder; },
    maybeSingle() {
      const row = [...state.rfqs.values()].find((r) => filter && r[filter[0]] === filter[1]) ?? null;
      return Promise.resolve({ data: row, error: null });
    },
  };
  return builder;
}

export function createClient() {
  return {
    auth: { getUser: async (token: string) => ({ data: { user: state.users.has(token) ? { id: state.users.get(token) } : null }, error: null }) },
    rpc: async (fn: string, args: Record<string, unknown>) => {
      if (fn === "rfq_rate_limit_hit") {
        const n = (state.hits.get(args.p_key as string) ?? 0) + 1;
        state.hits.set(args.p_key as string, n);
        return { data: [{ allowed: n <= (args.p_max as number), retry_after: 42 }], error: null };
      }
      if (fn === "is_staff") return { data: state.staff.has(args._user_id as string), error: null };
      throw new Error(`unexpected rpc ${fn}`);
    },
    from: table,
    storage: {
      from: () => ({
        list: async (folder: string) => ({
          data: [...state.objects.entries()]
            .filter(([path]) => path.startsWith(`${folder}/`) && !path.slice(folder.length + 1).includes("/"))
            .map(([path, obj]) => ({ name: path.slice(folder.length + 1), metadata: { size: obj.size } })),
          error: null,
        }),
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `fake://${path}` }, error: null }),
      }),
    },
  };
}
