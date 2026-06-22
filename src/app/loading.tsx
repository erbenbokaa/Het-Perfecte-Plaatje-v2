// Wordt direct getoond tijdens het laden van een pagina, zodat navigeren
// meteen reactie geeft (ook als de server even traag is).
export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="card h-20" />
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-36" />
        <div className="card h-36" />
        <div className="card h-36" />
        <div className="card h-36" />
      </div>
    </div>
  );
}
