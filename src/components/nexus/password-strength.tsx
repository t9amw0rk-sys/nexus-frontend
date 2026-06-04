export function PasswordStrength({ value }: { value: string }) {
  const score = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length);
  const colors = ["bg-muted", "bg-danger", "bg-warning", "bg-warning", "bg-success"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div>
      <div className="flex gap-1">
        {[0,1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded ${i < score ? colors[score] : "bg-muted"}`} />)}
      </div>
      {value && <p className="text-[11px] mt-1 text-muted-foreground">{labels[score]}</p>}
    </div>
  );
}
