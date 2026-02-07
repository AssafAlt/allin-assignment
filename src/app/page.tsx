import AddressSearchContainer from "@/components/address-search-container";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          מערכת בחירת כתובות
        </h1>
        <p className="text-slate-500 mt-2">בחר כתובת</p>
      </header>

      <AddressSearchContainer />
    </main>
  );
}
