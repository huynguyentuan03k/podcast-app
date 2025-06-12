import AppLayout from "@/layouts/app-layout";

export default function PodcastShow({ id }: { id: string }) {
  return (
    <AppLayout breadcrumbs={[{ title: "Podcasts", href: "/dashboard/podcasts" }, { title: `View #${id}` }]}>
      <h1 className="text-2xl font-bold">Viewing Podcast #{id}</h1>
    </AppLayout>
  );
}
