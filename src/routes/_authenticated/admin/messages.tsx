import { createFileRoute } from "@tanstack/react-router";
import { EnquiriesInbox } from "@/components/admin/EnquiriesInbox";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
  head: () => ({
    meta: [{ title: "Messages — RentaGh Admin" }],
  }),
});

function AdminMessages() {
  return (
    <div>
      <EnquiriesInbox />
    </div>
  );
}
