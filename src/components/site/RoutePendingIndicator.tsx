/** Thin top-of-page progress bar shown during slow route transitions, so
 * navigation (e.g. login -> dashboard) never looks frozen with no feedback. */
export function RoutePendingIndicator() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10">
      <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary via-gold to-primary" />
    </div>
  );
}
