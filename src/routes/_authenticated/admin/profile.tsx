import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: AdminProfile,
  head: () => ({
    meta: [{ title: "Profile — RentaGh Admin" }],
  }),
});

function AdminProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => getMyProfile() });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setPhone(profile.phone);
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () => updateMyProfile({ data: { fullName, phone } }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      setTimeout(() => setSaved(false), 2500);
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Profile</h1>
      <div className="mt-6 max-w-md rounded-[20px] border hairline bg-card p-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Email
          </label>
          <p className="mt-1 text-sm text-foreground">{user?.email}</p>
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Full name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0XXXXXXXXX"
            className="mt-1 w-full rounded-xl border hairline bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)]"
          />
        </div>
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending || !fullName.trim()}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && <p className="mt-2 text-sm text-emerald-700">Saved.</p>}
      </div>
    </div>
  );
}
