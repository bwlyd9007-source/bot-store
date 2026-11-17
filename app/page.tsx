import { Cta } from "@/components/cta";
import { Hero } from "@/components/hero";
import { Process } from "@/components/process";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getStore } from "@/lib/data";

export default async function Home() {
  const { settings } = await getStore();

  return (
    <>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <Hero />
        <Process />
        <Cta settings={settings} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
