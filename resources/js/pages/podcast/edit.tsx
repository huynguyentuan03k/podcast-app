import AppLayout from "@/layouts/app-layout";

export default function PodcastEdit({ id }: { id: string }) {
  return (
    <AppLayout breadcrumbs={[{ title: "Podcasts", href: "/dashboard/podcasts" }, { title: `Edit #${id}` }]}>
      <h1 className="text-2xl font-bold">Edit Podcast #{id}</h1>
    </AppLayout>
  );
}
