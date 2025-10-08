import Dashboard from '@/components/rdr2/Dashboard';
import Header from '@/components/rdr2/Header';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
