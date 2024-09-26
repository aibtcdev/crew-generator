import { Authentication } from "@/components/auth/Authentication";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Authentication />
    </div>
  );
}
