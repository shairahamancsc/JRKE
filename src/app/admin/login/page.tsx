import { LoginForm } from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-primary/10">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold font-headline text-primary">Jrke</h1>
        <p className="text-muted-foreground">Labor Management System</p>
      </div>
      <LoginForm />
    </main>
  );
}
