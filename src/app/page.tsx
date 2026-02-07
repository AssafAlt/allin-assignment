import AddressSearchContainer from "@/components/address-search-container";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Israel Address Service
        </h1>
        <p className="text-slate-500 mt-2">Find your location with ease</p>
      </header>

      <AddressSearchContainer />

      <footer className="mt-12 text-slate-400 text-sm">
        Official Government Data Integration
      </footer>
    </main>
  );
}
