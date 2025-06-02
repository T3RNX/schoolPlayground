import { EszettConverter } from "@/components/eszettConverter/eszett-converter";

export default function EszettConverterPage() {
  return (
    <>
      <div className="mb-4 px-1">
        <h1 className="text-2xl font-bold tracking-tight">Eszett Converter</h1>
        <p className="text-muted-foreground">
          Convert German "ß" characters to Swiss "ss" format for text
          compatibility.
        </p>
      </div>

      <div className="grid gap-4">
        <EszettConverter />
      </div>
    </>
  );
}
