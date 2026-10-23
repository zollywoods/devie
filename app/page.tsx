import { productions } from "./performances";
import { SpineShowcase } from "./spine-showcase";

export default function Home() {
  return (
    <div className="relative">
      <SpineShowcase productions={productions} />
    </div>
  );
}
