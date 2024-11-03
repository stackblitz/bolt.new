import { Rocket } from "lucide-react";

export function Deploy() {
  // TODO: Implement deploy functionality.
  return (
    <button className="flex items-center gap-1 px-2 py-1 bg-[#0E6EE8] hover:bg-[#1477f9] text-white text-sm border border-bolt-elements-borderColor rounded-md">
      <Rocket className="w-4 h-4" /> Deploy
    </button>
  );
}
